const mongoose = require('mongoose');
const asignatura = require('../models/asignatura');
const area = mongoose.Schema({

  codigo: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
  },
  fechaCreacion: {
    type: Date,
  },
  fechaActualizacion: {
    type: Date,

  },
  estado: {
    type: Boolean,
    required: true
  },
  asignatura: [{
    _id: {
      type: mongoose.Schema.ObjectId,
      ref: asignatura
    }
  }]
});

module.exports = mongoose.model('Area', area);
