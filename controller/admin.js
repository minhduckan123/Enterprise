const express = require('express')
const { insertObject, updateDocument, deleteObject, getDocumentById, getDocument} = require('../model/databaseControl')
const router = express.Router()
const date = require('date-and-time')

router.get('/users', async (req, res) => {
    const users = await getDocument("Users")
    console.log({model:users})
    res.render('users',{model:users})
})

router.get('/users/:id', async (req, res) => {
    const idValue = req.params.id
    const user = await getDocumentById(idValue, "Users")
    res.render('users',{model:user})
})

router.get('/addUsers',(req,res)=>{
    res.render('admin/addUsers')
})

router.get('/deleteUser/:id', async (req, res) => {
    const idValue = req.params.id
    await deleteObject(idValue, "Users")
    res.redirect('/admin/users')
})

router.post('/addUsers',async (req,res)=>{
    const name = req.body.txtName
    const pass = req.body.txtPass
    const role = req.body.txtRole
    const email = req.body.txtEmail
    const objectToInsert = {
        userName: name,
        password: pass,
        role: role,
        email: email,
    }
    await insertObject("Users", objectToInsert)
    res.redirect('/admin/home')
})

router.get('/courses', async (req, res) => {
    const courses = await getDocument("Course")
    res.render("admin/courses",{model:courses})
})

router.get('/addCourse', async (req, res) => {
    res.render("admin/addCourse")
})

router.post('/addCourse',async (req,res)=>{
    const course = req.body.txtCourse

    const dl1 = req.body.txtDL1
    const deadline1 = new Date(dl1)

    const dl2 = req.body.txtDL2
    const deadline2 = new Date(dl2)
    
    const objectToInsert = {
        courseName: course,
        deadLine1: date.format(deadline1,'YYYY/MM/DD HH:mm'),
        deadLine2: date.format(deadline2,'YYYY/MM/DD HH:mm'),
    }
    await insertObject("Course", objectToInsert)
    res.redirect('/admin/courses')
})

router.post('/update', async (req, res) => {
    const id = req.body.txtOId
    const name = req.body.txtUname
    const pass = req.body.txtPassword
    const role = req.body.txtRole
    const email = req.body.txtEmail
    let updateValues = { $set: {
        userName: name,
        password: pass,
        role: role,
        email: email
    } };
    await updateDocument(id, updateValues, "Users")
    res.redirect('/admin/users')
})

router.get('/editUser/:id', async (req, res) => {
    const idValue = req.params.id
    const userToEdit = await getDocumentById(idValue, "Users")
    res.render("editUser", { user: userToEdit })
})

router.get('/home', async (req, res) => {
    res.render("admin/home")
})



module.exports = router;