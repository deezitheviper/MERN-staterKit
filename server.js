const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const connectDB = require('./config/db')

app.use(express.json())

//config.env to config/config.env

require('dotenv').config({
    path: './config/config.env'
})


//Config for development
if (process.env.NODE_ENV === 'development') {
    app.use(cors({
        origin: process.env.CLIENT_URL
    }))
    app.use(morgan('dev')) //Morgan gives information about requests

}

//Connect DB
connectDB()

//Load all Routes
const authRouter = require('./routes/auth')


//use route
app.use('/api', authRouter);


app.use((req, res, next) => {
    res.status(404).send({
        success: false,
        message: 'Page not found'
    })
})
const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`App Listening on port ${PORT}`);
})