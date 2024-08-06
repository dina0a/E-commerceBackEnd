// import modules 
import mongoose from 'mongoose'

export const connectDB = () => {
    mongoose.connect('mongodb://127.0.0.1:27017/ecommerce').then(() => {
        console.log("db connected successfylly");
    }).catch((err) => {
        console.log("field connect to db");
    })
}

