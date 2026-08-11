require("dotenv").config()
const port = process.env.PORT
const https = require("https")
const fs = require("fs")
const path = require("path")
const { connectToDatabase } = require("./database/db")
connectToDatabase() //Establishes the connection.

//App from index.js import...
const app = require("./index.js")

const certPath = path.resolve(process.env.SSL_CERT_PATH)
const keyPath = path.resolve(process.env.SSL_KEY_PATH)

const sslOptions = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath)
}
https.createServer(sslOptions, app).listen(port, () => {
    console.log(`Server connected on Port ${port}`)
})