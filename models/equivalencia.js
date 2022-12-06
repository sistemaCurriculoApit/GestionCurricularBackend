// unused collection
const mongoose = require('mongoose');

const equivalencias = mongoose.Schema({
  sourcePlan: {
    type: String,
    required: true
  },
  sourcePlanName: {
    type: String,
  },
  sourceCourseCode: {
    type: String,
    required: true
  },
  sourceCourseName: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Equivalencia', equivalencias);
