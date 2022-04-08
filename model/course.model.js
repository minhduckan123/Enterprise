var mongoose = require('mongoose')
mongoose.connect("mongodb+srv://hieunt:EarthDefender@cluster0.vwoqw.mongodb.net/Enterprise?retryWrites=true&w=majority")

var courseSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    courseName: String,
    deadLine1: String,
    deadLine1Time: Number,
    deadLine2: String,
    deadLine2Time: Number,
},
{ collection : 'Course' }
)

var Course = mongoose.model('Course', courseSchema)

module.exports = Course