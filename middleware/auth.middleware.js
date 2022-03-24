const express = require('express')
const {DATABASE_NAME, getDB, getDocumentById, getDocument} = require('../model/databaseControl')
const {MongoClient,ObjectId} = require('mongodb')

async function authLogIn(req, res, next) {
    if (!req.signedCookies.userId){
        res.redirect("/login/login")
        return;
    }
    
    var dbo = await getDB()
    var user = await dbo.collection("Users").find({_id:req.signedCookies.userId});    

    if(!user) {
        res.redirect("/login/login")
        return;
    }

    next()
};

async function isAdmin(req, res, next) {
    var id = req.signedCookies.userId
    var user = await getDocumentById(id, "Users");  

    if(user.role === 'Admin'){
        next()
    }else {
        res.json('ERROR: You do not have the permission to access this page')
    }
}

async function isAdmin(req, res, next) {
    var id = req.signedCookies.userId
    var user = await getDocumentById(id, "Users");  

    if(user.role === 'Admin'){
        next()
    }else {
        res.json('ERROR: You do not have the permission to access this page')
    }
}

async function isQAM(req, res, next) {
    var id = req.signedCookies.userId
    var user = await getDocumentById(id, "Users");  

    if(user.role === 'Quality Assurance Manager'){
        next()
    }else {
        res.json('ERROR: You do not have the permission to access this page')
    }
}

async function isQAC(req, res, next) {
    var id = req.signedCookies.userId
    var user = await getDocumentById(id, "Users");  

    if(user.role === 'Quality Assurance Coordinator'){
        next()
    }else {
        res.json('ERROR: You do not have the permission to access this page')
    }
}

async function isStaff(req, res, next) {
    var id = req.signedCookies.userId
    var user = await getDocumentById(id, "Users");  

    if(user.role === 'Staff'){
        next()
    }else {
        res.json('ERROR: You do not have the permission to access this page')
    }
}

module.exports = {authLogIn, isAdmin, isQAM, isQAC, isStaff}

