import { Router } from "express";
import { isAuthenticate, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";
import { cloudUpload } from "../../utils/multer.cloud.js";
import { asyncHandler } from "../../utils/appError.js";
import { addUser, deleteUser, getUsers, updateUser } from "./admin.controller.js";
import { isActive } from "../../middleware/isActive.js";
import { isValid } from "../../middleware/validation.js";
import { addUserVal } from "./admin.validation.js";

const adminRouter = Router()

// add user
adminRouter.post('/add',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SUPER_ADMIN]),
    cloudUpload().single('image'),
    isActive(),
    isValid(addUserVal),
    asyncHandler(addUser)
)

// get users   
adminRouter.get('/get-users',
    isAuthenticate(),
    isAuthorized([roles.SUPER_ADMIN, roles.ADMIN]),
    isActive(),
    asyncHandler(getUsers)
)

// update users
adminRouter.put('/update-user/:userId',
    isAuthenticate(),
    isAuthorized([roles.SUPER_ADMIN, roles.ADMIN]),
    isActive(),
    asyncHandler(updateUser)
)

// delete users
adminRouter.delete('/delete-user/:userId',
    isAuthenticate(),
    isAuthorized([roles.SUPER_ADMIN, roles.ADMIN]),
    isActive(),
    asyncHandler(deleteUser)
)

export default adminRouter