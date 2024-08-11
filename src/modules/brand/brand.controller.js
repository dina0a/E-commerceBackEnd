import { Brand } from "../../../db/models/brand.model.js"
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"
import { deleteFile } from "../../utils/file-finctions.js"

// createBrand
export const createBrand = async (req, res, next) => {
    // get data from req 
    let { name } = req.body
    name = name.toLowerCase()
    // check file 
    if (!req.file) {
        return next(new AppError(messages.file.required, 400))
    }
    // check existence
    const brandExist = await Brand.findOne({ name })
    if (brandExist) {
        // remover image 
        req.file = req.file
        return next(new AppError(messages.brand.alreadyExist, 409))
    }
    // prepare data 
    const brand = new Brand({
        name,
        logo: req.file.path,
        // todo createdBy from token 
    })
    const createdBrand = await brand.save()
    if (!createdBrand) {
        // remove image
        req.file = req.file
        return next(new AppError(messages.brand.failToCreate, 500))
    }
    // send response
    return res.status(201).json({
        message: messages.brand.createdSuccessfully,
        success: true,
        data: createdBrand
    })
}

// updateBrand
export const updateBrand = async (req, res, next) => {
    // get data from req 
    let { name } = req.body
    name = name.toLowerCase()
    const { brandId } = req.params
    // check existence
    const brandExist = await Brand.findById(brandId)
    if (!brandExist) {
        // remove logo
        req.file = req.file
        return next(new AppError(messages.brand.notFound, 404))
    }
    if (name) {
        const nameExist = await Brand.findOne({ name, _id: { $ne: brandId } }) // {},null + so2aaaaal
        if (nameExist) {
            return next(new AppError(messages.brand.alreadyExist, 409))
        }
        brandExist.name = name
    }
    if (req.file) {
        // removel old image 
        deleteFile(brandExist.logo)
        // update with new image
        brandExist.logo = req.file.path
    }
    const updatedBrand = await brandExist.save()
    if (!updatedBrand) {
        // remove logo
        req.file = req.file
        return next(new AppError(messages.brand.failToCreate, 500))
    }
    // send response
    return res.status(200).json({
        message: messages.brand.updatedSuccessfully,
        success: true,
        data: updatedBrand
    })
}