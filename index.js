const express = require("express");
const app = express()
require("dotenv").config() //creates config: [Function: config] -> process.env

const { body, validationResult } = require("express-validator") //Object destructuring for body & validation results

const router = require("./routes/registration")
const loginRouter = require("./routes/login")
app.use(router)
app.use(loginRouter)

const helmet = require("helmet")
const isAuthenticated = require("./middlewares/auth")
const { authRouter } = require("./middlewares/authorize")
app.use(authRouter)

//JSON Body-parser
app.use(express.json())
app.use(helmet())

app.post("/contacts", [
    body("phonenumber").notEmpty()
    .withMessage("Phone number is required.")
    .matches(/^\+27\d{9}$/)
    .withMessage("Phone number should start with +27 & 9"),

    body("email").notEmpty() 
    .withMessage("Email is required...")
    .isEmail().withMessage("Ensure the email is correctly formated...")
], (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({
            success: false,
            errors: errors.array()
        })
    }
    const { phonenumber, email } = req.body
    return res.status(200).json({
        success: true,
        message: "Phone number and email validated.",
        data: {
            phonenumber, email
        }
    })
})

//Username validation with IF statement..
app.post("/test1", (req, res) => {
    const uname = req.body.username
    if(uname.length>6){
        res.status(400).send("Invalid Username, Only 6 Characters allowed.")
        console.log("Invalid Username, Only 6 Characters allowed.")
    }
})


//Specify a route
app.get("/", isAuthenticated, (_, res) => {
    res.send("This is so much FUN!💁🏽‍♂️");
})

app.get("/welcome", (req, res) => {
    res.status(200).send({message: "Welcome to INSY7314🫡"})
})
const notesRouter = require("./routes/notes")
app.use(notesRouter)

module.exports = app