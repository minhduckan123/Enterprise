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

// app.get('/',async (req,res)=>{
//     res.render('home')
// })

const adminController = require('./controller/admin')
app.use('/admin',authMiddleware.authLogIn, adminController)

const commentController = require('./controller/comment')
app.use('/comment', commentController)

const ideaController = require('./controller/idea')
app.use('/idea', ideaController)

const emailController = require('./controller/email')
app.use('/email', emailController)

const staffController = require('./controller/staff')
app.use('/staff', staffController)

const qamController = require('./controller/qam')
app.use('/qam', qamController)



var PORT = process.env.PORT || 5000
app.listen(PORT);
console.log("Server is running at " + PORT)