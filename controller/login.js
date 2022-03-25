const express = require('express')
const { getDB} = require('../model/databaseControl')

const {isAdmin} = require("../middleware/auth.middleware")
const router = express.Router()
//var session = require('express-session');
// router.use(session({
//     resave: true, 
//     saveUninitialized: true, 
//     secret: 'secret', 
//     cookie: { maxAge: 10}}));

router.get("/", async (req,res)=>{
    res.render('login');
})

router.post('/doLogin', async (req,res)=>{
    var nameInput = req.body.username;
    var passInput = req.body.password;
    const dbo = await getDB()

    var user  = await dbo.collection("Users").findOne({userName:nameInput});

    if(!user || user.password !== passInput){
        res.render("login"), {value: nameInput}
        return
    }
    
    res.cookie('userId', user._id, {signed:true, expires: new Date(Date.now() + 900000)})

    if(user.role == 'Quality Assurance Manager'){
        res.redirect('/qam/qam')
    }else if(user.role == 'Admin'){
        res.redirect('/admin/home')
    }else if(user.role == 'Staff'){
        res.redirect('/staff/ideas')
    // }else{
    //     res.redirect('/')
    }
    


})

router.get('/logout', function(req, res) {
    res.clearCookie('userId');
    res.redirect("/login/login");
});

module.exports = router;