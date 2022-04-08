var mongoose = require('mongoose')
mongoose.connect("mongodb+srv://hieunt:EarthDefender@cluster0.vwoqw.mongodb.net/Enterprise?retryWrites=true&w=majority")

var commentSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    text: String,
    ideaId: String,
    userId: String,
    date: Date
},
{ collection : 'Comment' }
)

var Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment