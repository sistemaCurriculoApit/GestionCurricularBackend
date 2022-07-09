const express = require('express')
const mongoose= require('mongoose')
const asignaturaModel = require('../models/asignatura')
const areaModel = require('../models/area')
const planModel = require('../models/plan')
const programaModel = require('../models/programa')
const docenteModel = require('../models/docente')
const route = express.Router()
const jwt = require('jsonwebtoken')
const verifyToken = require('./validarToken')
const { paginationSize } = require('../constants/constants')

const TemplateHtml = require('../constants/templateConstant')



route.post('/add', verifyToken, async (req, res) => {
    try {
        const asignaturaValidar = await asignaturaModel.findOne({ codigo: req.body.codigo })
        if (asignaturaValidar) return res.status(400).json({
            error: "Validacion Datos",
            descripcion: 'El código ya existe'
        });

        let hPractica = req.body.intensidadHorariaPractica ? parseInt(req.body.intensidadHorariaPractica):0;
        let hTeorica = req.body.intensidadHorariaTeorica ? parseInt(req.body.intensidadHorariaTeorica) : 0;
        let hIndependiente = req.body.intensidadHorariaIndependiente ? parseInt(req.body.intensidadHorariaIndependiente) : 0;
        if (req.body.asignaturaTipo === 0){
            hPractica = 0;
        }else if (req.body.asignaturaTipo === 1){
            hPractica= 0;
        }
        let hTotal = hTeorica+hPractica+hIndependiente
        let hTotalRelacion = `${hPractica+hTeorica}/${hIndependiente}`

        const asignatura = new asignaturaModel({
            nombre: req.body.nombre,
            codigo: req.body.codigo,
            semestre: req.body.semestre,
            cantidadCredito: req.body.cantidadCredito,
            fechaActualizacion: new Date(),
            fechaCreacion: new Date(),
            intensidadHorariaPractica: hPractica,
            intensidadHorariaTeorica: hTeorica,
            intensidadHorariaIndependiente: hIndependiente,
            intensidadHoraria: hTotal,
            intensidadHorariaRelacion: hTotalRelacion,
            estado: true,
            prerrequisitos: req.body.prerrequisitos,
            correquisitos: req.body.correquisitos,
            asignaturaTipo: req.body.asignaturaTipo,
            presentacionAsignatura: req.body.presentacionAsignatura,
            justificacionAsignatura: req.body.justificacionAsignatura,
            objetivoGeneral: req.body.objetivoGeneral,
            objetivosEspecificos: req.body.objetivosEspecificos,
            competencias: req.body.competencias,
            mediosEducativos: req.body.mediosEducativos,
            evaluacion: req.body.evaluacion,
            bibliografia: req.body.bibliografia,
            cibergrafia: req.body.cibergrafia,
            contenido: req.body.contenido,
            docente: req.body.docente,
            equivalencia: req.body.equivalencia
        })

        const asignaturaSaved = await asignatura.save()
        res.status(200).json({
            error: false,
            descripcion: "Registro Almacenado Exitosamente",
            asignatura: asignaturaSaved

        })
    } catch (error) {
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

        const asignaturas = await asignaturaModel.find(query)
            .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
            .limit(paginationSize).sort({ fechaCreacion: -1 });
        const totalAsignaturas = await asignaturaModel.count(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            asignaturas: asignaturas,
            totalAsignaturas
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

route.get('/allNotPaginatedWithPlanCode', verifyToken, async (req, res) => {
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
                    { 'descripcion': regex },
                ]
            }
            query = {
                $and: [query, or],
            };
        }

        const asignaturas = await asignaturaModel.find(query);
        var newAsignaturas = [];
        if (asignaturas.length) {
            for (let i = 0; i < asignaturas.length; i++) {
                const area = await areaModel.find({ 'asignatura._id' : asignaturas[i]._id });
                if (area && area[0]){
                    var plan;
                    if (area[1]){
                        plan = await planModel.find({'area._id' : area[1]._id})
                    }else {
                        plan = await planModel.find({'area._id' : area[0]._id})
                    }
                    if(plan && plan.length > 0){
                        var asignaturaObj;
                        if (plan[1]){
                            asignaturaObj = {
                                asignatura: asignaturas[i],
                                codigoPlan: plan[1].codigo
                            }
                        }else{
                            asignaturaObj = {
                                asignatura: asignaturas[i],
                                codigoPlan: plan[0].codigo
                            }
                        }
                        newAsignaturas.push(asignaturaObj)
                    }
                }
            }
        }
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            asignaturas: newAsignaturas
        })
    }catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

