const mongoose = require('mongoose')
const programa = require('../models/programa')
const plan = require('../models/plan')
const asignatura = require('../models/asignatura')

const homologacion = mongoose.Schema({
  programaId: {
    type: mongoose.Schema.ObjectId,
    ref: programa
  },
  planId: {
    type: mongoose.Schema.ObjectId,
    ref: plan
  },
  asignaturaId: {
    type: mongoose.Schema.ObjectId,
    ref: asignatura
  },
  asignaturaSolicitante: {
    type: String,
    required: true
  },
  añoHomologacion: {
    type: Date,
    required: true,
  },
  fechaDecision: {
    type: Date,
    required: false,
  },
  periodo: {
    type: String,
    required: true
  },
  estadoHomologacion:{
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
module.exports = mongoose.model('Homologacion', homologacion)