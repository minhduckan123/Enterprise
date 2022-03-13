const express = require('express')
const {DATABASE_NAME, getDB, insertObject, updateDocument, deleteObject, getDocumentById, getDocument} = require('../model/databaseControl')
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
    var dbo = await getDB()
    var user = await dbo.collection("Users").find({_id:req.signedCookies.userId});    

    if(user.role === 'Admin'){
        next().next();
        //res.send("You are not allowed to access this file")
    }else {
        //next();
        res.redirect('/login/login')
    }
}

module.exports = {authLogIn, isAdmin}

