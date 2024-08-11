import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const createBrandVal = joi.object({
    name: generalFields.name.required(),
}).required()

// updateBrandVal

export const updateBrandVal = joi.object({
    name: generalFields.name,
    brandId: generalFields.objectId.required()
}).required()