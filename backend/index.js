import express from 'express'
import 'dotenv/config'
import connectDB from './database/db.js'
import authRoute from './routes/authRoute.js'
import websiteRoute from './routes/websiteRoute.js'
import paymentRoute from './routes/paymentRoute.js'
import configRoute from './routes/configRoute.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3000
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173'
].filter(Boolean)

//middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))


app.use('/api/auth', authRoute)
app.use('/api/website', websiteRoute)
app.use('/api/payment', paymentRoute)
app.use('/api/config', configRoute)


app.listen(PORT, ()=>{
    connectDB()
    console.log(`Server is listening at port : ${PORT}` )
})