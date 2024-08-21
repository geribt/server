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
  tipo_habito: DataTypes.INTEGER,
  icono_habito: DataTypes.STRING,
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

// obtener todos los habitos
router.get('/', async function(req, res, next){
    Habito.findAll()
    .then((data) => {
        res.json({ok: true, data: data})
    })
    .catch((error) => {
        res.json({ok: false, error: error.message})
    })
})

// obtener un habito por id
router.get('/:id', async function(req, res, next){
    Habito.findByPk(req.params.id)
    .then((data) => {
        res.json({ok: true, data: data})
    })
    .catch((error) => {
        res.json({ok: false, error: error.message})
    })
})

// actualizar un habito
router.put('/:id', async function(req, res, next){
    Habito.update(req.body, {
        where: {
            id: req.params.id
        }
    })
    .then((data) => {
        res.json({ok: true, data: data})
    })
    .catch((error) => {
        res.json({ok: false, error: error.message})
    })
})

// eliminar un habito
router.delete('/:id', async function(req, res, next){
    Habito.destroy({
        where: {
            id: req.params.id
        }
    })
    .then((data) => {
        res.json({ok: true, data: data})
    })
    .catch((error) => {
        res.json({ok: false, error: error.message})
    })
})

export default router;