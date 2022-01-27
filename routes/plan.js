const express = require("express")
const planModel = require("../models/plan")
const route = express.Router()
const joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const verifyToken = require('./validarToken')
const { paginationSize } = require('../constants/constants')


route.post('/add', verifyToken, async (req, res) => {

    const planValidar = await planModel.findOne({ codigo: req.body.codigo });
    if (planValidar) return res.status(400).json({
        error: true,
        descripcion: 'El código del plan ya existe'

    });

    const plan = new planModel({
        nombre: req.body.nombre,
        codigo: req.body.codigo,
        descripcion: req.body.descripcion,
        fechaActualizacion: new Date(),
        fechaCreacion: new Date(),
        estado: true,
        area: req.body.area
    })

    try {
        const save = await plan.save()
        res.status(200).json({
            error: false,
            descripcion: "Registro Almacenado Exitosamente",
            plan: save
        })
    } catch (err) {
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


        const planes = await planModel.find(query)
            .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
            .limit(paginationSize).sort({ fechaCreacion: -1 });

        const totalPlanes = await planModel.count(query);
        res.send({ planes, totalPlanes })
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
                    { 'codigo': regex },
                    { 'nombre': regex },
                ]
            }
            query = {
                $and: [query, or],
            };
        }

        const planes = await planModel.find(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            planes
        })
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
        let planIds = req.body.planIds;
        if (planIds) {
            query = { _id: { $in: planIds } }
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

        const planes = await planModel.find(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            planes
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

route.post('/byListIdsNT', async (req, res) => {
    try {
        let query = {}

        //Datos para los filtros
        let search = req.body.search;
        let planIds = req.body.planIds;
        if (planIds) {
            query = { _id: { $in: planIds } }
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

        const planes = await planModel.find(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            planes
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
        const plan = await planModel.findById(id);

        res.status(200).json({

            error: false,
            descripcion: "Consulta Exitosa",
            plan: plan

        })


    } catch (error) {
        res.status(500).json({
            error: true,
            descripcion: error.message

        })
    }
})


route.delete('/:id', verifyToken, async (req, res) => {
    const id = req.params.id;

    try {
        const plan = await planModel.updateOne(
            { _id: id },
            { $set: req.body }
        )
        res.status(200).json({
            error: false,
            descripcion: "Registro Actualizado Exitosamente",
            plan: plan
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
        const planValidar = await planModel.findOne({ codigo: req.body.codigo });
        if (planValidar && planValidar._id.toString() !== req.params.id) return res.status(400).json({
            error: true,
            descripcion: 'El código del plan ya existe'

        });

        const id = req.params.id;
        const plan = {
            nombre: req.body.nombre,
            codigo: req.body.codigo,
            descripcion: req.body.descripcion,
            fechaActualizacion: new Date(),
            area: req.body.area
        };

        const update = await planModel.updateOne({
            _id: id
        }, {
            $set: plan
        })
        res.status(200).json({
            error: false,
            descripcion: "Registro Actualizado Exitosamente",
            plan: update
        })
    } catch (error) {
        res.status(400).json({

            error: true,
            descripcion: error.message

        })
    }

})
module.exports = route