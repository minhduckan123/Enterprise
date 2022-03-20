const express = require('express')
const { insertObject, updateDocument, deleteObject, getDocumentById, getDocument} = require('../model/databaseControl')
const router = express.Router()
const multer = require("multer");
var path = require('path')

router.get('/idea', async (req, res) => {
    const ideas = await getDocument("Idea")
    res.render('ideas',{model:ideas})
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

router.get('/addIdea',(req,res)=>{
    res.render('addIdea')
})

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function(req, file, cb) {
        cb(null,file.originalname);
    }
});
const upload = multer({storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.pdf' && ext !== '.doc' && ext !== '.docx') {
            return callback(new Error('Only pdf and doc are allowed'))
        }
        callback(null, true)
    },
})

router.post('/addIdea', upload.array('txtFile', 5), async (req,res)=>{
try {
        const user = req.body.txtUser
        const idea = req.body.txtIdea
        const course = req.body.txtCourse
        const file = req.files.txtFile

        const objectToInsert = {
            user: user,
            idea: idea,
            course: course,
            file : file,
            date: new Date(Date.now()).toLocaleString()
        }
        await insertObject("Idea", objectToInsert)
    } catch (error) {
        console.log(error)
    }
    
    res.redirect('/qam/qam')
})

module.exports = router;