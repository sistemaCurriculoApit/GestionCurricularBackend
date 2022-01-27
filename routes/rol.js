const express=require('express')
const rolModel=require('../models/rol')
const route=express.Router()


route.post('/add', async(req,res)=>{    
    
    const rol = new rolModel({
        nombre:req.body.nombre,
        codigo:req.body.codigo,
        descripcion:req.body.descripcion,
        fechaActualizacion:req.body.fechaActualizacion,
        estado:req.body.estado

    })
    
    const save= await rol.save()
    try{
        res.send(save)
    }catch(err){
        res.send(err.message)
    }
   
})
route.get('/all',async(req,res)=>{
    const rol= await rolModel.find()
    try{
        res.send(user)
    }catch(error){
        res.send(error.message)
    }
})

route.get('/:id', async(req,res)=>{
    const id=req.params.id;
    const rol= await rolModel.findById(id);
    try{
        res.send(rol)
    }catch(error){
        res.send(error.message)
    }
})

route.delete('/:id',async(req, res)=>{
    const rolId=req.params.id;
    const rol=rolModel.remove({
        _id:id
    })
    try{
        res.send(rol)
    }catch(error){
        res.send(error.message)
    }

})

route.patch('/:id',async(req, res)=>{
    const rolId=req.params.id;
    const update=rolModel.updateOne({
        _id:id
    },{
        $set: req.body
    })
    try{
        res.send(update)
    }catch(error){
        res.send(error.message)
    }

})


module.exports=route