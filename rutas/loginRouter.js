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
    const response = {};
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ ok: false, msg: "email o password no rebuts" });
    }

    Usuario.findOne({ where: { email: email } })
        .then((usuari) => {
            if (usuari && bcrypt.compareSync(password, usuari.password)) {
                return usuari;
            } else {
                throw "usuari/password invalids";
            }
        })
        .then(usuari => {
            response.ok = true;
            response.token = jsonwebtoken.sign(
                {
                    expiredAt: new Date().getTime() + durada,
                    name: usuari.name,
                    id: usuari.id,
                },
                secretKey
            );
            res.json(response);
        })
        .catch(err => res.status(400).json({ ok: false, msg: err }));
});


export default router;