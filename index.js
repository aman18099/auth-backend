const express = require("express")
const connectDB = require('./config/db')
const authRouter = require("./routes/authroute")
const cookieParser = require('cookie-parser');

require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser());
app.use('/api/auth' , authRouter)


connectDB().then(()=>{
    app.listen(PORT, () => {
        console.log('Server is running on http://localhost:9000');
    })
}).catch((e)=>{
    console.log("something went wrong")
})