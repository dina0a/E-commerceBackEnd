import joi from "joi";
import { couponTypes } from "../../utils/constant/enums.js";

// create coupon val
export const createCouponVal = joi.object({
    couponCode: joi.string().length(6).required(),
    couponAmount: joi.number().positive().min(1),
    couponType: joi.string().valid(...Object.values(couponTypes)),
    fromDate: joi.date().greater(Date.now() - 24 * 60 * 60 * 1000),
    toDate: joi.date().greater(joi.ref('fromDate'))
}).required()