const { string } = require('@hapi/joi')
const mongoose=require('mongoose')
const contenido=require('../models/contenido')
const docente= require('../models/docente')
const asignatura=mongoose.Schema({
    nombre:{
        type:String,
        required:true
    },
    codigo:{
        type:String,
        required:true
    },
    fechaActualizacion:{
        type:Date,
    },
    semestre:{
        type:String,
        required:true
    },
    fechaCreacion:{
        type:Date
    },
    estado:{
        type:Boolean,
        required:true
    }, 
    cantidadCredito:{
        type:Number,
        required:true
    },
    intensidadHoraria:{
        type:String,
        required:true
    },
    contenido:[{
        _id:{
            type:mongoose.Schema.ObjectId,
            ref:contenido
        }
    }], 
    docente:[{
        _id:{
            type:mongoose.Schema.ObjectId,
            ref:docente
        }
    }]
})

module.exports=mongoose.model('Asignatura',asignatura)