const express = require('express')
const actaModel = require('../models/acta')
const userModel = require('../models/user')
const docenteModel = require('../models/docente')
const homologacion = require('../models/homologacion')
const avance = require('../models/avance')
const route = express.Router()
const verifyToken = require('./validarToken')



route.get('/dataCount', verifyToken, async (req, res) => {
    try {

        const totalUsers = await userModel.count({});
        const totalDocentes = await docenteModel.count({});
        const totalActas = await actaModel.count({});

        res.send({ totalUsers, totalDocentes, totalActas })
    } catch (error) {
        console.log(error);
        res.send(error.message)
    }
})

route.get('/chartHomologaciones', verifyToken, async (req, res) => {
    try {
        let query = {}
        let homologacionesByMonth = []
        var date = new Date();
        for (let i = 0; i < 12; i++) {
            var firstDay = new Date(date.getFullYear(), date.getMonth() + i, 1);
            var lastDay = new Date(date.getFullYear(), date.getMonth() + (i + 1), 0);
            query.fechaCreacion = {}
            query.fechaCreacion.$gte = firstDay.toISOString();
            query.fechaCreacion.$lte = lastDay.toISOString();
            const homologaciones = await homologacion.count(query);
            homologacionesByMonth.push(homologaciones);
        }

        res.send({ homologacionesByMonth })
    } catch (error) {
        console.log(error);
        res.send(error.message)
    }
})

route.get('/chartAvances', verifyToken, async (req, res) => {
    try {
        let query = {}
        let avancesByMonth = []
        var date = new Date();
        for (let i = 0; i < 12; i++) {
            var firstDay = new Date(date.getFullYear(), date.getMonth() + i, 1);
            var lastDay = new Date(date.getFullYear(), date.getMonth() + (i + 1), 0);
            query.fechaCreacion = {}
            query.fechaCreacion.$gte = firstDay.toISOString();
            query.fechaCreacion.$lte = lastDay.toISOString();
            const avances = await avance.count(query);
            avancesByMonth.push(avances);
        }

        res.send({ avancesByMonth })
    } catch (error) {
        console.log(error);
        res.send(error.message)
    }
})

module.exports = route