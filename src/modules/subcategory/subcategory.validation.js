import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const addSubCategoryVal = joi.object({
    name: generalFields.name.required(),
    category: generalFields.objectId.required()
}).required()

export const updateSubCategoryVal = joi.object({
    name: generalFields.name,
    subcategoryId: generalFields.objectId.required()
}).required()