const mongoose = require('mongoose');
const contenido = require('../models/contenido');
const docente = require('../models/docente');
const asignatura = mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  codigo: {
    type: String,
    required: true
  },
  fechaActualizacion: {
    type: Date,
  },
  semestre: {
    type: String,
    required: true
  },
  fechaCreacion: {
    type: Date
  },
  estado: {
    type: Boolean,
    required: true
  },
  cantidadCredito: {
    type: Number,
    required: true
  },
  intensidadHorariaPractica: {
    type: Number,
    required: true
  },
  intensidadHorariaTeorica: {
    type: Number,
    required: true
  },
  intensidadHorariaIndependiente: {
    type: Number,
    required: true
  },
  intensidadHoraria: {
    type: Number,
    required: true
  },
  intensidadHorariaRelacion: {
    type: String,
    required: true
  },
  prerrequisitos: {
    type: String
  },
  correquisitos: {
    type: String
  },
  asignaturaTipo: {
    type: Number,
    required: true
  },
  presentacionAsignatura: {
    type: String
  },
  justificacionAsignatura: {
    type: String
  },
  objetivoGeneral: {
    type: String
  },
  objetivosEspecificos: {
    type: String
  },
  competencias: {
    type: String
  },
  mediosEducativos: {
    type: String
  },
  evaluacion: {
    type: String
  },
  bibliografia: {
    type: String
  },
  cibergrafia: {
    type: String
  },
  contenido: [{
    _id: {
      type: mongoose.Schema.ObjectId,
      ref: contenido
    }
  }],
  docente: [{
    _id: {
      type: mongoose.Schema.ObjectId,
      ref: docente
    }
  }],
  equivalencia: [this]
});

module.exports = mongoose.model('Asignatura', asignatura);
