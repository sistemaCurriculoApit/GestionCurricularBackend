const express = require('express')
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const avanceModel = require('../models/avance')
const docenteModel = require('../models/docente')
const jwt = require('jsonwebtoken')
const verify = require('./validarToken')
const verifyToken = require('./validarToken')
const route = express.Router()
const { paginationSize } = require('../constants/constants')



route.post('/add', verifyToken, async (req, res) => {
  try {
    const avance = new avanceModel({
      programaId: req.body.programaId,
      planId: req.body.planId,
      areaId:req.body.areaId,
      asignaturaId:req.body.asignaturaId,
      docenteId:req.body.docenteId,
      contenido:req.body.contenido,
      añoAvance: req.body.añoAvance,
      periodo: req.body.periodo,
      porcentajeAvance: req.body.porcentajeAvance,
      descripcion: req.body.descripcion,
      fechaActualizacion: new Date(),
      fechaCreacion: new Date(),
      estado: true,
    })
    const save = await avance.save();
    res.send(save);
  } catch (err) {
    console.error(err);
    res.status(400).json({
      error: true,
      descripcion: err.message
    });
  }

})

route.get('/all', verifyToken, async (req, res) => {

  try {
    let pageNumber = req.query.page ? req.query.page * 1 : 0;
    let query = {}

    //Datos para los filtros
    let search = req.query.search;
    let dateCreationFrom = req.query.dateCreationFrom;
    let dateCreationTo = req.query.dateCreationTo;


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
      var regex = new RegExp(search, 'ig');
      const or = {
        $or: [
          { 'descripcion': regex },
        ]
      }
      query = {
        $and: [query, or],
      };
    }


    const avances = await avanceModel.find(query)
      .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
      .limit(paginationSize).sort({ fechaCreacion: -1 });

    const totalAvances = await avanceModel.count(query);
    res.send({ avances, totalAvances })
  } catch (error) {
    res.status(400).json({
      error: true,
      descripcion: error.message
    })
  }
})


route.get('/allByDocenteEmail', verifyToken, async (req, res) => {

  try {
    let pageNumber = req.query.page ? req.query.page * 1 : 0;
    let query = {}

    //Datos para los filtros
    let search = req.query.search;
    let dateCreationFrom = req.query.dateCreationFrom;
    let dateCreationTo = req.query.dateCreationTo;

    let docente = await docenteModel.findOne({correo: req.query.emailDocente})

    if (!docente) return res.status(400).json({
      error: "Validación Datos",
      descripcion: 'El docente no existe'
    });

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
      var regex = new RegExp(search, 'ig');
      const or = {
        $or: [
          { 'descripcion': regex },
        ]
      }
      query = {
        $and: [query, or],
        $and: [{'docenteId' : docente._id}]
      };
    }else {
      query = {
        $and: [{'docenteId' : docente._id}]
      };
    }


    const avances = await avanceModel.find(query)
      .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
      .limit(paginationSize).sort({ fechaCreacion: -1 });

    const totalAvances = await avanceModel.count(query);
    res.send({ avances, totalAvances })
  } catch (error) {
    res.status(400).json({
      error: true,
      descripcion: error.message
    })
  }
})

route.get('/allNotPaginated', verifyToken, async (req, res) => {
  try {
    let query = {}

    //Datos para los filtros
    let search = req.query.search;

    if (search) {
      var regex = new RegExp(search, 'ig');
      const or = {
        $or: [
          { 'identificacionSolicitante': regex },
          { 'nombreSolicitante': regex },
          { 'universidadSolicitante': regex },
          { 'programaSolicitante': regex },
          { 'asignaturaSolicitante': regex },
        ]
      }
      query = {
        $and: [query, or],
      };
    }

    const avances = await avanceModel.find(query);
    res.status(200).json({
      error: false,
      descripcion: "Consulta Exitosa",
      avances
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    })
  }
})
route.post('/allByAsignatura', verifyToken, async (req, res) => {
  try {
    let query = {}
    let pageNumber = req.body.page ? req.body.page * 1 : 0;
    let paginationSizeLocal = req.body.paginationSize || paginationSize;


    //Datos para los filtros
    let añoAvance = req.body.añoAvance;
    let periodo = req.body.periodo;
    let asignaturaId = req.body.asignaturaId;

    query = {añoAvance:{$eq:añoAvance},periodo:{$eq:periodo},asignaturaId:{$eq:asignaturaId}}

    const avances = await avanceModel.find(query).skip(pageNumber > 0 ? (pageNumber * paginationSizeLocal) : 0)
    .limit(paginationSizeLocal).sort({ fechaCreacion: -1 });
    
    const totalAvances = await avanceModel.count(query);

    res.status(200).json({
      error: false,
      descripcion: "Consulta Exitosa",
      avances,
      totalAvances
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    })
  }
})

route.post('/allByDocente', verifyToken, async (req, res) => {
  try {
    let query = {}
    let pageNumber = req.body.page ? req.body.page * 1 : 0;
    let paginationSizeLocal = req.body.paginationSize || paginationSize;

    //Datos para los filtros
    let añoAvance = req.body.añoAvance;
    let periodo = req.body.periodo;
    let docenteId = req.body.docenteId;

    query = {añoAvance:{$eq:añoAvance},periodo:{$eq:periodo},docenteId:{$eq:docenteId}}

    const avances = await avanceModel.find(query).skip(pageNumber > 0 ? (pageNumber * paginationSizeLocal) : 0)
    .limit(paginationSizeLocal).sort({ fechaCreacion: -1 });
    
    const totalAvances = await avanceModel.count(query);

    res.status(200).json({
      error: false,
      descripcion: "Consulta Exitosa",
      avances,
      totalAvances
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    })
  }
})

route.post('/allByPeriodo', verifyToken, async (req, res) => {
  try {
    let query = {}
    let pageNumber = req.body.page ? req.body.page * 1 : 0;

    //Datos para los filtros
    let añoAvance = req.body.añoAvance;
    let periodo = req.body.periodo;

    query = {añoAvance:{$eq:añoAvance},periodo:{$eq:periodo}}

    const avances = await avanceModel.find(query).skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
    .limit(paginationSize).sort({ fechaCreacion: -1 });
    
    const totalAvances = await avanceModel.count(query);

    res.status(200).json({
      error: false,
      descripcion: "Consulta Exitosa",
      avances,
      totalAvances
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    })
  }
})


route.get('/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  const homologacion = await avanceModel.findById(id);
  try {
    res.send(homologacion)
  } catch (error) {
    res.send(error.message)
  }
})

route.delete('/:id', verifyToken, async (req, res) => {
  const homologacionId = req.params.id;
  const homologacion = avanceModel.remove({
    _id: id
  })
  try {
    res.send(homologacion)
  } catch (error) {
    res.send(error.message)
  }

})

route.patch('/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const homologacion = {
      programaId: req.body.programaId,
      planId: req.body.planId,
      areaId:req.body.areaId,
      asignaturaId:req.body.asignaturaId,
      docenteId:req.body.docenteId,
      contenido:req.body.contenido,
      añoAvance: req.body.añoAvance,
      periodo: req.body.periodo,
      porcentajeAvance: req.body.porcentajeAvance,
      descripcion: req.body.descripcion,
      fechaActualizacion: new Date(),
    };
    const update = await avanceModel.updateOne({
      _id: id
    }, {
      $set: homologacion
    });
    res.status(200).json({
      error: false,
      descripcion: "Registro Actualizado Exitosamente",
      homologacion: update
    })
  } catch (error) {
    res.send(error.message)
  }

})


module.exports = route