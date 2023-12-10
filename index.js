import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import { routerUser } from './routes/user.route.js'


dotenv.config()
const app = express()
app.use(express.json())
app.use(cors())
app.use('/api/v1', routerUser)


const db = async () => {
    await mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('Connected to DB')
        })
        .catch((err) => {
            console.log(err)
        })
}

db();
const port = process.env.PORT;

app.get('/test', (req, res)=> {
    return res.send('hi from test');
})

app.listen(port, () => {
    console.log(`Server start at port ${port}`)
})