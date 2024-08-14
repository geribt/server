import { DataTypes } from 'sequelize';
import sequelize from '../loadSequelize.js';
import express from 'express';

const SeguimientoHabitos = sequelize.define('SeguimientoHabitos', {
    fecha: { type: DataTypes.DATEONLY, },
    id_habitos: {
        type: DataTypes.INTEGER,
    },
    id_usuarioSeguimiento: {
        type: DataTypes.INTEGER,
    },
    progreso: {
        type: DataTypes.INTEGER,
    }
}, { tableName: 'seguimiento_habitos', timestamps: false, });


const router = express.Router();

//buscar seguimiento de habito
router.get('/:fecha/:id_habito', async function (req, res, next) {
    
    SeguimientoHabitos.findOne({
        where: {
            fecha: req.params.fecha,
            id_habitos: req.params.id_habito
        }
    })
        .then((data) => {
            res.json({ ok: true, data: data })
        })
        .catch((error) => {
            res.json({ ok: false, error: error.message })
        })
})

//actualizar progreso de habitos
router.put('/:fecha/:id_habito', async function (req, res, next) {
    SeguimientoHabitos.update(req.body, {
        where: {
            id_habitos: req.params.id_habito
        }
    })
       .then((data) => {
            res.json({ ok: true, data: data })
        })
       .catch((error) => {
            res.json({ ok: false, error: error.message })
        })
})





export default router;