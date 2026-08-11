//RBAC
/* Roles
admin, { Change Roles, CRUD notes }
lecturer, { Create, View Notes }
student { View notes }
*/
function authorize(...allowedRoles){
    return (req, res, next) => {
        if(!req.user){
            return res.status(401).json({
                message: "Authentication is Required."
            })
        }
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({message: "Access denied."})
        }
        next()
    }
}
const express = require("express")
const isAuthenticated = require("./auth")
const authRouter = express.Router()
const { getDatabase } = require("../database/db")
const { ObjectId } = require("mongodb")
authRouter.use(express.json())
authRouter.use(express.urlencoded({extended: true}))
authRouter.patch("/users/:id/role", isAuthenticated, authorize("admin"),
async(req, res) => {
    const db = getDatabase()
    const userCollection = db.collection("Users")
    const { role } = req.body
    const validRoles = [
        "admin", "lecturer", "student"
    ]
    if(!validRoles.includes(role)){
        return res.status(400).json({message: "Invalid Code"})
    }
    await userCollection.updateOne({
        _id: new ObjectId(req.params.id)
    }, {
        $set: {
            role
        }
    })
    res.json({
        message: "Role updated successfully."
    })
})

module.exports = { authorize, authRouter }