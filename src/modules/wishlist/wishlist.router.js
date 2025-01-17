import { Router } from "express";
import { isAuthenticate } from "../../middleware/authentication.js";
import { asyncHandler } from "../../utils/appError.js";
import { addToWishlist, deleteFromWishlist, getWishlist } from "./wishlist.controller.js";
const wishlistRouter = Router()

// add to wishlist
wishlistRouter.put('/',
    isAuthenticate(),
    asyncHandler(addToWishlist)
)

// delete from wishlist
wishlistRouter.put('/:productId',
    isAuthenticate(),
    asyncHandler(deleteFromWishlist)
)

// get wishList
wishlistRouter.get('/',
    isAuthenticate(),
    asyncHandler(getWishlist)
)

export default wishlistRouter