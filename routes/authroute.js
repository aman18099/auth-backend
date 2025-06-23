const  express = require("express")
const { registerController, loginController } = require("../controllers/authcontroller")

const authRouter = express.Router()

authRouter.post("/signup" , registerController)

authRouter.post("/login" , loginController)

authRouter.post("/logout" ,(req,res) =>{

})

module.exports = authRouter