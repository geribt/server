import express from 'express';
import { DataTypes } from "sequelize";
import sequelize from "../loadSequelize.js";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";


//DEFINICION DEL MODELO
const Usuario = sequelize.define('Usuario', {
    email:DataTypes.STRING,
    password:DataTypes.STRING,
}, { tableName: 'usuarios', timestamps: false });

const router = express.Router();
const durada = 60 * 60 * 1000;
const secretKey = "setze-jutges";

router.post('/', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ ok: false, msg: "Email o password no recibidos" });
    }

    Usuario.findOne({ where: { email: email } })
        .then((usuari) => {
            if (usuari && bcrypt.compareSync(password, usuari.password)) {
                return usuari;
            } else {
                throw new Error("Usuario o contraseña inválidos");
            }
        })
        .then(usuari => {
            const token = jsonwebtoken.sign(
                {
                    expiredAt: new Date().getTime() + durada,
                    name: usuari.name,
                    id: usuari.id,
                },
                secretKey
            );
            res.json({ ok: true, token });
        })
        .catch(err => {
            console.error(err); // Log the error for debugging purposes
            let errorMessage = 'Error en el servidor';
            if (err.message === "Usuario o contraseña inválidos") {
                errorMessage = err.message;
            }
            res.status(400).json({ ok: false, msg: errorMessage });
        });
});



export default router;