import { Router } from "express";
import { isAuthenticate } from "../../middleware/authentication.js";
import { asyncHandler } from "../../utils/appError.js";
import { addToCart, deleteFromCart, getCart } from "./cart.controller.js";
import { isActive } from "../../middleware/isActive.js";

const cartRouter = Router()

// add to cart
cartRouter.post('/',
    isAuthenticate(),
    isActive(),
    asyncHandler(addToCart)
)

// delete from cart
cartRouter.delete('/delete-product/:productId',
    isAuthenticate(),
    isActive(),
    asyncHandler(deleteFromCart)
)

cartRouter.get('/getCart',
    isAuthenticate(),
    isActive(),
    asyncHandler(getCart)
)

export default cartRouter