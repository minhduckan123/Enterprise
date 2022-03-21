const express = require('express')
const { insertObject, updateDocument, deleteObject, getDocumentById, getDocument, getDocumentWithCondition, getCommentByIdea} = require('../model/databaseControl')
const router = express.Router()

router.get('/qac', async (req, res) => {
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
    res.render('quality_assurance_coordinator',{model:ideas})
})

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
        if (user._id == idea.userId) {
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
    res.render('quality_assurance_manager_idea_detail',{model:ideas, comments:commentByIdea})
})

module.exports = router;