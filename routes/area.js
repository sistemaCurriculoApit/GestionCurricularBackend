const router = require('express').Router();
const AreaModel = require('../models/area');
const verifyToken = require('../util/tokenValidation');
const { paginationSize } = require('../constants/constants');

router.post('/add', verifyToken, async (req, res) => {
  try {
    const areaValidar = await AreaModel.findOne({ codigo: req.body.codigo });
    if (areaValidar) {
      return res.status(400).json({
        error: true,
        descripcion: 'El código del área ya existe'

      });
    }
    const area = new AreaModel({
      codigo: req.body.codigo,
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      estado: true,
      asignatura: req.body.asignatura
    });

    const save = await area.save();
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      area: save
    });
  } catch (err) {
    res.status(400).json({
      error: true,
      descripcion: err.message,
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

    const areas = await AreaModel.find(query)
      .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
      .limit(paginationSize).sort({ fechaCreacion: -1 });

    const totalAreas = await AreaModel.count(query);
    res.send({ areas, totalAreas });
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

    const areas = await AreaModel.find(query);
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      areas
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
    const areaIds = req.body.areaIds;
    if (areaIds) {
      query = { _id: { $in: areaIds } };
    }

    if (search) {
      const regex = new RegExp(search, 'ig');
      const or = {
        $or: [
          { codigo: regex },
          { nombre: regex },
          { descripcion: regex },
        ]
      };
      query = {
        $and: [query, or],
      };
    }

    const areas = await AreaModel.find(query);
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      areas
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.post('/byListIdsNT', async (req, res) => {
  try {
    let query = {};

    // Datos para los filtros
    const search = req.body.search;
    const areaIds = req.body.areaIds;
    if (areaIds) {
      query = { _id: { $in: areaIds } };
    }

    if (search) {
      const regex = new RegExp(search, 'ig');
      const or = {
        $or: [
          { codigo: regex },
          { nombre: regex },
          { descripcion: regex },
        ]
      };
      query = {
        $and: [query, or],
      };
    }

    const areas = await AreaModel.find(query);
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      areas
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

  try {
    const area = await AreaModel.findById(id);
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      area
    });
  } catch (error) {
    res.status(400).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  const areaId = req.params.id;
  const area = {
    nombre: req.body.nombre,
    codigo: req.body.correo,
    descripcion: req.body.documento,
    fechaActualizacion: new Date(),
    estado: false
  };

  try {
    const update = await AreaModel.updateOne({
      _id: areaId
    }, {
      $set: { ...area }
    });
    res.status(200).json({
      error: false,
      descripcion: 'Registro Actualizado Exitosamente',
      area: update
    });
  } catch (error) {
    res.status(400).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const areaValidar = await AreaModel.findOne({ codigo: req.body.codigo });
    if (areaValidar && areaValidar._id.toString() !== req.params.id) {
      return res.status(400).json({
        error: true,
        descripcion: 'El código del área ya existe'

      });
    }

    const areaId = req.params.id;
    const area = {
      nombre: req.body.nombre,
      codigo: req.body.codigo,
      descripcion: req.body.descripcion,
      fechaActualizacion: new Date(),
      asignatura: req.body.asignatura
    };

    const update = await AreaModel.updateOne({
      _id: areaId
    }, {
      $set: { ...area }
    });
    res.status(200).json({
      error: false,
      descripcion: 'Registro Actualizado Exitosamente',
      area: update
    });
  } catch (error) {
    res.status(400).json({
      error: true,
      descripcion: error.message
    });
  }
});

module.exports = router;
