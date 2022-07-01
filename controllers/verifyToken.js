const axios = require('axios')
exports.getToken = token => {
    axios.get(process.env.GOOGLE_VALIDATION_URL+token)
}

