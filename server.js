//importamos express y controladores
import express from "express";


//instanciamos nueva aplicación express
const app = express();

//necesario para poder recibir datos en json
app.use(express.json());



//arranque del servidor
const port = 3000
app.listen(port, () => console.log(`API listening on port ${port}!`))
