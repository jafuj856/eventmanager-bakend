const nodemailer = require("nodemailer")
const path = require("path")
// const hbs = require("nodemailer-express-handlebars")
require('dotenv').config({ path: '/.env' })


module.exports = {
    sendOtpEmail: async (email) => new Promise(async (resolve, reject) => {
        const otpCode = Math.floor(100000 + Math.random() * 900000)
        const currentDate = new Date().toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS,
            }
        });
       
        const client = {
          from: process.env.NODEMAILER_USER,
          to: email,
          subject: "Email Verification",
          html: `<p>Your OTP code is: <strong>${otpCode}</strong></p>
                   <p>Sent on: ${currentDate}</p>`,
        };
        transporter.sendMail(client, (error, info) => {
            console.log(info);
            
            if (error) reject(error)
            resolve(otpCode)
        })
    })
}
