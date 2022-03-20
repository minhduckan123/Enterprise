const express = require('express')
const { insertObject, updateDocument, deleteObject, getDocumentById, getDocument, getDocumentWithCondition, getCommentByIdea} = require('../model/databaseControl')
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
    const ratings = await getDocument("Rating")

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

        let likeNumber = 0
        let dislikeNumber = 0
        for(const rate of ratings){
            if(idea._id == rate.ideaId){
                if(rate.rate=="Like"){
                    likeNumber += 1
                }
                else if(rate.rate=="Dislike"){
                    dislikeNumber += 1
                }
            }
        }
        rateScore = likeNumber - dislikeNumber
        idea['likeNumber'] = likeNumber
        idea['dislikeNumber'] = dislikeNumber
        idea['rateScore'] = rateScore

        for(const user of users){
            if(user._id == idea.userId){
                idea['user'] = user.userName        
            }
        }      
    }
    if(sort == "Comment"){
        ideas.sort((a, b) => (b.commentNumber > a.commentNumber) ? 1 : -1)
    }
    if(sort == "Rating"){
        ideas.sort((a, b) => (b.rateScore > a.rateScore) ? 1 : -1)
    }
    res.render('quality_assurance_manager',{model:ideas})
})

//Test add comment

router.post('/qam/addComment',async (req,res)=>{
    const text = req.body.txtComment
    const ideaId = req.body.ideaId
    const users = await getDocument("Users")
    const idea = await getDocumentById(ideaId, "Idea")
    const objectToInsert = {
        text: text,
        ideaId: ideaId,
        date: new Date(Date.now()).toLocaleString()
    }
    await insertObject("Comment", objectToInsert)
    res.redirect('/qam/qam')
    let themail = "19";
    for (const user of users) {
        if (user._id == idea.userId) {
            themail = user.email
        }
    }
    console.log(themail)
    const nodemailer = require('nodemailer');
    const transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'group4enterprise2022@gmail.com',
            pass: 'group45678',
        },
    });
    const mailOptions = {
        from: 'group4enterprise2022@gmail.com',
        to: themail,
        subject: 'New Comment',
        html: 'Someone comment on your Idea',
    };
    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
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