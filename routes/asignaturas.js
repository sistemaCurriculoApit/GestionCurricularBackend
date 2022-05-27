const express = require('express')
const asignaturaModel = require('../models/asignatura')
const areaModel = require('../models/area')
const route = express.Router()
const jwt = require('jsonwebtoken')
const verify = require('./validarToken')
const verifyToken = require('./validarToken')
const { paginationSize } = require('../constants/constants')
const area = require('../models/area')



route.post('/add', verifyToken, async (req, res) => {
    try {
        const asignaturaValidar = await asignaturaModel.findOne({ codigo: req.body.codigo })
        if (asignaturaValidar) return res.status(400).json({
            error: "Validacion Datos",
            descripcion: 'El código ya existe'
        });


        const asignatura = new asignaturaModel({
            nombre: req.body.nombre,
            codigo: req.body.codigo,
            semestre: req.body.semestre,
            cantidadCredito: req.body.cantidadCredito,
            fechaActualizacion: new Date(),
            fechaCreacion: new Date(),
            intensidadHoraria: req.body.intensidadHoraria,
            estado: true,
            contenido: req.body.contenido,
            docente: req.body.docente,
            equivalencia: req.body.equivalencia
        })

        const asignaturaSaved = await asignatura.save()
        res.status(200).json({
            error: false,
            descripcion: "Registro Alamcenado Exitosamente",
            asignatura: asignaturaSaved

        })
    } catch (error) {
        res.status(400).json({
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
                ]
            }
            query = {
                $and: [query, or],
            };
        }

        const asignaturas = await asignaturaModel.find(query)
            .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
            .limit(paginationSize).sort({ fechaCreacion: -1 });
        const totalAsignaturas = await asignaturaModel.count(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            asignaturas: asignaturas,
            totalAsignaturas
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

        const asignaturas = await asignaturaModel.find(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            asignaturas: asignaturas
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

route.post('/getAllAsignaturasByPlan', verifyToken, async (req, res) => {
    try {
        let query = {}

        //Datos para los filtros
        let search = req.body.search;

        const areas = await areaModel.find({ _id: { $in: req.body.areasIds } });
        let asignaturasIds = [];
        if (areas.length) {
            for (let i = 0; i < areas.length; i++) {
                asignaturasIds.push(...areas[i].asignatura.map((asignatura) => asignatura._id));
            }
        }
        if (!asignaturasIds.length) {
            res.status(200).json({
                error: false,
                descripcion: "Consulta Exitosa",
                asignaturas: []
            })
            return
        } else {
            if (asignaturasIds) {
                query = { _id: { $in: asignaturasIds } }
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



            const asignaturas = await asignaturaModel.find(query);
            res.status(200).json({
                error: false,
                descripcion: "Consulta Exitosa",
                asignaturas: asignaturas
            })

        }

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
        let asignaturaIds = req.body.asignaturaIds;
        if (asignaturaIds) {
            query = { _id: { $in: asignaturaIds } }
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

        const asignaturas = await asignaturaModel.find(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            asignaturas
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

route.post('/byListIdsPaginated', verifyToken, async (req, res) => {
    try {
        let pageNumber = req.body.page ? req.body.page * 1 : 0;
        let query = {}

        //Datos para los filtros
        let asignaturaIds = req.body.asignaturaIds;
        if (asignaturaIds) {
            query = { _id: { $in: asignaturaIds } }
        }

        const asignaturas = await asignaturaModel.find(query)
            .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
            .limit(paginationSize).sort({ fechaCreacion: -1 });

        const totalAsignaturas = await asignaturaModel.count(query);

        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            asignaturas,
            totalAsignaturas
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

route.post('/byListIdsPaginatedNT', async (req, res) => {
    try {
        let pageNumber = req.body.page ? req.body.page * 1 : 0;
        let query = {}

        //Datos para los filtros
        let asignaturaIds = req.body.asignaturaIds;
        if (asignaturaIds) {
            query = { _id: { $in: asignaturaIds } }
        }

        const asignaturas = await asignaturaModel.find(query)
            .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
            .limit(paginationSize).sort({ fechaCreacion: -1 });

        const totalAsignaturas = await asignaturaModel.count(query);

        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            asignaturas,
            totalAsignaturas
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

    try {
        const asignatura = await asignaturaModel.findById(id);
        res.status(200).json({

            error: false,
            descripcion: "Registro Alamcenado Exitosamente",
            asignatura: asignatura

        })

    } catch (error) {
        res.status(400).json({

            error: true,
            descripcion: error.message

        })
    }
})

route.delete('/:id', verifyToken, async (req, res) => {
    const id = req.params.id;

    try {
        const asignatura = await asignaturaModel.updateOne(
            { _id: id },
            { $set: req.body }
        )
        res.status(200).json({
            error: false,
            descripcion: "Registro Actualizado Exitosamente",
            asignatura: asignatura
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
        const id = req.params.id;

        const asignaturaValidar = await asignaturaModel.findOne({ codigo: req.body.codigo })
        if (asignaturaValidar && asignaturaValidar._id.toString() !== req.params.id) return res.status(400).json({
            error: "Validacion Datos",
            descripcion: 'El código ya existe'
        });


        const update = await asignaturaModel.updateOne({
            _id: id
        }, {
            $set: req.body
        })
        res.status(200).json({
            error: false,
            descripcion: "Registro Actualizado Exitosamente",
            asignatura: update
        })
    } catch (error) {
        res.status(400).json({

            error: true,
            descripcion: error.message

        })
    }

})


module.exports = route