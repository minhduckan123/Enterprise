const express = require('express')
const { insertObject, updateDocument, deleteObject, getDocumentById, getDocument, getDocumentWithCondition, getCommentByIdea,getDocumentByAttribute, getDB, getDocumentSortByDate,getDocumentSortByViews} = require('../model/databaseControl')
const router = express.Router()
const multer = require("multer");
const { route } = require('express/lib/application');
const path = require('path')
const nodemailer = require('nodemailer');

var mongoose = require('mongoose')
const User = require('../model/user.model')
const Course = require('../model/course.model')
const Category = require('../model/category.model')
const Comment = require('../model/comment.model')
const Rating = require('../model/rating.model')
const Idea = require('../model/idea.model')

router.get('/addIdea', async (req, res) => {
    const categories = await Category.find()
    const courses = await Course.find()

    for(const course of courses){
        course['timeNow'] = new Date(Date.now()).getTime()
    }
    
    const userId = req.session.userId

    res.render('staff/staff_add_idea', {categories:categories, courses:courses, userId:userId})
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
    const anonymous = req.body.anonymous
    const course = req.body.txtCourse
    const courseObjects = await Course.findOne({courseName:course})
    const ideaDate = new Date(Date.now())
    const ideaDateTime = ideaDate.getTime()
    let courseDateTime = ""
    const qacMailList = []

    const user = req.body.txtUser
    const idea = req.body.txtIdea
    //const course = req.body.txtCourse
    const category = req.body.txtCategory
    const file = req.files


    const userObject =  await User.findById(user)
    const userName = userObject.userName
    const department = userObject.department
    const qacToMail = await User.find({department:department, role:'Quality Assurance Coordinator' })
    
    for(const qactomail of qacToMail){
        const qacMail = qactomail.email
        qacMailList.push(qacMail)
    }
    //Lay user
    //Lay department cua user
    //Lay tat ca qac cua department do (Goi db)
    //Lay email cua cac qac do

    // for(const courseObject of courseObjects){
    //     courseDateTime = courseObject.deadLine1Time
    // }
    console.log(ideaDateTime)
    //const time = courseObjects.deadLine1Time
    //console.log(courseObjects.deadLine1Time)
    console.log(courseObjects)
    if(ideaDateTime < courseObjects.deadLine1Time){
        try {
            const objectToInsert = {
                _id: mongoose.Types.ObjectId(),
                user: user,
                anonymous: anonymous,
                idea: idea,
                course: course,
                category:category,
                department:department,
                file: file,
                views: 0,
                date: new Date(Date.now())
            }
            //await insertObject("Idea", objectToInsert)
            const newIdea = new Idea(objectToInsert)
            await newIdea.save()
            console.log(objectToInsert)

            //SEND AUTOMATIC EMAIL
            const transport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'group4enterprise2022@gmail.com',
                    pass: 'group45678',
                },
            });

            
            for(const emai of qacMailList){
                const mailOptions = {
                    from: 'group4enterprise2022@gmail.com',
                    to: emai,
                    subject: 'This is an automatic email. Please do not reply',
                    html: ` A staff (${userName}) from ${department} department just submitted 1 idea for ${course} course. 
                            Login to system for more details.`,
                };
                transport.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    }
                    console.log('Email sent: ' + info.response);
                });
            }
        } catch (error) {
            console.log(error)
        }
        res.redirect('/staff/date')
    }
    else{
        res.redirect('/staff/rating')
    }
})

