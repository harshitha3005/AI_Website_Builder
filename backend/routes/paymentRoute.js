import express from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated.js'
import { createOrder, verifyPayment } from '../controllers/paymentController.js'
import { createPaymentLink } from '../controllers/paymentController.js'



const router = express.Router()

router.post('/order', isAuthenticated, createOrder)
router.post('/verify', isAuthenticated, verifyPayment)
router.post('/link', isAuthenticated, createPaymentLink)


export default router