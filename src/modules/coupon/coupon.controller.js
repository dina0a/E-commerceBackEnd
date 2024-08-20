import { Coupon } from "../../../db/index.js"
import { AppError } from "../../utils/appError.js"
import { couponTypes } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"

export const createCoupon = async (req, res, next) => {
    // get data from req
    const { couponCode, couponAmount, couponType, fromDate, toDate } = req.body
    // check coupon exist 
    const couponExist = await Coupon.findOne({ couponCode })
    if (couponExist) {
        return next(new AppError(messages.coupon.alreadyExist, 409))
    }
    if (couponType == couponTypes.PERCENTAGE && couponAmount > 100) {
        return next(new AppError('must be less than 100', 400))
    }
    // prepare data
    const coupon = new Coupon({
        couponCode,
        couponAmount,
        couponType,
        fromDate,
        toDate,
        createdBy: req.authUser._id
    })
    const createdCoupon = await coupon.save()
    if (!createdCoupon) {
        return next(new AppError(messages.coupon.failToCreate, 500))
    }
    return res.status(201).json({
        message: messages.coupon.createdSuccessfully,
        data: createdCoupon,
        success: true
    })
}