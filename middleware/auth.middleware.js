const {MongoClient,ObjectId} = require('mongodb')
const User = require('../model/user.model')

async function authLogIn(req, res, next) {
    const userId = req.session.userId
    
    var user = await User.findById(userId)
    if(!user || !userId) {
        res.redirect("/login")
        return;
    }

    next()
};

async function isAdmin(req, res, next) {
    const id = req.session.userId
    var user = await User.findById(id)

    if(user.role === 'Admin'){
        next()
    }else {
        res.render('error', {title: 'Authorization Permitted', message:'you have to be Admin to access this page'})
    }
}

async function isQAM(req, res, next) {
    var id = req.session.userId
    var user = await User.findById(id)

    if(user.role === 'Quality Assurance Manager'){
        next()
    }else {
        res.render('error', {title: 'Authorization Permitted', message:'you have to be Quality Assurance Manager to access this page'})
    }
}

async function isQAC(req, res, next) {
    var id = req.session.userId
    var user = await User.findById(id)

    if(user.role === 'Quality Assurance Coordinator'){
        next()
    }else {
        res.render('error', {title: 'Authorization Permitted', message:'you have to be Quality Assurance Coordinator to access this page'})
    }
}

async function isStaff(req, res, next) {
    var id = req.session.userId
    var user = await User.findById(id)

    if(user.role === 'Staff'){
        next()
    }else {
        res.render('error', {title: 'Authorization Permitted', message:'you have to be Staff to access this page'})
    }
}

module.exports = {authLogIn, isAdmin, isQAM, isQAC, isStaff}

