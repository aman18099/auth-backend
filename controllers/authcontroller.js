const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const User = require('../models/usermodel');
const transporter = require('../utils/mailhandler');
exports.registerController = async(req,res,next) =>{
    const {username , name , email, password} = req.body
    try {
        if (!name || !username || !email || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }]});
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(409).json({ error: "Email already in use." });
            }
            if (existingUser.username === username) {
                return res.status(409).json({ error: "Username already taken." });
            }
        }

        const hashedPassword = await bcrypt.hash(password , 2)
        const user = new User({name, username,email,password:hashedPassword})

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.SECRET_KEY,
            { expiresIn: '7d' }
        );
        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("accesstoken" , token , {httpOnly:true , secure:true})
        res.cookie("refreshtoken" , refreshToken , {httpOnly:true , secure:true})

        let OTP = Math.floor(Math.random() * 1000000)
        try {
            const mailOptions = {
                from:process.env.SMTP_USER,
                to: 'yihobed937@ofacer.com',
                subject: 'Login Notification',
                html: `
                    <h1>Login Successful</h1>
                    <p>Hello ${user.name},</p>
                    <p>You logged in at ${new Date().toLocaleString()}.</p>
                    <p>Your OTP is ${OTP}</p>
                `
            };
            
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', {
                messageId: info.messageId,
                previewURL: nodemailer.getTestMessageUrl(info)
            });

            const savedUser = await user.save()
            savedUser.refreshToken = refreshToken
            savedUser.otp = OTP
            await savedUser.save()
            console.log(savedUser)
        } catch (error) {
            console.error('Email failed:', error);
            res.status(400).json({message : error})
        }

        return res.status(200).json({message: " User Register Successfully"})
    } catch (error) {
        console.log("error" , error)
        res.status(400).json({message : error})
    }

    
}

exports.loginController = async(req,res,next)=>{
    const {username, password} = req.body
    try {
        if(!username || !password){
            return res.status(401).json({message: "Fill all the inputs"})
        }

        const user = await User.findOne({username})
        if(!user){
            return res.json({message :"User doesnt Exists"})
        }

        const checkedpassword = await bcrypt.compare(password, user.password)
        if(!checkedpassword){
            res.status(401).json({message: "wrong credantials"})
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.SECRET_KEY,
            { expiresIn: '7d' }
        );
        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("accesstoken" , token , {httpOnly:true , secure:true})
        res.cookie("refreshtoken" , refreshToken , {httpOnly:true , secure:true})

        

        return res.status(201).json({message: "Login successful" , data:user})

    } catch (error) {
        return res.status(400).json({message:error})
    }
}

exports.refreshTokenController = async(req,res,next)=>{
    const refreshToken = req.cookies.refreshtoken

    try {
        if(!refreshToken){
            return res.status(401).json({message: "No refresh Token"})
        }

        console.log(refreshToken)

        const decodedtoken = jwt.verify(refreshToken , process.env.SECRET_KEY)

        const user = await User.findById(decodedtoken?.userId)
        console.log(user)

        if(!user){
            return res.status(401).json({message: "No user found"})
        }

        if(user?.refreshToken != refreshToken){
            return res.status(401).json({message: "Refresh Token doesnt match"})
        }

        const newAccessToken = jwt.sign({ userId: user._id, email: user.email },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }) 
        
        const newRefreshToken = jwt.sign({ userId: user._id, email: user.email },
            process.env.SECRET_KEY,
            { expiresIn: '7d' }) 

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("accesstoken" , newAccessToken , {httpOnly:true , secure:true})
        res.cookie("refreshtoken" , newRefreshToken , {httpOnly:true , secure:true})

        return res.status(200).json({ message: "Tokens refreshed successfully." });

    } catch (error) {
        return res.status(400).json({message:error})
    }
}

exports.verifyOTPController = async(req,res,next)=>{
    const {OTP} = req.body
    const token = req.cookies.accesstoken
    try {
        if (!OTP) {
            return res.status(400).json({ error: "field is  required." });
        }
        if (!token) {
            return res.status(401).json({ error: "No access token provided." });
        }
        const decodedtoken = jwt.verify(token , process.env.SECRET_KEY)
        const {userId} = decodedtoken
        const loggedInUser = await User.findById(userId) 

        if (!loggedInUser) {
            return res.status(404).json({ error: "User not found." });
        }
        
        if(loggedInUser.otp !== +OTP){
            console.log(loggedInUser.otp , OTP)
            return res.status(400).json({message: "Wrong OTP , try Again"})
        }
        return res.status(200).json({message: "OTP matched , user verified"})
    } catch (error) {
        return res.status(400).json({message:error})
    }
}