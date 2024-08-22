import { Router } from "express";
import { isAuthenticate, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";
import { cloudUpload } from "../../utils/multer.cloud.js";
import { asyncHandler } from "../../utils/appError.js";
import { addUser, deleteUser, getUsers, updateUser } from "./admin.controller.js";

const adminRouter = Router()

// add user
adminRouter.post('/add',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SUPER_ADMIN]),
    cloudUpload().single('image'),
    // todo isValid()
    asyncHandler(addUser)
)

// get users   
adminRouter.get('/get-users',
    isAuthenticate(),
    isAuthorized([roles.SUPER_ADMIN, roles.ADMIN]),
    // todo isActive,
    asyncHandler(getUsers)
)

// update users
adminRouter.put('/update-user/:userId',
    isAuthenticate(),
    isAuthorized([roles.SUPER_ADMIN, roles.ADMIN]),
    // todo isActive,
    asyncHandler(updateUser)
)

// delete users
adminRouter.delete('/delete-user/:userId',
    isAuthenticate(),
    isAuthorized([roles.SUPER_ADMIN, roles.ADMIN]),
    // todo isActive,
    asyncHandler(deleteUser)
)

export default adminRouter