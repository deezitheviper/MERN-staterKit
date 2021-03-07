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
    loginController, forgetController, resetController, googleController, facebookController
} = require('../controllers/authcontroller.js')

router.post('/register', validateRegister, registerController)
router.post('/activate', activationController)
router.post('/login', validateLogin, loginController)
router.post('/passwords/forget', forgotPasswordValidator, forgetController)
router.put('/passwords/reset', resetController)
//Google login
router.post('/googlelogin', googleController)
//FB Login
router.post('/facebooklogin', facebookController)


module.exports = router