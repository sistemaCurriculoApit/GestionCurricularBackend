const mongoose=require('mongoose')
const programa= require('../models/programa')
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
        _id:{
            type:mongoose.Schema.ObjectId,
            ref:programa
        }
    },
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