const nodemailer = require("nodemailer")
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host:"smtp.ethereal.email",
    port:587,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS
    }
})

module.exports = transporter;   