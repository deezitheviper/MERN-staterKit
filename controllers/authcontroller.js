const User = require('../models/authmodels')
const expressJwt = require('express-jwt')
var _ = require('lodash');
const { OAuth2Client } = require('google-auth-library')
const axios = require('axios')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const {getToken} = require('./verifyToken')
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
                expiresIn: "60m"
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
                let { name, email, password } = decoded
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
                message: "Succesfully Logged In",
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

exports.forgetController = (req, res) => {
    const { email } = req.body;
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    } else {
        User.findOne({ email }, (err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: "User not found"
                }
                )
            }
            const token = jwt.sign({
                _id: user._id
            }, process.env.JWT_ACTIVATOR, {
                expiresIn: "10m"
            })
            //send mail
            const emailData = {
                to: email,
                subject: 'Password reset Link',
                html: `
<h1>Click on the Link below to reset password</h1>
<p>${process.env.CLIENT_URL}/password/reset/${token}</p>
<hr/>
<p>${process.env.CLIENT_URL}</p>
`
            }
            return User.updateOne({
                resetPasswordLink: token
            }, (err, success => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    })
                } else {
                    transporter.sendMail(emailData, (err, info) => {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            })
                        }
                        return res.json({
                            message: `Password reset link  sent to ${email}`
                        })
                    })
                }
            }))

        })
    }
}

exports.resetController = (req, res) => {
    const { newPassword, resetPasswordLink } = req.body


    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.json({
            error: firstError
        })
    } else {
        if (resetPasswordLink) {
            jwt.verify(resetPasswordLink, process.env.JWT_ACTIVATOR, (err, decoded) => {
                if (err) {
                    return res.status(400).json({
                        error: "Link Expired "
                    })
                }
                User.findOne({ resetPasswordLink }, (err, user) => {
                    if (err || !user) {

                        return res.status(400).json({
                            error: "Link Broken"
                        })
                    }
                    const updateFields = {
                        password: newPassword,
                        resetPasswordLink: "",
                        resetPassword: ""
                    }
                    user = _.extend(user, updateFields)
                    user.save((err, result) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Error Reseting password"
                            })
                        }
                        else {
                            return res.json({
                                message: "You can now login with the new password"
                            })
                        }
                    })
                })
            })
        }
    }
}


const client = new OAuth2Client(process.env.G_CLIENT)

exports.googleController = (req, res) => {
    const { idToken} = req.body
    const id_token = idToken.uc.id_token
    axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=`+id_token).then(response => {
        const { email, email_verified, name } = response.data
        //if email is verified
        if (email_verified) { 
 
            User.findOne({ email }).exec((err, user) => { 
                //if email exits
                if (user) {
                    const token = jwt.sign({ _id: user._id }, process.env.JWT_ACTIVATOR, {
                        expiresIn: '7d'
                    })
                    const { _id, role, email, name } = user
                    return res.json({
                        token,
                        user: { _id, name, email, role }
                    })
                } else {
                    //If user does not exit, save user to DB
                    let password = email + process.env.JWT_SECRET
                    user = new User({ email, name, password })
                    user.save((err, data) => {
                       
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            })
                        }

                        const token = jwt.sign({
                            _id: data._id
                        }, process.env.JWT_ACTIVATOR, { 
                            expiresIn: "7d"
                         })
                        const { name, _id, email, role } = data
                        return res.json({
                            token,
                            user: { _id, name, email, role }
                        })
                    })
                }
            })
        } else {
            return res.status(400).json({
                error: "Google login Failed"
            })
        }
    }).catch(err => {
        console.log(err)
    })
}


exports.facebookController = (req, res) => {
    const {userID, accessToken} = req.body
    const url = `https://graph.facebook.com/v2.12/${userID}?fields=id,name,email&access_token=${accessToken}`
    axios.get(url)
    .then(response => {
        const {email, name} = response.data
        User.findOne({email}).exec((err, user)=>{
            if(user){
                const token = jwt.sign({ _id: user._id }, process.env.JWT_ACTIVATOR, {
                    expiresIn: '7d'
                })
                const { _id, role, email, name } = user
                return res.json({
                    token,
                    user: { _id, name, email, role }
                })
            }else {
                //If user does not exit, save user to DB
                let password = email + process.env.JWT_SECRET
                user = new User({ email, name, password })
                user.save((err, data) => {
                   
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        })
                    }

                    const token = jwt.sign({
                        _id: data._id
                    }, process.env.JWT_ACTIVATOR, { 
                        expiresIn: "7d"
                     })
                    const { name, _id, email, role } = data
                    return res.json({
                        token,
                        user: { _id, name, email, role }
                    })
                })
            }
        })
    }).catch(err => {
        return res.json({error: "Faceook Login Failed"})
    })
}  