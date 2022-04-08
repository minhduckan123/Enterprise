const { Int32 } = require('mongodb')
var mongoose = require('mongoose')
mongoose.connect("mongodb+srv://hieunt:EarthDefender@cluster0.vwoqw.mongodb.net/Enterprise?retryWrites=true&w=majority")

var ideaSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: String,
    idea: String,    
    course: String,
    category: String,
    department: String,
    file: Array,
    views: Number,
    date: Date
},
{ collection : 'Idea' }
)

var Idea = mongoose.model('Idea', ideaSchema)

module.exports = Idea