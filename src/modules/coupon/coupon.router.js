import { Router } from "express";
import { isAuthenticate, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";
import { isValid } from "../../middleware/validation.js";
import { createCouponVal, updateCouponVal } from "./coupon.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { createCoupon, deleteCoupon, getCoupon, updateCoupon } from "./coupon.controller.js";
const couponRouter = Router()

// create coupon
couponRouter.post('/',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SUPER_ADMIN]),
    isValid(createCouponVal),
    asyncHandler(createCoupon)
)

// get coupon 
couponRouter.get('/get-coupon',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SUPER_ADMIN]),
    // todo is Active
    asyncHandler(getCoupon)
)

// get coupon 
couponRouter.put('/update-coupon/:couponId',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SUPER_ADMIN]),
    // todo is Active
    isValid(updateCouponVal),
    asyncHandler(updateCoupon)
)

// deleteCoupon 
couponRouter.delete('/delete-coupon/:couponId',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SUPER_ADMIN]),
    // todo is Active
    asyncHandler(deleteCoupon)
)
export default couponRouter