const route = require('express').Router()
const estudianteModel = require('../models/estudiante')
const verifyToken = require('../util/tokenValidation')

route.post('/getByEmail', verifyToken, async (req, res) => {
  try {
    const estudiante = await estudianteModel.findOne({ correo: req.body.correo })
    res.send(estudiante)
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    })
  }
})

route.get('/all', verifyToken, async (req, res) => {
  try {
    const estudiantes = await estudianteModel.find();
    res.status(200).json({
      error: false,
      descripcion: "Consulta Exitosa",
      estudiantes
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    })
  }
})

module.exports = route