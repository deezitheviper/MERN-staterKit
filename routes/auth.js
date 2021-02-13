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
    activationController
} = require('../controllers/authcontroller.js')

router.post('/register', validateRegister, registerController)
router.post('/activate', validateLogin, activationController)


module.exports = router