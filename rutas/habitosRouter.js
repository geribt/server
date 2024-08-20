import express from 'express';
import { DataTypes } from "sequelize";
import sequelize from "../loadSequelize.js";
import autentica from './autentica.js';

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

//nuevo habito
router.post('/',autentica, async function(req, res, next){
    Habito.create(req.body)
    .then((data) => {
        res.json({ok: true, data: data})
    })
    .catch((error) => {
        res.json({ok: false, error: error.message})
    })
})

router.get('/:id_usuario/usuario', autentica, async function(req, res, next){

    const usuarioAutenticado = req.userId;

    Habito.findAll({where: {id_usuario: usuarioAutenticado}})
    .then((data) => {
        res.json({ok: true, data: data})
    })
    .catch((error) => {
        res.json({ok: false, error: error.message})
    })
})

router.get('/:idHabito',autentica, async function(req, res, next){
    Habito.findOne({where: {id: req.params.idHabito}})
    .then((data) => {
        res.json({ok: true, data: data})
    })
    .catch((error) => {
        res.json({ok: false, error: error.message})
    })
})

export default router;
