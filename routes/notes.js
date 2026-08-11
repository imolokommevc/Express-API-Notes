const express = require("express")
const { body, validationResult } = require("express-validator")
const { getDatabase } = require("../database/db")
const isAuthenticated = require("../middlewares/auth")
const helmet = require("helmet")
const router = express.Router()
const { ObjectId } = require("mongodb")

router.use(express.json())
router.use(express.urlencoded({extended: true}))
router.use(helmet()) //Default Settings

const { authorize } = require("../middlewares/authorize")

router.post("/createnote", isAuthenticated, authorize("admin","lecturer"), [
    body("title").notEmpty().withMessage("Title is required."),
    body("description").notEmpty().withMessage("Description is required.")
], async(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json(errors.array())
    }
    try{
        const note = {
            userId: req.user.userId,
            title: req.body.title,
            description: req.body.description,
            createdAt: new Date()
        }
        const database = getDatabase()
        const notesCollection = database.collection("Notes")
        const result = await notesCollection.insertOne(note)
        res.status(201).json({
            message: "Note created successfully.",
            noteId: result.insertedId
        })
    }catch(err){
        console.error(err)
        res.status(500).json({message: "Server Error!!!"})
    }
})

router.get("/viewnotes", isAuthenticated, authorize("admin","lecturer","student"), async(req, res) => {
    try{
        const db = getDatabase()
        const notesCollection = db.collection("Notes")
        const notes = await notesCollection
        .find({userId: req.user.userId})
        .sort({createdAt: -1}) //-1: descending, 1: ascending order
        .toArray()
    }catch(err){
        console.error(err)
        res.status(500).json({message: "Internal Server Error."})
    }
})

router.put("/updatenote/:id", isAuthenticated,authorize("admin","lecturer"), [
    body("title").notEmpty().withMessage("Title is required."),
    body("description").notEmpty().withMessage("Description is required.")
], async(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json(errors.array())
    }
    try{
        const db = getDatabase()
        const notesCollection = db.collection("Notes")
        const result = await notesCollection.updateOne({
            _id: new ObjectId(req.params.id),
            userId: req.user.userId
        }, {
            $set: {
                title: req.body.title,
                description: req.body.description,
                updatedAt: new Date()
            }
        })
        if(result.matchedCount === 0){
            return res.status(404).json({message: "Note not found."})
        }
        res.json({message: "Note updated successfully."})
    }catch(err){
        console.error(err)
        res.status(500).json({message: "Internal Server Error."})
    }
})
router.delete("/del/:id", isAuthenticated, authorize("admin"), 
async(req, res) => {
    try{
        const db = getDatabase()
        const notesCollection = db.collection("Notes")
        const result = await notesCollection.deleteOne({
            _id: new ObjectId(req.params.id),
            userId: req.user.userId
        })
        if(result.deleteCount === 0){
            return res.status(404).json({
                message: "Note not found."
            })
        }
        res.json({
            message: "Note deleted successfully."
        })
    }catch(err){
        console.error(err)
         res.status(500).json({message: "Internal Server Error."})
    }
})

module.exports = router