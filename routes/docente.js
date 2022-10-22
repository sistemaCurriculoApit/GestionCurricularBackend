const router = require('express').Router();
const DocenteModel = require('../models/docente');
const verifyToken = require('../util/tokenValidation');
const { paginationSize } = require('../constants/constants');

router.post('/add', verifyToken, async (req, res) => {
  const docenteValidar = await DocenteModel.findOne({ correo: req.body.correo });
  if (docenteValidar) {
    return res.status(400).json({
      error: 'Validación Datos',
      descripcion: 'El Correo ya existe'
    });
  }

  const docente = new DocenteModel({
    nombre: req.body.nombre,
    correo: req.body.correo,
    documento: req.body.documento,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
    estado: true

  });

  const save = await docente.save();
  try {
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      docente: save
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.get('/all', verifyToken, async (req, res) => {
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
        { nombre: regex },
        { correo: regex },
        { documento: regex },
      ]
    };
    query = {
      $and: [query, or],
    };
  }

  try {
    const docentes = await DocenteModel.find(query)
      .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
      .limit(paginationSize).sort({ fechaCreacion: -1 });

    const totalDocentes = await DocenteModel.count(query);
    res.status(200).json({
      error: false,
      descripcion: 'consulta Exitosa',
      docentes,
      totalDocentes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.get('/allNotPaginated', verifyToken, async (req, res) => {
  let query = {};
  // Datos para los filtros
  const search = req.query.search;

  if (search) {
    const regex = new RegExp(search, 'ig');
    const or = {
      $or: [
        { nombre: regex },
        { correo: regex },
        { documento: regex },
      ]
    };
    query = {
      $and: [query, or],
    };
  }

  const docentes = await DocenteModel.find(query);
  try {
    res.status(200).json({
      error: false,
      docentes
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
  let query = {};
  // Datos para los filtros
  const search = req.query.search;

  if (search) {
    const regex = new RegExp(search, 'ig');
    const or = {
      $or: [
        { nombre: regex },
        { correo: regex },
        { documento: regex },
      ]
    };
    query = {
      $and: [query, or],
    };
  }

  const docentes = await DocenteModel.find(query);
  try {
    res.status(200).json({
      error: false,
      docentes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.post('/byListIds', verifyToken, async (req, res) => {
  try {
    let query = {};

    // Datos para los filtros
    const search = req.body.search;
    const docenteIds = req.body.docenteIds;
    if (docenteIds) {
      query = { _id: { $in: docenteIds } };
    }

    if (search) {
      const regex = new RegExp(search, 'ig');
      const or = {
        $or: [
          { nombre: regex },
          { correo: regex },
          { documento: regex },
        ]
      };
      query = {
        $and: [query, or],
      };
    }

    const docentes = await DocenteModel.find(query);
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      docentes
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
  const docente = await DocenteModel.findById(id);
  try {
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      docente
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const docenteDelete = await DocenteModel.deleteOne({
      _id: id
    });
    res.send(docenteDelete);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
  const docenteValidar = await DocenteModel.findOne({ correo: req.body.correo });
  if (docenteValidar) {
    return res.status(400).json({
      error: 'Validación Datos',
      descripcion: 'El Correo ya existe'
    });
  }

  const docenteId = req.params.id;
  const docente = {
    nombre: req.body.nombre,
    correo: req.body.correo,
    documento: req.body.documento,
    fechaActualizacion: new Date(),
  };

  try {
    await DocenteModel.updateOne({
      _id: docenteId
    }, {
      $set: { ...docente }
    });
    res.send(docente);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.delete('/delete/:id', verifyToken, async (req, res) => {
  const docenteId = req.params.id;
  const docente = {
    nombre: req.body.nombre,
    correo: req.body.correo,
    documento: req.body.documento,
    fechaActualizacion: new Date(),
    estado: false
  };

  try {
    await DocenteModel.updateOne({
      _id: docenteId
    }, {
      $set: { ...docente }
    });
    res.send(docente);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    });
  }
});

module.exports = router;
