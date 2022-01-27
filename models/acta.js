const mongoose= require('mongoose')

const acta=mongoose.Schema({
    actividad:{
        type:String,
        required:true
    },
    lugar:{
        type:String,
        required:true
    },
    asistente:{
        type:String,
        required:true
    },
    tema:{
        type:String,
        required:true        
    },
    
    conclusion:{
        type:String,
        required:true
    },
    fechaActa:{
        type:Date        
    },
    fechaCreacion:{
        type:Date        
    },
    fechaActualizacion:{
        type:Date        
    },
    estado:{
        type:Boolean ,
        required:true       
    }
})

module.exports=mongoose.model('Acta',acta)