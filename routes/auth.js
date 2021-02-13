const express = require('express')
const router = express.Router()
//Validation
const {
    validateRegister,
    validateLogin,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../helpers/validator')

const { registerController,
    activationController,
    loginController
} = require('../controllers/authcontroller.js')

router.post('/register', validateRegister, registerController)
router.post('/activate', activationController)
router.post('/login', validateLogin, loginController)


module.exports = router