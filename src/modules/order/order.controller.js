import { Cart, Coupon, Order, Product } from "../../../db/index.js"
import { AppError } from "../../utils/appError.js"
import { orderStatus } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"


// createOrder
export const createOrder = async (req, res, next) => {
    // get data from req 
    const { address, phone, coupon, payment } = req.body
    // chexk coupon 
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
        if (!productExist.inStock(product.quantity)) {
            return next(new AppError('out of stock'))
        }
        orderProducts.push({
            productId: productExist._id,
            title: productExist.title,
            itemPrice: productExist.finalPrice,
            quantity: product.quantity,
            finalPrice: product.quantity * productExist.finalPrice
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
    if (payment == 'visa') {

    }
    // send response
    // return res.status(201).json({
    //     success: true,
    //     message: messages.order.createdSuccessfully,
    //     orderCreated
    // })
}