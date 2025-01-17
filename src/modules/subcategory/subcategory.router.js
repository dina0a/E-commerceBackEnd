// import modules
import { Router } from "express";
import { fileUpload } from "../../utils/multer.js";
import { isValid } from "../../middleware/validation.js";
import { addSubCategoryVal, updateSubCategoryVal } from "./subcategory.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addSubCategory, deleteSubCategory, getSubcategory, updateSubCategory } from "./subcategory.controller.js";
import { isAuthenticate, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";

const subcategoryRouter = Router()
// const subcategoryRouter = Router({ mergeParams: true })

// // add subcategory  todo authentcation & auth
subcategoryRouter.post('/',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    fileUpload({ folder: "subcategory" }).single("image"),
    isValid(addSubCategoryVal),
    asyncHandler(addSubCategory)
)

// getSubcategory
subcategoryRouter.get('/:categoryId',
    asyncHandler(getSubcategory)
)

// update subcategoty
subcategoryRouter.put('/:subcategoryId',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    fileUpload({ folder: "subcategory" }).single("image"),
    isValid(updateSubCategoryVal),
    asyncHandler(updateSubCategory)
)

// deleteSubCategory
subcategoryRouter.delete('/:subId', asyncHandler(deleteSubCategory))


export default subcategoryRouter
