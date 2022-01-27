const mongoose= require('mongoose')
const contenido=mongoose.Schema({
    nombre:{
        type:String,
        required:true
    },
    codigo:{
        type:String,
        required:true
    },
    descripcion:{
        type:String
    },
    fechaActualizacion:{
        type:Date
    },
    fechaCreacion:{
        type:Date
    },
    estado:{
        type:Boolean,
        required:true
    },
    contenidoSemana:{
        type:String
    }
})
module.exports=mongoose.model('Contenido',contenido)