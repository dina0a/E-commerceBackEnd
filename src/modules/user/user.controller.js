import { User } from "../../../db/index.js"
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"
import { comparePassword, hashPassword } from "../../utils/hash-and-commpare.js"

// resetPassword
export const resetPassword = async (req, res, next) => {
    // get data from req 
    const { oldPassword, newPassword } = req.body
    const userId = req.authUser._id
    // check user password
    const match = comparePassword({ password: oldPassword, hashPassword: req.authUser.password })
    if (!match) {
        return next(new AppError(messages.password.invalidCredentials, 401))
    }
    // hashPassword
    const hasedPassword = hashPassword({ password: newPassword })
    // update user
    await User.updateOne({ _id: userId }, { password: hasedPassword })
    // return response
    return res.status(201).json({
        message: messages.user.updatedSuccessfully,
        success: true
    })
}

// updateUser
export const updateUser = async (req, res, next) => {
    const { userName, email, phone, image, DOB, address } = req.body
    const user = await User.findOne({ _id: req.authUser._id })
    if (!user) {
        return next(new AppError(messages.user.notFound, 404))
    }
    if (email || phone) {
        const userExist = await User.findOne({
            _id: { $ne: req.authUser._id },
            $or: [
                { email: email },
                { phone: phone }
            ]
        });
        if (userExist) {
            return next(new AppError('Email or phone already in use', 400));
        }
    }
    user.userName = userName || user.userName
    user.email = email || user.email
    user.phone = phone || user.phone
    user.DOB = DOB || user.DOB
    user.address = address || user.address
    // Save the updated user
    const updatedUser = await user.save();
    // Send response
    return res.status(200).json({
        success: true,
        message: messages.user.updatedSuccessfully,
        updatedUser
    });
}