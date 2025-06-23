const User = require('../models/usermodel')

exports.registercontroller = async(req,res,next) =>{
    const {username , name , email, password} = req.body
    try {
        if (!name || !username || !email || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const duplicateUser = await User.findOne({$or: [{ email }, { username }] })
        if(duplicateUser.email === email || duplicateUser.username === username ){
            return res.status(409).json({message : "user already exists"})
        }

        // const hashedPassword
        const data = new User({name, username,email,password})
        const saveduser = await data.save()
        console.log(saveduser)

        return res.status(200).json({message: " User Register Successfully"})
    } catch (error) {
        console.log("error" , error)
        res.status(400).json({message : error})
    }

    
}