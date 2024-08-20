import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

// add review 
export const addReviewVal = joi.object().keys({
    comment: generalFields.comment.required(),
    rate: joi.number().min(0).max(5),
    productId: generalFields.objectId.required()
}).required()