import Stripe from "stripe"
import { connectDB } from "../db/connection.js"
import { Cart, Order, Product } from "../db/index.js"
import * as allRouters from './index.js'
import { asyncHandler, globalErrorHandling } from "./utils/appError.js"
import dotenv from 'dotenv'
import path from 'path'
export const initApp = (app, express) => {
    dotenv.config({ path: path.resolve('./config/.env') })
    const port = process.env.PORT || 3000
    // connect to DB
    connectDB()
    app.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
        const sig = req.headers['stripe-signature'].toString();
        const stripe = new Stripe('sk_test_51PrhZFLfxbRKaWmBzpEnKDQWxA4353S2nZvnAC3ekzGYyjz3fBVvH6aOiwm0e8BNHDs557b7QNfxG5thrZl2grkh00fguyHshg')
        let event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_PRL0tzLtOd6BCkWw8KEwB1XPu78f3Qn8');
        if (event.type == 'checkout.session.completed') {
            const checkout = event.data.object;
            const orderId = checkout.metaData.orderId
            const orderExist = await Order.findByIdAndUpdate(orderId, { status: 'placed' }, { new: true })
            await Cart.findByIdAndUpdate({ user: orderExist.user }, { products: [] }, { new: true })
            for (const product of orderExist.products) {
                await Product.findByIdAndUpdate(product.productId, { $inc: { stock: -product.quantity } })
            }
            // clear cart 
            // update order status palced
        }
        // Return a 200 response to acknowledge receipt of the event
        res.sendStatus(200);
    }));
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
        return res.json({ message: "invalid url" })
    })
    // global error
    app.use(globalErrorHandling)

    // listen on server
    app.listen(port, () => {
        console.log("server is running on port...", port);
    })

}