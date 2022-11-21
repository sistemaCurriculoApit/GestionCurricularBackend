const router = require('express').Router();
const AdvancementModel = require('../models/advancement');
const ProfessorModel = require('../models/docente');
const { paginationSize } = require('../constants/constants');
const {
  getAvailablePeriods,
  getAvailableProfessorsByPeriod,
  getAvailableSubjectsByPeriod,
  getAdvancements,
  queryAdvancements,
  queryAdvancementsCount
} = require('../controllers/advancementsController');

router.get('/', getAdvancements);

router.get('/periods', getAvailablePeriods);

router.get('/professors', async (req, res) => {
  const { search, dateCreationFrom, dateCreationTo, email: correo, page } = req.query;

  try {
    if (!correo) {
      return res.status(400).json({
        error: 'Wrong data provided',
        description: 'Professor email was not provided'
      });
    }

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

router.get('/years/:year/periods/:period/subjects', getAvailableSubjectsByPeriod);

router.get('/years/:year/periods/:period/professors', getAvailableProfessorsByPeriod);

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
      fechaCreacion: new Date(),
      estado: true,
      concertacion: [
        { nombre: 'Evaluacion', porcentaje: 50.0, visto: false },
        { nombre: 'Parcial', porcentaje: 25.0, visto: false },
        { nombre: 'Final', porcentaje: 25.0, visto: false },
      ]
    });
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
    agreement
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
    concertacion: agreement
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
