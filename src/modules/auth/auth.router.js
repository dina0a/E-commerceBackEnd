import { Router } from "express";
import { asyncHandler } from "../../utils/appError.js";
import { changePassword, forgetPassword, login, signup, verifyAccount } from "./auth.controller.js";
import { isValid } from "../../middleware/validation.js";
import { loginVal } from "./auth.validation.js";

const authRouter = Router()

// signup
authRouter.post('/signup' , asyncHandler(signup))
authRouter.get('/verify-account',asyncHandler(verifyAccount))
authRouter.post('/login',isValid(loginVal),asyncHandler(login))
authRouter.post('/forget-password',asyncHandler(forgetPassword))
authRouter.put('/change-password',asyncHandler(changePassword))

export default authRouter