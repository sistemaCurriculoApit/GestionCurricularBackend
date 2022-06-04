const express = require('express')
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const homologacionModel = require('../models/homologacion')
const jwt = require('jsonwebtoken')
const verify = require('./validarToken')
const verifyToken = require('./validarToken')
const route = express.Router()
const { paginationSize } = require('../constants/constants')



route.post('/add', verifyToken, async (req, res) => {
  try {

    let estado = req.body.estadoHomologacion ? parseInt(req.body.estadoHomologacion):0;

    const homologacion = new homologacionModel({
      programaId: req.body.programaId,
      planId: req.body.planId,
      asignaturaId:req.body.asignaturaId,
      identificacionSolicitante: req.body.identificacionSolicitante,
      nombreSolicitante: req.body.nombreSolicitante,
      universidadSolicitante: req.body.universidadSolicitante,
      programaSolicitante: req.body.programaSolicitante,
      asignaturaSolicitante: req.body.asignaturaSolicitante,
      añoHomologacion: req.body.añoHomologacion,
      periodo: req.body.periodo,
      estadoHomologacion: estado,
      fechaDecision: estado === 2 ? req.body.fechaDecision : null,
      descripcion: req.body.descripcion,
      fechaActualizacion: new Date(),
      fechaCreacion: new Date(),
      estado: true,
    })

    const save = await homologacion.save();
    res.send(save);
  } catch (err) {
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


    const homologaciones = await homologacionModel.find(query)
      .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
      .limit(paginationSize).sort({ fechaCreacion: -1 });

    const totalHomologaciones = await homologacionModel.count(query);
    res.send({ homologaciones, totalHomologaciones })
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

    const homologaciones = await homologacionModel.find(query);
    res.status(200).json({
      error: false,
      descripcion: "Consulta Exitosa",
      homologaciones
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      descripcion: error.message
    })
  }
})

route.post('/allByIdSolicitante', verifyToken, async (req, res) => {
  try {
    let query = {}
    let pageNumber = req.body.page ? req.body.page * 1 : 0;

    //Datos para los filtros
    let identificacionSolicitante = req.body.identificacionSolicitante;

    query = {identificacionSolicitante:{$eq:identificacionSolicitante}}

    const homologaciones = await homologacionModel.find(query).skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
    .limit(paginationSize).sort({ fechaCreacion: -1 });
    
    const totalHomologaciones = await homologacionModel.count(query);

    res.status(200).json({
      error: false,
      descripcion: "Consulta Exitosa",
      homologaciones,
      totalHomologaciones
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
    let añoHomologacion = req.body.añoHomologacion;
    let periodo = req.body.periodo;

    query = {añoHomologacion:{$eq:añoHomologacion},periodo:{$eq:periodo}}
    const homologaciones = await homologacionModel.find(query).skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
    .limit(paginationSize).sort({ fechaCreacion: -1 });
    
    const totalHomologaciones = await homologacionModel.count(query);

    res.status(200).json({
      error: false,
      descripcion: "Consulta Exitosa",
      homologaciones,
      totalHomologaciones
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
  const homologacion = await homologacionModel.findById(id);
  try {
    res.send(homologacion)
  } catch (error) {
    res.send(error.message)
  }
})

route.delete('/:id', verifyToken, async (req, res) => {
  const homologacionId = req.params.id;
  const homologacion = homologacionModel.remove({
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
    let estado = req.body.estadoHomologacion ? parseInt(req.body.estadoHomologacion):0;
    const homologacion = {
      programaId: req.body.programaId,
      planId: req.body.planId,
      asignaturaId:req.body.asignaturaId,
      identificacionSolicitante: req.body.identificacionSolicitante,
      nombreSolicitante: req.body.nombreSolicitante,
      universidadSolicitante: req.body.universidadSolicitante,
      programaSolicitante: req.body.programaSolicitante,
      asignaturaSolicitante: req.body.asignaturaSolicitante,
      añoHomologacion: req.body.añoHomologacion,
      periodo: req.body.periodo,
      estadoHomologacion: estado,
      fechaDecision: estado !== 2 ? req.body.fechaDecision : null,
      descripcion: req.body.descripcion,
      fechaActualizacion: new Date(),
    };
    const update = await homologacionModel.updateOne({
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