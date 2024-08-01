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
  router.post('/', function (req, res, next) {
    const hash = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hash;
  
    // Generar codigo_pass basado en la fecha y hora actuales
    const now = new Date();
    req.body.codigo_pass = now.getTime(); // Puedes modificar esta lógica para generar un código más específico
    req.body.fecha_registro = now;
  
    Usuario.create(req.body)
      .then(item => res.json({ ok: true, data: item }))
      .catch((error) => res.json({ ok: false, error }));
  });

export default router;