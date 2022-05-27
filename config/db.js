const mongoose = require('mongoose')
const connectDB = async () => {
    const connection = await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }).catch(err => {
        console.log(err)
    })

    console.log(`mongoDB Connected: ${connection.connection.host}`)
}

module.exports = connectDB 