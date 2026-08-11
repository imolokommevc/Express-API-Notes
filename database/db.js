const { MongoClient } = require("mongodb")
let client 
let database

async function connectToDatabase(){
    if(database){
        return database
    }
    const connString = process.env.MONGODB_URI
    const databaseName = process.env.DB_NAME
    client = new MongoClient(connString)
    await client.connect() //Establishes the DB connection
    database = client.db(databaseName) //Maintains that DB connection
    console.log(`Connected to MongoDB Successfully on ${databaseName}`)
}
//Check if we connected to the DB.
function getDatabase(){
    if(!database){
        throw new Error(
            "Connection Failed."
        )
    }
    return database //Returns that maintained connection from CTDB()
}

module.exports = { connectToDatabase, getDatabase }