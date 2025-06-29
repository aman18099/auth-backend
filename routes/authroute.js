const  express = require("express")
const { registerController, loginController, verifyOTPController, refreshTokenController } = require("../controllers/authcontroller")

const authRouter = express.Router()

authRouter.post("/signup" , registerController)

authRouter.post("/login" , loginController)

authRouter.post("/verifyOTP" , verifyOTPController)

authRouter.post("/refreshtoken" , refreshTokenController)

authRouter.post("/logout" ,(req,res) =>{

})

module.exports = authRouter