var mongoose = require('mongoose')
mongoose.connect("mongodb+srv://hieunt:EarthDefender@cluster0.vwoqw.mongodb.net/Enterprise?retryWrites=true&w=majority")

var ratingSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    rate: String,
    ideaId: String,
    userId: String,
},
{ collection : 'Rating' }
)

var Rating = mongoose.model('Rating', ratingSchema)

module.exports = Rating