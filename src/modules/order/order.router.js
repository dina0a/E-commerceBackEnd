import { Router } from "express";
import { isAuthenticate, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";
import { asyncHandler } from "../../utils/appError.js";
import { createOrder } from "./order.controller.js";
const orderRouter = Router()

// create order
orderRouter.post('/',
    isAuthenticate(),
    isAuthorized(Object.values(roles)),
    asyncHandler(createOrder)
)
export default orderRouter