import nodemailer from "nodemailer";
require('dotenv').config()
const transport = nodemailer.createTransport({
  host: process.env.SMTP_ENDPOINT,
  port: 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});


export async function sendEmail(to: string, body: string) {
    await transport.sendMail({
        from: "jipanali1011@gmail.com",
        sender: "jipanali1011@gmail.com",
        to,
        subject: "Hello from Jipan Zapier",
        text: body,
        
    })
}



