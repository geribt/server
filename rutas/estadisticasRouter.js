import express from 'express';
import { and, DataTypes,Op, fn, col, literal } from "sequelize";
import sequelize from "../loadSequelize.js";
import SeguimientoHabitos from './seguimientoHabitosRouter.js';

const Estadisticas = sequelize.define('Habito', {
    nombre_habito: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    frecuencia: DataTypes.STRING,
    fecha_creacion: DataTypes.DATE,
    activo: DataTypes.TINYINT,
    id_usuario: DataTypes.INTEGER,
    tipo_habito: DataTypes.INTEGER
  }, { tableName: 'habitos', timestamps: false });

Estadisticas.hasMany(SeguimientoHabitos, { foreignKey: 'id_habitos' });
SeguimientoHabitos.belongsTo(Estadisticas, { foreignKey: 'id_habitos' });

const router = express.Router();
router.get('/countByDate/:id', async (req, res) => {
    try {
        const countByDate = await sequelize.query(`
            SELECT fecha, COUNT(fecha) as count
            FROM seguimiento_habitos
            WHERE progreso >= (
                SELECT frecuencia 
                FROM habitos 
                WHERE habitos.id = seguimiento_habitos.id_habitos
                AND habitos.id_usuario = ${req.params.id}
            )
            AND id_usuarioSeguimiento = ${req.params.id}
            GROUP BY fecha
        `, {
            type: sequelize.QueryTypes.SELECT
        });

        res.json(countByDate);
    } catch (error) {
        console.error('Error fetching count by date:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




router.get('/progreso/:id/:id_habit', async (req, res) => {
    try {
        const progreso = await SeguimientoHabitos.findAll({
            where: { id_usuarioSeguimiento: req.params.id , id_habitos: req.params.id_habit },
            attributes: [ 'fecha','progreso']
        });
        res.json(progreso);
    } catch (error) {
        console.error('Error fetching progreso: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/historial/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const historial = await sequelize.query(`
            SELECT
                fechas.fecha,
                COUNT(DISTINCT h.id) AS total_retos,
                SUM(CASE 
                    WHEN sh.progreso >= h.frecuencia THEN 1 
                    ELSE 0 
                END) AS retos_completados,
                CASE
                    WHEN COUNT(DISTINCT h.id) = SUM(CASE 
                        WHEN sh.progreso >= h.frecuencia THEN 1 
                        ELSE 0 
                    END) THEN 'Completado'
                    ELSE 'No Completado'
                END AS estado_retos
            FROM (
                SELECT DISTINCT fecha
                FROM seguimiento_habitos
                WHERE id_usuarioSeguimiento = :userId
            ) AS fechas
            LEFT JOIN habitos AS h
                ON h.id_usuario = :userId
                AND h.fecha_creacion <= fechas.fecha
            LEFT JOIN seguimiento_habitos AS sh
                ON sh.id_habitos = h.id
                AND sh.fecha = fechas.fecha
            GROUP BY fechas.fecha
            ORDER BY fechas.fecha;
        `, {
            type: sequelize.QueryTypes.SELECT,
            replacements: { userId: userId }
        });

        res.json(historial);
    } catch (error) {
        console.error('Error fetching historial:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
export default router;
