import { Coupon } from "../../../db/index.js"
import { AppError } from "../../utils/appError.js"
import { couponTypes } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"

// createCoupon
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

// getCoupon
export const getCoupon = async (req, res, next) => {
    const couponExist = await Coupon.find()
    if (couponExist.length === 0) {
        return next(new AppError(messages.coupon.notFound, 404))
    }
    return res.status(201).json({
        success: true,
        data: couponExist
    })
}

// updateCoupon
export const updateCoupon = async (req, res, next) => {
    const { couponId } = req.params;
    const { couponCode, couponAmount, couponType, fromDate, toDate } = req.body;
    // check coupon exist 
    const couponExist = await Coupon.findById(couponId);
    if (!couponExist) {
        return next(new AppError(messages.coupon.notFound, 404));
    }
    if (couponCode && couponCode !== couponExist.couponCode) {
        const codeExists = await Coupon.findOne({ couponCode });
        if (codeExists) {
            return next(new AppError(messages.coupon.alreadyExist, 409));
        }
    }
    // Validate coupon amount
    if (couponType === couponTypes.PERCENTAGE && couponAmount > 100) {
        return next(new AppError('Coupon amount must be less than 100 for percentage-based coupons', 400));
    }
    // updatedData
    couponExist.couponCode = couponCode || couponExist.couponCode;
    couponExist.couponAmount = couponAmount || couponExist.couponAmount;
    couponExist.couponType = couponType || couponExist.couponType;
    couponExist.fromDate = fromDate || couponExist.fromDate;
    couponExist.toDate = toDate || couponExist.toDate;
    couponExist.updatedBy = req.authUser._id;

    // Save to db
    const updatedCoupon = await couponExist.save();
    // Respond with success
    return res.status(200).json({
        message: messages.coupon.updatedSuccessfully,
        data: updatedCoupon,
        success: true
    });
}

// deleteCoupon
export const deleteCoupon = async (req, res, next) => {
    const { couponId } = req.params
    const couponExist = await Coupon.findById(couponId)
    if (!couponExist) {
        return next(new AppError(messages.coupon.notFound, 404))
    }
    await couponExist.deleteOne()
    return res.status(201).json({
        message: messages.coupon.deletedSuccessfully,
        success: true
    })
}