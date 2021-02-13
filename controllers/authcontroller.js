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


//Registration

exports.registerController = (req, res) => {
    const { name, email, password } = req.body
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
                expiresIn: "30m"
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
                message: `Confirmation Email sent to ${email}`
            })
        })
    }
}

//Activation and saving to database
exports.activationController = (req, res) => {
    const { token } = req.body
    if (token) {
        jwt.verify(token, process.env.JWT_ACTIVATOR, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    error: 'Expired Link, Signup again'
                })
            } else {
                const { name, email, password } = jwt.decode(token)
                const user = new User({
                    name,
                    email,
                    password
                })
                user.save((err, user) => {
                    if (err) {
                        return res.status(401).json({
                            error: errorHandler(err)
                        })
                    } else {
                        return res.status(200).json({
                            success: true,
                            message: "Successfully Registered",
                            user
                        })
                    }
                })
            }
        })
    } else {
        return res.json({
            message: 'can\'t complete request at the moment try again later'
        })
    }
}


//Login Controller
exports.loginController = (req, res) => {
    const { email, password } = req.body
    const errors = validationResult(req)


    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    } else {
        //If user doesn't not exist
        User.findOne({
            email
        }).exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: 'User with that email does not exist'
                })
            }

            //Authenticate user

            if (!user.authenticate(password)) {
                return res.status(400).json({
                    error: 'Email and password does not match'
                })
            }


            //Create Auth Token

            const token = jwt.sign(
                {
                    _id: user._id,
                }, process.env.JWT_SECRET,
                {
                    expiresIn: '7d'
                })
            const { _id, name, email, role } = user
            return res.json({
                token,
                user: {
                    _id,
                    name,
                    email,
                    role
                }
            })
        })
    }

}