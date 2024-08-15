import { Router } from "express";
import { fileUpload } from "../../utils/multer.js";
import { cloudUpload } from "../../utils/multer.cloud.js";
import { isValid } from "../../middleware/validation.js";
import { addCategoryVal, updateCategoryVal } from "./category.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addCategory, createCategoryCloud, deleteCategory, getCategories, getSpecificCategory, updateCategory } from "./category.controller.js";

const categoryRouter = Router()
// categoryRouter.use('/:categoryId',subcategoryRouter) merge params

// add category  todo authentcation & auth
categoryRouter.post('/',
    fileUpload({ folder: 'category' }).single('image'),
    isValid(addCategoryVal),
    asyncHandler(addCategory)
)

// add category cloud
categoryRouter.post('/cloud',
    cloudUpload().single('image'),
    asyncHandler(createCategoryCloud)
)

// update categoty todo authentcation & auth
categoryRouter.put('/:categoryId',
    fileUpload({ folder: 'category' }).single('image'),
    isValid(updateCategoryVal),
    asyncHandler(updateCategory)
)
// get all categories
categoryRouter.get('/', asyncHandler(getCategories))

// getSpecificCategory
categoryRouter.get('/:categoryId', asyncHandler(getSpecificCategory))

// deleteCategory
categoryRouter.delete('/:categoryId', asyncHandler(deleteCategory))

// deleteCategoryCloud


export default categoryRouter