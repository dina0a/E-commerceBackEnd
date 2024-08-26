import Stripe from "stripe"
import { Cart, Coupon, Order, Product } from "../../../db/index.js"
import { AppError } from "../../utils/appError.js"
import { orderStatus } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"


// createOrder
export const createOrder = async (req, res, next) => {
    // get data from req 
    const { address, phone, coupon, payment } = req.body
    // check coupon 
    const couponExist = await Coupon.findOne({ couponCode: coupon })
    if (!couponExist) {
        return next(new AppError(messages.coupon.notFound, 404))
    }
    if (couponExist.fromDate > Date.now() || couponExist.toDate < Date.now()) {
        return next(new AppError('invalid coupon', 404))
    }
    // chexk cart 
    const cart = await Cart.findOne({ user: req.authUser._id }).populate('products._id')
    const products = cart.products
    if (products.length <= 0) {
        return next(new AppError('cart empty', 400))
    }
    // check products
    let orderProducts = []
    let orderPrice = 0
    for (const product of products) {
        const productExist = await Product.findById(product.productId)
        if (!productExist) {
            return next(new AppError(messages.product.notFound, 404))
        }
        if (product.quantity > productExist.stock) {
            if (productExist.stock === 0) {
                return next(new AppError(`Product ${productExist.title} is out of stock`, 400))
            } else {
                return next(new AppError(`Only ${productExist.stock} units of ${productExist.title} are in stock`, 400))
            }
        }
        // // Decrease the quantity in stock
        // productExist.stock -= product.quantity;
        await productExist.save();
        orderProducts.push({
            productId: productExist._id,
            title: productExist.title,
            itemPrice: productExist.finalPrice,
            quantity: product.quantity,
            finalPrice: product.quantity * productExist.finalPrice,
            name: productExist.title
        })
        orderPrice += product.quantity * productExist.finalPrice
    }
    const order = new Order({
        user: req.authUser._id,
        products: orderProducts,
        address,
        phone,
        coupon: {
            couponId: couponExist?._id,
            code: couponExist?.couponCode,
            discount: couponExist?.couponAmount
        },
        status: orderStatus.PLACED,
        payment,
        orderPrice,
        finalPrice: orderPrice - (orderPrice * ((couponExist.couponAmount || 0) / 100))
    })
    // save to db
    const orderCreated = await order.save()
    if (!orderCreated) {
        return next(new AppError(messages.order.failToCreate))
    }
    // integrate payment gatway
    if (payment == 'visa') {
        const stripe = new Stripe('sk_test_51PrhZFLfxbRKaWmBzpEnKDQWxA4353S2nZvnAC3ekzGYyjz3fBVvH6aOiwm0e8BNHDs557b7QNfxG5thrZl2grkh00fguyHshg')
        const checkout = await stripe.checkout.sessions.create({
            success_url: "https://www.google.com",
            cancel_url: "https://www.facebook.com",
            payment_method_types: ['card'],
            mode: "payment",
            metadata: {
                orderId: orderCreated._id.toString()
            },
            line_items: orderCreated.products.map((product) => {
                return {
                    price_data: {
                        currency: 'egp',
                        product_data: {
                            name: product.title
                        },
                        unit_amount: product.itemPrice * 100
                    },
                    quantity: product.quantity
                }
            })
        })
        // send response
        return res.status(200).json({
            success: true,
            message: messages.order.createdSuccessfully,
            orderCreated,
            url: checkout.url
        })
    }
    // send response
    return res.status(200).json({
        success: true,
        message: messages.order.createdSuccessfully,
        orderCreated
    })
}

// getOrder
export const getOrder = async (req, res, next) => {
    const orders = await Order.find({ user: req.authUser._id })
    if (orders.length === 0) {
        return next(new AppError('no orders', 404))
    }
    // send response
    return res.status(201).json({
        success: true,
        orders
    })
}

// delete order
export const deleteOrder = async (req, res, next) => {
    // get data from req 
    const { orderId } = req.params
    const order = await Order.findById(orderId)
    if (!order) {
        return next(new AppError(messages.order.notFound, 404))
    }
    if (order.user.toString() !== req.authUser._id.toString()) {
        return next(new AppError('Unauthorized access to this order', 403));
    }
    await order.deleteOne()
    // send response
    return res.status(201).json({
        message: messages.order.deletedSuccessfully,
        success: true
    })
}

// todo update order