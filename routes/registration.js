const express = require("express")
const bcrypt = require("bcrypt")
const { body, validationResult } = require("express-validator")
const { getDatabase } = require("../database/db")

const router = express.Router()
router.use(express.json())
router.use(express.urlencoded({extended: true}))

router.post("/register", [
    //Input validation whitelisting...
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("surname").notEmpty().withMessage("Surname is required."),
    body("email").notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Email format incorrect"),
    body("password").notEmpty().withMessage("Password is required.")
    .isLength({min: 8}).withMessage("Password must contain at least 8 characters.")
    .matches(/[A-Z]/).withMessage("Password must contain at least uppercase")
    .matches(/[0-9]/).withMessage("Password must contain at least a digit.")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain at least a special character.")
], async(req, res) => {
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array()
            })
        }
        const { name, surname, email, password } = req.body
        let role 
        const database = getDatabase()
        const userCollection = database.collection("Users")
        const existingUser = await userCollection.findOne({email})
        if(existingUser){
            return res.status(409).json({
                success: false,
                message: "Email address already exist. Try a different one."
            })
        }
        //Password hashing -> Password + salt => hashedPassword.
        //Abc123% + skdbvjbvuhiuiJBbvkjbkhJBKjk = jdbvkjrvre854er(vnjre=vjhkn#jknKd34L1
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = {
            name, surname, email, password: hashedPassword, role: "student"
        }
        const result = await userCollection.insertOne(newUser)
        return res.status(201).json({
            sucess: true,
            message: "User added successfully",
            user: {
                id: result.insertedId,
                name, surname, email, role
            }
        })
    }catch(error){
        console.error("Registration Error: " , error)
        return res.status(500).json({
            success: false,
            message: "Internal Server error occurred..."
        })
    }
})

module.exports = router