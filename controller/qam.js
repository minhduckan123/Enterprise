const express = require('express')
const { insertObject, updateDocument, deleteObject, getDocumentById, getDocument, getDocumentWithCondition} = require('../model/databaseControl')
const router = express.Router()
const fs = require('fs')
const admzip = require('adm-zip')

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
    }
    await insertObject("Comment", objectToInsert)
    res.redirect('/qam/qam')
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


// router.get('/addIdea',(req,res)=>{
//     res.render('addIdea')
// })

// router.get('/deleteIdea/:id', async (req, res) => {
//     const idValue = req.params.id
//     await deleteObject(idValue, "Idea")
//     res.redirect('/admin/ideas')
// })

// router.post('/addIdea',async (req,res)=>{
//     const user = req.body.txtUser
//     const idea = req.body.txtIdea
//     const course = req.body.txtCourse
//     const file = req.body.txtFile
//     const objectToInsert = {
//         user: user,
//         idea: idea,
//         course: course,
//         file : file,
//     }
//     await insertObject("Users", objectToInsert)
//     res.redirect('/idea/ideas')
// })

const path = "./public/uploads"
var uploadDir = fs.readdirSync(path);
router.get('/downloadZipFile',  (req, res)=>{
    var zip = new admzip();

    if(uploadDir.length > 0){
        for(var i = 0; i < uploadDir.length;i++){
            zip.addLocalFile("./public/uploads/"+uploadDir[i]);
        }
    }
 
    // Define zip file name
    const downloadName = `download_ideas_files.zip`;
 
    const data = zip.toBuffer();
    
    // code to download zip file
 
    res.set('Content-Type','application/octet-stream');
    res.set('Content-Disposition',`attachment; filename=${downloadName}`);
    res.set('Content-Length',data.length);
    res.send(data);

})

module.exports = router;