import jwt from 'jsonwebtoken'
import { User } from '../models/userModel.js'

const getTokenFromRequest = (req) => {
    if (req.cookies && req.cookies.token) return req.cookies.token
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1]
    }
    return null
}

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req)
        if (!token) {
            return res.status(401).json({
                message: "Token not found"
            })
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        req.user = await User.findById(decoded.id)
        next()
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Invalid Token"
        })
    }
}