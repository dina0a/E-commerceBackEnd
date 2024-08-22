import { Router } from "express";
import { isAuthenticate, isAuthorized } from "../../middleware/authentication.js";
import { isValid } from "../../middleware/validation.js";
import { addReviewVal } from "./review.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addReview, deleteReviews, getReviews } from "./review.controller.js";
import { roles } from "../../utils/constant/enums.js";
import { isActive } from "../../middleware/isActive.js";
const reviewRouter = Router()

// add review 
reviewRouter.post('/',
    isAuthenticate(),
    isAuthorized([roles.CUSTOMER]),
    isValid(addReviewVal),
    isActive(),
    asyncHandler(addReview)
)

// get rreview
reviewRouter.get('/get-review/:productId',
    isAuthenticate(),
    asyncHandler(getReviews)
)

// delete rreview
reviewRouter.delete('/delete-review/:reviewId',
    isAuthenticate(),
    isAuthorized([roles.ADMIN, roles.SUPER_ADMIN, roles.CUSTOMER]),
    isActive(),
    asyncHandler(deleteReviews)
)

export default reviewRouter