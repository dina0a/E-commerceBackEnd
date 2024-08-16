import slugify from "slugify"
import { Category } from "../../../db/models/category.model.js"
import { SubCategory } from "../../../db/models/subcategory.model.js"
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"
import { deleteFile } from "../../utils/file-finctions.js"
import { ApiFeature } from "../../utils/apiFeature.js"
import { Product } from "../../../db/models/product.model.js"

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
    const nameExist = await SubCategory.findOne({ name }) // {},null // so2al
    if (nameExist) {
        return next(new AppError(messages.subCategory.alreadyExist, 409))
    }
    // prepare data
    const slug = slugify(name)
    const subCategory = new SubCategory({
        name,
        slug,
        category,
        image: { path: req.file.path },
        createdBy: req.authUser._id
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
    const apiFeature = new ApiFeature(SubCategory.find({ category: categoryId }).populate([{ path: "category" }]), req.query).pagination().sort().select().filter()
    const subcategories = await apiFeature.mongooseQuery
    if (subcategories.length == 0) {
        return next(new AppError(messages.subCategory.notFound, 404))
    }
    // send response
    return res.status(201).json({
        success: true,
        data: subcategories
    })
}

// update subcategory
export const updateSubCategory = async (req, res, next) => {
    // get data from req
    const { name } = req.body
    const { subcategoryId } = req.params
    // check existence
    const subcategoryExist = await SubCategory.findById(subcategoryId) // {},null
    if (!subcategoryExist) {
        return next(new AppError(messages.subCategory.notFound, 404))
    }
    // check name existence
    const nameExist = await SubCategory.findOne({ name, _id: { $ne: subcategoryId } })
    if (nameExist) {
        return next(new AppError(messages.subCategory.alreadyExist, 409))
    }
    // prepare data 
    if (name) {
        subcategoryExist.name = name
        subcategoryExist.slug = slugify(name)
    }
    // update image
    if (req.file) {
        // delete old image 
        deleteFile(subcategoryExist.image.path)
        // update with new image 
        subcategoryExist.image = { path: req.file.path }
    }
    // update to db
    const updatedSubcategory = await subcategoryExist.save()
    if (!updatedSubcategory) {
        return next(new AppError(messages.subCategory.failToUpdate, 500))
    }
    // send response
    return res.status(201).json({
        message: messages.subCategory.updatedSuccessfully,
        success: true,
        data: updatedSubcategory
    })
}

// delete subcategory
export const deleteSubCategory = async (req, res, next) => {
    // get data from req
    const { subId } = req.params
    // check existence
    const subcategoryExist = await SubCategory.findByIdAndDelete(subId)
    if (subcategoryExist) {
        deleteFile(subcategoryExist.image.path)
    }
    if (!subcategoryExist) {
        return next(new AppError(messages.subCategory.notFound, 404))
    }
    // prepare ids
    const products = await Product.find({ subcategory: subId }).select(["mainImage", "subImages"])
    const productIds = products.map(product => product._id) // [id1 , id2 , id3]

    // delete products
    await Product.deleteMany({ _id: { $in: productIds } });

    // Delete images of products
    products.forEach(product => {
        if (product.mainImage) {
            deleteFile(product.mainImage);
        }
        product.subImages.forEach(image => {
            if (image) {
                deleteFile(image);
            }
        });
    });
    // delete subcategory
    const deletedSubCategory = await subcategoryExist.deleteOne()
    if (!deletedSubCategory) {
        return next(new AppError(messages.subCategory.failToCreate))
    }
    // send response
    return res.status(200).json({
        message: messages.subCategory.deletedSuccessfully,
        success: true
    })
}