//Main view all idea
router.get('/view', async (req, res) => {
    const ideas = await Idea.find().sort({views:-1}).lean()
    const users = await User.find().lean()
    const comments = await Comment.find().lean()
    const ratings = await Rating.find().lean()

    let dateShow = ""
    for (const idea of ideas) {
        dateShow = idea.date.toLocaleString()
        idea['dateShow'] = dateShow

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

    res.render('staff/staff', { model: ideas })
})

router.get('/date', async (req, res) => {
    const ideas = await Idea.find().sort({date:-1}).lean()
    const users = await User.find().lean()
    const comments = await Comment.find().lean()
    const ratings = await Rating.find().lean()

    let dateShow = ""
    for (const idea of ideas) {
        dateShow = idea.date.toLocaleString()
        idea['dateShow'] = dateShow

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
    res.render('staff/staff', { model: ideas })
})

router.get('/rating', async (req, res) => {
    const ideas = await Idea.find().lean()
    const users = await User.find().lean()
    const comments = await Comment.find().lean()
    const ratings = await Rating.find().lean()

    let dateShow = ""
    for (const idea of ideas) {
        dateShow = idea.date.toLocaleString()
        idea['dateShow'] = dateShow

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
    ideas.sort((a, b) => (b.rateScore > a.rateScore) ? 1 : -1)

    res.render('staff/staff', { model: ideas })
})

//Idea detail
router.get('/ideaDetail/:id', async (req, res) => {
    const id = req.params.id
    const idea = await Idea.findById(id)
    const users = await User.find()
    const comments = await Comment.find()
    const ratings = await Rating.find()
    const courseOfIdea = await Course.findOne({courseName:idea.course})
    const userId = req.session.userId

    //Increase view
    await Idea.findByIdAndUpdate(id, {$set:{
        views : parseInt(idea.views) + 1,
    }})

    //const comments = await getCommentByIdea(id, "Comment")
    let commentNumber = 0
    let commentByIdea = []
    let dateShow = ""
    for(const comment of comments){
        for (const user of users) {
            if (user._id == comment.userId) {
                comment['user'] = user.userName
            }
        }

        dateShow = comment.date.toLocaleString()
        comment['dateShow'] = dateShow
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
            idea['username'] = user.userName
        }
    }

    idea['dateShow'] = idea.date.toLocaleString()

    idea['commentDate'] = new Date(Date.now()).getTime()
    idea['courseDate'] = courseOfIdea.deadLine2Time


    let ideas = []
    ideas.push(idea)
    
    res.render('staff/staff_idea_detail',{model:ideas, comments:commentByIdea, userId:userId})
})

router.post('/ideaDetail/addComment',async (req,res)=>{
    const ideaId = req.body.ideaId
    const idea = await Idea.findById(ideaId)
    const course = idea.course
    const courseObjects = await Course.findOne({courseName:course})
    const commentDate = new Date(Date.now())
    const commentDateTime = commentDate.getTime()
    let courseDateTime = ""
    for(const courseObject of courseObjects){
        courseDateTime = courseObject.deadLine2Time
    }
    if(commentDateTime < courseDateTime){
        const text = req.body.txtComment      
        const userId = req.body.userId
        const objectToInsert = {
            _id: mongoose.Types.ObjectId(),
            text: text,
            ideaId: ideaId,
            userId: userId,
            date: new Date(Date.now())
        }
        //await insertObject("Comment", objectToInsert)
        const newComment = new Comment(objectToInsert)
        await newComment.save()

        //SEND AUTOMATIC EMAIL
        const userIdeaID = req.body.userIdeaID
        const userOfIdea = await User.findById(userIdeaID)
        const userOfComment = await User.findById(userId)
        const transport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'group4enterprise2022@gmail.com',
                pass: 'group45678',
            },
        });

        const mailOptions = {
            from: 'group4enterprise2022@gmail.com',
            to: userOfIdea.email,
            subject: 'This is an automatic email. Please do not reply',
            html: ` A staff (${userOfComment.userName}) from ${userOfComment.department} department just commented on your idea of ${course} course. 
                    Login to system for more details.`,
        };
        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            }
            console.log('Email sent: ' + info.response);
        });

        res.redirect('/staff/ideaDetail/' + ideaId)
        
    }
    else{
        res.redirect('/staff/ideaDetail/' + ideaId)
    }
})

router.post('/rate/:id', async (req,res)=>{
    const ideaId = req.params.id //Dung hidden field
    const userId = req.session.userId //Truyen vao tu token
    const rate = req.body.rate
    const ratings = await Rating.find().lean()
    let exist = 0
    for (const rating of ratings) {
        if (rating.userId == userId && rating.ideaId == ideaId) {
            // let updateValues = {
            //     $set: {
            //         rate: rate,
            //         ideaId: ideaId,
            //         userId: userId,
            //     }
            // };
            await Rating.findByIdAndUpdate(rating._id, {$set:{
                rate: rate,
                ideaId: ideaId,
                userId: userId,
            }})
            //await updateDocument(rating._id, updateValues, "Rating")
            exist = 1
        }
    }
    if (exist == 0) {
        const objectToInsert = {
            rate: rate,
            ideaId: ideaId,
            userId: userId,
        }
        const newRating = new Rating(objectToInsert)
        await newRating.save()
    }
    res.redirect('/staff/rating')
})

module.exports = router;