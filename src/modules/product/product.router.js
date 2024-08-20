import { Router } from "express"
import { fileUpload } from "../../utils/multer.js"
import { isValid } from "../../middleware/validation.js"
import { createProductVal, updateProductVal } from "./product.validation.js"
import { asyncHandler } from "../../utils/appError.js"
import { createProduct, deleteProduct, getProducts, updateProduct } from "./product.controller.js"
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

// update product 
productRouter.put('/',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    fileUpload({ folder: "product" }).fields([
        { name: "mainImage", maxCount: 1 },
        { name: "subImages", maxCount: 5 }
    ]),
    isValid(updateProductVal),
    asyncHandler(updateProduct)
)

// deleteProduct
productRouter.delete('/:productId',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    asyncHandler(deleteProduct)
)

export default productRouter

