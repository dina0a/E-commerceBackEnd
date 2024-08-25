import { connectDB } from "../db/connection.js"
import * as allRouters from './index.js'
import { globalErrorHandling } from "./utils/appError.js"
import dotenv from 'dotenv'
import path from 'path'
export const initApp = (app, express) => {
    dotenv.config({ path: path.resolve('./config/.env') })
    const port = process.env.PORT || 3000

    // connect to DB
    connectDB()

    //parse req
    app.use(express.json())
    app.use('/uploads', express.static('uploads'))
    app.use('/category', allRouters.categoryRouter)
    app.use('/subcategory', allRouters.subcategoryRouter)
    app.use('/brand', allRouters.brandRouter)
    app.use('/product', allRouters.productRouter)
    app.use('/auth', allRouters.authRouter)
    app.use('/admin', allRouters.adminRouter)
    app.use('/wishlist', allRouters.wishlistRouter)
    app.use('/review', allRouters.reviewRouter)
    app.use('/coupon', allRouters.couponRouter)
    app.use('/cart', allRouters.cartRouter)
    app.use('/user', allRouters.userRouter)
    app.use('/order', allRouters.orderRouter)
    app.all('*', (req, res, next) => {
        return res.json({message:"invalid url"})
    })
    // global error
    app.use(globalErrorHandling)

    // listen on server
    app.listen(port, () => {
        console.log("server is running on port...", port);
    })

}