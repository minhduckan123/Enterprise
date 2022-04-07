const {MongoClient,ObjectId} = require('mongodb')

const DATABASE_URL = "mongodb+srv://hieunt:EarthDefender@cluster0.vwoqw.mongodb.net/test"
const DATABASE_NAME = 'Enterprise'

async function getDB() {
    const client = await MongoClient.connect(DATABASE_URL);
    const dbo = client.db(DATABASE_NAME);
    return dbo;
}

async function deleteObject(id,collectionName){
    const dbo = await getDB()
    await dbo.collection(collectionName).deleteOne({_id:ObjectId(id)})
}

async function insertObject(collectionName, objectToInsert) {
    const dbo = await getDB();
    const newObject = await dbo.collection(collectionName).insertOne(objectToInsert);
    console.log("Gia tri id moi duoc insert la: ", newObject.insertedId.toHexString());
}

async function updateDocument(id, updateValues,collectionName){
    const dbo = await getDB();
    await dbo.collection(collectionName).updateOne({_id:ObjectId(id)},updateValues)
}

async function getDocumentById(id, collectionName){
    const dbo = await getDB()
    const result = await dbo.collection(collectionName).findOne({_id:ObjectId(id)})
    return result;
}

async function getDocument(collectionName){
    const dbo = await getDB()
    const results = await dbo.collection(collectionName).find({}).toArray();
    return results;
}

async function getDocumentWithCondition(collectionName, limit, sort){
    const dbo = await getDB()
    const results = await dbo.collection(collectionName).find({}).sort({sort:1}).toArray();
    return results;
}

async function getDocumentSortByDate(collectionName){
    const dbo = await getDB()
    const results = await dbo.collection(collectionName).find({}).sort({date:-1}).toArray();
    return results;
}

async function getDocumentSortByDateByDepartment(collectionName, department){
    const dbo = await getDB()
    const results = await dbo.collection(collectionName).find({department: department}).sort({date:-1}).toArray();
    return results;
}

async function getDocumentSortByViews(collectionName){
    const dbo = await getDB()
    const results = await dbo.collection(collectionName).find({}).sort({views:-1}).toArray();
    return results;
}

async function getDocumentSortByViewsByDepartment(collectionName, department){
    const dbo = await getDB()
    const results = await dbo.collection(collectionName).find({department: department}).sort({date:-1}).toArray();
    return results;
}

async function getCommentByIdea(id, collectionName){
    const dbo = await getDB()
    const result = await dbo.collection(collectionName).find({ideaId:id}).toArray();
    return result;
}

async function getDocumentByAttribute(collectionName, attribute, condition){
    const dbo = await getDB()
    const result = await dbo.collection(collectionName).find({courseName:condition}).toArray();
    return result;
}

async function getDocumentForChart(collectionName, department, year){
    const dbo = await getDB();
    const result = await dbo.collection(collectionName).find({$and:[{department:department},{date: {$gte: new Date(year - 1, 12, 31), $lt: new Date(year + 1,1,1)}}]}).toArray();
    return result;
}

module.exports = { getDB, deleteObject, insertObject,updateDocument, getDocumentById, getDocument,
    getCommentByIdea, getDocumentWithCondition, getDocumentByAttribute, getDocumentForChart, getDocumentSortByDate, getDocumentSortByViews, getDocumentSortByDateByDepartment,
    getDocumentSortByViewsByDepartment}