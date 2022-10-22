const mongoose = require('mongoose');

const rol = mongoose.Schema({
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
    required: true
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: Boolean,
    required: true
  }
});
module.exports = mongoose.model('Rol', rol);
