// import modules
import joi from 'joi'
import { AppError } from '../utils/appError.js'
import { Types } from 'mongoose'

const validateObjectId = (value, helper) => {
    const match = Types.ObjectId.isValid(value)
    if (match) {
        return true
    }
    return helper("invalid objectId")
}
export const generalFields = {
    name: joi.string(),
    // objectId: joi.string().hex().length(24),
    email: joi.string().email().required(),
    password: joi.string(),
    rePassword: joi.string().valid(joi.ref('password')),
    objectId: joi.custom(validateObjectId),
    comment: joi.string()
}

export const isValid = (schema) => {
    return (req, res, next) => {
        let data = { ...req.body, ...req.params, ...req.query }
        const { error } = schema.validate(data, { abortEarly: false })
        if (error) {
            const errArr = []
            error.details.forEach(err => {
                errArr.push(err.message)
            });
            return next(new AppError(errArr, 400))
        }
        next()
    }
}