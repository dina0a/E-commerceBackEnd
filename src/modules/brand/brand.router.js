import { Router } from "express";
import { fileUpload } from "../../utils/multer.js";
import { isValid } from "../../middleware/validation.js";
import { createBrandVal, updateBrandVal } from "./brand.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { createBrand, deleteBrand, getBrand, updateBrand } from "./brand.controller.js";
import { isAuthenticate, isAuthorized } from "../../middleware/authentication.js";
import { roles } from "../../utils/constant/enums.js";

const brandRouter = Router()

// create brand
brandRouter.post('/',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    fileUpload({ folder: "brand" }).single("logo"),
    isValid(createBrandVal),
    asyncHandler(createBrand)
)

// update brand
brandRouter.put('/:brandId',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    fileUpload({ folder: "brand" }).single("logo"),
    isValid(updateBrandVal),
    asyncHandler(updateBrand)
)

// getBrands
brandRouter.get('/',
    asyncHandler(getBrand)
)

// delete brand
brandRouter.delete('/:brandId',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SELLER]),
    asyncHandler(deleteBrand)
)

export default brandRouter