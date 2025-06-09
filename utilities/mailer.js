const nodemailer = require('nodemailer')

const generateOTP = () => {
    let otp = '';
    for (let i = 0; i < 6; i++) {
      otp += Math.floor(Math.random() * 10); // generates a digit from 0-9
    }
    return otp;
  }

const confirmMail = async(email, firstname, otp) => {

      
    const message = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Reset</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f5f7fa;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #2a9d8f;
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #e76f51;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin-top: 20px;
    }
    .footer {
      background-color: #f1f1f1;
      padding: 20px;
      font-size: 12px;
      text-align: center;
      color: #888888;
    }
    @media (max-width: 600px) {
      .container {
        margin: 15px;
      }
      .content {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      Reset Your Password
    </div>
    <div class="content">
      <p>Hello ${firstname},</p>
      <p>You recently requested to reset your password. Click the button below to proceed:</p>
      <a href="http://localhost:5173/user/resetpassword/${otp}" class="button">Reset Password</a>
      <p>If you didn’t request this, please ignore this email. This link will expire in 30 minutes.</p>
      <p>Thanks,<br>Glammx</p>
    </div>
    <div class="footer">
      &copy; 2025 Your Company. All rights reserved.
    </div>
  </div>
</body>
</html>
`

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN_EMAIL,
            pass: process.env.ADMIN_PASSWORD,
            }
        })
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: email,
            subject: 'Email confirmation',
            html: message
        }
        try {
            const sentmail = await transporter.sendMail(mailOptions);
            if (sentmail) {
                console.log('email sent successfully');
                return true
            }
        } catch (error) {
            console.log("error sending mail");
            return false
            
        }
    }






    module.exports ={ confirmMail, generateOTP };