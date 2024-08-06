// import modules
import { Router } from "express";
import { fileUpload } from "../../utils/multer.js";
import { isValid } from "../../middleware/validation.js";
import { addSubCategoryVal } from "./subcategory.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addSubCategory, getSubcategory } from "./subcategory.controller.js";

const subcategoryRouter = Router()

// // add subcategory  todo authentcation & auth
subcategoryRouter.post('/',
    fileUpload({ folder: "subcategory" }).single("image"),
    isValid(addSubCategoryVal),
    asyncHandler(addSubCategory)
)

// getSubcategory
subcategoryRouter.get('/:categoryId',
    asyncHandler(getSubcategory)
)


export default subcategoryRouter
