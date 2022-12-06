const actaModel = require('../models/acta');
const userModel = require('../models/user');
const docenteModel = require('../models/docente');
const homologacion = require('../models/homologation');
const avance = require('../models/advancement');
const router = require('express').Router();
const verifyToken = require('../util/tokenValidation');

router.get('/dataCount', verifyToken, async (req, res) => {
  try {
    const totalUsers = await userModel.count({});
    const totalDocentes = await docenteModel.count({});
    const totalActas = await actaModel.count({});

    res.send({ totalUsers, totalDocentes, totalActas });
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});

router.get('/chartHomologaciones', verifyToken, async (req, res) => {
  try {
    const query = {};
    const homologacionesByMonth = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const firstDay = new Date(date.getFullYear(), i, 1);
      const lastDay = new Date(date.getFullYear(), i + 1, 0);
      query.fechaCreacion = {};
      query.fechaCreacion.$gte = firstDay.toISOString();
      query.fechaCreacion.$lte = lastDay.toISOString();
      const homologaciones = await homologacion.count(query);
      homologacionesByMonth.push(homologaciones);
    }

    res.send({ homologacionesByMonth });
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});

router.get('/chartAvances', verifyToken, async (req, res) => {
  try {
    const query = {};
    const avancesByMonth = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const firstDay = new Date(date.getFullYear(), i, 1);
      const lastDay = new Date(date.getFullYear(), i + 1, 0);
      query.fechaCreacion = {};
      query.fechaCreacion.$gte = firstDay.toISOString();
      query.fechaCreacion.$lte = lastDay.toISOString();
      const avances = await avance.count(query);
      avancesByMonth.push(avances);
    }

    res.send({ avancesByMonth });
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});

module.exports = router;
