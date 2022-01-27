const mongoose=require('mongoose')


const docente=mongoose.Schema({
    
    nombre:{
        type:String,
        required:true
    },
    correo:{
        type:String,
        required:true
    },
    documento:{
        type:String,
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
module.exports=mongoose.model('Docente',docente)