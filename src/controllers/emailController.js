import nodemailer from "nodemailer";

export default {
  async sendEmail(req, res, next) {
    const userEmail = req.body.email;
    const msg = req.body.msg;
    let subject = req.body.subject;

    if (!userEmail) {
      return res.status(400).send({
        error: "Missing parameter: userEmail!"
      });
    } 
    else if (!msg) {
      return res.status(400).send({
        error: "Missing parameter: msg!"
      });
    }

    if (!subject) 
        subject = `User ${userEmail}`;

    try {
      createEmail(userEmail, subject, msg);

      return res.status(200).send({
        msg: "Email was sent successfull!"
      });
    } 
    catch (err) {
      return res.status(500).send({
        error: err
      });
    }
  }
}


let createEmail = (userEmail, subject, msg) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `${userEmail}`,
    to: "FilarKamil04@gmail.com",
    subject: subject,
    text: msg,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) 
      console.log(error);
    
    transporter.close();
  })
}
