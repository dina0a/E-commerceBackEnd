import path from 'path'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve('config/.env') })
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})
console.log('API_KEY:', process.env.API_KEY);
console.log('api:', process.env.API_SECRET);
export default cloudinary