const jwt = require("jsonwebtoken")

function isAuthenticated(req, res, next){
    const authHeader = req.headers.authorization
    if(!authHeader){
        return res.status(401).json({
            success: false,
            message: "Access denied, Can't find token."
        })
    }
    const token = authHeader.split(" ")[1]

    if(!token){
        return res.status(401).json({
            success: false,
            message: "Access denied, Invalid Token."
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    }catch(err){
        return res.status(403).json({
            success: false,
            message: "Invalid or Expired Token."
        })
    }
}
module.exports = isAuthenticated