const router = require('express').Router()
const HomologationModel = require('../models/homologation')
const StudentModel = require('../models/estudiante')
const { paginationSize } = require('../constants/constants')

const queryHomologations = (query, paginated, pageNumber, pageSize = paginationSize) => {
  if (!paginated) {
    return HomologationModel.find(query).sort({ fechaCreacion: -1 })
  }

  return HomologationModel.find(query)
    .skip(pageNumber * pageSize)
    .limit(pageSize).sort({ fechaCreacion: -1 })
}

router.get('/', async (req, res) => {
  const { page, search, dateCreationFrom, dateCreationTo, paginated } = req.query

  try {
    const pageNumber = page && page >= 0 ? page : 0;
    const query = {}

    if (dateCreationFrom || dateCreationTo) {
      query.fechaCreacion = {}
      if (dateCreationFrom) {
        query.fechaCreacion.$gte = new Date(new Date(dateCreationFrom).toDateString()).toISOString();
      }
      if (dateCreationTo) {
        query.fechaCreacion.$lte = new Date(new Date(dateCreationTo).toDateString()).toISOString();
      }
    }

    if (search) {
      const regex = new RegExp(search, 'ig');
      query.$or = [
        { 'identificacion': regex },
        { 'nombre': regex },
        { 'universidad': regex },
        { 'programa': regex }
      ]
    }

    const homologations = await queryHomologations(query, paginated, pageNumber);

    res.status(200).json({ homologations, homologationsCount: homologations.length })
  } catch (error) {
    res.status(400).json({
      error: true,
      description: error.message
    })
  }
})

router.post('/', async (req, res) => {
  const {
    programId,
    planId,
    subjectId,
    studentId,
    applicantName,
    applicantCollege,
    applicantProgram,
    applicantSubject,
    homologationYear,
    period,
    homologationStatus,
    desitionDate,
    description,
  } = req.body

  try {
    const student = await StudentModel.findOne({ identificacion: studentId, estado: true })

    if (!student) {
      return res.status(400).json({
        error: "Validación Datos",
        descripcion: 'Estudiante inexistente o inactivo.'
      });
    }


    const status = homologationStatus ? parseInt(homologationStatus) : 0;

    const homologation = new HomologationModel({
      programaId: programId,
      planId: planId,
      asignaturaId: subjectId,
      identificacionSolicitante: studentId,
      nombreSolicitante: applicantName,
      universidadSolicitante: applicantCollege,
      programaSolicitante: applicantProgram,
      asignaturaSolicitante: applicantSubject,
      añoHomologacion: homologationYear,
      periodo: period,
      estadoHomologacion: status,
      fechaDecision: status !== 2 ? desitionDate : null,
      descripcion: description,
      fechaActualizacion: new Date(),
      fechaCreacion: new Date(),
      estado: true,
    })

    const save = await homologation.save();
    student.homologacion.push(save);

    await StudentModel.updateOne({
      _id: student._id
    }, {
      $set: { ...student }
    })

    res.status(201).json(save);
  } catch (err) {
    res.status(400).json({
      error: true,
      descripcion: err.message
    });
  }
})

router.get('/applicants/:id', async (req, res) => {
  const { page } = req.query
  const { id } = req.params;
  try {
    if (!id) {
      throw new Error('No applicant Id was provided')
    }

    const pageNumber = page && page >= 0 ? page : 0;
    const query = { identificacionSolicitante: id }

    const homologations = await queryHomologations(query, true, pageNumber)

    res.status(200).json({ homologations, homologationsCount: homologations.length })
  } catch (error) {
    res.status(400).json({
      error: true,
      description: error.message
    })
  }
})

router.get('/periods/:period', async (req, res) => {
  const { page, homologacionYear } = req.query
  const { period: periodo } = req.params

  try {
    if (!periodo) {
      throw new Error('No period was provided');
    }

    const query = { periodo }
    const pageNumber = page && page >= 0 ? page : 0;

    if (homologacionYear) {
      query['añoHomologacion'] = homologacionYear
    }

    const homologations = await queryHomologations(query, true, pageNumber)

    res.status(200).json({ homologations, homologationsCount: homologations.length })
  } catch (error) {
    res.status(400).json({
      error: true,
      descripcion: error.message
    })
  }
})

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const homologation = await HomologationModel.findById(id);
    res.status(200).json(homologation)
  } catch (error) {
    res.status(400).json({
      error: true,
      descripcion: error.message
    })
  }
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const homologation = await HomologationModel.deleteOne({
      _id: id
    })
    res.status(200).json(homologation)
  } catch (error) {
    res.status(400).json({
      error: true,
      descripcion: error.message
    })
  }

})

router.put('/:id', async (req, res) => {
  const {
    programId,
    planId,
    subjectId,
    studentId,
    applicantName,
    applicantCollege,
    applicantProgram,
    applicantSubject,
    homologationYear,
    period,
    homologationStatus,
    desitionDate,
    description,
  } = req.body

  const { id } = req.params

  try {
    const student = await StudentModel.findOne({ identificacion: studentId, estado: true })

    if (!student) {
      return res.status(400).json({
        error: "Validación Datos",
        descripcion: 'Estudiante inexxistente o inactivo.'
      });
    }

    const status = homologationStatus ? parseInt(homologationStatus) : 0;

    const homologation = {
      programaId: programId,
      planId: planId,
      asignaturaId: subjectId,
      identificacionSolicitante: studentId,
      nombreSolicitante: applicantName,
      universidadSolicitante: applicantCollege,
      programaSolicitante: applicantProgram,
      asignaturaSolicitante: applicantSubject,
      añoHomologacion: homologationYear,
      periodo: period,
      estadoHomologacion: status,
      fechaDecision: status !== 2 ? desitionDate : null,
      descripcion: description,
      fechaActualizacion: new Date(),
      fechaCreacion: new Date(),
      estado: true,
    }

    const update = await HomologationModel.updateOne({
      _id: id
    }, {
      $set: homologation
    });

    student.homologacion.push(id);

    await StudentModel.updateOne({
      _id: student._id
    }, {
      $set: { ...student }
    })
    res.status(200).json({
      homologacion: update
    })
  } catch (error) {
    res.status(400).json({
      error: true,
      descripcion: error.message
    });
  }

})

module.exports = router