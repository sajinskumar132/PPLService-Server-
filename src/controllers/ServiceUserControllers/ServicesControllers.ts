
import Service from "../../Models/ServiceProviders/Service";
import { accessTokenAuthenticator } from "../../Services/accessTokenAuthenticator";
import { RequestHandler } from "express";
import { ServiceCatogory } from "../../util/Enums";
import { startSession } from "mongoose";
import ServiceUser from '../../Models/ServiceProviders/ServiceUser'
export const getAllServices:RequestHandler=async(req,res,next)=>{
    try {
        const Services=await Service.find()
        return res.status(200).json({data:Services,message:"Services"})
    } catch (error) {
        next(error)
        return res.status(500).json({data:null,message:"Internal Server error"})
    }
}

export const getServicesByUser:RequestHandler=async(req,res,next)=>{
    try {
        const token=req.headers.authorization?.split(' ')[1]
        if(!token) return res.status(401).json({data:null,message:"Unauthorized"})
        const userid = accessTokenAuthenticator.TokenAuthenticator(token)
        if(!userid) return res.status(401).json({data:null,message:"Unauthorized"})
        const Services=await Service.find({userId:userid})
        return res.status(200).json({data:Services,message:"Services"})
    } catch (error) {
        next(error)
        return res.status(500).json({data:null,message:"Internal Server error"})
    }
}

export const getServiceById:RequestHandler=async(req,res,next)=>{
    try {
        const token=req.headers.authorization?.split(' ')[1]
        const {id}=req.params
        if(!token) return res.status(401).json({data:null,message:"Unauthorized"})
        const userid = accessTokenAuthenticator.TokenAuthenticator(token)
        if(!userid) return res.status(401).json({data:null,message:"Unauthorized"})
        const service=await Service.findById(id)
        return res.status(200).json({data:service,message:"Service"})
    } catch (error) {
        next(error)
        return res.status(500).json({data:null,message:"Internal Server error"})
    }
}

export const NewService:RequestHandler=async(req,res,next)=>{
    const session =await startSession()
    try {
        session.startTransaction({session})
        const token=req.headers.authorization?.split(' ')[1]
        if(!token) return res.status(401).json({data:null,message:"Unauthorized"})
        const userid = accessTokenAuthenticator.TokenAuthenticator(token)
        if(!userid) return res.status(401).json({data:null,message:"Unauthorized"})
        const existingUser=await ServiceUser.findById(userid)
        if(!existingUser) return res.status(400).json({data:null,message:"not found"})
        const {category,experience,description,location}=req.body
        let IsValidCCategory=false
        const keys = Object.keys(ServiceCatogory);
        for(let item of  keys){
            if(item == category){
                IsValidCCategory=true
                break
            }
        }
        if(!IsValidCCategory) return res.status(400).json({data:null,message:"Invalid Category"})
        const newService:any=new Service({userId:userid,category,experience,description,location,status:"Approved"})
        existingUser.service.push(newService)
        await existingUser.save()
        await newService.save()
        return res.status(201).json({data:newService,message:"Sucessfully created service"})
    } catch (error) {
        next(error)
        return res.status(500).json({data:null,message:"Internal Server error"})
    } finally{
        await session.commitTransaction()
    }
}

export const UpdateService:RequestHandler=async(req,res,next)=>{
    try {
        const token=req.headers.authorization?.split(' ')[1]
        const {id}=req.params
        const {experience,description,location}=req.body
        if(!token) return res.status(401).json({data:null,message:"Unauthorized"})
        const userid = accessTokenAuthenticator.TokenAuthenticator(token)
        if(!userid) return res.status(401).json({data:null,message:"Unauthorized"})
        let existingService=await Service.findById(id)
        if(!existingService) return res.status(400).json({data:null,message:`Service not found`})
        let updateService= await Service.findByIdAndUpdate(id,{experience,description,location,status:"Approved"},{new:true})
        return res.status(200).json({data:updateService,message:"Sucessfully updated service"})
    } catch (error) {
        next(error)
        return res.status(500).json({data:null,message:"Internal Server error"})
    }
}

export const DeleteServices:RequestHandler=async(req,res,next)=>{
    try {
        const token=req.headers.authorization?.split(' ')[1]
        const {id}=req.params
        if(!token) return res.status(401).json({data:null,message:"Unauthorized"})
        const userid = accessTokenAuthenticator.TokenAuthenticator(token)
        if(!userid) return res.status(401).json({data:null,message:"Unauthorized"})
        let existingService=await Service.findByIdAndRemove(id)
        if(!existingService) return res.status(400).json({data:null,message:`Service not found`})
        return res.status(200).json({data:null,message:"Sucessfully deleted service"})
    } catch (error) {
        next(error)
        return res.status(500).json({data:null,message:"Internal Server error"})
    }
}