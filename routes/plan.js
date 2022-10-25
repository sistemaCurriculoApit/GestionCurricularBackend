const router = require('express').Router();
const PlanModel = require('../models/plan');
const verifyToken = require('../util/tokenValidation');
const { paginationSize } = require('../constants/constants');

router.post('/add', verifyToken, async (req, res) => {
  const planValidar = await PlanModel.findOne({ codigo: req.body.codigo });
  if (planValidar) {
    return res.status(400).json({
      error: true,
      descripcion: 'El código del plan ya existe'

    });
  }

  const plan = new PlanModel({
    nombre: req.body.nombre,
    codigo: req.body.codigo,
    descripcion: req.body.descripcion,
    fechaActualizacion: new Date(),
    fechaCreacion: new Date(),
    estado: true,
    area: req.body.area
  });

  try {
    const save = await plan.save();
    res.status(200).json({
      error: false,
      descripcion: 'Registro Almacenado Exitosamente',
      plan: save
    });
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

    const planes = await PlanModel.find(query)
      .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
      .limit(paginationSize).sort({ fechaCreacion: -1 });

    const totalPlanes = await PlanModel.count(query);
    res.send({ planes, totalPlanes });
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

    const planes = await PlanModel.find(query);
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      planes
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
    const planIds = req.body.planIds;
    if (planIds) {
      query = { _id: { $in: planIds } };
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

    const planes = await PlanModel.find(query);
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      planes
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
    const planIds = req.body.planIds;
    if (planIds) {
      query = { _id: { $in: planIds } };
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

    const planes = await PlanModel.find(query);
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      planes
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
    const plan = await PlanModel.findById(id);

    res.status(200).json({

      error: false,
      descripcion: 'Consulta Exitosa',
      plan

    });
  } catch (error) {
    res.status(500).json({
      error: true,
      descripcion: error.message

    });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  const id = req.params.id;

  try {
    const plan = await PlanModel.updateOne(
      { _id: id },
      { $set: req.body }
    );
    res.status(200).json({
      error: false,
      descripcion: 'Registro Actualizado Exitosamente',
      plan
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
    const planValidar = await PlanModel.findOne({ codigo: req.body.codigo });
    if (planValidar && planValidar._id.toString() !== req.params.id) {
      return res.status(400).json({
        error: true,
        descripcion: 'El código del plan ya existe'

      });
    }

    const id = req.params.id;
    const plan = {
      nombre: req.body.nombre,
      codigo: req.body.codigo,
      descripcion: req.body.descripcion,
      fechaActualizacion: new Date(),
      area: req.body.area
    };

    const update = await PlanModel.updateOne({
      _id: id
    }, {
      $set: plan
    });
    res.status(200).json({
      error: false,
      descripcion: 'Registro Actualizado Exitosamente',
      plan: update
    });
  } catch (error) {
    res.status(400).json({

      error: true,
      descripcion: error.message

    });
  }
});

module.exports = router;
