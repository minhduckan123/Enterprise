const express = require('express')
const { insertObject, updateDocument, deleteObject, getDocumentById, getDocument, getDocumentWithCondition, getCommentByIdea, getDB} = require('../model/databaseControl')
const router = express.Router()
const multer = require("multer");
const { route } = require('express/lib/application');
const async = require('hbs/lib/async');
const path = require('path')

router.get('/addIdea', async (req, res) => {
    const categories = await getDocument("Category")
    const userId = req.signedCookies.userId

    res.render('staff_add_idea', {categories:categories, userId:userId})
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.pdf' && ext !== '.doc' && ext !== '.docx') {
            return callback(new Error('Only pdf and doc are allowed'))
        }
        callback(null, true)
    },
})

router.post('/addIdea', upload.array('txtFile', 5), async (req, res) => {
    try {
        const user = req.body.txtUser
        const idea = req.body.txtIdea
        const course = req.body.txtCourse
        const category = req.body.txtCategory
        const file = req.files

        const objectToInsert = {
            user: user,
            idea: idea,
            course: course,
            category:category,
            file: file,
            views: 0,
            date: new Date(Date.now()).toLocaleString()
        }
        await insertObject("Idea", objectToInsert)
    } catch (error) {
        console.log(error)
    }

        
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
        to: 'group4enterprise2022@gmail.com',
        subject: 'New Idea',
        html: 'A staff submited a new Idea',
    };
    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
    res.redirect('/staff/ideas')
})


router.get('/ideas', async (req, res) => {
    const ideas = await getDocument("Idea")
    const users = await getDocument("Users")
    const categories = await getDocument("Category")
    const comments = await getDocument("Comment")
    for (const idea of ideas) {
        let commentNumber = 0
        for (const comment of comments) {
            if (idea._id == comment.ideaId) {
                commentNumber += 1
            }
            idea['commentNumber'] = commentNumber
        }

        for (const user of users) {
            if (user._id == idea.user) {
                idea['user'] = user.userName
            }
        }
    }

    res.render('staff', { model: ideas, categories:categories })
})


//Main view all idea
router.get('/:sort', async (req, res) => {
    const sort = req.params.sort
    const ideas = await getDocumentWithCondition("Idea", 10, sort)
    const users = await getDocument("Users")
    const comments = await getDocument("Comment")
    const ratings = await getDocument("Rating")

    for (const idea of ideas) {
        /*    console.log(idea.date)
            let dateShow = idea.date
            console.log(dateShow)
            dateShow = dateShow.toLocaleString()
            
            idea['dateShow'] = dateShow
        */
        let commentNumber = 0
        for (const comment of comments) {
            if (idea._id == comment.ideaId) {
                commentNumber += 1
            }
        }
        idea['commentNumber'] = commentNumber

        let likeNumber = 0
        let dislikeNumber = 0
        for (const rate of ratings) {
            if (idea._id == rate.ideaId) {
                if (rate.rate == "Like") {
                    likeNumber += 1
                }
                else if (rate.rate == "Dislike") {
                    dislikeNumber += 1
                }
            }
        }
        rateScore = likeNumber - dislikeNumber
        idea['likeNumber'] = likeNumber
        idea['dislikeNumber'] = dislikeNumber
        idea['rateScore'] = rateScore

        for (const user of users) {
            if (user._id == idea.user) {
                idea['user'] = user.userName
            }
        }
    }
    if(sort == "rating"){
        ideas.sort((a, b) => (b.rateScore > a.rateScore) ? 1 : -1)
    }

    res.render('staff', { model: ideas })
})

//Idea detail
router.get('/ideaDetail/:id', async (req, res) => {
    const id = req.params.id
    const idea = await getDocumentById(id, "Idea")
    const users = await getDocument("Users")
    const comments = await getDocument("Comment")
    const ratings = await getDocument("Rating")
    //const comments = await getCommentByIdea(id, "Comment")
    let commentNumber = 0
    let commentByIdea = []
        for(const comment of comments){
            if(idea._id == comment.ideaId){
                commentNumber += 1
                commentByIdea.push(comment)
            }      
        }
    idea['commentNumber'] = commentNumber
    let likeNumber = 0
    let dislikeNumber = 0
    for (const rate of ratings) {
        if (idea._id == rate.ideaId) {
            if (rate.rate == "Like") {
                likeNumber += 1
            }
            else if (rate.rate == "Dislike") {
                dislikeNumber += 1
            }
        }
    }
    idea['likeNumber'] = likeNumber
    idea['dislikeNumber'] = dislikeNumber

    for (const user of users) {
        if (user._id == idea.user) {
            idea['user'] = user.userName
        }
    }
    //Increase view
    let updateValues = { $set: {
        userId: idea.userId,
        idea: idea.idea,
        course: idea.course,
        file : idea.file,
        views : parseInt(idea.views) + 1,
        date: new Date(Date.now()).toLocaleString()
    } };
    await updateDocument(id, updateValues, "Idea") 

    let ideas = []
    ideas.push(idea)
    console.log(commentByIdea)
    res.render('staff_idea_detail',{model:ideas, comments:commentByIdea})
})

router.get('/comment/:id', async (req, res) => {
    const idValue = req.params.id
    const comments = await getCommentByIdea(idValue ,"Comment")
    console.log(comments)
    res.render('comment',{model:comments})
})

router.get('/deleteComment/:id', async (req, res) => {
    const idValue = req.params.id
    await deleteObject(idValue, "Comment")
    res.redirect('/staff/ideas')
})

router.post('/addComment', async (req, res) => {
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

router.post('/ideaDetail/addComment',async (req,res)=>{
    const text = req.body.txtComment
    const ideaId = req.body.ideaId
    const objectToInsert = {
        text: text,
        ideaId: ideaId,
        date: new Date(Date.now()).toLocaleString()
    }
    await insertObject("Comment", objectToInsert)
    res.redirect('/staff/ideaDetail/' + ideaId)
})

router.post('/rate/:id', async (req,res)=>{
    const ideaId = req.params.id //Dung hidden field
    const userId = 1 //Truyen vao tu token
    const rate = req.body.rate
    console.log(rate)
    const ratings = await getDocument("Rating")
    let exist = 0
    for (const rating of ratings) {
        if (rating.userId == userId && rating.ideaId == ideaId) {
            let updateValues = {
                $set: {
                    rate: rate,
                    ideaId: ideaId,
                    userId: userId,
                }
            };
            await updateDocument(rating._id, updateValues, "Rating")
            exist = 1
        }
    }
    if (exist == 0) {
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