import express from 'express';
import { DataTypes } from "sequelize";
import sequelize from "../loadSequelize.js";

//Modelo de datos
const Habito = sequelize.define('Habito', {
  nombre_habito: DataTypes.STRING,
  descripcion: DataTypes.STRING,
  frecuencia: DataTypes.STRING,
  fecha_creacion: DataTypes.DATE,
  activo: DataTypes.TINYINT,
  id_usuario: DataTypes.INTEGER,
  tipo_habito: DataTypes.INTEGER
}, { tableName: 'habitos', timestamps: false });

const router = express.Router();

// nuevo habito
router.post('/', async function(req, res, next){
    Habito.create(req.body)
    .then((data) => {
        res.json({ok: true, data: data})
    })
    .catch((error) => {
        res.json({ok: false, error: error.message})
    })
})

router.get('/:id_usuario', async function(req, res, next){
    Habito.findAll({where: {id_usuario: req.params.id_usuario}})
    .then((data) => {
        res.json({ok: true, data: data})
    })
    .catch((error) => {
        res.json({ok: false, error: error.message})
    })
})

export default router;
