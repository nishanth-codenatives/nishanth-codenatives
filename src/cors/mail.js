const nodemailer = require("nodemailer");
const config = require('config');

let sendMail = (to, subject, html) => {
  return new Promise((resolve, reject) => {
    const mode = process.env.NODE_ENV || 'dev';

    let transporter = nodemailer.createTransport({
      host: config.get(`${mode}.email.host`),
      port: config.get(`${mode}.email.port`),
      secure: true,
      auth: {
        user: config.get(`${mode}.email.username`),
        pass: config.get(`${mode}.email.password`)
      }
    });
    
    let mailOptions = {
      from: `${mode}.email.username`,
      to: to,
      subject: subject,
      html: html,
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error" , error)
        reject(false);
      } else {
        resolve(true);
      }
    });
  })
};

module.exports = {
  sendMail
}