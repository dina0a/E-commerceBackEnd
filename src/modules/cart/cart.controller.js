import { Cart, Product } from "../../../db/index.js"
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"

export const addToCart = async (req, res, next) => {
    // get data from req 
    const { productId, quantity } = req.body
    // check exist product
    const productExist = await Product.findById(productId)//.lean() // {},null
    if (!productExist) {
        return next(new AppError(messages.product.notFound, 404))
    }
    // check stock
    if (!productExist.inStock(quantity)) {
        return next(new AppError('out of stock', 400))
    }
    // check cart 
    const userCart = await Cart.findOneAndUpdate(
        {
            user: req.authUser._id, "products.productId": productId
        },
        {
            $set: { "products.$.quantity": quantity }
        },
        { new: true }
    )
    let data = userCart
    if (!userCart) {
        data = await Cart.findOneAndUpdate({ user: req.authUser._id },
            { $push: { products: { productId, quantity } } }, { new: true }
        )
    }
    return res.status(200).json({
        message: "product added to cart successfully",
        success: true,
        data
    })
}