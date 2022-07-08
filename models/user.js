const mongoose=require('mongoose')
const role= require('./rol')

const user=mongoose.Schema({
    
    nombreUsuario:{
        type:String,
        required:true
    },
    identificacion:{
        type:String,
        required:true
    },
    correo:{
        type:String,
        required:true
    },
    contrasena:{
        type:String,
        required:true
    },
    rolId:{
        type:Number,
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
module.exports=mongoose.model('User',user)