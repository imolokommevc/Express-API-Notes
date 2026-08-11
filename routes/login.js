const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const { getDatabase } = require("../database/db")
const router = express.Router()

router.use(express.json())
router.use(express.urlencoded({extended: true}))

router.post("/login", [
    body("email").notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Invalid email structure."),
    body("password").notEmpty().withMessage("Password is required.")
], async(req, res) => {
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array()
            })
        }
        const { email, password } = req.body
        const database = getDatabase()
        const userCollection = database.collection("Users")
        const user = await userCollection.findOne({ email })
        const role = user.role
        if(!user){
            return res.status(401).json({
                success: false,
                message: "Incorrect Email OR password."
            })
        }
        const matchedPassword = await bcrypt.compare(password, user.password)
        if(!matchedPassword){
            return res.status(401).json({
                success: false,
                message: "Incorrect Email OR password."
            })
        }
        const token = jwt.sign({
            userId: user._id.toString(),
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        })
        console.log("Token: " + token)
        return res.status(200).json({
            success: true,
            message: "Welcome, signed-in successfully.",
            user: {
                id: user._id, 
                name: user.name,
                surname: user.surname,
                email: user.email
            }
        })
        
    }catch(err){
        console.error("Login Error: ", err)

        return res.status(500).json({
            success: false,
            message: "Internal Server Error Occurred"
        })
    }
})

module.exports = router