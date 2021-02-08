const User = require('../models/authmodels')
const expressJwt = require('express-jwt')
const loadash = require('lodash')
const { OAuth2Client } = require('google-auth-library')
const axios = require('axios')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')

//custom error handler to get error from database
const { errorHandler } = require('../helpers/dbErrorHandling')

const nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
});

exports.registerController = (req, res) => {
    const { name, email, password } = req.body
    console.log(name, email)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    }
    else {
        User.findOne({
            email
        }).exec((err, user) => {
            if (user) {
                return res.status(400).json({
                    error: "Email already exist"
                })
            }
        })
        const token = jwt.sign({
            name,
            email,
            password
        },
            process.env.JWT_ACTIVATOR,
            {
                expiresIn: "15m"
            })
        const emailData = {
            to: email,
            subject: 'Email Confirmation Link',
            html: `
        <h1>Click on the Link below to activate</h1>
        <p>${process.env.CLIENT_URL}/user/activate/${token}</p>
        <hr/>
        <p>${process.env.CLIENT_URL}</p>
        `
        }
        transporter.sendMail(emailData, (err, info) => {
            if (err) {
                console.log(err)
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            return res.json({
                message: `Confirmation Email sent to ${email}, ${info.messageId}`
            })
        })
    }
}