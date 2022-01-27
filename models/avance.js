const mongoose = require('mongoose')
const programa = require('./programa')
const plan = require('./plan')
const area = require('./area')
const asignatura = require('./asignatura')
const docente = require('./docente')
const contenido = require('./contenido')

const avance = mongoose.Schema({
  programaId: {
    type: mongoose.Schema.ObjectId,
    ref: programa
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
    ref: asignatura
  },
  docenteId: {
    type: mongoose.Schema.ObjectId,
    ref: docente
  },
  contenido: [
    {
      _id: {
        type: mongoose.Schema.ObjectId,
        ref: contenido
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
module.exports = mongoose.model('Avance', avance)