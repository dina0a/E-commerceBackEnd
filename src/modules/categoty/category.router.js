import { Router } from "express";
import { fileUpload } from "../../utils/multer.js";
import { cloudUpload } from "../../utils/multer.cloud.js";
import { isValid } from "../../middleware/validation.js";
import { addCategoryVal, updateCategoryVal } from "./category.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addCategory, createCategoryCloud, deleteCategory, getCategories, getSpecificCategory, updateCategory } from "./category.controller.js";
import { isAuthenticate, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";

const categoryRouter = Router()
// categoryRouter.use('/:categoryId',subcategoryRouter) merge params

// add category 
categoryRouter.post('/',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    fileUpload({ folder: 'category' }).single('image'),
    // isValid(addCategoryVal),
    asyncHandler(addCategory)
)

// add category cloud
categoryRouter.post('/cloud',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    cloudUpload().single('image'),
    asyncHandler(createCategoryCloud)
)

// update categoty
categoryRouter.put('/:categoryId',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    fileUpload({ folder: 'category' }).single('image'),
    isValid(updateCategoryVal),
    asyncHandler(updateCategory)
)
// get all categories
categoryRouter.get('/', asyncHandler(getCategories))

// getSpecificCategory
categoryRouter.get('/:categoryId', asyncHandler(getSpecificCategory))

// deleteCategory
categoryRouter.delete('/:categoryId',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    asyncHandler(deleteCategory))

// deleteCategoryCloud


export default categoryRouter