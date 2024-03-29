const mongoose = require('mongoose')
const crypto = require('crypto')


//User Schema

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    hashed_password: {
        type: String,
        required: true
    },
    salt: String,
    role: {
        type: String,
        default: 'Normal'
    },
    resetPasswordLink: {
        data: String,
        default: ""
    }
}, { timestamp: true })


//Virtual Password
userSchema.virtual('password')
    .set(function (password) {
        this.salt = this.makeSalt()
        this.hashed_password = this.encryptPassword(password)
    })
    .get(function () {
        return this._password
    })


//methods
userSchema.methods = {
    makeSalt: function () {
        return Math.round(new Date().valueOf() * Math.random()) + ""
    },

    //Encrypt Pass
    encryptPassword: function (password) {
        if (!password) return ""
        try {
            return crypto
                .createHmac('Sha1', this.salt)
                .update(password)
                .digest('hex')

        } catch (err) {
            return ""
        }
    },
    //Compare the plain password from user and hashed password
    authenticate: function (plainPassword) {
        return this.encryptPassword(plainPassword) === this.hashed_password

    }
}

module.exports = mongoose.model('User', userSchema)