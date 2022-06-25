const mongoose=require('mongoose')
const programa= require('../models/programa')
const homologacion = require('../models/homologacion')
const user= require('../models/user')

const estudiante=mongoose.Schema({
    
    identificacion:{
        type:String,
        required:true
    },
    nombre:{
        type:String,
        required:true
    },
    universidad:{
        type:String,
        required:true
    },
    programa:{
       type:String,
       required:true
    },
    plan:{
        type:String,
        required:true
    },
    homologacion:[{
        _id:{
            type:mongoose.Schema.ObjectId,
            ref:homologacion
        }
    }],
    correo:{
        type:String,
        required:true
    },
    fechaCreacion:{
        type:Date,
        
    },
    fechaActualizacion:{
        type:Date,
    },
    estado:{
        type:Boolean,
        required:true
    }
})
module.exports=mongoose.model('Estudiante',estudiante)