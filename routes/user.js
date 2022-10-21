const router = require('express').Router()
const userModel = require('../models/user')
const estudianteModel = require('../models/estudiante')
const verifyToken = require('../util/tokenValidation')
const { paginationSize, userProfilesObject } = require('../constants/constants')

const crypto = require('crypto');

router.get('/home', (req, res) => {
    res.json({
        body: {
            message: 'api.. probando /home'
        }

    });
})

router.post('/user/add', verifyToken, async (req, res) => {

    try {
        const usuarioValidar = await userModel.findOne({ correo: req.body.correo })
        if (usuarioValidar) return res.status(400).json({
            error: "Validación Datos",
            descripcion: 'El Correo ya existe'
        });

        const estudiante = await estudianteModel.findOne({ correo: req.body.correo })

        if (req.body.rolId === userProfilesObject.est.id && !estudiante) {
            const estudiante = new estudianteModel({
                identificacion: req.body.identificacion,
                nombre: req.body.nombreUsuario,
                universidad: req.body.universidadEstudiante,
                universidadOrigen: req.body.universidadEstudianteOrigen,
                programa: req.body.programa,
                plan: req.body.plan,
                programaOrigen: req.body.programaOrigen,
                planOrigen: req.body.planOrigen,
                correo: req.body.correo,
                fechaActualizacion: new Date(),
                fechaCreacion: new Date(),
                estado: true,
            })
            try {
                const saveEstudiante = await estudiante.save();
            }
            catch (error) {
                return res.status(500).json({
                    error: true,
                    descripcion: error.message
                })
            }
        } else if (req.body.rolId === userProfilesObject.est.id) {
            estudiante.nombre = req.body.nombreUsuario;
            estudiante.universidad = req.body.universidadEstudiante;
            estudiante.universidadOrigen = req.body.universidadEstudianteOrigen;
            estudiante.programa = req.body.programa;
            estudiante.plan = req.body.plan;
            estudiante.programaOrigen = req.body.programaOrigen;
            estudiante.planOrigen = req.body.planOrigen;
            estudiante.fechaActualizacion = new Date();
            estudiante.estado = true;
            try {
                const updateEstudiante = await estudianteModel.updateOne({
                    _id: estudiante._id
                }, {
                    $set: { ...estudiante }
                })
            }
            catch (error) {
                return res.status(500).json({
                    error: true,
                    descripcion: error.message
                })
            }
        }

        var hashPassword = crypto.createHash('md5').update(req.body.contrasena).digest('hex');
        const user = new userModel({
            nombreUsuario: req.body.nombreUsuario,
            identificacion: req.body.identificacion,
            correo: req.body.correo,
            contrasena: hashPassword,
            rolId: req.body.rolId,
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
            estado: true

        })

        const save = await user.save();
        try {
            res.send(save);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: true,
                descripcion: error.message
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

router.get('/user/all', verifyToken, async (req, res) => {
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
                    { 'nombreUsuario': regex },
                    { 'correo': regex },
                ]
            }
            query = {
                $and: [query, or],
            };
        }

        const users = await userModel.find(query)
            .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
            .limit(paginationSize).sort({ fechaCreacion: -1 });
        const totalUsers = await userModel.count(query);
        res.send({ users, totalUsers })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

router.get('/user/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const user = await userModel.findById(id);
    try {
        res.send(user)
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

router.delete('/user/:id', verifyToken, async (req, res) => {
    const userId = req.params.id;
    const userDelete = userModel.remove({
        _id: id
    })
    try {
        res.send(userDelete)
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }

})

router.patch('/user/:id', verifyToken, async (req, res) => {

    const usuarioValidar = await userModel.findOne({ correo: req.body.correo })
    if (!usuarioValidar) return res.status(400).json({
        error: "Validación Datos",
        descripcion: 'El Correo no existe'
    });
    const estudiante = await estudianteModel.findOne({ correo: req.body.correo })

    if (req.body.rolId !== userProfilesObject.est.id && estudiante) {
        estudiante.estado = false
        await estudianteModel.updateOne({
            _id: estudiante._id
        }, {
            $set: { ...estudiante }
        })
    } else if (req.body.rolId === userProfilesObject.est.id) {
        if (estudiante) {
            estudiante.nombre = req.body.nombreUsuario;
            estudiante.universidad = req.body.universidadEstudiante;
            estudiante.identificacion = req.body.identificacion;
            estudiante.universidadOrigen = req.body.universidadEstudianteOrigen
            estudiante.programa = req.body.programa;
            estudiante.plan = req.body.plan;
            estudiante.programaOrigen = req.body.programaOrigen;
            estudiante.planOrigen = req.body.planOrigen;
            estudiante.estado = true;
            estudiante.fechaActualizacion = new Date();
            try {
                const updateEstudiante = await estudianteModel.updateOne({
                    _id: estudiante._id
                }, {
                    $set: { ...estudiante }
                })
            }
            catch (error) {
                return res.status(500).json({
                    error: true,
                    descripcion: error.message
                })
            }
        } else {
            const estudiante = new estudianteModel({
                identificacion: req.body.identificacion,
                nombre: req.body.nombreUsuario,
                universidad: req.body.universidadEstudiante,
                universidadOrigen: req.body.universidadEstudianteOrigen,
                programa: req.body.programa,
                plan: req.body.plan,
                programaOrigen: req.body.programaOrigen,
                planOrigen: req.body.planOrigen,
                correo: req.body.correo,
                fechaActualizacion: new Date(),
                fechaCreacion: new Date(),
                estado: true,
            })
            try {
                const saveEstudiante = await estudiante.save();
            }
            catch (error) {
                return res.status(500).json({
                    error: true,
                    descripcion: error.message
                })
            }
        }
    }

    const userId = req.params.id;
    if (req.body.contrasena) {
        var hashPassword = crypto.createHash('md5').update(req.body.contrasena).digest('hex');
    } else {
        var hashPassword = usuarioValidar.contrasena
    }


    const user = {
        nombreUsuario: req.body.nombreUsuario,
        identificacion: req.body.identificacion,
        correo: req.body.correo,
        contrasena: hashPassword,
        rolId: req.body.rolId,
        fechaActualizacion: new Date(),
    };
    try {
        const update = await userModel.updateOne({
            _id: userId
        }, {
            $set: { ...user }
        })

        res.send(update)
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }

})


module.exports = router