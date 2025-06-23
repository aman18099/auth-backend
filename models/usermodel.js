const mongoose = require("mongoose")

const Schema = mongoose.Schema

const UserSchema = new Schema({
    name: {
        type:String,
        required:true,
    },
    username: {
        type:String,
        required:true,
        unique:true
    },
    password: {
        type:String,
        required:true,
        // minLength:8,
        // maxLength:12
    },
    refreshToken:{
        type:String
    },
    otp:{
        type:Number,
        max:6
    },
    emailVerified:{
        type:Boolean,
        default:false
    }
},
    {
        timestamps:true
    }
)

const User = mongoose.model('user' , UserSchema)
module.exports = User