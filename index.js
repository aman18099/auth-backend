const express = require("express")
const connectDB = require('./config/db')
const authRouter = require("./routes/authroute")
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())

app.use('/api/auth' , authRouter)


connectDB().then(()=>{
    app.listen(PORT, () => {
        console.log('Server is running on http://localhost:9000');
    })
}).catch((e)=>{
    console.log("something went wrong")
})