import slugify from "slugify"
import { Category } from "../../../db/models/category.model.js"
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"
import { deleteFile } from "../../utils/file-finctions.js"
import { SubCategory } from "../../../db/models/subcategory.model.js"
import { Product } from "../../../db/models/product.model.js"
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
    const categoryExist = await Category.findOne({ name }) // {},null
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

// getSpecificCategory
export const getSpecificCategory = async (req, res, next) => {
    // get data from req
    const { categoryId } = req.params
    const category = await Category.findById(categoryId).populate([{ path: "subcategories" }])
    category ?
        res.status(200).json({
            success: true,
            data: category
        }) : next(new AppError(messages.category.notFound, 404))
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
        categoryExist.name = name
        categoryExist.slug = slugify(name)
    }
    // update image
    if (req.file) {
        // delete old image
        deleteFile(categoryExist.image.path)
        // update with new image
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

// deleteCategory
// export const deleteCategory = async (req, res, next) => {
//     // get data from req
//     const { categoryId } = req.params
//     // check existence
//     const categoryExist = await Category.findByIdAndDelete(categoryId) // {},null
//     if (categoryExist) {
//         deleteFile(categoryExist.image.path)
//     }
//     if (!categoryExist) {
//         return next(new AppError(messages.category.notFound, 404))
//     }
//     // find and delete related subcategories
//     const subcategories = await SubCategory.find({ category: categoryId });

//     //  // delete subcategory image files if they exist
//     if (subcategories.length != 0) {
//         subcategories.forEach(subcategory => {
//             if (subcategory.image && subcategory.image.path) {
//                 deleteFile(subcategory.image.path)
//             }
//         });
//     }
//     // delete subcategory
//     await SubCategory.deleteMany({ category: categoryId });

//     // send response
//     return res.status(200).json({
//         message: messages.category.deletedSuccessfully,
//         success: true
//     })
// }

// deleteCategory
export const deleteCategory = async (req, res, next) => {
    // get data from req
    const { categoryId } = req.params
    // check existence
    const categoryExist = await Category.findByIdAndDelete(categoryId) // {},null
    if (!categoryExist) {
        return next(new AppError(messages.category.notFound, 404))
    }

    // prepare ids
    const subcategories = await SubCategory.find({ category: categoryId }).select('image')
    const products = await Product.find({ category: categoryId }).select('mainImage subImages')
    const subcategoryIds = subcategories.map(sub => sub._id)
    const productIds = products.map(pro => pro._id)

    // delete subcategories
    await SubCategory.deleteMany({ _id: { $in: subcategoryIds } })
    await Product.deleteMany({ _id: { $in: productIds } })

    // delete images
    const imagePaths = subcategories.map(sub => sub.image)
    for (let i = 0; i < products.length; i++) {
        imagePaths.push(products[i].mainImage)
        imagePaths.push(...products[i].subImages)
    }
    for (let i = 0; i < imagePaths.length; i++) {
         deleteFile(imagePaths[i])
    }
    // // send response
    return res.status(200).json({
        message: messages.category.deletedSuccessfully,
        success: true
    })
} // todo solve error
