const express = require('express')
const { insertObject, updateDocument, deleteObject, getDocumentById, getDocument} = require('../model/databaseControl')
const router = express.Router()
const date = require('date-and-time')
const bcrypt = require("bcrypt");

//HOME
router.get('/home', async (req, res) => {
    const users = await getDocument("Users")
    let username
    for(const user of users){
        if(user._id == req.session.userId){
            username = user.userName        
        }
    }      
    
    res.render("admin/home")
})

router.get('/users/:id', async (req, res) => {
    const idValue = req.params.id
    const user = await getDocumentById(idValue, "Users")
    res.render('users',{model:user})
})

//USER
router.get('/addUsers', async(req,res)=>{
    const users = await getDocument("Users")
    let username
    for(const user of users){
        if(user._id == req.session.userId){
            username = user.userName        
        }
    }      
    
    res.render("admin/addUsers", {model:users, userName:username})
})

router.post('/addUsers',async (req,res)=>{
    const name = req.body.txtName
    const pass = req.body.txtPass
    const role = req.body.txtRole
    const email = req.body.txtEmail
    const department = req.body.txtDepartment

    const salt = await bcrypt.genSalt(10);

    const objectToInsert = {
        userName: name,
        password: await bcrypt.hash(pass, salt),
        role: role,
        email: email,
        department: department
    }
    await insertObject("Users", objectToInsert)
    res.redirect('/admin/addUsers')
})

router.get('/deleteUser/:id', async (req, res) => {
    const idValue = req.params.id
    await deleteObject(idValue, "Users")
    res.redirect('/admin/users')
})

router.get('/editUser/:id', async (req, res) => {
    const idValue = req.params.id
    const userToEdit = await getDocumentById(idValue, "Users")
    res.render("admin/editUser", { user: userToEdit })
})

router.post('/editUser', async (req, res) => {
    let id = req.body.txtId;
    const name = req.body.txtName
    const pass = req.body.txtPass
    const role = req.body.txtRole
    const email = req.body.txtEmail
    const department = req.body.txtDepartment

    const salt = await bcrypt.genSalt(10);

    let newValues ={$set : {
        userName: name,
        password: await bcrypt.hash(pass, salt),
        role: role,
        email: email,
        department: department}};
    
    await updateDocument(id, newValues, "Users")
    
    res.redirect("/admin/addUsers")
})

//COURSE

router.get('/courses', async (req, res) => {
    const courses = await getDocument("Course")
    const users = await getDocument("Users")
    let username
    for(const user of users){
        if(user._id == req.session.userId){
            username = user.userName        
        }
    }      

    res.render("admin/courses",{model:courses, userName:username})
})

router.get('/addCourse', async (req, res) => {
    const users = await getDocument("Users")
    let username
    for(const user of users){
        if(user._id == req.session.userId){
            username = user.userName        
        }
    }      

    res.render("admin/addCourse", {userName:username})
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
        courseName: course,
        deadLine1: date.format(deadline1,'YYYY/MM/DD HH:mm'),
        deadLine1Time: deadLine1Time,
        deadLine2: date.format(deadline2,'YYYY/MM/DD HH:mm'),
        deadLine2Time: deadLine2Time
    }
    await insertObject("Course", objectToInsert)
    res.redirect('/admin/courses')
})

router.get('/deleteCourse', async (req, res) => {
    const idValue = req.query.id
    await deleteObject(idValue, "Course")
    res.redirect('/admin/courses')
})

router.get('/editCourse/:id', async (req, res) => {
    const idValue = req.params.id
    const courseToEdit = await getDocumentById(idValue, "Course")
    res.render("admin/editCourse", { course: courseToEdit })
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
    
    let newValues ={$set : {
        courseName: course,
        deadLine1: date.format(deadline1,'YYYY/MM/DD HH:mm'),
        deadLine1Time: deadLine1Time,
        deadLine2: date.format(deadline2,'YYYY/MM/DD HH:mm'),
        deadLine2Time: deadLine2Time
    }}
    
    await updateDocument(id, newValues, "Course")
    
    res.redirect("/admin/courses")
})



module.exports = router;