import express from 'express'
import { getRazorpayKey } from '../controllers/configController.js'

const router = express.Router()

router.get('/razorpay', getRazorpayKey)

export default router
