const express = require('express')
const docenteModel = require('../models/docente')
const route = express.Router()
const joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const verify = require('./validarToken')
const verifyToken = require('./validarToken')
const { paginationSize } = require('../constants/constants')

route.post('/add', verifyToken, async (req, res) => {

    /* const schema =joi.object({
         name:joi.string().min(5).required(),
         mail:joi.string().min(5).required().email(),
         password:joi.string().min(10).required()
 
     })
     const err=schema.validate(req.body)
      if(err) return res.status(400).send(err.error.details)
 
     const salt= await bcrypt.genSalt(10)
     const haspassword= await bcrypt.hash(req.body.password,salt)
 console.log('paso 1')*/
    // const usuarioValidar = await docenteModel.findOne({ idDocente: req.body.idDocente })
    // if (usuarioValidar) return res.status(400).json({        
    //         error: true,
    //         descripcion: 'El usuario ya existe'
        
    // });
    const docente = new docenteModel({
        nombre: req.body.nombre,
        correo: req.body.correo,
        documento: req.body.documento,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        estado: true

    })

    const save = await docente.save();
    try {
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            docente: save
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }

})

route.get('/all', verifyToken, async (req, res) => {
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
                { 'nombre': regex },
                { 'correo': regex },
                { 'documento': regex },
            ]
        }
        query = {
            $and: [query, or],
        };
    }

    
    try {
        const docentes = await docenteModel.find(query)
        .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
        .limit(paginationSize).sort({ fechaCreacion: -1 });

    const totalDocentes = await docenteModel.count(query);
        res.status(200).json({
            error:false,
            descripcion:'consulta Exitosa',            
            docentes: docentes, totalDocentes })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

route.get('/allNotPaginated', verifyToken, async (req, res) => {
    let query = {}
    //Datos para los filtros
    let search = req.query.search;

    if (search) {
        var regex = new RegExp(search, 'ig');
        const or = {
            $or: [
                { 'nombre': regex },
                { 'correo': regex },
                { 'documento': regex },
            ]
        }
        query = {
            $and: [query, or],
        };
    }

    const docentes = await docenteModel.find(query);
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
        })
    }
})

route.post('/byListIds', verifyToken, async (req, res) => {
    try {
        let query = {}

        //Datos para los filtros
        let search = req.body.search;
        let docenteIds = req.body.docenteIds;
        if (docenteIds) {
            query = { _id: { $in: docenteIds } }
        }

        if (search) {
            var regex = new RegExp(search, 'ig');
            const or = {
                $or: [
                    { 'nombre': regex },
                    { 'correo': regex },
                    { 'documento': regex },
                ]
            }
            query = {
                $and: [query, or],
            };
        }

        const docentes = await docenteModel.find(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            docentes
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
    const docente = await docenteModel.findById(id);
    try {
        res.status(200).json({
            error:false,
            descripcion:'Consulta Exitosa',
            docente:docente})
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

route.delete('/:id', verifyToken, async (req, res) => {
    const docenteId = req.params.id;
    
    try {
        const docenteDelete = await docenteModel.remove({
            _id: id
        })
        res.send(docenteDelete)
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }

})
route.patch('/:id', verifyToken, async (req, res) => {
    const docenteId = req.params.id;
    const docente = {
        nombre: req.body.nombre,
        correo: req.body.correo,
        documento: req.body.documento,
        fechaActualizacion: new Date(),
    };
   
    try {
        const update = await docenteModel.updateOne({
            _id: docenteId
        }, {
            $set: { ...docente }
        })
        res.send(docente)
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }

})


route.delete('/delete/:id', verifyToken, async (req, res) => {
    const docenteId = req.params.id;
    const docente = {
        nombre: req.body.nombre,
        correo: req.body.correo,
        documento: req.body.documento,
        fechaActualizacion: new Date(),
        estado:false
    };
   
    try {
        const update = await docenteModel.updateOne({
            _id: docenteId
        }, {
            $set: { ...docente }
        })
        res.send(docente)
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }

})


module.exports = route