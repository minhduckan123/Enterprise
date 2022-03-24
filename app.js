var express = require('express')
const {} = require('./model/databaseControl')
var app = express()

var hbs = require('hbs')
app.set('view engine','hbs')
app.set('views', require('path').join(__dirname, 'views'));

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

var partialDir = require('path').join(__dirname,'/views/partials');
hbs.registerPartials(partialDir)

// var uploadDir = require('path').join(__dirname,'/uploads');
// app.use(express.static(uploadDir))

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}))

var cookieParser = require('cookie-parser')
app.use(cookieParser('abc9d$67#sdvdJisY'))

var authMiddleware = require("./middleware/auth.middleware")

app.get('/adminIndex', async (req, res) => {
    res.render('adminIndex')
})

const loginController = require('./controller/login')
app.use('/login',  loginController)

const adminController = require('./controller/admin')
app.use('/admin',authMiddleware.authLogIn, authMiddleware.isAdmin, adminController)

const staffController = require('./controller/staff')
app.use('/staff', authMiddleware.authLogIn, authMiddleware.isStaff , staffController)

const qamController = require('./controller/qam')
app.use('/qam', authMiddleware.authLogIn, authMiddleware.isQAM, qamController)

const qacController = require('./controller/qac')
app.use('/qac', authMiddleware.authLogIn, authMiddleware.isQAM, qacController)



var PORT = process.env.PORT || 5000
app.listen(PORT);
console.log("Server is running at " + PORT)

