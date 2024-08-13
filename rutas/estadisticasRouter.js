import express from 'express';
import { DataTypes } from "sequelize";
import sequelize from "../loadSequelize.js";
import SeguimientoHabitos from './seguimientoHabitos.js';

const Estadisticas = sequelize.define('Habito', {
    nombre_habito: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    frecuencia: DataTypes.STRING,
    fecha_creacion: DataTypes.DATE,
    activo: DataTypes.TINYINT,
    id_usuario: DataTypes.INTEGER,
    tipo_habito: DataTypes.INTEGER
  }, { tableName: 'habitos', timestamps: false });

Estadisticas.hasMany(SeguimientoHabitos, { foreignKey: 'id_habito' });
SeguimientoHabitos.belongsTo(Estadisticas, { foreignKey: 'id_habito' });

const router = express.Router();

router.get('/countByDate/:id', async (req, res) => {
    try {
        const countByDate = await SeguimientoHabitos.findAll({
            attributes: ['fecha', [sequelize.fn('COUNT', sequelize.col('fecha')), 'count']],
            where: { id_usuarioSeguimiento: req.params.id }, // Filtro por id_usuarioSeguimiento
            group: ['fecha']
        });
        res.json(countByDate);
    } catch (error) {
        console.error('Error fetching count by date:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
