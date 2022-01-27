const mongoose= require('mongoose')
const area= require('../models/area')
const plan=mongoose.Schema({
    nombre:{
        type:String,
        required:true
    },
    codigo:{
        type:String,
        required:true
    },
    descripcion:{
        type:String,
    },
    fechaActualizacion:{
        type:Date,
        default:Date.now
    },
    fechaCreacion:{
        type:Date,
        default:Date.now
    },
    estado:{
        type:Boolean,
        required:true
    },
    area:[{
        _id:{
            type:mongoose.Schema.ObjectId,
            ref:area
        }
    }]
})

module.exports=mongoose.model('Plan',plan)