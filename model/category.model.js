var mongoose = require('mongoose')
mongoose.connect("mongodb+srv://hieunt:EarthDefender@cluster0.vwoqw.mongodb.net/Enterprise?retryWrites=true&w=majority")

var categorySchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    category: String,
    description: String,
},
{ collection : 'Category' }
)

var Category = mongoose.model('Category', categorySchema)

module.exports = Category