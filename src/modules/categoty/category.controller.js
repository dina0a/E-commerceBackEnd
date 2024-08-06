import slugify from "slugify"
import { Category } from "../../../db/models/category.model.js"
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"
import { deleteFile } from "../../utils/file-finctions.js"
// 1- medule built in
// 2- I downloaded it
// 3- I make it 

// add category 
export const addCategory = async (req, res, next) => {
    // get data from req 
    let { name } = req.body
    name = name.toLowerCase()
    // check file
    if (!req.file) {
        return next(new AppError(messages.file.required, 400))
    }
    // check existence
    const categoryExist = await Category.findOne() // {},null
    if (categoryExist) {
        return next(new AppError(messages.category.alreadyExist, 409))
    }
    // prepare data
    const slug = slugify(name, "-")
    const category = new Category({
        name,
        slug,
        image: { path: req.file.path }
    })
    // add to db 
    const createdCategory = await category.save() // {},null
    if (!createdCategory) {
        // todo rollback delete image
        return next(new AppError(messages.category.failToCreate, 500))
    }
    // send response
    return res.status(201).json({
        message: messages.category.createdSuccessfully,
        success: true,
        data: createdCategory
    })
}

// get categories
export const getCategories = async (req, res, next) => {
    const categories = await Category.find().populate([{ path: "subcategories" }])
    // const categories = await Category.aggregate([
    //     {
    //         $lookup: {
    //             from: "subcategories",
    //             localField: "_id",
    //             foreignField: "category",
    //             as: "suncategories"
    //         }
    //     }
    // ])
    // send response
    return res.status(200).json({
        success: true,
        data: categories
    })
}

// update category
export const updateCategory = async (req, res, next) => {
    // get data from req 
    const { name } = req.body
    const { categoryId } = req.params
    // check existence
    const categoryExist = await Category.findById(categoryId) // {},null
    if (!categoryExist) {
        return next(new AppError(messages.category.notFound, 404))
    }
    // check name existence
    const nameExist = await Category.findOne({ name, _id: { $ne: categoryId } }) // {},null understanIt
    if (nameExist) {
        return next(new AppError(messages.category.alreadyExist, 409))
    }
    // prepare data
    if (name) {
        categoryExist.slug = slugify(name)
    }
    // update image
    if (req.file) {
        deleteFile(categoryExist.image.path)
        categoryExist.image = { path: req.file.path }
    }
    // update to db
    const updatedCategory = await categoryExist.save()
    if (!updatedCategory) {
        return next(new AppError(messages.category.failToUpdate, 500))
    }
    // send response
    return res.status(201).json({
        message: messages.category.updatedSuccessfully,
        success: true,
        data: updatedCategory
    })
}  