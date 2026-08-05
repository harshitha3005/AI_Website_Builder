import { User } from "../models/userModel.js"
import jwt from 'jsonwebtoken'

const isProduction = process.env.NODE_ENV === 'production'

export const googleAuth = async (req, res) => {
    try {
        const { name, email, avatar } = req.body
        let user = await User.findOne({ email })
        if (!user) {
            user = await User.create({ name, email, avatar })
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "7d" })
        res.cookie("token", token,
            {
                httpOnly: true,
                secure: isProduction,
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/'
            })

        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            credits: user.credits,
            plan: user.plan
        }

        return res.status(200).json({ user: userData, token })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const logoutUser = async (_, res) => {
    try {
         res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'none',
            path: '/'
         })
         return res.status(200).json({message:"User Logout Successfully"})
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getTokenFromRequest = (req) => {
    if (req.cookies && req.cookies.token) return req.cookies.token
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1]
    }
    return null
}

export const getCurrentUser = async (req, res) => {
    try {
        const token = getTokenFromRequest(req)
        if (!token) {
            return res.status(401).json({ message: "Token not found" })
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        const user = await User.findById(decoded.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            credits: user.credits,
            plan: user.plan
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Invalid Token" })
    }
}