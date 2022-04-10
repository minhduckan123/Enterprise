const express = require('express')
const router = express.Router()
const fs = require('fs')
const admzip = require('adm-zip')
const json2csvParser  = require("json2csv").parse;

var mongoose = require('mongoose')
const User = require('../model/user.model')
const Course = require('../model/course.model')
const Category = require('../model/category.model')
const Comment = require('../model/comment.model')
const Rating = require('../model/rating.model')
const Idea = require('../model/idea.model')

//CATEGORY

router.get('/categories', async (req,res)=>{
    const categories = await Category.find().lean()
    res.render('qam/categories', {model:categories})
})

router.post('/addCat',async (req,res)=>{
    const category = req.body.txtCategory
    const description = req.body.txtDescription

    const objectToInsert = {
        _id: mongoose.Types.ObjectId(),
        category: category,
        description: description,
    }
    const newCategory = new Category(objectToInsert)
    await newCategory.save()
    res.redirect('/qam/categories')
})

router.get('/deleteCat', async (req, res) => {
    const idValue = req.query.id
    await Category.deleteOne({_id:idValue})
    res.redirect('/qam/categories')
})

router.get('/editCat/:id', async (req, res) => {
    const idValue = req.params.id
    const category = await Category.findById(idValue)
    res.render('qam/editCategory', {category:category})
})


router.post('/editCat', async (req, res) => {
    let id = req.body.txtId;
    const category = req.body.txtCategory
    const description = req.body.txtDescription

    await Category.findByIdAndUpdate(id, {$set:{
        category: category,
        description: description
    }})

    res.redirect('/qam/categories')
})

//DOWNLOAD CSV
router.get('/downloadCSV', async(req, res)=>{
    const courses = await Course.find().lean()
    const time = new Date(Date.now())
    const timeNow = time.getTime()

    for (const course of courses){
        course['timeNow'] = timeNow
    }
    
    res.render('qam/quality_assurance_manager_download_csv', {model:courses})
    
})

router.get('/downloadCSV/:id', async(req, res)=>{
    const id = req.params.id
    const course = await Course.findById(id)
    const ideas = await Idea.find()
    const users = await User.find()
    let ideaToCSV = []

    for (const user of users){
        for (const idea of ideas){
            if(idea.user == user._id && idea.course == course.courseName){
                idea['user'] = user.userName

                const i = {User: idea['user'], Idea: idea.idea, Course: idea.course, Category: idea.category, Date: idea.date.toLocaleString()}
                ideaToCSV.push(i)
            }
            
        }
    };
    console.log(ideaToCSV)
    const csvData = json2csvParser(ideaToCSV);
    const filename = course.courseName

    fs.writeFileSync(`${filename}.csv`, csvData , { encoding: 'utf8' }, function(error) {
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

    }, 10000);

    res.redirect('/qam/date')

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
    const idea = await Idea.findById(id)
    const users = await User.find().lean()
    const comments = await Comment.find().lean()
    const ratings = await Rating.find().lean()

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
    idea['dateShow'] = idea.date.toLocaleString()

    for (const user of users) {
        if (user._id == idea.user) {
            idea['user'] = user.userName

        }
    }
    //Increase view
    await Idea.findByIdAndUpdate(id, {$set:{
        views : parseInt(idea.views) + 1,
    }})

    let ideas = []
    ideas.push(idea)
    console.log(commentByIdea)
    res.render('qam/quality_assurance_manager_idea_detail',{model:ideas, comments:commentByIdea})
})

router.get('/dashboard', async(req, res)=>{
    const courses = await Course.find()

    let barChart1 =[]
    let barChart2 =[]
    let pieChart =[]
    
    for(let year = 2019; year<2023; year++){
        let IT = await Idea.find({$and:[{department:"Intelligent Technology"},{date: {$gte: new Date(year - 1, 12, 31), $lt: new Date(year + 1,1,1)}}]})
        let Business = await Idea.find({$and:[{department:"Business"},{date: {$gte: new Date(year - 1, 12, 31), $lt: new Date(year + 1,1,1)}}]})
        let Design = await Idea.find({$and:[{department:"Design"},{date: {$gte: new Date(year - 1, 12, 31), $lt: new Date(year + 1,1,1)}}]})
        
        let ITUser = new Set()
        let BusinessUser = new Set()
        let DesignUser = new Set()

        for(const idea of IT){
            ITUser.add(idea.user)
        }
        for(const idea of Business){
            BusinessUser.add(idea.user)
        }
        for(const idea of Design){
            DesignUser.add(idea.user)
        }

        const chart1 = {IT:IT.length, Business:Business.length, Design:Design.length, Year:year}
        const chart2 = {IT:ITUser.size, Business:BusinessUser.size, Design:DesignUser.size, Year:year}
        barChart1.push(chart1)
        barChart2.push(chart2)
    }

    for(const course of courses){
        const chart3 = {TotalCourse: await Idea.countDocuments({course: course.courseName}), Course:course.courseName}
        pieChart.push(chart3)
    }
    
    const csvData1 = json2csvParser(barChart1);
    const csvData2 = json2csvParser(barChart2);
    const csvData3 = json2csvParser(pieChart);


    fs.writeFile('./public/csv/dashboardData.csv', csvData1, function(error) {
        if (error) throw error;
        console.log("Write csv file successfully!");
    });

    fs.writeFile('./public/csv/dashboardData2.csv', csvData2, function(error) {
        if (error) throw error;
        console.log("Write csv file successfully!");
    });

    fs.writeFile('./public/csv/pieChart.csv', csvData3, function(error) {
        if (error) throw error;
        console.log("Write csv file successfully!");
    });

    res.render('qam/quality_assurance_manager_dashboard', {ideas: await Idea.countDocuments(), courses: await Course.countDocuments(), users: await User.countDocuments()})
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

    res.render('qam/quality_assurance_manager', { model: ideas})
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

    //await getUsername()
    res.render('qam/quality_assurance_manager', { model: ideas})
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

    res.render('qam/quality_assurance_manager', { model: ideas})
})

module.exports = router;