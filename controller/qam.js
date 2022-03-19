const express = require('express')
const { insertObject, updateDocument, deleteObject, getDocumentById, getDocument, getDocumentWithCondition, getCommentByIdea} = require('../model/databaseControl')
const router = express.Router()

router.get('/qam', async (req, res) => {
    const sort = req.params.sort
    const ideas = await getDocumentWithCondition("Idea", 10, "_id")
    const users = await getDocument("Users")
    const comments = await getDocument("Comment")
    for(const idea of ideas) { 
        let commentNumber = 0
        for(const comment of comments){
            if(idea._id == comment.ideaId){
                commentNumber += 1
            }
            idea['commentNumber'] = commentNumber
        }

        for(const user of users){
            if(user._id == idea.userId){
                idea['user'] = user.userName        
            }
        }      
    }
    res.render('quality_assurance_manager',{model:ideas})
})

router.get('/qam/:sort', async (req, res) => {
    const sort = req.params.sort
    const ideas = await getDocumentWithCondition("Idea", 10, sort)
    const users = await getDocument("Users")
    const comments = await getDocument("Comment")

    for(const idea of ideas) { 
    /*    console.log(idea.date)
        let dateShow = idea.date
        console.log(dateShow)
        dateShow = dateShow.toLocaleString()
        
        idea['dateShow'] = dateShow
    */
        let commentNumber = 0
        for(const comment of comments){
            if(idea._id == comment.ideaId){
                commentNumber += 1
            }
            idea['commentNumber'] = commentNumber
        }

        for(const user of users){
            if(user._id == idea.userId){
                idea['user'] = user.userName        
            }
        }      
    }
    if(sort == "Comment"){
        ideas.sort((a, b) => (a.commentNumber > b.commentNumber) ? 1 : -1)
    }
    if(sort == "Rating"){
        ideas.sort((a, b) => (a.rating > b.rating) ? 1 : -1)
    }
    res.render('quality_assurance_manager',{model:ideas})
})

//Test add comment

router.post('/qam/addComment',async (req,res)=>{
    const text = req.body.txtComment
    const ideaId = req.body.ideaId
    const objectToInsert = {
        text: text,
        ideaId: ideaId,
        date: new Date(Date.now()).toLocaleString()
    }
    await insertObject("Comment", objectToInsert)
    res.redirect('/qam/qam')
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

router.get('/idea/:id', async (req, res) => {
    const id = req.params.id
    const idea = await getDocumentById(id, "Idea")
    const comments = await getCommentByIdea(id, "Comment")

    let commentNumber = 0
    for(const comment of comments){
        if(idea._id == comment.ideaId){
            commentNumber += 1
        }
        idea['commentNumber'] = commentNumber
    }

    for(const user of users){
        if(user._id == idea.userId){
            idea['user'] = user.userName        
        }
    }      
    res.render('quality_assurance_manager',{model:comment}, {ideaModel:idea})
})

module.exports = router;