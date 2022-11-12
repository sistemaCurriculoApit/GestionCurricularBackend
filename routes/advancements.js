const router = require('express').Router();
const AdvancementModel = require('../models/advancement');
const SubjectModel = require('../models/asignatura');
const ProfessorModel = require('../models/docente');
const { paginationSize } = require('../constants/constants');
const { queryAdvancements, queryAdvancementsCount } = require('../controllers/advancementsController');

router.get('/', async (req, res) => {
  const {
    search,
    dateCreationFrom,
    dateCreationTo,
    page,
    paginated
  } = req.query;

  try {
    const pageNumber = page && page >= 0 ? page : 0;
    const query = {};

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
      if (paginated) {
        query.descripcion = regex;
      } else {
        query.$or = [
          { identificacionSolicitante: regex },
          { nombreSolicitante: regex },
          { universidadSolicitante: regex },
          { programaSolicitante: regex },
          { asignaturaSolicitante: regex },
        ];
      }
    }

    const [advancements, advancementsCount] = await Promise.all([queryAdvancements(query, paginated, pageNumber), queryAdvancementsCount(query)]);

    res.status(200).json({ advancements, advancementsCount });
  } catch (error) {
    res.status(400).json({
      error: true,
      description: error.message
    });
  }
});

router.get('/periods', async (req, res) => {
  try {
    const years = await AdvancementModel.distinct('añoAvance');
    const periodsPerYear = await Promise.all(years.map((year) => AdvancementModel.find({ añoAvance: year }).distinct('periodo')));
    const yearsPeriod = years
      .reduce((acc, year, i) => [
        ...acc,
        ...periodsPerYear[i].map((period) => `${new Date(year).getFullYear()} - ${period}`)
      ], []);

    res.status(200).json({ periods: yearsPeriod });
  } catch (e) {
    res.status(400).json({
      error: true,
      description: e.message
    });
  }
});

router.get('/professors', async (req, res) => {
  const { search, dateCreationFrom, dateCreationTo, email: correo, page } = req.query;

  try {
    const pageNumber = page && page >= 0 ? page : 0;
    const professor = await ProfessorModel.findOne({ correo });

    if (!professor) {
      return res.status(400).json({
        error: 'Wrong data provided',
        description: 'Professor does not exist'
      });
    }

    const query = {
      docenteId: professor._id
    };

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
      query.descripcion = new RegExp(search, 'ig');
    }

    const [advancements, advancementsCount] = await Promise.all([queryAdvancements(query, true, pageNumber), queryAdvancementsCount(query)]);

    res.status(200).json({ advancements, advancementsCount });
  } catch (error) {
    res.status(400).json({
      error: true,
      description: error.message
    });
  }
});

router.get('/professors/:id', async (req, res) => {
  const { id: docenteId } = req.params;
  const { advancementYear, period, page, pageSize } = req.query;

  try {
    const pageNumber = page && page >= 0 ? page : 0;
    const paginationSizeLocal = pageSize || paginationSize;

    const query = { docenteId };

    if (period) {
      query.periodo = period;
    }

    if (advancementYear) {
      query['añoAvance'] = new Date(`${advancementYear}-1-1`).toISOString();
    }

    const [advancements, advancementsCount] = await Promise.all([queryAdvancements(query, true, pageNumber, paginationSizeLocal), queryAdvancementsCount(query)]);

    res.status(200).json({ advancements, advancementsCount });
  } catch (error) {
    res.status(400).json({
      error: true,
      description: error.message
    });
  }
});

