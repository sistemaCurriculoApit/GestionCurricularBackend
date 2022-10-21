const router = require('express').Router()
const rolModel = require('../models/rol')

router.post('/add', async (req, res) => {

    const rol = new rolModel({
        nombre: req.body.nombre,
        codigo: req.body.codigo,
        descripcion: req.body.descripcion,
        fechaActualizacion: req.body.fechaActualizacion,
        estado: req.body.estado

    })

    const save = await rol.save()
    try {
        res.send(save)
    } catch (err) {
        res.send(err.message)
    }

})

router.get('/all', async (req, res) => {
    const rol = await rolModel.find()
    try {
        res.send(user)
    } catch (error) {
        res.send(error.message)
    }
})

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const rol = await rolModel.findById(id);
    try {
        res.send(rol)
    } catch (error) {
        res.send(error.message)
    }
})

router.delete('/:id', async (req, res) => {
    const rolId = req.params.id;
    const rol = rolModel.remove({
        _id: id
    })
    try {
        res.send(rol)
    } catch (error) {
        res.send(error.message)
    }

})

router.patch('/:id', async (req, res) => {
    const rolId = req.params.id;
    const update = rolModel.updateOne({
        _id: id
    }, {
        $set: req.body
    })
    try {
        res.send(update)
    } catch (error) {
        res.send(error.message)
    }

})

module.exports = router