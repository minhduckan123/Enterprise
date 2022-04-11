//REQUIRED PACKAGES
var express = require('express')
var app = express()
const {} = require('./model/databaseControl')

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}))

var session = require('express-session');
app.use(session({
    resave: true, 
    saveUninitialized: false, 
    secret: 'secret', 
    cookie: { secure:false, httpOnly:true, maxAge: 900000}
}));

app.set('views', require('path').join(__dirname, 'views'));

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));


//MONGOOSE
var mongoose = require('mongoose')


//HBS TEMPLATE
var hbs = require('hbs')
app.set('view engine','hbs')

var partialDir = require('path').join(__dirname,'/views/partials'); 
hbs.registerPartials(partialDir)

hbs.registerHelper("compare", function(value1, value2, options){
    if (value1 > value2){
        return options.fn(this);
    }else{
        return options.inverse(this);
    }
})

hbs.registerHelper("compareEq", function(value1, value2, options){
    if (value1 != value2){
        return options.fn(this);
    }else{
        return options.inverse(this);
    }
})


//CONTROLLERS
var authMiddleware = require("./middleware/auth.middleware") //Authentication and authorization middleware

const loginController = require('./controller/login')
app.use('/login',  loginController)

const adminController = require('./controller/admin')
app.use('/admin',authMiddleware.authLogIn, authMiddleware.isAdmin, adminController)

const staffController = require('./controller/staff')
app.use('/staff', authMiddleware.authLogIn, authMiddleware.isStaff , staffController)

const qamController = require('./controller/qam')
app.use('/qam', authMiddleware.authLogIn, authMiddleware.isQAM, qamController)

const qacController = require('./controller/qac')
app.use('/qac', authMiddleware.authLogIn, authMiddleware.isQAC, qacController)

app.use(function(req, res, next){
    res.status(404).render('error', {title:'404', message:'page not found'})
})

//RUNNING APP PORT
var PORT = process.env.PORT || 5000
app.listen(PORT);
console.log("Server is running at " + PORT)

