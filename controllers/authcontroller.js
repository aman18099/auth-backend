const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const User = require('../models/usermodel')
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
        const data = new User({name, username,email,password:hashedPassword})
        const saveduser = await data.save()
        console.log(saveduser)

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