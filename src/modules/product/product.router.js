import { Router } from "express"
import { fileUpload } from "../../utils/multer.js"
import { isValid } from "../../middleware/validation.js"
import { createProductVal } from "./product.validation.js"
import { asyncHandler } from "../../utils/appError.js"
import { createProduct, getProducts } from "./product.controller.js"

const productRouter = Router()

// add product  todo authentcation & auth
productRouter.post('/',
    fileUpload({ folder: "product" }).fields([
        { name: "mainImage", maxCount: 1 },
        { name: "subImages", maxCount: 5 }
    ]),
    isValid(createProductVal),
    asyncHandler(createProduct)
)

// get product
productRouter.get('/',asyncHandler(getProducts))

export default productRouter

