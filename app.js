const express= require('express')
const mongoose= require('mongoose')
const env= require('dotenv/config')

const cors = require('cors');


const app= express();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

app.use(cors({
    origin: '*'
}));

const userRoute= require('./routes/user')
app.use('/api/',userRoute)

const authRoute= require('./routes/auth')
app.use('/api/auth/',authRoute)

const asignaturaRoute= require('./routes/asignaturas')
app.use('/api/asignatura/',asignaturaRoute) 

const contenidoRoute= require('./routes/contenido')
app.use('/api/contenido/',contenidoRoute) 

const programaRoute= require('./routes/programa')
app.use('/api/programa/',programaRoute) 

const actaRoute= require('./routes/acta')
app.use('/api/acta/',actaRoute) 

const planRoute= require('./routes/plan')
app.use('/api/plan/',planRoute) 

const dashboardRoute= require('./routes/dashboard')
app.use('/api/dashboard/',dashboardRoute) 

const docenteRoute= require('./routes/docente')
app.use('/api/docente/',docenteRoute)

const areaRoute= require('./routes/area')
app.use('/api/area/',areaRoute) 

const homologacionRoute= require('./routes/homologacion')
app.use('/api/homologacion/',homologacionRoute) 

const avanceRoute= require('./routes/avance')
app.use('/api/avance/',avanceRoute) 

app.listen('3000',()=>{
 console.log('server is running')
})

mongoose.connect(process.env.BD,{useNewUrlParser:true,useUnifiedTopology:true},(err)=>{
    if(err) return console.log(err)
    console.log('conexion a bds exitosa')
})