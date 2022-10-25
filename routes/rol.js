const router = require('express').Router();
const RolModel = require('../models/rol');

router.post('/add', async (req, res) => {
  const rol = new RolModel({
    nombre: req.body.nombre,
    codigo: req.body.codigo,
    descripcion: req.body.descripcion,
    fechaActualizacion: req.body.fechaActualizacion,
    estado: req.body.estado

  });

  const save = await rol.save();
  try {
    res.send(save);
  } catch (err) {
    res.send(err.message);
  }
});

router.get('/all', async (req, res) => {
  const rol = await RolModel.find();
  try {
    res.send(rol);
  } catch (error) {
    res.send(error.message);
  }
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const rol = await RolModel.findById(id);
  try {
    res.send(rol);
  } catch (error) {
    res.send(error.message);
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const rol = RolModel.deleteOne({
    _id: id
  });
  try {
    res.send(rol);
  } catch (error) {
    res.send(error.message);
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const update = RolModel.updateOne({
    _id: id
  }, {
    $set: req.body
  });
  try {
    res.send(update);
  } catch (error) {
    res.send(error.message);
  }
});

module.exports = router;
