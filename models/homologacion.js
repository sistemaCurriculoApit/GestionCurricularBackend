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
  identificacionSolicitante: {
    type: String,
    required: true
  },
  nombreSolicitante: {
    type: String,
    required: true
  },
  universidadSolicitante: {
    type: String,
    required: true
  },
  programaSolicitante: {
    type: String,
    required: true
  },
  asignaturaSolicitante: {
    type: String,
    required: true
  },
  añoHomologacion: {
    type: Date,
    required: true,
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
    type: String,
    required: true
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