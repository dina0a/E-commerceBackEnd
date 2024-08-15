import { Router } from "express";
import { isAuthenticate, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";
import { cloudUpload } from "../../utils/multer.cloud.js";
import { isValid } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addUser } from "./admin.controller.js";

const adminRouter = Router()

// add user
adminRouter.post('/add',
    isAuthenticate(),
    isAuthorized([roles.ADMIN]),
    cloudUpload().single('image'),
    // todo isValid()
    asyncHandler(addUser)
)

export default adminRouter