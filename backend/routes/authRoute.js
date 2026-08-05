import express from 'express'
import { googleAuth, logoutUser, getCurrentUser } from '../controllers/authController.js'

const router = express.Router()

router.post('/google', googleAuth)
router.get('/logout', logoutUser)
router.get('/me', getCurrentUser)

export default router