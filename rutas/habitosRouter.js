import express from 'express';
import { DataTypes } from "sequelize";
import sequelize from "../loadSequelize.js";
import autentica from './autentica.js';
import  SeguimientoHabitos from './seguimientoHabitos.js';

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
router.post('/', async function (req, res, next) {
    try {
        console.log("Creando nuevo habito...");
        const nuevoHabito = await Habito.create(req.body);

        // Si el tipo de hábito es 3, crear un registro en SeguimientoHabitos
        if (req.body.tipo_habito == 3) {
            console.log("Creando seguimiento para el nuevo habito...");
            const seguimientoData = {
                fecha: new Date(), // Puedes ajustar la fecha según tus necesidades
                id_habitos: nuevoHabito.id, // Asumiendo que 'id' es el PK del nuevo hábito
                id_usuarioSeguimiento: 19, // Usar el id del usuario autenticado
                progreso: 1 // Progreso inicial
            };

            const nuevoSeguimiento = await SeguimientoHabitos.create(seguimientoData);
        }

        res.json({ ok: true, data: nuevoHabito });
    } catch (error) {
        res.json({ ok: false, error: error.message });
    }
});


router.get('/:id_usuario/usuario', autentica, async function (req, res, next) {

    const usuarioAutenticado = req.userId;

    Habito.findAll({ where: { id_usuario: usuarioAutenticado } })
        .then((data) => {
            res.json({ ok: true, data: data })
        })
        .catch((error) => {
            res.json({ ok: false, error: error.message })
        })
})

router.get('/:idHabito', autentica, async function (req, res, next) {
    Habito.findOne({ where: { id: req.params.idHabito } })
        .then((data) => {
            res.json({ ok: true, data: data })
        })
        .catch((error) => {
            res.json({ ok: false, error: error.message })
        })
})

// actualizar un habito
router.put('/:id', autentica, async function (req, res, next) {
    Habito.update(req.body, {
        where: {
            id: req.params.id
        }
    })
        .then((data) => {
            res.json({ ok: true, data: data })
        })
        .catch((error) => {
            res.json({ ok: false, error: error.message })
        })
})

// eliminar un habito
router.delete('/:id', autentica, async function(req, res, next){
    SeguimientoHabitos.destroy({
        where: {
            id_habitos: req.params.id
        }
    })
      .then((data) => {
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
    .catch((error) => {
        res.json({ok: false, error: error.message})
    })

// encontrar todos los habitos del tipo 3
router.get('/:id_usuario/tipo', autentica, async function (req, res, next) {
    Habito.findAll({ where: { id_usuario: req.params.id_usuario, tipo_habito: 3 } })
        .then((data) => {
            res.json({ ok: true, data: data })
        })
        .catch((error) => {
            res.json({ ok: false, error: error.message })
        })

})

export default router;
