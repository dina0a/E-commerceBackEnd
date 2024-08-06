import slugify from "slugify"
import { Category } from "../../../db/models/category.model.js"
import { SubCategory } from "../../../db/models/subcategory.model.js"
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"

// add subcategory 
export const addSubCategory = async (req, res, next) => {
    let { name, category } = req.body
    name = name.toLowerCase()
    // check file
    if (!req.file) {
        return next(new AppError(messages.file.required, 400))
    }
    // check existence
    const categoryExist = await Category.findById(category) // {},null
    if (!categoryExist) {
        return next(new AppError(messages.category.notFound, 404))
    }
    // check name existence
    const nameExist = await SubCategory.findOne({ name, category }) // {},null
    if (nameExist) {
        return next(new AppError(messages.subCategory.alreadyExist, 409))
    }
    // prepare data
    const slug = slugify(name)
    const subCategory = new SubCategory({
        name,
        slug,
        category,
        image: { path: req.file.path }
    })
    // add to db 
    const subcategoryCreated = await subCategory.save()
    if (!subcategoryCreated) {
        return next(new AppError(messages.subCategory.failToCreate, 500))
    }
    // send response
    return res.status(201).json({
        message: messages.subCategory.createdSuccessfully,
        success: true,
        data: subcategoryCreated
    })

}

// getSubcategory
export const getSubcategory = async (req, res, next) => {
    const { categoryId } = req.params
    const subcategories = await SubCategory.find({ category: categoryId }).populate([{ path: "category" }]) // [{}], []
    if (subcategories.length == 0) {
        return next(new AppError(messages.subCategory.notFound, 404))
    }
    // send response
    return res.status(201).json({
        success: true,
        data: subcategories
    })
}