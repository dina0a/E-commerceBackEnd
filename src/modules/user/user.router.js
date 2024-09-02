import { Router } from "express";
import { isAuthenticate, isAuthorized } from "../../middleware/authentication.js";
import { asyncHandler } from "../../utils/appError.js";
import { deleteUser, getUserProfile, logout, resetPassword, updateUser } from "./user.controller.js";
import { roles } from "../../utils/constant/enums.js";
import { cloudUpload } from "../../utils/multer.cloud.js";
import { isActive } from "../../middleware/isActive.js";
const userRouter = Router()

//update user
userRouter.put('/',
    isAuthenticate(),
    isAuthorized([roles.CUSTOMER]),
    cloudUpload().single('image'),
    isActive(),
    asyncHandler(updateUser)
)

// reset password
userRouter.put('/reset-password',
    isAuthenticate(),
    isActive(),
    asyncHandler(resetPassword)
)

// get user profile
userRouter.get('/profile',
    isAuthenticate(),
    isActive(),
    asyncHandler(getUserProfile)
)

//  delete user
userRouter.delete('/',
    isAuthenticate(),
    isAuthorized(roles.CUSTOMER),
    isActive(),
    asyncHandler(deleteUser)
)

// logout
userRouter.get('/logout',
    isAuthenticate(),
    isActive(),
    asyncHandler(logout)
)


export default userRouter