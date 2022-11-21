const express = require('express');
const route = express.Router();

const userModel = require('../models/user');
const jwt = require('jsonwebtoken');

route.post('/login', async (req, res) => {
  try {
    const user = await userModel.findOne({ correo: req.body.correo });
    if (!user) {
      return res.status(400).json({
        body: {
          error: 'Validación Usuario',
          descripcion: 'Usuario Inválido'
        }
      });
    }
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    res.json({
      body: {
        user,
        token
      }
    });
  } catch (err) {
    res.send(err.message);
  }
});

module.exports = route;
