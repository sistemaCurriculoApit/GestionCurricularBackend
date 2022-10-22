const mongoose = require('mongoose')
const program = require('./programa')
const plan = require('./plan')
const area = require('./area')
const subject = require('./asignatura')
const professor = require('./docente')
const content = require('./contenido')

const advancement = mongoose.Schema({
  Id: {
    type: mongoose.Schema.ObjectId,
    ref: program
  },
  planId: {
    type: mongoose.Schema.ObjectId,
    ref: plan
  },
  areaId: {
    type: mongoose.Schema.ObjectId,
    ref: area
  },
  asignaturaId: {
    type: mongoose.Schema.ObjectId,
    ref: subject
  },
  docenteId: {
    type: mongoose.Schema.ObjectId,
    ref: professor
  },
  contenido: [
    {
      _id: {
        type: mongoose.Schema.ObjectId,
        ref: content
      }
    }
  ],
  añoAvance: {
    type: Date,
    required: true,
  },
  periodo: {
    type: String,
    required: true
  },
  porcentajeAvance: {
    type: Number,
    required: true
  },
  descripcion: {
    type: String
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: Boolean,
    required: true
  }

})
module.exports = mongoose.model('Avance', advancement)