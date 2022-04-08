const express = require('express')
const router = express.Router()
const date = require('date-and-time')
const bcrypt = require("bcrypt");

var mongoose = require('mongoose')
const User = require('../model/user.model')
const Course = require('../model/course.model')

async function getUserName(sessionID){
    const users = await User.find()
    let username
    for(const user of users){
        if(user._id == sessionID){
            username = user.userName        
        }
    }      

    return username
}

//HOME
router.get('/home', async (req, res) => {
    const user = await getUserName(req.session.userId)  
   
    res.render("admin/home", {userName: user})
})

router.get('/users/:id', async (req, res) => {
    const idValue = req.params.id
    const user = await User.findById(idValue)
    res.render('users',{model:user})
})

//USER
router.get('/addUsers', async(req,res)=>{
    const user = await getUserName(req.session.userId)  
    const users = await User.find()

    res.render("admin/addUsers", {model:users, userName: user})
})

router.post('/addUsers',async (req,res)=>{
    const name = req.body.txtName
    const pass = req.body.txtPass
    const role = req.body.txtRole
    const email = req.body.txtEmail
    const department = req.body.txtDepartment

    const salt = await bcrypt.genSalt(10);

    const objectToInsert = {
        _id: mongoose.Types.ObjectId(),
        userName: name,
        password: await bcrypt.hash(pass, salt),
        role: role,
        email: email,
        department: department
    }
    //await insertObject("Users", objectToInsert)

    const newUser = new User(objectToInsert)
    await newUser.save()
    res.redirect('/admin/addUsers')
})

router.get('/deleteUser/:id', async (req, res) => {
    const idValue = req.params.id
    await User.deleteOne({_id: idValue})
    res.redirect('/admin/addUsers')
})

router.get('/editUser/:id', async (req, res) => {
    const user = await getUserName(req.session.userId)  

    const idValue = req.params.id
    const userToEdit = await User.findById(idValue)
    res.render("admin/editUser", { user: userToEdit, userName: user })
})

router.post('/editUser', async (req, res) => {
    let id = req.body.txtId;
    const name = req.body.txtUser
    const pass = req.body.txtPass
    const role = req.body.txtRole
    const email = req.body.txtEmail
    const department = req.body.txtDepartment

    const salt = await bcrypt.genSalt(10);

    // let newValues ={$set : {
    //     userName: name,
    //     password: await bcrypt.hash(pass, salt),
    //     role: role,
    //     email: email,
    //     department: department}};
    
    await User.findByIdAndUpdate(id, {$set:{
        userName: name,
        password: await bcrypt.hash(pass, salt),
        role: role,
        email: email,
        department: department}})
    
    res.redirect("/admin/addUsers")
})

//COURSE

router.get('/courses', async (req, res) => {
    const user = await getUserName(req.session.userId)  

    const courses = await Course.find().lean()
    const users = await User.find().lean()

    res.render("admin/courses",{model:courses, userName: user})
})

router.get('/addCourse', async (req, res) => {
    const user = await getUserName(req.session.userId)  

    res.render("admin/addCourse", {userName: user})
})

router.post('/addCourse',async (req,res)=>{
    const course = req.body.txtCourse

    const dl1 = req.body.txtDL1
    const deadline1 = new Date(dl1)
    const deadLine1Time = deadline1.getTime()

    const dl2 = req.body.txtDL2
    const deadline2 = new Date(dl2)
    const deadLine2Time = deadline2.getTime()
    
    const objectToInsert = {
        _id: mongoose.Types.ObjectId(),
        courseName: course,
        deadLine1: date.format(deadline1,'YYYY/MM/DD HH:mm'),
        deadLine1Time: deadLine1Time,
        deadLine2: date.format(deadline2,'YYYY/MM/DD HH:mm'),
        deadLine2Time: deadLine2Time
    }
    
    const newCourse = new Course(objectToInsert)
    await newCourse.save()

    res.redirect('/admin/courses')
})

router.get('/deleteCourse', async (req, res) => {
    const idValue = req.query.id
    await Course.deleteOne({_id: idValue})
    res.redirect('/admin/courses')
})

router.get('/editCourse/:id', async (req, res) => {
    const user = await getUserName(req.session.userId)  

    const idValue = req.params.id
    const courseToEdit = await Course.findById(idValue)
    res.render("admin/editCourse", { course: courseToEdit, userName: user })
})

router.post('/editCourse', async (req, res) => {
    let id = req.body.txtId;

    const course = req.body.txtCourse

    const dl1 = req.body.txtDL1
    const deadline1 = new Date(dl1)
    const deadLine1Time = deadline1.getTime()

    const dl2 = req.body.txtDL2
    const deadline2 = new Date(dl2)
    const deadLine2Time = deadline2.getTime()
    
    await Course.findByIdAndUpdate(id, {$set:{
        courseName: course,
        deadLine1: date.format(deadline1,'YYYY/MM/DD HH:mm'),
        deadLine1Time: deadLine1Time,
        deadLine2: date.format(deadline2,'YYYY/MM/DD HH:mm'),
        deadLine2Time: deadLine2Time
    }})
    
    res.redirect("/admin/courses")
})



module.exports = router;