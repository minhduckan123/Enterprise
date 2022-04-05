const express = require('express')
const { getDB} = require('../model/databaseControl')
const router = express.Router()
const bcrypt = require("bcrypt");

router.get("/", async (req,res)=>{
    res.render('login');
})

router.post('/doLogin', async (req,res)=>{
    var nameInput = req.body.username;
    var passInput = req.body.password;
    
    const dbo = await getDB()
    var user  = await dbo.collection("Users").findOne({userName:nameInput});

    const validPassword = await bcrypt.compare(passInput, user.password);
    if(!user){  //if(!user || !validPassword)
        res.render("login"), {value: nameInput}
    }else{

        req.session.userId = user._id

        if(user.role == 'Quality Assurance Manager'){
            res.redirect('/qam/date')
        }else if(user.role == 'Admin'){
            res.redirect('/admin/home')
        }else if(user.role == 'Staff'){
            res.redirect('/staff/date')
        }else if(user.role == 'Quality Assurance Coordinator'){
            res.redirect('/qac/qac')
        }
    }


})

router.get('/logout', function(req, res) {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
          if(err) {
            return next(err);
          } else {
            res.redirect("/login");
          }
        });
      }
});

module.exports = router;