const express = require('express')
const contenidoModel = require('../models/contenido')
const route = express.Router()
const jwt = require('jsonwebtoken')
const verify = require('./validarToken')
const verifyToken = require('./validarToken')
const { paginationSize } = require('../constants/constants')

route.post('/add', verifyToken, async (req, res) => {

    try {

        const contenidoValidar = await contenidoModel.findOne({ codigo: req.body.codigo })
        if (contenidoValidar) return res.status(400).json({
            error: "Validación Datos",
            descripcion: 'El código ya existe'
        });

        const contenido = new contenidoModel({
            nombre: req.body.nombre,
            codigo: req.body.codigo,
            descripcion: req.body.descripcion,
            fechaActualizacion: new Date(),
            fechaCreacion: new Date(),
            estado: true,
            contenidoSemana: req.body.contenidoSemana

        })


        const save = await contenido.save()
        res.status(200).json({
            error: false,
            descripcion: "Registro Alamcenado Exitosamente",
            contenido: save
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })

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
                    { 'descripcion': regex },
                ]
            }
            query = {
                $and: [query, or],
            };
        }

        const contenido = await contenidoModel.find(query)
            .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
            .limit(paginationSize).sort({ fechaCreacion: -1 });
        const totalContenidos = await contenidoModel.count(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            contenidos: contenido,
            totalContenidos
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
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
                    { 'codigo': regex },
                    { 'nombre': regex },
                    { 'descripcion': regex },
                ]
            }
            query = {
                $and: [query, or],
            };
        }

        const contenido = await contenidoModel.find(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            contenidos: contenido
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

route.post('/getAllContenidoByAsignatura', verifyToken, async (req, res) => {
    try {
        let query = {}

        //Datos para los filtros
        let search = req.body.search;

        if (req.body.contenidosIds) {
            query = { _id: { $in: req.body.contenidosIds } }
        }

        const contenidos = await contenidoModel.find(query);

        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            contenidos: contenidos
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})
route.post('/getAllContenidoByAsignaturaNT', async (req, res) => {
    try {
        let query = {}

        //Datos para los filtros
        let search = req.body.search;

        if (req.body.contenidosIds) {
            query = { _id: { $in: req.body.contenidosIds } }
        }

        const contenidos = await contenidoModel.find(query);

        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            contenidos: contenidos
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
    try {
        const id = req.params.id;
        const contenido = await contenidoModel.findById(id);
        if (contenido != null) {
            res.status(200).json({
                error: false,
                descripcion: "Consulta Exitosa",
                contenido: contenido
            })

        } else {
            if (contenido == null) {
                res.status(400).json({
                    error: false,
                    descripcion: "Contenido no Existe",
                })
            }

        }

    } catch (error) {
        res.status(500).json({
            body: {
                error: true,
                descripcion: error.message
            }
        })
    }
})

route.delete('/:id', verifyToken, async (req, res) => {
    try {
        const contenidoId = req.params.id;
        const contenido = contenidoModel.remove({
            _id: id
        })
        res.send(contenido)
    } catch (error) {
        res.send(error.message)
    }

})

route.post('/eliminar/:id', verifyToken, async (req, res) => {
    const id = req.params.id;

    try {
        const update = await contenidoModel.updateOne(
            { _id: id },
            { $set: req.body }
        )
        res.status(200).json({
            error: false,
            descripcion: "Registro Actualizado Exitosamente",
            contenido: update
        })
    } catch (error) {
        res.status(400).json({
            error: true,
            descripcion: error.message
        })
    }

})

route.patch('/:id', verifyToken, async (req, res) => {
    try {
        const contenidoValidar = await contenidoModel.findOne({ codigo: req.body.codigo });
        if (contenidoValidar && contenidoValidar._id.toString() !== req.params.id) return res.status(400).json({
            error: "Validación Datos",
            descripcion: 'El código ya existe'
        });

        const id = req.params.id;
        const contenido = {
            nombre: req.body.nombre,
            codigo: req.body.codigo,
            descripcion: req.body.descripcion,
            fechaActualizacion: new Date(),
            contenidoSemana: req.body.contenidoSemana

        };
        const update = await contenidoModel.updateOne({
            _id: id
        }, {
            $set: { ...contenido }
        })
        res.status(200).json({
            error: false,
            descripcion: "Registro Actualizado Exitosamente",
            contenido: update
        })

    } catch (error) {
        res.status(400).json({
            error: true,
            descripcion: "Registro NO fue Actualizado ",
            contenido: error.message
        })

    }

})


module.exports = route