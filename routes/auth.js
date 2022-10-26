const router = require('express').Router();

const userModel = require('../models/user');
const jwt = require('jsonwebtoken');

const crypto = require('crypto');


route.post('/login', async (req, res) => {
    try {
        const user = await userModel.findOne({ correo: req.body.correo })
        if (!user) return res.status(400).json({
            body: {
                error: "Validación Usuario",
                descripcion: 'Usuario o contraseña Inválidos'
            }
        })
        /**si la autenticación fue con google identity se salta la validacion de la contraseña */
        var hashPassword = crypto.createHash('md5').update(req.body.contrasena).digest('hex');
        if (!req.body.googleIdentity) {
            if (hashPassword != user.contrasena) return res.status(400).json({
                body: {
                    error: "Validación Usuario",
                    descripcion: 'Usuario o contraseña Inválidos'
                }
            })
        }

        const token = jwt.sign({ _id: user._id }, process.env.SECRET)
        user.contrasena = undefined;
        res.json({
            body: {
                user: user,
                token: token
            }
        });
    } catch (err) {
        res.send(err.message)
    }

})
