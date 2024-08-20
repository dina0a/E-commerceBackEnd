import { Router } from "express";
import { isAuthenticate } from "../../middleware/authentication.js";
import { isValid } from "../../middleware/validation.js";
import { addReviewVal } from "./review.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addReview } from "./review.controller.js";
const reviewRouter = Router()

// add review 
reviewRouter.post('/',
    isAuthenticate(),
    isValid(addReviewVal),
    asyncHandler(addReview)
)

export default reviewRouter