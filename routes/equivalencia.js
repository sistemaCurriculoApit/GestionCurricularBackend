const express = require('express')
const equivalenciaModel = require('../models/equivalencia')
const route = express.Router()
const verifyToken = require('./validarToken')
const { paginationSize } = require('../constants/constants')

route.post('/add', verifyToken, async(req, res) => {
    try{
        const equivalenciaValidar = await equivalenciaModel.findOne({ sourceCourseCode: req.body.sourceCourseCode })
        if (equivalenciaValidar) return res.status(400).json({
            error: "Validacion Datos",
            descripcion: 'El código ya existe'
        });

        const equivalencia = new equivalenciaModel({
            sourcePlan: req.body.sourcePlan,
            sourcePlanName: req.body.sourcePlanName,
            sourceCourseCode: req.body.sourceCourseCode,
            sourceCourseName: req.body.sourceCourseName
        })

        const equivalenciaSaved = await equivalencia.save()
        res.status(200).json({
            error: false,
            descripcion: "Equivalencia guardada correctamente",
            equivalencia: equivalenciaSaved
        })

    } catch (error){
        res.status(500).json({
            error: true,
            description: error.message
        })
    }
})

route.patch('/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;

        const asignaturaValidar = await equivalenciaModel.findOne({ sourceCourseCode: req.body.sourceCourseCode })
        if (asignaturaValidar && asignaturaValidar._id.toString() !== req.params.id) return res.status(400).json({
            error: "Validacion Datos",
            descripcion: 'El código ya existe'
        });


        const update = await equivalenciaModel.updateOne({
            _id: id
        }, {
            $set: req.body
        })
        res.status(200).json({
            error: false,
            descripcion: "Registro Actualizado Exitosamente",
            equivalencia: update
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
        const equivalencia = await equivalenciaModel.deleteOne(
            { _id: id },
            { $set: req.body }
        )
        res.status(200).json({
            error: false,
            descripcion: "Registro Eliminado Exitosamente",
            equivalencia: equivalencia
        })
    } catch (error) {
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
        if (search) {
            var regex = new RegExp(search, 'ig');
            const or = {
                $or: [
                    { 'sourceCourseName': regex },
                    { 'sourceCourseCode': regex },
                ]
            }
            query = {
                $and: [query, or],
            };
        }

        const equivalencias = await equivalenciaModel.find(query)
            .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
            .limit(paginationSize).sort({ fechaCreacion: -1 });
        const totalEquivalencias = await equivalenciaModel.count(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            equivalencias: equivalencias,
            totalEquivalencias
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
                    { 'sourceCourseName': regex },
                    { 'sourceCourseCode': regex },
                ]
            }
            query = {
                $and: [query, or],
            };
        }

        const equivalencias = await equivalenciaModel.find(query);
        // const totalEquivalencias = await equivalenciaModel.count(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            equivalencias: equivalencias,
            // totalEquivalencias
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
        const equivalencia = await equivalenciaModel.findById(id);
        if (equivalencia != null) {
            res.status(200).json({
                error: false,
                descripcion: "Consulta Exitosa",
                equivalencia: equivalencia
            })
        } else {
            if (equivalencia == null) {
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


route.post('/getEquivalenciaByAsignatura', verifyToken, async (req, res) => {
    try {
        let query = {}

        //Datos para los filtros
        let search = req.body.search;

        if (req.body.equivalenciasIds) {
            query = { _id: { $in: req.body.equivalenciasIds } }
        }

        const equivalencias = await equivalenciaModel.find(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            equivalencias: equivalencias
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})


module.exports = route