const router = require('express').Router();
const ProgramaModel = require('../models/programa');
const verifyToken = require('../util/tokenValidation');
const { paginationSize } = require('../constants/constants');

router.post('/add', verifyToken, async (req, res) => {
  try {
    const programaValidar = await ProgramaModel.findOne({ codigo: req.body.codigo });
    if (programaValidar) {
      return res.status(400).json({
        error: true,
        descripcion: 'El código del programa ya existe'

      });
    }

    const programa = new ProgramaModel({
      nombre: req.body.nombre,
      codigo: req.body.codigo,
      descripcion: req.body.descripcion,
      fechaActualizacion: new Date(),
      fechaCreacion: new Date(),
      estado: true,
      plan: req.body.plan

    });

    const save = await programa.save();
    res.send(save);
  } catch (err) {
    res.status(400).json({
      error: true,
      descripcion: err.message
    });
  }
});

router.get('/all', verifyToken, async (req, res) => {
  try {
    const pageNumber = req.query.page ? req.query.page * 1 : 0;
    let query = {};

    // Datos para los filtros
    const search = req.query.search;
    const dateCreationFrom = req.query.dateCreationFrom;
    const dateCreationTo = req.query.dateCreationTo;

    if (dateCreationFrom || dateCreationTo) {
      query.fechaCreacion = {};
      if (dateCreationFrom) {
        query.fechaCreacion.$gte = new Date(new Date(dateCreationFrom).toDateString()).toISOString();
      }
      if (dateCreationTo) {
        query.fechaCreacion.$lte = new Date(new Date(dateCreationTo).toDateString()).toISOString();
      }
    }

    if (search) {
      const regex = new RegExp(search, 'ig');
      const or = {
        $or: [
          { codigo: regex },
          { nombre: regex },
        ]
      };
      query = {
        $and: [query, or],
      };
    }

    const programas = await ProgramaModel.find(query)
      .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
      .limit(paginationSize).sort({ fechaCreacion: -1 });

    const totalProgramas = await ProgramaModel.count(query);
    res.send({ programas, totalProgramas });
  } catch (error) {
    res.status(400).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.get('/allNotPaginated', verifyToken, async (req, res) => {
  try {
    let query = {};

    // Datos para los filtros
    const search = req.query.search;

    if (search) {
      const regex = new RegExp(search, 'ig');
      const or = {
        $or: [
          { codigo: regex },
          { nombre: regex },
        ]
      };
      query = {
        $and: [query, or],
      };
    }

    const programas = await ProgramaModel.find(query);
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      programas
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.get('/allNotPaginatedNT', async (req, res) => {
  try {
    let query = {};

    // Datos para los filtros
    const search = req.query.search;

    if (search) {
      const regex = new RegExp(search, 'ig');
      const or = {
        $or: [
          { codigo: regex },
          { nombre: regex },
        ]
      };
      query = {
        $and: [query, or],
      };
    }

    const programas = await ProgramaModel.find(query);
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      programas
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  const programa = await ProgramaModel.findById(id);
  try {
    res.send(programa);
  } catch (error) {
    res.send(error.message);
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const programa = ProgramaModel.deleteOne({
    _id: id
  });
  try {
    res.send(programa);
  } catch (error) {
    res.send(error.message);
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const programaValidar = await ProgramaModel.findOne({ codigo: req.body.codigo });
    if (programaValidar && programaValidar._id.toString() !== req.params.id) {
      return res.status(400).json({
        error: true,
        descripcion: 'El código del programa ya existe'

      });
    }

    const id = req.params.id;
    const programa = {
      nombre: req.body.nombre,
      codigo: req.body.codigo,
      descripcion: req.body.descripcion,
      fechaActualizacion: new Date(),
      plan: req.body.plan
    };
    const update = await ProgramaModel.updateOne({
      _id: id
    }, {
      $set: programa
    });
    res.status(200).json({
      error: false,
      descripcion: 'Registro Actualizado Exitosamente',
      programa: update
    });
  } catch (error) {
    res.send(error.message);
  }
});

module.exports = router;