route.get('/allNotPaginatedWithPlanCodeNoToken', async (req, res) => {
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
                    { 'descripcion': regex },
                ]
            }
            query = {
                $and: [query, or],
            };
        }

        const asignaturas = await asignaturaModel.find(query);
        var newAsignaturas = [];
        if (asignaturas.length) {
            for (let i = 0; i < asignaturas.length; i++) {
                const area = await areaModel.find({ 'asignatura._id' : asignaturas[i]._id });
                if (area && area[0]){
                    var plan;
                    if (area[1]){
                        plan = await planModel.find({'area._id' : area[1]._id})
                    }else {
                        plan = await planModel.find({'area._id' : area[0]._id})
                    }
                    if(plan){
                        var asignaturaObj;
                        if (plan[1]){
                            asignaturaObj = {
                                asignatura: asignaturas[i],
                                codigoPlan: plan[1].codigo
                            }
                        }else{
                            asignaturaObj = {
                                asignatura: asignaturas[i],
                                codigoPlan: plan[0].codigo
                            }
                        }
                        newAsignaturas.push(asignaturaObj)
                    }
                }
            }
        }
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            asignaturas: newAsignaturas
        })
    }catch (error) {
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
                    { 'codigo': regex },
                    { 'nombre': regex },
                    { 'descripcion': regex },
                ]
            }
            query = {
                $and: [query, or],
            };
        }

        const asignaturas = await asignaturaModel.find(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            asignaturas: asignaturas
        })
    }catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

