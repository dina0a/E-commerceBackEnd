import { Router } from "express";
import { isAuthenticate, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";
import { asyncHandler } from "../../utils/appError.js";
import { createOrder, deleteOrder, getOrder, updateOrder } from "./order.controller.js";
import { isActive } from "../../middleware/isActive.js";
const orderRouter = Router()

// create order
orderRouter.post('/',
    isAuthenticate(),
    isAuthorized([...Object.values(roles)]),
    isActive(),
    asyncHandler(createOrder)
)

// get order
orderRouter.get('/',
    isAuthenticate(),
    isActive(),
    asyncHandler(getOrder)
)

// delete order
orderRouter.delete('/:orderId',
    isAuthenticate(),
    isAuthorized([...Object.values(roles)]),
    isActive(),
    asyncHandler(deleteOrder)
)

// update order
orderRouter.put('/update-order/:orderId',
    isAuthenticate(),
    isAuthorized(Object.values(roles)),
    isActive(),
    asyncHandler(updateOrder)
)

export default orderRouter