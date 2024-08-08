// models/SeguimientoHabitos.js
import { DataTypes } from 'sequelize';
import sequelize from '../loadSequelize.js';

const SeguimientoHabitos = sequelize.define('SeguimientoHabitos', {
    fecha: {type: DataTypes.DATE,},
    id_habito: {
        type: DataTypes.INTEGER,},
}, {tableName: 'seguimiento_habitos',timestamps: false,});

export default SeguimientoHabitos;