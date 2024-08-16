import { Router } from "express"
import { fileUpload } from "../../utils/multer.js"
import { isValid } from "../../middleware/validation.js"
import { createProductVal } from "./product.validation.js"
import { asyncHandler } from "../../utils/appError.js"
import { createProduct, getProducts } from "./product.controller.js"
import { isAuthenticate, isAuthorized } from "../../middleware/authentication.js"
import { roles } from "../../utils/constant/enums.js"

const productRouter = Router()

// add product 
productRouter.post('/',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    fileUpload({ folder: "product" }).fields([
        { name: "mainImage", maxCount: 1 },
        { name: "subImages", maxCount: 5 }
    ]),
    isValid(createProductVal),
    asyncHandler(createProduct)
)

// get product
productRouter.get('/',asyncHandler(getProducts))

// add product 
productRouter.put('/:productId',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    fileUpload({ folder: "product" }).fields([
        { name: "mainImage", maxCount: 1 },
        { name: "subImages", maxCount: 5 }
    ]),
    isValid(createProductVal), // complete from here
    asyncHandler(createProduct)
)

export default productRouter

