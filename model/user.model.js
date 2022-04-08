var mongoose = require('mongoose')
mongoose.connect("mongodb+srv://hieunt:EarthDefender@cluster0.vwoqw.mongodb.net/Enterprise?retryWrites=true&w=majority")

var userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userName: String,
    password: String,
    role: String,
    email: String,
    department: String,
},
{ collection : 'Users' }
)

var User = mongoose.model('User', userSchema)

module.exports = User