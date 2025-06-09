const mongoose = require('mongoose')
const usermodel = require('../Models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { confirmMail, generateOTP } = require('../utilities/mailer')
const otpmodel = require('../Models/otp.model')
const cloudinary = require('../utilities/cloudinary')

const hashRound = 8
const dummypic = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXCvxaCmrRH7JgHSuhSvtER33sfmRdQRKc6A&s"

const getAllUsers = async(req, res) => {
    const allUsers = await usermodel.find()

    if (!allUsers){
        return res.status(403).json({message: "No user found", status: false})
    }
    return res.status(200).json({message: "Fetched all users", allUsers})
};


const registerNewUser = async (req, res) => {
    const {firstname, lastname, email, password} = req.body

    try {
        if (!firstname || !lastname || !email || !password) {
            return res.status(404).json({message: "All fields are required", status: false})
        }
        const newpassword =await bcrypt.hash(password, hashRound)
        const user = await usermodel.create({
            firstname,
            lastname,
            email,
            password:newpassword,
            loggedin: false,
            profilepic: dummypic,
        })
        if (!user) {
            return res.status(403).json({message: "User registeration failed", status: false})
        }
            
          console.log(user);
            
        return res.status(200).json({message: "Users successfully registered", status: true})
    } catch (error) {
        console.log(error);
        
    }

}

const signinUser = async(req, res) => {
    const {email, password} = req.body
    
    try {
        if (!email || !password) {
            return res.status(404).json({message: "Email and password are required", status:
                false})
                }
        const registereduser =await usermodel.findOne({email}) //works
        
        
        if (!registereduser) {
            return res.status(403).json({message: "User not found", status: false})
            }
            const isMatch = await bcrypt.compare(password, registereduser.password)
            
        if (!isMatch) {
            return res.status(405).json({message: "Invalid emsil or password", status: false})
            }
        const token = await jwt.sign({email}, process.env.JWTSECRET)
        const user = await usermodel.findOne({email})
        user.loggedin = true
        if (!user) {
            return res.status(406).json({message: "User not found", status: false})
            }
        return res.status(200).json({message: "User logged in successfully", status: true, token})
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "User logged in unsuccessful", status: false})
        
    }
}


const verifyUser = async(req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    
    try {
        if (!token) {
            return res.status(403).json({message: "No token provided", status: false})
            }
            
        const verifiedtoken = await jwt.verify(token, process.env.JWTSECRET)
        if (!verifiedtoken) {
            return res.status(403).json({message: "Invalid token", status: false})
            }
            const user = await usermodel.findOne({email: verifiedtoken.email})
            if (!user) {
                return res.status(403).json({message: "User not found", status: false})
                }
                return res.status(200).json({message: "User logged in successfully", status: true, user})
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: "Failed to verify user", status: false})
                }
        }         

const confirmEmail = async(req, res) => {
    try {
        const { email } = req.body;
    const user = await usermodel.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found", status: false });
        }
        const otp = generateOTP()
    const sendmail = await confirmMail(email, user.firstname, otp)
    if (!sendmail) {
        return res.status(500).json({ message: "Failed to send email", status: false
            });
            }
        await otpmodel.create({
            email,
            otp
        })
        console.log(req.body, otp);
        
        return res.status(200).json({ message: "Confirmation email sent", status: true,  });
    } catch (error) {
        return res.status(500).send({message:error.message, status:false})
    }//Entire function works
} 
    
const resetPassword = async(req, res) => {
    try {
        
     const { password, otp } = req.body;
     console.log(password, otp);
     
    const otpexist = await otpmodel.findOne({ otp: otp });
    console.log(otpexist);
    
    if (!otpexist) {
        return res.status(404).json({ message: "Invalid OTP", status: false });
        }   
        const hashedPassword = await bcrypt.hash(password, hashRound);
        const user = await usermodel.findOne({ email: otpexist.email });
        if (!user) {
            return res.status(405).json({ message: "User not found", status: false });
            }
            user.password = hashedPassword;
            await user.save();
            await otpmodel.deleteOne({ otp: otp });
            return res.status(200).json({ message: "Password reset successfully", status: true });
            } catch (error) {
                console.log(error.message);
                
                return res.status(500).send({message:error.message, status:false})        
    }
}

const uploadImage = async(req, res) => {
    
        try {
            const {profilepic, user: {email}} = req.body
            const profileImage = await cloudinary.uploader.upload(profilepic)
            if (!profileImage) {
                return res.status(404).json({message: "Image not uploaded", status: false})
            }
            const profileImageUrl = profileImage.secure_url
            const user = await usermodel.findOne({email})
            if (!user) {
                return res.status(404).json({message: "User not found", status: false})
            }
            user.profilepic = profileImageUrl
            await user.save()
            return res.status(200).json({message: "Image uploaded successfully", status: true, user})
            
        } catch (error) {
            console.log(error)
        }
}


const editUser = async(req, res) => {
    console.log(req.body);
    
    try {
        const { firstname, lastname, email, password, _id, profilepic } = req.body
        if (!firstname || !lastname || !email || !password || !_id || !profilepic) {
            return res.status(404).json({message: "All fields are required", status: false})
        }
        const user = await usermodel.findOne({email})
        if (!user) {
            return res.status(404).json({message: "User not found", status: false})
        }
        user.firstname = firstname
        user.lastname = lastname
        user.email = email
        await user.save()
        return res.status(200).json({message: "User updated successfully", status: true, user})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "User not updated", status: false})
    }
}


const logoutUser = async(req, res) => {
    const { email } = req.body;
    
    try {
        const user = await usermodel.findOneAndUpdate({ email }, {loggedin: false});
        if (!user) {
            return res.status(404).json({ message: "User not found", status: false });
            }
        return res.status(200).json({ message: "User logged out successfully", status: true });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "User not logged out", status: false });
        
    }
    
    
}


module.exports = { getAllUsers, registerNewUser, signinUser, verifyUser, confirmEmail, resetPassword, uploadImage, editUser, logoutUser }