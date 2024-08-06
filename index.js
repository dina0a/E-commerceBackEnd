// import modules
import express from 'express'
import { connectDB } from './db/connection.js'
import categoryRouter from './src/modules/categoty/category.router.js'
import { globalErrorHandling } from './src/utils/appError.js'
import subcategoryRouter from './src/modules/subcategory/subcategory.router.js'

// create server 
const app = express()
const port = 3000

// connect to DB
connectDB()

//parse req
app.use(express.json())
app.use('/category', categoryRouter)
app.use('/subcategory', subcategoryRouter)

// global error
app.use(globalErrorHandling)

// listen on server
app.listen(port, () => {
    console.log("server is running on port...", port);
})
