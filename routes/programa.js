const express = require('express')
const programaModel = require('../models/programa')
const jwt = require('jsonwebtoken')
const verify = require('./validarToken')
const verifyToken = require('./validarToken')
const route = express.Router()
const { paginationSize } = require('../constants/constants')



route.post('/add', verifyToken, async (req, res) => {
    try {

        const programaValidar = await programaModel.findOne({ codigo: req.body.codigo });
        if (programaValidar) return res.status(400).json({
            error: true,
            descripcion: 'El código del programa ya existe'
    
        });
    

        const programa = new programaModel({
            nombre: req.body.nombre,
            codigo: req.body.codigo,
            descripcion: req.body.descripcion,
            fechaActualizacion: new Date(),
            fechaCreacion: new Date(),
            estado: true,
            plan: req.body.plan

        })

        const save = await programa.save();
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
                    { 'codigo': regex },
                    { 'nombre': regex },
                ]
            }
            query = {
                $and: [query, or],
            };
        }


        const programas = await programaModel.find(query)
            .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
            .limit(paginationSize).sort({ fechaCreacion: -1 });

        const totalProgramas = await programaModel.count(query);
        res.send({ programas, totalProgramas })
    } catch (error) {
        res.status(400).json({
            error: true,
            descripcion: error.message
        })
    }
})

route.get('/allNotPaginated',verifyToken, async (req, res) => {
    try {
        let query = {}

        //Datos para los filtros
        let search = req.query.search;

        if (search) {
            var regex = new RegExp(search, 'ig');
            const or = {
                $or: [
                    { 'codigo': regex },
                    { 'nombre': regex },
                ]
            }
            query = {
                $and: [query, or],
            };
        }

        const programas = await programaModel.find(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            programas
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

route.get('/allNotPaginatedNT', async (req, res) => {
    try {
        let query = {}

        //Datos para los filtros
        let search = req.query.search;

        if (search) {
            var regex = new RegExp(search, 'ig');
            const or = {
                $or: [
                    { 'codigo': regex },
                    { 'nombre': regex },
                ]
            }
            query = {
                $and: [query, or],
            };
        }

        const programas = await programaModel.find(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            programas
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
    const programa = await programaModel.findById(id);
    try {
        res.send(programa)
    } catch (error) {
        res.send(error.message)
    }
})

route.delete('/:id', verifyToken, async (req, res) => {
    const programaId = req.params.id;
    const programa = programaModel.remove({
        _id: id
    })
    try {
        res.send(programa)
    } catch (error) {
        res.send(error.message)
    }

})

route.patch('/:id', verifyToken, async (req, res) => {
    try {
        const programaValidar = await programaModel.findOne({ codigo: req.body.codigo });
        if (programaValidar && programaValidar._id.toString() !== req.params.id) return res.status(400).json({
            error: true,
            descripcion: 'El código del programa ya existe'
    
        });
        
        const id = req.params.id;
        const programa = {
            nombre: req.body.nombre,
            codigo: req.body.codigo,
            descripcion: req.body.descripcion,
            fechaActualizacion: new Date(),
            plan: req.body.plan
        };
        const update = await programaModel.updateOne({
            _id: id
        }, {
            $set: programa
        });
        res.status(200).json({
            error: false,
            descripcion: "Registro Actualizado Exitosamente",
            programa: update
        })
    } catch (error) {
        res.send(error.message)
    }

})


module.exports = route