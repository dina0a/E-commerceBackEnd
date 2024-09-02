// import modules 
import mongoose from 'mongoose'

export const connectDB = () => {
    mongoose.connect(process.env.DB_URL).then(() => {
        console.log("db connected successfully");
    }).catch((err) => {
        console.log("faild connect to db");
    })
}

