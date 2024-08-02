import express from 'express';
import { DataTypes } from "sequelize";
import sequelize from "../loadSequelize.js";
import bcrypt from "bcrypt";

// DEFINICION DEL MODELO
const Usuario = sequelize.define('Usuario', {
  nombre: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  fecha_registro: DataTypes.DATE,
  codigo_pass: DataTypes.INTEGER,
  estado: DataTypes.TINYINT,
  telefono: DataTypes.STRING,
}, { tableName: 'usuarios', timestamps: false });

const router = express.Router();

// Nou usuari
router.post('/', async function (req, res, next) {
  try {
    console.log("body", req.body);

    // Comprobar si el correo ya está registrado
    const existingUser = await Usuario.findOne({ where: { email: req.body.email } });
    if (existingUser) {
      return res.json({ ok: false, error: 'El correo ya está registrado.' });
    }

    // Si el correo no está registrado, proceder con el registro
    const hash = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hash;

    // Generar codigo_pass basado en la fecha y hora actuales
    const now = new Date();
    req.body.codigo_pass = now.getTime(); // Puedes modificar esta lógica para generar un código más específico
    req.body.fecha_registro = now;

    const newUser = await Usuario.create(req.body);
    return res.json({ ok: true, data: newUser });
  } catch (error) {
    return res.json({ ok: false, error: error.message });
  }
});

export default router;
