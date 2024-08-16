import slugify from "slugify"
import { Category } from "../../../db/models/category.model.js"
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"
import { deleteFile } from "../../utils/file-finctions.js"
import { SubCategory } from "../../../db/models/subcategory.model.js"
import { Product } from "../../../db/models/product.model.js"
import cloudinary from "../../utils/cloudinary.js"
import { ApiFeature } from "../../utils/apiFeature.js"
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
        image: { path: req.file.path },
        createdBy: req.authUser._id
    })
    // add to db 
    const createdCategory = await category.save() // {},null
    if (!createdCategory) {
        req.file = req.file
        return next(new AppError(messages.category.failToCreate, 500))
    }
    // send response
    return res.status(201).json({
        message: messages.category.createdSuccessfully,
        success: true,
        data: createdCategory
    })
}

// createCategoryCloud
export const createCategoryCloud = async (req, res, next) => {
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
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: 'c42/category'
    })
    const category = new Category({
        name,
        slug,
        image: { secure_url, public_id },
        createdBy: req.authUser._id
    })
    // add to db 
    const createdCategory = await category.save() // {},null
    if (!createdCategory) {
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
    const apiFeature = new ApiFeature(Category.find().populate([{ path: "subcategories" }]), req.query).pagination().sort().select().filter()
    const categories = await apiFeature.mongooseQuery
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
export const deleteCategory = async (req, res, next) => {
    // get data from req
    const { categoryId } = req.params
    // check category existance
    const categoryExist = await Category.findById(categoryId)
    if (!categoryExist) {
        return next(new AppError(messages.category.notFound, 404))
    }
    // prepare ids
    const subcategories = await SubCategory.find({ category: categoryId }).select("image")
    const products = await Product.find({ category: categoryId }).select(["mainImage", "subImages"])
    const subcategoriesIds = subcategories.map(sub => sub._id) // [id1 , id2 , id3]
    const productIds = products.map(product => product._id) // [id1 , id2 , id3]

    // delete subCategories
    await SubCategory.deleteMany({ _id: { $in: subcategoriesIds } });

    // delete products
    await Product.deleteMany({ _id: { $in: productIds } });

    // Delete images of subcategories
    subcategories.forEach(subcategory => {
        deleteFile(subcategory.image.path);
    });
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
    // delete category image
    deleteFile(categoryExist.image.path)
    // delete category
    const deletedCategory = await categoryExist.deleteOne()
    if (!deletedCategory) {
        return next(new AppError(messages.category.failToDelete))
    }
    // // send response
    return res.status(200).json({
        message: messages.category.deletedSuccessfully,
        success: true
    })
}

// delete category cloud
export const deleteCategoryCloud = async (req, res, next) => {
    // get data from req
    const { categoryId } = req.query
    // check existence
    const categoryExist = await Category.findByIdAndDelete(categoryId) // {},null
    if (!categoryExist) {
        return next(new AppError(messages.category.notFound, 404))
    }

    // prepare ids
    const subcategories = await SubCategory.find({ category: categoryId }).select('image')
    const products = await Product.find({ category: categoryId }).select('mainImage subImages')
    const imagePaths = []

    const subcategoryIds = []
    subcategories.forEach(sub => {
        imagePaths.push(sub.image)
        subcategoryIds.push(sub._id)
    })

    const productIds = []
    products.forEach(pro => {
        imagePaths.push(pro.mainImage)
        imagePaths.push(...pro.subImages)
        productIds.push(pro._id)
    })

    // delete subcategories
    await SubCategory.deleteMany({ _id: { $in: subcategoryIds } })
    await Product.deleteMany({ _id: { $in: productIds } })

    for (let i = 0; i < imagePaths.length; i++) {
        if (typeof (imagePaths[i]) === "string") {
            deleteFile(imagePaths[i])
        }
        else {
            await cloudinary.uploader.destroy(imagePaths[i].public_id)
        }
    }
    // another solution >>> delete folder 
    await cloudinary.api.delete_resources_by_prefix(`c42/category/${categoryId}`)
    await cloudinary.api.delete_folder(`c42/category/${categoryId}`)

    // // // send response
    // return res.status(200).json({
    //     message: messages.category.deletedSuccessfully,
    //     success: true
    // })
}

// updateCategoryCloud
export const updateCategoryCloud = async (req, res, next) => {
    // get data from req 
    const { categoryId } = req.params
    const category = await Category.findById(categoryId)
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { public_id: category.image.public_id })
        req.body.image = { secure_url, public_id }
    }
    category.name = req.body.name || category.name
    category.image = req.body.image || category.image
    await category.save()
    // send response
    return res.status(201).json({
        message: messages.category.updatedSuccessfully,
        success: true
    })
}
