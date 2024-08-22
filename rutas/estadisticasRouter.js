import express from 'express';
import { and, DataTypes,Op, fn, col, literal } from "sequelize";
import sequelize from "../loadSequelize.js";
import SeguimientoHabitos from './seguimientoHabitos.js';
import autentica from './autentica.js';

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
router.get('/countByDate/:id',autentica, async (req, res) => {
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




router.get('/progreso/:id/:id_habit',autentica, async (req, res) => {
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


router.get('/historial/:id',autentica, async (req, res) => {
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

router.get('/totalCompleted/:id',autentica, async (req, res) => {
    try {
        const totalCompleted = await sequelize.query(`
            SELECT COUNT(DISTINCT h.id) AS total_completados
            FROM habitos h
            LEFT JOIN seguimiento_habitos sh ON h.id = sh.id_habitos
            WHERE h.id_usuario = :userId
            AND sh.progreso >= h.frecuencia
        `, {
            type: sequelize.QueryTypes.SELECT,
            replacements: { userId: req.params.id }
        });

        res.json({ total_completados: totalCompleted[0].total_completados });
    } catch (error) {
        console.error('Error fetching total completed habits:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/daysAllCompleted/:id', async (req, res) => {
    try {
        const daysAllCompleted = await sequelize.query(`
            SELECT COUNT(fechas.fecha) AS dias_completados
            FROM (
                SELECT DISTINCT sh.fecha
                FROM seguimiento_habitos sh
                WHERE sh.id_usuarioSeguimiento = :userId
            ) AS fechas
            LEFT JOIN habitos h
                ON h.id_usuario = :userId
            LEFT JOIN seguimiento_habitos sh
                ON sh.id_habitos = h.id
                AND sh.fecha = fechas.fecha
            GROUP BY fechas.fecha
            HAVING COUNT(DISTINCT h.id) = SUM(CASE
                WHEN sh.progreso >= h.frecuencia THEN 1
                ELSE 0
            END)
        `, {
            type: sequelize.QueryTypes.SELECT,
            replacements: { userId: req.params.id }
        });

        res.json({ dias_completados: daysAllCompleted[0].dias_completados });
    } catch (error) {
        console.error('Error fetching days with all habits completed:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/percentage/:id', autentica, async (req, res) => {
    try {
        const userId = req.params.id;

        // Obtén el historial de hábitos completados
        const historial = await sequelize.query(`
            SELECT
                COUNT(DISTINCT h.id) AS total_retos,
                SUM(CASE 
                    WHEN sh.progreso >= h.frecuencia THEN 1 
                    ELSE 0 
                END) AS retos_completados
            FROM habitos h
            LEFT JOIN seguimiento_habitos sh ON h.id = sh.id_habitos
            WHERE h.id_usuario = :userId
        `, {
            type: sequelize.QueryTypes.SELECT,
            replacements: { userId: userId }
        });

        const totalRetos = historial[0].total_retos;
        const retosCompletados = historial[0].retos_completados;
        
        // Calcular porcentaje
        const porcentajeCompletado = totalRetos === 0 ? 0 : (retosCompletados / totalRetos) * 100;

        res.json({ porcentaje_completado: porcentajeCompletado.toFixed(2) });
    } catch (error) {
        console.error('Error fetching completion percentage:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
