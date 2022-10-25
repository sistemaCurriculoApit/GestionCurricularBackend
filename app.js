const express = require('express');
const bodyParser = require('body-parser');
const authRoute = require('./routes/auth');
const areaRoute = require('./routes/area');
const asignaturaRoute = require('./routes/asignaturas');
const advancementsRoute = require('./routes/advancements');
const contenidoRoute = require('./routes/contenido');
const estudianteRoute = require('./routes/estudiante');
const actaRoute = require('./routes/acta');
const planRoute = require('./routes/plan');
const dashboardRoute = require('./routes/dashboard');
const docenteRoute = require('./routes/docente');
const homologationsRoute = require('./routes/homologations');
const programaRoute = require('./routes/programa');
const userRoute = require('./routes/user');
const verifyToken = require('./util/tokenValidation');
const router = require('express').Router();
const connectDB = require('./util/db');
require('dotenv/config');

const port = process.env.PORT || 3000;
const cors = require('cors');
const app = express();

app.all(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});

app.use(cors());
app.use(bodyParser.json());

router.use('/', userRoute);
router.use('/auth/', authRoute);
router.use('/asignatura/', asignaturaRoute);
router.use('/contenido/', contenidoRoute);
router.use('/programa/', programaRoute);
router.use('/acta/', actaRoute);
router.use('/plan/', planRoute);
router.use('/dashboard/', dashboardRoute);
router.use('/docente/', docenteRoute);
router.use('/area/', areaRoute);
router.use('/homologations/', verifyToken, homologationsRoute);
router.use('/advancements/', verifyToken, advancementsRoute);
router.use('/estudiante/', estudianteRoute);

app.use('/api/', router);

app.listen(port, () => {
  console.log('server is running ' + port);
});

connectDB();
