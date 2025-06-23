const  express = require("express")
const { registercontroller } = require("../controllers/authcontroller")

const authRouter = express.Router()

authRouter.post("/signup" , registercontroller)

authRouter.post("/login" , (req,res)=>{

})

authRouter.post("/logout" ,(req,res) =>{

})

module.exports = authRouter