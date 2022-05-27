"use strict"

/*
Get Unique error field name
*/

const uniqueMessage = error => {
    let output;
    try {
        let fieldName = error.message.split("$")[1]
        field = field.split('dub key')[0]
        field = field.substring(0, field.lastIndexOf(" "))
        require.flash("errors", [{
            message: "User with this " + field + "already exists"
        }])
        output = fieldName.charAt(0).toUppercase() + fieldName.slice(1) + "already exits"
    } catch (err) {
        output = "already exits"
    }
    return output
}


//Error message from error object

exports.errorHandler = error => {
    let message = ""
    if (error.code) {
        switch (error.code) {
            case 11000:
            case 11001:
                message = uniqueMessage(error)
                break;
            default:
                message = "Something went wrong"
        }
    } else {
        for (let errorName in error.errors) {
            if (error.errors[errorName].message) {
                message = error.errors[errorName].message
            }
        }
    }
    return message
}