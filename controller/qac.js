const express = require('express')
const router = express.Router()

var mongoose = require('mongoose')
const User = require('../model/user.model')
const Course = require('../model/course.model')
const Category = require('../model/category.model')
const Comment = require('../model/comment.model')
const Rating = require('../model/rating.model')
const Idea = require('../model/idea.model')

router.get('/qac', async (req, res) => {

    const ideas = await Idea.find().lean()
    const users = await User.find().lean()
    const comments = await Comment.find().lean()
    let dateShow = ""
    for(const idea of ideas) { 
        dateShow = idea.date.toLocaleString()
        idea['dateShow'] = dateShow

        let commentNumber = 0
        for(const comment of comments){
            if(idea._id == comment.ideaId){
                commentNumber += 1
            }
            idea['commentNumber'] = commentNumber
        }

        for(const user of users){
            if(user._id == idea.user){
                idea['user'] = user.userName        
            }
        }      
    }
    res.render('qac/quality_assurance_coordinator',{model:ideas})
})

router.get('/view', async (req, res) => {
    const userId = req.session.userId
    const user = await User.findById(userId).lean()
    const ideas = await Idea.find({department: user.department}).sort({views:-1}).lean()
    const users = await User.find().lean()
    const comments = await Comment.find().lean()
    const ratings = await Rating.find().lean().lean()

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

    res.render('qac/quality_assurance_coordinator',{model:ideas})
})

router.get('/date', async (req, res) => {
    const userId = req.session.userId
    const user = await User.findById(userId).lean()
    const ideas = await Idea.find({department: user.department}).sort({date:-1}).lean()
    const users = await User.find().lean()
    const comments = await Comment.find().lean()
    const ratings = await Rating.find().lean().lean()

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
    res.render('qac/quality_assurance_coordinator',{model:ideas})
})

router.get('/rating', async (req, res) => {
    const userId = req.session.userId
    const user = await User.findById(userId).lean()
    const ideas = await Idea.find().lean()
    const users = await User.find().lean()
    const comments = await Comment.find().lean()
    const ratings = await Rating.find().lean().lean()

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

    res.render('qac/quality_assurance_coordinator',{model:ideas})
})


router.get('/ideaDetail/:id', async (req, res) => {
    const id = req.params.id
    const idea = await Idea.findById(id).lean()
    const users = await User.find().lean()
    const comments = await Comment.find().lean()
    const ratings = await Rating.find().lean()
    const userId = req.session.userId
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
            idea['user'] = user.userName
        }
    }

    idea['dateShow'] = idea.date.toLocaleString()
    
    //Increase view
    await Idea.findByIdAndUpdate(id, {$set:{
        views : parseInt(idea.views) + 1,
    }})

    let ideas = []
    ideas.push(idea)

    res.render('qac/quality_assurance_coordinator_idea_detail',{model:ideas, comments:commentByIdea})
})

module.exports = router;