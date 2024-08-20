import slugify from "slugify"
import { Brand } from "../../../db/models/brand.model.js"
import { Category } from "../../../db/models/category.model.js"
import { SubCategory } from "../../../db/models/subcategory.model.js"
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"
import { Product } from "../../../db/models/product.model.js"
import { ApiFeature } from "../../utils/apiFeature.js"
import { deleteFile } from "../../utils/file-finctions.js"


// createProduct
export const createProduct = async (req, res, next) => {
    const deleteImage = () => {
        // delete image
        if (req.files?.mainImage) {
            deleteFile(req.files.mainImage[0].path);
        }
        if (req.files?.subImages) {
            req.files.subImages.forEach(img => {
                deleteFile(img.path);
            });
        }
    }
    // get data from req
    const { title, description, category,
        subcategory, brand, price, discount,
        size, colors, stock } = req.body

    // check category existence
    const categoryExist = await Category.findById(category) // {},null
    if (!categoryExist) {
        deleteImage()
        return next(new AppError(messages.category.notFound, 404))
    }
    // check subcategory existence
    const subcategoryExist = await SubCategory.findById(subcategory) // {},null
    if (!subcategoryExist) {
        deleteImage()
        return next(new AppError(messages.subCategory.notFound, 404))
    }
    // check brand existence
    const brandExist = await Brand.findById(brand) // {},null
    if (!brandExist) {
        deleteImage()
        return next(new AppError(messages.brand.notFound, 404))
    }
    // prepare data
    const slug = slugify(title)
    const product = new Product({
        title,
        slug,
        mainImage: req.files.mainImage[0].path,
        subImages: req.files.subImages.map(img => img.path),
        description,
        category,
        subcategory,
        brand,
        price,
        discount,
        size: JSON.parse(size),
        colors: colors, //JSON.parse(colors),
        stock,
        createdBy: req.authUser._id
        // todo createdBy updatedBy
    })
    const createdProduct = await product.save()
    if (!createdProduct) {
        deleteImage()
        return next(new AppError(messages.product.failToCreate, 500))
    }
    // send response
    return res.status(201).json({
        message: messages.product.createdSuccessfully,
        success: true,
        data: createdProduct
    })
}

// getAllProduct with pagination(done) sort(done) select(done) filter
/*
    let { page, size, sort, select } = req.query
    // price:{$gt:7000} price < 7000
    let filter = { ...req.query }
    let excludes = ['sort', 'select', 'page', 'size']
    excludes.forEach((ele) => {
        delete filter[ele]
    })
    select = select?.replaceAll(',', ' ')
    sort = sort?.replaceAll(',', ' ')
    page = parseInt(page)
    size = parseInt(size)
    if (page <= 0) page = 1
    if (size <= 0) size = 2
    const skip = (page - 1) * size
    const products = await Product.find(filter).limit(size).skip(skip).sort(sort).select(select)

// by front end send == page and size
   page  size  skip
          1    1-5     0
          2    6-10    5
          3    11-15   10
          skip = (page -1 ) * size

    // limit = كام واحد يرجع
    // skip = سكيب الرقم الي بكتبو و الباقي يرجع 

    sort('createdAt')
    sort('-createdAt') reverse
    sort('price')
    sort('-price') reverse
*/
export const getProducts = async (req, res, next) => {
    const apiFeature = new ApiFeature(Product.find(), req.query).pagination().sort().select().filter()
    const products = await apiFeature.mongooseQuery
    // send response
    return res.status(201).json({
        success: true,
        data: products
    })
}

// updateProduct
export const updateProduct = async (req, res, next) => {
    // get data from req
    const { title, description,
        price, discount,
        size, colors, stock, productId } = req.body
    // check product exist
    const productExist = await Product.findById(productId)
    if (!productExist) {
        return next(new AppError(messages.product.notFound, 404))
    }
    // prepare data
    if (title) {
        productExist.title = title;
        productExist.slug = slugify(title)
    }
    productExist.description = description || productExist.description;
    productExist.price = price || productExist.price;
    productExist.discount = discount || productExist.discount;
    productExist.size = size || productExist.size;
    productExist.colors = colors || productExist.colors;
    productExist.stock = stock || productExist.stock;
    // update image
    if (req.files?.mainImage) {
        if (productExist.mainImage) {
            deleteFile(productExist.mainImage); // Delete old main image
        }
        productExist.mainImage = req.files.mainImage[0].path; // Update with new main image path as a string
    }
    if (req.files?.subImages) {
        if (productExist.subImages?.length) {
            productExist.subImages.forEach(img => {
                if (img) { // Ensure the path exists before attempting to delete
                    deleteFile(img);
                }
            });
        }
        productExist.subImages = req.files.subImages.map(img => img.path); // Update with new sub-images paths as an array of strings
    }
    const updatedProduct = await productExist.save()
    // send response
    return res.status(201).json({
        message: messages.product.updatedSuccessfully,
        success: true,
        data: updatedProduct
    })
}

// deleteProduct
export const deleteProduct = async (req, res, next) => {
    const { productId } = req.params
    const productExist = await Product.findById(productId)
    if (!productExist) {
        return next(new AppError(messages.product.notFound, 404))
    }
    // delete product images
    if (productExist.mainImage) {
        deleteFile(productExist.mainImage);
    }

    if (productExist.subImages && productExist.subImages.length > 0) {
        productExist.subImages.forEach(img => {
            deleteFile(img);
        });
    }
    await productExist.deleteOne()
    // send response
    return res.status(201).json({
        message: messages.product.deletedSuccessfully,
        success: true,
    })
}