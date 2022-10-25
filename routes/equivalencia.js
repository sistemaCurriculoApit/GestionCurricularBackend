const router = require('express').Router();
const EquivalenciaModel = require('../models/equivalencia');
const verifyToken = require('../util/tokenValidation');
const { paginationSize } = require('../constants/constants');

router.post('/add', verifyToken, async (req, res) => {
  try {
    const equivalenciaValidar = await EquivalenciaModel.findOne({ sourceCourseCode: req.body.sourceCourseCode });
    if (equivalenciaValidar) {
      return res.status(400).json({
        error: 'Validacion Datos',
        descripcion: 'El código ya existe'
      });
    }

    const equivalencia = new EquivalenciaModel({
      sourcePlan: req.body.sourcePlan,
      sourcePlanName: req.body.sourcePlanName,
      sourceCourseCode: req.body.sourceCourseCode,
      sourceCourseName: req.body.sourceCourseName
    });

    const equivalenciaSaved = await equivalencia.save();
    res.status(200).json({
      error: false,
      descripcion: 'Equivalencia guardada correctamente',
      equivalencia: equivalenciaSaved
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      description: error.message
    });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;

    const asignaturaValidar = await EquivalenciaModel.findOne({ sourceCourseCode: req.body.sourceCourseCode });
    if (asignaturaValidar && asignaturaValidar._id.toString() !== req.params.id) {
      return res.status(400).json({
        error: 'Validacion Datos',
        descripcion: 'El código ya existe'
      });
    }

    const update = await EquivalenciaModel.updateOne({
      _id: id
    }, {
      $set: req.body
    });
    res.status(200).json({
      error: false,
      descripcion: 'Registro Actualizado Exitosamente',
      equivalencia: update
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
    const equivalencia = await EquivalenciaModel.deleteOne(
      { _id: id },
      { $set: req.body }
    );
    res.status(200).json({
      error: false,
      descripcion: 'Registro Eliminado Exitosamente',
      equivalencia
    });
  } catch (error) {
    res.status(500).json({

      error: true,
      descripcion: error.message

    });
  }
});

router.get('/all', verifyToken, async (req, res) => {
  try {
    const pageNumber = req.query.page ? req.query.page * 1 : 0;
    let query = {};

    // Datos para los filtros
    const search = req.query.search;
    if (search) {
      const regex = new RegExp(search, 'ig');
      const or = {
        $or: [
          { sourceCourseName: regex },
          { sourceCourseCode: regex },
        ]
      };
      query = {
        $and: [query, or],
      };
    }

    const equivalencias = await EquivalenciaModel.find(query)
      .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
      .limit(paginationSize).sort({ fechaCreacion: -1 });
    const totalEquivalencias = await EquivalenciaModel.count(query);
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      equivalencias,
      totalEquivalencias
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
  try {
    let query = {};

    // Datos para los filtros
    const search = req.query.search;
    if (search) {
      const regex = new RegExp(search, 'ig');
      const or = {
        $or: [
          { sourceCourseName: regex },
          { sourceCourseCode: regex },
        ]
      };
      query = {
        $and: [query, or],
      };
    }

    const equivalencias = await EquivalenciaModel.find(query);
    // const totalEquivalencias = await EquivalenciaModel.count(query);
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      equivalencias,
      // totalEquivalencias
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
  try {
    const id = req.params.id;
    const equivalencia = await EquivalenciaModel.findById(id);
    if (equivalencia != null) {
      res.status(200).json({
        error: false,
        descripcion: 'Consulta Exitosa',
        equivalencia
      });
    } else {
      if (equivalencia == null) {
        res.status(400).json({
          error: false,
          descripcion: 'Contenido no Existe',
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      body: {
        error: true,
        descripcion: error.message
      }
    });
  }
});

router.post('/getEquivalenciaByAsignatura', verifyToken, async (req, res) => {
  try {
    let query = {};

    // Datos para los filtros
    // const search = req.body.search;

    if (req.body.equivalenciasIds) {
      query = { _id: { $in: req.body.equivalenciasIds } };
    }

    const equivalencias = await EquivalenciaModel.find(query);
    res.status(200).json({
      error: false,
      descripcion: 'Consulta Exitosa',
      equivalencias
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    });
  }
});

module.exports = router;
