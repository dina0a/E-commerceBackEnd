import { Router } from "express";
import { isAuthenticate } from "../../middleware/authentication.js";
import { asyncHandler } from "../../utils/appError.js";
import { resetPassword } from "./user.controller.js";
const userRouter = Router()

// reset password
userRouter.put('/reset-password',
    isAuthenticate(),
    asyncHandler(resetPassword)
)
export default userRouter