const express = require('express')
const { insertObject, updateDocument, deleteObject, getDocumentById, getDocument, getDocumentWithCondition} = require('../model/databaseControl')
const router = express.Router()
const multer = require("multer");
const { route } = require('express/lib/application');


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../uploads');
    },
    filename: function(req, file, cb) {
        cb(null,file.originalname);
    }
    });
const upload = multer({storage: storage})

router.get('/addIdea',(req,res)=>{
    res.render('addIdea')
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
    await insertObject("Idea", objectToInsert)
    res.redirect('ideas')
})

router.get('/ideas', async (req, res) => {
    const ideas = await getDocument("Idea")
    res.render('staff',{model:ideas})
})

router.get('/:sort', async (req, res) => {
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
        }
        idea['commentNumber'] = commentNumber

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
    console.log(ideas)
    if(sort == "rating"){
        ideas.sort((a, b) => (b.rateScore > a.rateScore) ? 1 : -1)
    }

    res.render('staff',{model:ideas})
})


router.get('/comment/:id', async (req, res) => {
    const idValue = req.params.id
    const comments = await getCommentByIdea(idValue ,"Comment")
    res.render('comment',{model:comments})
})

router.get('/addComment',(req,res)=>{
    res.render('addComment')
})

router.get('/deleteComment/:id', async (req, res) => {
    const idValue = req.params.id
    await deleteObject(idValue, "Comment")
    res.redirect('/staff/ideas')
})

router.post('/addComment',async (req,res)=>{
    const text = req.body.txtText
    const idea = req.body.txtIdea
    const user = req.body.txtUser
    const objectToInsert = {
        text: text,
        idea: idea,
        user: user,
    }
    await insertObject("Comments", objectToInsert)
    res.redirect('/ideas')
})

router.post('/rate/:id', async (req,res)=>{
    const ideaId = req.params.id //Dung hidden field
    const userId = 1 //Truyen vao tu token
    const rate = req.body.rate
    console.log(rate)
    const ratings = await getDocument("Rating")
    let exist = 0
    for(const rating of ratings) {
        if(rating.userId == userId && rating.ideaId == ideaId){
            let updateValues = { $set: {
                rate: rate,
                ideaId: ideaId,
                userId: userId,
            } };
            await updateDocument(rating._id, updateValues, "Rating") 
            exist = 1
        }
    }
    if(exist == 0){
        const objectToInsert = {
            rate: rate,
            ideaId: ideaId,
            userId: userId,
        }
        await insertObject("Rating", objectToInsert)
    }
    console.log(exist)
    res.redirect('/staff/ideas')
})

module.exports = router;