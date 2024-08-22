import { Cart, Product } from "../../../db/index.js"
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"

// addToCart
export const addToCart = async (req, res, next) => {
    // // get data from req 
    // const { productId, quantity } = req.body
    // // check exist product
    // const productExist = await Product.findById(productId)//.lean() // {},null
    // if (!productExist) {
    //     return next(new AppError(messages.product.notFound, 404))
    // }
    // // check stock
    // if (!productExist.inStock(quantity)) {
    //     return next(new AppError('out of stock', 400))
    // }
    // // check cart 
    // const userCart = await Cart.findOneAndUpdate(
    //     {
    //         user: req.authUser._id, "products.productId": productId
    //     },
    //     {
    //         $set: { "products.$.quantity": quantity }
    //     },
    //     { new: true }
    // )
    // let data = userCart
    // if (!userCart) {
    //     data = await Cart.findOneAndUpdate({ user: req.authUser._id },
    //         { $push: { products: { productId, quantity } } }, { new: true }
    //     )
    // }
    // return res.status(200).json({
    //     message: "product added to cart successfully",
    //     success: true,
    //     data:data
    // })
    // Get data from req
    const { productId, quantity } = req.body;
    // Check product exists
    const productExist = await Product.findById(productId);
    if (!productExist) {
        return next(new AppError(messages.product.notFound, 404));
    }
    // Check if in stock
    if (!productExist.inStock(quantity)) {
        return next(new AppError('Out of stock', 400));
    }

    // Find the user's cart
    let userCart = await Cart.findOne({ user: req.authUser._id });

    if (userCart) {
        const productInCart = userCart.products.find(p => p.productId.toString() === productId);
        if (productInCart) {
            productInCart.quantity = quantity;
        } else {
            userCart.products.push({ productId, quantity });
        }
        // Save the updated cart
        userCart = await userCart.save();
    } else {
        // If no cart exists, create a new one
        userCart = await Cart.create({
            user: req.authUser._id,
            products: [{ productId, quantity }]
        });
    }
    // Respond with success
    return res.status(200).json({
        message: "Product added to cart successfully",
        success: true,
        data: userCart
    });
}

// deleteFromCart
export const deleteFromCart = async (req, res, next) => {
    // get data from req
    const { productId } = req.params
    const productExist = await Product.findById(productId)
    if (!productExist) {
        return next(new AppError(messages.product.notFound, 404))
    }
    // Find and update the user's cart by removing the product
    const userCart = await Cart.findOneAndUpdate(
        { user: req.authUser._id },
        { $pull: { products: { productId } } },
        { new: true }
    );
    // Check if the cart exists and if the product was removed
    if (!userCart || !userCart.products.some(product => product.productId.toString() === productId)) {
        return next(new AppError("Product not found in cart", 404));
    }
    // Respond with success
    return res.status(200).json({
        message: "Product removed from cart successfully",
        success: true,
        data: userCart
    });
}

// getCart
export const getCart = async (req, res, next) => {
    const userId = req.authUser._id
    const userCart = await Cart.findOne({ user: userId })
    if (userCart.products?.length === 0) {
        return next(new AppError("cart is empty", 404))
    }
    // send response
    return res.status(200).json({
        success: true,
        data: userCart.products
    })
}