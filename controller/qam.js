const express = require('express')
const { insertObject, updateDocument, deleteObject, getDocumentById, getDocument, getDocumentWithCondition, getCommentByIdea, getDocumentForChart, getDocumentSortByDate, getDocumentSortByViews} = require('../model/databaseControl')
const router = express.Router()
const fs = require('fs')
const admzip = require('adm-zip')
const { FORMERR } = require('dns')
const json2csvParser  = require("json2csv").parse;

//CATEGORY

router.get('/categories', async (req,res)=>{
    const categories = await getDocument("Category")
    res.render('qam/categories', {model:categories})
})

router.post('/addCat',async (req,res)=>{
    const category = req.body.txtCategory
    const description = req.body.txtDescription
    const objectToInsert = {
        category: category,
        description: description,
    }
    await insertObject("Category", objectToInsert)
    res.redirect('/qam/categories')
})

router.get('/deleteCat', async (req, res) => {
    const idValue = req.query.id
    await deleteObject(idValue, "Category")
    res.redirect('/qam/categories')
})

//DOWNLOAD CSV
router.get('/downloadCSV', async(req, res)=>{
    const courses = await getDocument('Course')
    const time = new Date(Date.now())
    const timeNow = time.getTime()

    for (const course of courses){
        course['timeNow'] = timeNow
    }
    
    res.render('qam/quality_assurance_manager_download_csv', {model:courses})
    
})

router.get('/downloadCSV/:id', async(req, res)=>{
    const id = req.params.id
    const course = await getDocumentById(id, "Course")
    const ideas = await getDocument('Idea')
    const users = await getDocument('Users')
    let ideaToCSV = []

    for (const user of users){
        for (const idea of ideas){
            if(idea.user == user._id && idea.course == course.courseName){
                idea['user'] = user.userName
                ideaToCSV.push(idea)
            }
            console.log(idea.file)
        }
    };

    const csvData = json2csvParser(ideaToCSV);
    const filename = course.courseName

    fs.writeFile(`${filename}.csv`, csvData, function(error) {
        if (error) throw error;
        console.log("Write csv file successfully!");
    });

    res.set('Content-Type','text/csv');
    res.set('Content-Disposition',`attachment; filename=${filename}.csv`);
    res.set('Content-Length',csvData.length);
    res.send(csvData);

    setTimeout(function () {
        fs.unlink(`${filename}.csv`, function (err) { // delete this file after 30 seconds
            if (err) {
                console.error(err);
            }
            console.log('File has been Deleted');
        });

    }, 3000);

})

//DOWNLOAD FILES
const pathZipFile = "./public/uploads"
var uploadDir = fs.readdirSync(pathZipFile);
router.get('/downloadZipFile',  (req, res)=>{
    var zip = new admzip();

    if(uploadDir.length > 0){
        for(var i = 0; i < uploadDir.length;i++){
            zip.addLocalFile("./public/uploads/"+uploadDir[i]);
        }
    }
 
    const downloadName = `download_ideas_files.zip`;// Define zip file name
    const data = zip.toBuffer();
    
    // code to download zip file
    res.set('Content-Type','application/octet-stream');
    res.set('Content-Disposition',`attachment; filename=${downloadName}`);
    res.set('Content-Length',data.length);
    res.send(data);

})

//IDEA & COMMENT

router.get('/ideaDetail/:id', async (req, res) => {
    const id = req.params.id
    const idea = await getDocumentById(id, "Idea")
    const users = await getDocument("Users")
    const comments = await getDocument("Comment")
    const ratings = await getDocument("Rating")
    //const comments = await getCommentByIdea(id, "Comment")
    let commentNumber = 0
    let commentByIdea = []
    let dateShow = ""
        for(const comment of comments){
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
    //Increase view
    let updateValues = { $set: {
        userId: idea.user,
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
    res.render('qam/quality_assurance_manager_idea_detail',{model:ideas, comments:commentByIdea})
})

router.get('/dashboard', async(req, res)=>{
    let charts =[]
    
    for(let i = 2019; i<2023; i++){
        let IT = await getDocumentForChart("Idea", "Intelligent Technology", i)
        let Business = await getDocumentForChart("Idea", "Business", i)
        let Design = await getDocumentForChart("Idea", "Design", i)
        let ITnumber = IT.length
        let BusinessNumber = Business.length
        let DesignNumber = Design.length

        const chart = {IT:ITnumber, Business:BusinessNumber, Design:DesignNumber, Year:i}
        charts.push(chart)
    }
    console.log(charts)
    
    const csvData = json2csvParser(charts);

    fs.writeFile('./public/csv/dashboardData.csv', csvData, function(error) {
        if (error) throw error;
        console.log("Write csv file successfully!");
    });

    res.render('qam/quality_assurance_manager_dashboard')
})

router.get('/dashboard2', async(req, res)=>{
    let charts =[]

    for(let i = 2019; i<2023; i++){
        let ITUser = new Set()
        let BusinessUser = new Set()
        let DesignUser = new Set()
        let IT = await getDocumentForChart("Idea", "Intelligent Technology", i)
        for(const idea of IT){
            ITUser.add(idea.user)
        }
        let Business = await getDocumentForChart("Idea", "Business", i)
        for(const idea of Business){
            BusinessUser.add(idea.user)
        }
        let Design = await getDocumentForChart("Idea", "Design", i)
        for(const idea of Design){
            DesignUser.add(idea.user)

        }
        let ITnumber = ITUser.size
        let BusinessNumber = BusinessUser.size
        let DesignNumber = DesignUser.size

        const chart = {IT:ITnumber, Business:BusinessNumber, Design:DesignNumber, Year:i}
        charts.push(chart)
    }
    console.log(charts)
    
    const csvData = json2csvParser(charts);

    fs.writeFile('./public/csv/dashboardData.csv', csvData, function(error) {
        if (error) throw error;
        console.log("Write csv file successfully!");
    });

    res.render('qam/quality_assurance_manager_dashboard')
})

//Main view all idea
router.get('/view', async (req, res) => {
    const ideas = await getDocumentSortByViews("Idea")
    const users = await getDocument("Users")
    const comments = await getDocument("Comment")
    const ratings = await getDocument("Rating")

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

    res.render('qam/quality_assurance_manager', { model: ideas})
})

router.get('/date', async (req, res) => {
    const ideas = await getDocumentSortByDate("Idea")
    const users = await getDocument("Users")
    const comments = await getDocument("Comment")
    const ratings = await getDocument("Rating")

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
    res.render('qam/quality_assurance_manager', { model: ideas})
})

router.get('/rating', async (req, res) => {
    const ideas = await getDocument("Idea")
    const users = await getDocument("Users")
    const comments = await getDocument("Comment")
    const ratings = await getDocument("Rating")

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

    res.render('qam/quality_assurance_manager', { model: ideas})
})

module.exports = router;