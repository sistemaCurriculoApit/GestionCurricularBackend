const actaModel = require('../models/acta');
const userModel = require('../models/user');
const docenteModel = require('../models/docente');
const homologacion = require('../models/homologation');
const avance = require('../models/advancement');
const router = require('express').Router();
const verifyToken = require('../util/tokenValidation');

router.get('/dataCount', verifyToken, async (req, res) => {
  try {
    const [
      totalUsers,
      totalDocentes,
      totalActas
    ] = await Promise.all([
      userModel.count({}),
      docenteModel.count({}),
      actaModel.count({})
    ]);

    res.send({ totalUsers, totalDocentes, totalActas });
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});

router.get('/chartHomologaciones', verifyToken, async (req, res) => {
  try {
    const promises = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 12; i++) {
      const query = {
        fechaCreacion: {
          $gte: new Date(currentYear, i, 0).toISOString(),
          $lte: new Date(currentYear, i + 1, 0).toISOString()
        }
      };
      promises.push(homologacion.count(query));
    }

    const homologacionesByMonth = await Promise.all(promises);

    res.send({ homologacionesByMonth });
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});

router.get('/chartAvances', verifyToken, async (req, res) => {
  try {
    const promises = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 12; i++) {
      const query = {
        fechaCreacion: {
          $gte: new Date(currentYear, i, 0).toISOString(),
          $lte: new Date(currentYear, i + 1, 0).toISOString()
        }
      };
      promises.push(avance.count(query));
    }

    const avancesByMonth = await Promise.all(promises);

    res.send({ avancesByMonth });
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});

module.exports = router;