router.get('/subjects/:id', async (req, res) => {
  const { id } = req.params;
  const { advancementYear, period, page, paginationSize: ps } = req.query;

  try {
    if (!id) {
      throw new Error('Subject Id was not provided');
    }

    const pageNumber = page && page >= 0 ? page : 0;
    const paginationSizeLocal = ps || paginationSize;

    const query = { asignaturaId: id };

    if (advancementYear) {
      query['añoAvance'] = new Date(`${advancementYear}-1-1`).toISOString();
    }

    if (period) {
      query.periodo = period;
    }

    const [advancements, advancementsCount] = await Promise.all([queryAdvancements(query, true, pageNumber, paginationSizeLocal), queryAdvancementsCount(query)]);

    res.status(200).json({ advancements, advancementsCount });
  } catch (error) {
    res.status(400).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.get('/periods/:period', async (req, res) => {
  const { period: periodo } = req.params;
  const { page, advancementYear } = req.query;

  try {
    const pageNumber = page && page >= 0 ? page : 0;

    if (!periodo) {
      throw new Error('Period was not provided');
    }

    const query = { periodo };

    if (advancementYear) {
      query['añoAvance'] = new Date(`${advancementYear}-1-1`).toISOString();
    }

    const [advancements, advancementsCount] = await Promise.all([queryAdvancements(query, true, pageNumber), queryAdvancementsCount(query)]);

    res.status(200).json({ advancements, advancementsCount });
  } catch (error) {
    res.status(400).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.get('/years/:year/periods/:period/subjects', async (req, res) => {
  const { period: periodo, year } = req.params;

  try {
    if (!periodo || !year) {
      throw new Error('Period or Year were not provided');
    }

    const query = {
      periodo,
      añoAvance: new Date(`${year}-1-1`).toISOString()
    };

    const subjectsId = await AdvancementModel
      .find(query)
      .distinct('asignaturaId');

    const subjects = await SubjectModel
      .find({ _id: { $in: subjectsId } });

    res.status(200).json({ subjects });
  } catch (error) {
    res.status(400).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.get('/years/:year/periods/:period/professors', async (req, res) => {
  const { period: periodo, year } = req.params;

  try {
    if (!periodo || !year) {
      throw new Error('Period or Year were not provided');
    }

    const query = {
      periodo,
      añoAvance: new Date(`${year}-1-1`).toISOString()
    };

    const professorIds = await AdvancementModel
      .find(query)
      .distinct('docenteId');

    const professors = await ProfessorModel
      .find({ _id: { $in: professorIds } });

    res.status(200).json({ professors });
  } catch (error) {
    res.status(400).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const advancement = await AdvancementModel.findById(id);
    res.status(200).json(advancement);
  } catch (error) {
    res.status(400).json({
      error: true,
      description: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      programId,
      planId,
      areaId,
      subjectId,
      professorId,
      content,
      advancementYear,
      period,
      advancementPercentage,
      description,
    } = req.body;
    
    const advancement = new AdvancementModel({
      programaId: programId,
      planId: planId,
      areaId: areaId,
      asignaturaId: subjectId,
      docenteId: professorId,
      contenido: content,
      añoAvance: advancementYear,
      periodo: period,
      porcentajeAvance: advancementPercentage,
      descripcion: description,
      fechaActualizacion: new Date(),
      fechaCreacion: new Date(),
      estado: true,
      concertacion: [
        {"nombre":"Parcial","porcentaje":25.0,"visto": false},
        {"nombre":"Final","porcentaje":25.0,"visto": false},
        {"nombre":"Evaluacion","porcentaje":50.0,"visto": false},
      ]
    });
    console.log(advancement)
    const save = await advancement.save();
    res.status(200).json(save);
  } catch (err) {
    res.status(400).json({
      error: true,
      descripcion: err.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const advancement = await AdvancementModel.deleteOne({
      _id: id
    });
    res.send(advancement);
  } catch (error) {
    res.status(400).json({
      error: true,
      descripcion: error.message
    });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    programId,
    planId,
    areaId,
    subjectId,
    professorId,
    content,
    advancementYear,
    period,
    advancementPercentage,
    description,
    concertacion
  } = req.body;

  const advancement = {
    programaId: programId,
    planId,
    areaId,
    asignaturaId: subjectId,
    docenteId: professorId,
    contenido: content,
    añoAvance: advancementYear,
    periodo: period,
    porcentajeAvance: advancementPercentage,
    descripcion: description,
    fechaActualizacion: new Date(),
    concertacion: concertacion
  };
  try {
    const update = await AdvancementModel.updateOne({
      _id: id
    }, {
      $set: advancement
    });
    res.status(200).json(update);
  } catch (error) {
    res.send(error.message);
  }
});

module.exports = router;
