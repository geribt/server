import loginRouter from "./rutas/loginRouter.js";
import registerRouter from "./rutas/registerRouter.js";
import habitosRouter from "./rutas/habitosRouter.js";
import estadisticasRouter from "./rutas/estadisticasRouter.js";
import SeguimientoHabitosRouter from "./rutas/seguimientoHabitos.js";
import cors from "cors";

//importamos express y controladores
import express from "express";


//instanciamos nueva aplicación express
const app = express();
app.use(cors());
//necesario para poder recibir datos en json
app.use(express.json());
//app.use(urlencoded({ extended: false }));

app.use("/api/login", loginRouter);
app.use("/api/register", registerRouter);
app.use("/api/habitos", habitosRouter);
app.use("/api/stadisticas", estadisticasRouter);


//arranque del servidor
const port = 3000;
app.listen(port, () => console.log(`API listening on port ${port}!`))
