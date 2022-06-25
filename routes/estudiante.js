const express = require('express')
const estudianteModel = require('../models/estudiante')
const verifyToken = require('./validarToken')
const route = express.Router()


route.post('/getByEmail', verifyToken, async(req, res)=>{
    try{
        const estudiante = await estudianteModel.findOne({correo: req.body.correo})
        res.send(estudiante)
    }catch(error){
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})


module.exports = route