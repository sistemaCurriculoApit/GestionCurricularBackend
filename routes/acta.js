const express = require('express')
const actaModel = require('../models/acta')
const route = express.Router()
const jwt = require('jsonwebtoken')
const verify = require('./validarToken')
const verifyToken = require('./validarToken')
const { paginationSize } = require('../constants/constants')


route.post('/add', verifyToken, async (req, res) => {

    const acta = new actaModel({
        actividad: req.body.actividad,
        lugar: req.body.lugar,
        asistente: req.body.asistente,
        tema: req.body.tema,
        conclusion: req.body.conclusion,
        fechaActa: new Date(req.body.fechaActa),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        estado: true
    })
    
    try {
        const save = await acta.save()
        res.send(save)
    } catch (err) {
        res.send(err.message)
    }

})
route.get('/all', verifyToken, async (req, res) => {
    let pageNumber = req.query.page ? req.query.page * 1 : 0;
    let query = {}
    try {

        //Datos para los filtros
        let search = req.query.search;
        let dateCreationFrom = req.query.dateCreationFrom;
        let dateCreationTo = req.query.dateCreationTo;
        let dateActaFrom = req.query.dateActaFrom;
        let dateActaTo = req.query.dateActaTo;

        if (dateActaFrom || dateActaTo) {
            query.fechaActa = {}
            if (dateActaFrom) {
                query.fechaActa.$gte = new Date(new Date(dateActaFrom).toDateString()).toISOString();
            }
            if (dateActaTo) {
                query.fechaActa.$lte = new Date(new Date(dateActaTo).toDateString()).toISOString();
            }
        }

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
                    { 'actividad': regex },
                    { 'lugar': regex },
                    { 'asistente': regex },
                    { 'tema': regex },
                    { 'conclusion': regex },
                ]
            }
            query = {
                $and: [query, or],
            };
        }
        const actas = await actaModel.find(query)
            .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
            .limit(paginationSize).sort({ fechaCreacion: -1 });

        const totalActas = await actaModel.count(query);
        res.send({ actas, totalActas })
    } catch (error) {
        console.log(error);
        res.send(error.message)
    }
})

route.get('/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const acta = await actaModel.findById(id);
    try {
        res.status(200).json({
            error: false,
            descripcion:'La Consulta fue exitosa ',
            acta:acta})
    } catch (error) {
        res.status(400).json({
            error:true,
            descripcion:error.message})
    }
})

route.delete('/:id', verifyToken, async (req, res) => {
    const actaId = req.params.id;
  
    try {
        const actaDelete = actaModel.remove({
            _id: id
        })
        res.status(200).json({
            error:false,
            descripcion:'Registro eliminado correctamente',
            acta:actaDelete})
    } catch (error) {
        res.status(400).json({
            error:true,
            descripcion:error.message})
    }

})

route.patch('/:id', verifyToken, async (req, res) => {
    const actaId = req.params.id;
    const acta = {
        actividad: req.body.actividad,
        lugar: req.body.lugar,
        asistente: req.body.asistente,
        tema: req.body.tema,
        conclusion: req.body.conclusion,
        fechaActualizacion: new Date(),
    };
   
    try {
        const update = await actaModel.updateOne({
            _id: actaId
        }, {
            $set: acta
        })
        res.send(update)
    } catch (error) {
        res.send(error.message)
    }

})
module.exports = route