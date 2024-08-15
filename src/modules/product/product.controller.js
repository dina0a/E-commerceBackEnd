import slugify from "slugify"
import { Brand } from "../../../db/models/brand.model.js"
import { Category } from "../../../db/models/category.model.js"
import { SubCategory } from "../../../db/models/subcategory.model.js"
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"
import { Product } from "../../../db/models/product.model.js"
import { ApiFeature } from "../../utils/apiFeature.js"


// createProduct
export const createProduct = async (req, res, next) => {
    // get data from req
    const { title, description, category,
        subcategory, brand, price, discount,
        size, colors, stock } = req.body

    // check category existence
    const categoryExist = await Category.findById(category) // {},null
    if (!categoryExist) {
        return next(new AppError(messages.category.notFound, 404))
    }
    // check subcategory existence
    const subcategoryExist = await SubCategory.findById(subcategory) // {},null
    if (!subcategoryExist) {
        return next(new AppError(messages.subCategory.notFound, 404))
    }
    // check brand existence
    const brandExist = await Brand.findById(brand) // {},null
    if (!brandExist) {
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
        stock
        // todo createdBy updatedBy
    })
    const createdProduct = await product.save()
    if (!createdProduct) {
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