route.post('/getAllAsignaturasByPlan', verifyToken, async (req, res) => {
    try {
        let query = {}

        //Datos para los filtros
        let search = req.body.search;

        const areas = await areaModel.find({ _id: { $in: req.body.areasIds } });
        let asignaturasIds = [];
        if (areas.length) {
            for (let i = 0; i < areas.length; i++) {
                asignaturasIds.push(...areas[i].asignatura.map((asignatura) => asignatura._id));
            }
        }
        if (!asignaturasIds.length) {
            res.status(200).json({
                error: false,
                descripcion: "Consulta Exitosa",
                asignaturas: []
            })
            return
        } else {
            if (asignaturasIds) {
                query = { _id: { $in: asignaturasIds } }
            }
            if (search) {
                var regex = new RegExp(search, 'ig');
                const or = {
                    $or: [
                        { 'codigo': regex },
                        { 'nombre': regex },
                        { 'descripcion': regex },
                    ]
                }
                query = {
                    $and: [query, or],
                };
            }



            const asignaturas = await asignaturaModel.find(query);
            res.status(200).json({
                error: false,
                descripcion: "Consulta Exitosa",
                asignaturas: asignaturas
            })

        }

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
        let asignaturaIds = req.body.asignaturaIds;
        if (asignaturaIds) {
            query = { _id: { $in: asignaturaIds } }
        }

        if (search) {
            var regex = new RegExp(search, 'ig');
            const or = {
                $or: [
                    { 'codigo': regex },
                    { 'nombre': regex },
                    { 'descripcion': regex },
                ]
            }
            query = {
                $and: [query, or],
            };
        }

        const asignaturas = await asignaturaModel.find(query);
        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            asignaturas
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

route.post('/byListIdsPaginated', verifyToken, async (req, res) => {
    try {
        let pageNumber = req.body.page ? req.body.page * 1 : 0;
        let query = {}

        //Datos para los filtros
        let asignaturaIds = req.body.asignaturaIds;
        if (asignaturaIds) {
            query = { _id: { $in: asignaturaIds } }
        }

        const asignaturas = await asignaturaModel.find(query)
            .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
            .limit(paginationSize).sort({ fechaCreacion: -1 });

        const totalAsignaturas = await asignaturaModel.count(query);

        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            asignaturas,
            totalAsignaturas
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

route.post('/byListIdsPaginatedNT', async (req, res) => {
    try {
        let pageNumber = req.body.page ? req.body.page * 1 : 0;
        let query = {}

        //Datos para los filtros
        let asignaturaIds = req.body.asignaturaIds;
        if (asignaturaIds) {
            query = { _id: { $in: asignaturaIds } }
        }

        const asignaturas = await asignaturaModel.find(query)
            .skip(pageNumber > 0 ? (pageNumber * paginationSize) : 0)
            .limit(paginationSize).sort({ fechaCreacion: -1 });

        const totalAsignaturas = await asignaturaModel.count(query);

        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            asignaturas,
            totalAsignaturas
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
        const asignatura = await asignaturaModel.findById(id);
        res.status(200).json({

            error: false,
            descripcion: "Registro Alamcenado Exitosamente",
            asignatura: asignatura

        })

    } catch (error) {
        res.status(400).json({

            error: true,
            descripcion: error.message

        })
    }
})

route.delete('/:id', verifyToken, async (req, res) => {
    const id = req.params.id;

    try {
        const asignatura = await asignaturaModel.updateOne(
            { _id: id },
            { $set: req.body }
        )
        res.status(200).json({
            error: false,
            descripcion: "Registro Actualizado Exitosamente",
            asignatura: asignatura
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
        const id = req.params.id;

        const asignaturaValidar = await asignaturaModel.findOne({ codigo: req.body.codigo })
        if (asignaturaValidar && asignaturaValidar._id.toString() !== req.params.id) return res.status(400).json({
            error: "Validacion Datos",
            descripcion: 'El código no existe'
        });

        let hPractica = req.body.intensidadHorariaPractica ? parseInt(req.body.intensidadHorariaPractica):0;
        let hTeorica = req.body.intensidadHorariaTeorica ? parseInt(req.body.intensidadHorariaTeorica) : 0;
        let hIndependiente = req.body.intensidadHorariaIndependiente ? parseInt(req.body.intensidadHorariaIndependiente) : 0;
        req.body.fechaActualizacion = new Date();
        if (req.body.asignaturaTipo === 0){
            hPractica = 0;
        }else if (req.body.asignaturaTipo === 1){
            hPractica= 0;
        }
        let hTotal = hTeorica+hPractica+hIndependiente
        let hTotalRelacion = `${hPractica+hTeorica}/${hIndependiente}`

        req.body.intensidadHorariaRelacion = hTotalRelacion;
        req.body.intensidadHoraria  = hTotal;

        const update = await asignaturaModel.updateOne({
            _id: id
        }, {
            $set: req.body
        })
        res.status(200).json({
            error: false,
            descripcion: "Registro Actualizado Exitosamente",
            asignatura: update
        })
    } catch (error) {
        res.status(400).json({

            error: true,
            descripcion: error.message

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

        const equivalencias = await asignaturaModel.find(query);
        var newEquivalenciasList = [];
        if (equivalencias.length) {
            for (let i = 0; i < equivalencias.length; i++) {
                const area = await areaModel.find({ 'asignatura._id' : equivalencias[i]._id });
                if (area){
                    var plan;
                    if (area[1]){
                        plan = await planModel.find({'area._id' : area[1]._id})
                    }else {
                        plan = await planModel.find({'area._id' : area[0]._id})
                    }
                    if(plan){
                        var equivalenciaObj;
                        if (plan[1]){
                            equivalenciaObj = {
                                equivalencia: equivalencias[i],
                                codigoPlan: plan[1].codigo
                            }
                        }else{
                            equivalenciaObj = {
                                equivalencia: equivalencias[i],
                                codigoPlan: plan[0].codigo
                            }
                        }
                        newEquivalenciasList.push(equivalenciaObj)
                    }
                }
            }

        }

        res.status(200).json({
            error: false,
            descripcion: "Consulta Exitosa",
            equivalencias: newEquivalenciasList
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

route.post('/getEquivalenciaByAsignaturaNT', async (req, res) => {
    try {
        let query = {}

        //Datos para los filtros
        let search = req.body.search;

        if (req.body.equivalenciasIds) {
            query = { _id: { $in: req.body.equivalenciasIds } }
        }

        const equivalencias = await asignaturaModel.find(query);

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


route.post('/getFile', async (req, res) => {
    var pdf = require('html-pdf');

    //Se obtienen datos necesarios que no llegan en el request para llenado de platilla
try{
    const area = await areaModel.findOne({ 'asignatura._id' : req.body._id });
    let plan;
    let programa;
    if (area)
    {
        plan = await planModel.findOne({'area._id' : area._id})
        if (plan)
        {
            programa = await programaModel.findOne({'plan._id' : plan._id})
        }
    }

    //Se obtiene la plantilla del modulo templateHtml
    let fileString = TemplateHtml.module.toString();

    //Llenado de data en la plantilla html con datos de la asignatura.
    //programa data
    if (programa){
        fileString = fileString.replace('[programa]', programa.nombre ?? '')
    }else{
        fileString = fileString.replace('[programa]', '')
    }

    //area data
    if(area){
        fileString = fileString.replace('[area]', area.nombre ?? '')
    }else{
        fileString = fileString.replace('[area]', '')
    }


    //asignatura data
    fileString = fileString.replace('[asignatura]', req.body.nombre ?? '')
    fileString = fileString.replace('[prerrequisitos]', req.body.prerrequisitos ?? '')
    fileString = fileString.replace('[correquisitos]', req.body.correquisitos ?? '')
    fileString = fileString.replace('[codigo]', req.body.codigo ?? '')

    //Se ejecuta dos veces dado que la plantilla los campos horas_teorica y horas_practica estan dos veces
    for (let i = 0; i < 2; i++) {
        fileString = fileString.replace('[horas_teorica]', req.body.intensidadHorariaTeorica ?? '')
        fileString = fileString.replace('[horas_practica]', req.body.intensidadHorariaPractica ?? '')
    }
    fileString = fileString.replace('[horas_independiente]', req.body.intensidadHorariaIndependiente ?? '')
    fileString = fileString.replace('[horas_total]', req.body.intensidadHoraria ?? '')
    fileString = fileString.replace('[creditos]', req.body.cantidadCredito ?? '')
    fileString = fileString.replace('[htp_hti]', req.body.intensidadHorariaRelacion ?? '')
    fileString = fileString.replace('[presentacion]', req.body.presentacionAsignatura ?? '')
    fileString = fileString.replace('[presentacion]', req.body.presentacionAsignatura ?? '')
    fileString = fileString.replace('[justificacion]', req.body.justificacionAsignatura ?? '')
    fileString = fileString.replace('[objetivo_general]', req.body.objetivoGeneral ?? '')
    fileString = fileString.replace('[objetivos_especificos]', req.body.objetivosEspecificos ?? '')
    fileString = fileString.replace('[competencias]', req.body.competencias ?? '')
    fileString = fileString.replace('[medios]', req.body.mediosEducativos ?? '')
    fileString = fileString.replace('[evaluacion]', req.body.evaluacion ?? '')
    fileString = fileString.replace('[bibliografia]', req.body.bibliografia ?? '')
    fileString = fileString.replace('[cibergrafia]', req.body.cibergrafia ?? '')

    //Contenido data. Se ejecuta 6 veces dada la cantidad de contenidos de la plantilla. Max 6
    for (let i=0; i < 6; i++){
        if (req.body.contenido && req.body.contenido[i]){
            fileString = fileString.replace(`[tema_${i+1}]`, req.body.contenido[i].nombre ?? '' )
            fileString = fileString.replace(`[subtemas_${i+1}]`, req.body.contenido[i].descripcion ?? '')
        }else{
            fileString = fileString.replace(`[tema_${i+1}]`, '' )
            fileString = fileString.replace(`[subtemas_${i+1}]`, '')
        }
    }

    //Make break lines on file
    const search = '\n';
    const replaceWith = '<br>';
    fileString = fileString.split(search).join(replaceWith);

    //Config pdf
    var config = {format: 'A4',
        border: {
            top: "0.2in",
            right: "0.4in",
            bottom: "0.2in",
            left: "0.4in"
        },
    };
    pdf.create(fileString, config).toStream(function (err, pdfStream) {
        if (err) return console.log(err);
        else{
            res.status(200)
            pdfStream.on('end', ()=> {
                return res.end()
            })
            res.attachment('FD-GC70.pdf')
            pdfStream.pipe(res)
        }
     });
    }catch (error){
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})


route.post('/getAllAsignaturasByDocente', verifyToken, async (req, res) => {
    try {

        const asignaturas = await asignaturaModel.find();
        let asignaturasByDocente = [];
        if (asignaturas.length) {
            for (let i = 0; i < asignaturas.length; i++) {
                var docenteIds = asignaturas[i].docente.map(x => x._id.toString())
                if (docenteIds.length > 0){
                    for (let j = 0; j < docenteIds.length; j++){
                        if (docenteIds[j] === req.body.docenteId){
                            asignaturasByDocente.push(asignaturas[i])  
                        }
                    }
                }
            }
        }
        if (!asignaturasByDocente.length) {
            res.status(200).json({
                error: false,
                descripcion: "Consulta Exitosa",
                asignaturas: []
            })
            return
        } else {

            res.status(200).json({
                error: false,
                descripcion: "Consulta Exitosa",
                asignaturas: asignaturasByDocente
            })

        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            descripcion: error.message
        })
    }
})

module.exports = route