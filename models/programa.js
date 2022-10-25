const mongoose = require('mongoose');
const plan = require('../models/plan');

const program = mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  codigo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
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
  },
  plan: [{
    _id: {
      type: mongoose.Schema.ObjectId,
      ref: plan
    }
  }]

});
module.exports = mongoose.model('Programa', program);
