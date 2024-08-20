import { Product, Review } from "../../../db/index.js"
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"

// addReview
export const addReview = async (req, res, next) => {
    // get data from req 
    const { comment, rate } = req.body
    const { productId } = req.query

    // check product exist 
    const productExist = await Product.findById(productId)// {},null
    if (!productExist) {
        return next(new AppError(messages.product.notFound, 404))
    }
    // todo check has order
    // check has review 
    const reviewExist = await Review.findOneAndUpdate({ user: req.authUser._id, product: productId },
        { comment, rate }, { new: true }
    )
    let message = messages.review.updatedSuccessfully
    let data = reviewExist
    if (!reviewExist) {
        const review = new Review({
            comment,
            rate,
            user: req.authUser._id,
            product: productId
        })
        const createdReview = await review.save()
        if (!createdReview) {
            return next(new AppError(messages.review.failToCreate, 500))
        }
        message = messages.review.createdSuccessfully
        data = createdReview
    }
    return res.status(201).json({
        message,
        data,
        success: true
    })
}