const express = require('express')
const { insertObject, updateDocument, deleteObject, getDocumentById, getDocument} = require('../model/databaseControl')
const router = express.Router()

router.get('/qam', async (req, res) => {
    const ideas = await getDocument("Idea")
    const users = await getDocument("Users")
    for(const idea of ideas) { 
        for(const user of users){
            if(user._id == idea.userId){
                idea['user'] = user.userName        
            }
        }      
    } 
    console.log({model:ideas})
    res.render('quality_assurance_manager',{model:ideas})
})

router.get('/idea/:id', async (req, res) => {
    const idValue = req.params.id
    const comments = await getCommentByIdea(idValue ,"Comment")
    res.render('comment',{model:comments})
})


router.get('/addIdea',(req,res)=>{
    res.render('addIdea')
})

router.get('/deleteIdea/:id', async (req, res) => {
    const idValue = req.params.id
    await deleteObject(idValue, "Idea")
    res.redirect('/admin/ideas')
})

router.post('/addIdea',async (req,res)=>{
    const user = req.body.txtUser
    const idea = req.body.txtIdea
    const course = req.body.txtCourse
    const file = req.body.txtFile
    const objectToInsert = {
        user: user,
        idea: idea,
        course: course,
        file : file,
    }
    await insertObject("Users", objectToInsert)
    res.redirect('/idea/ideas')
})

module.exports = router;