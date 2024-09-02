import { User } from "../../../db/index.js"
import { AppError } from "../../utils/appError.js"
import cloudinary from "../../utils/cloudinary.js"
import { status } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"
import { sendEmail } from "../../utils/email.js"
import { comparePassword, hashPassword } from "../../utils/hash-and-commpare.js"
import { generateToken } from "../../utils/token.js"

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
    // get data from req
    const userId = req.authUser._id
    const { userName, email, phone, address } = req.body

    // check user exist
    const user = await User.findById(userId)
    if (!user) {
        return next(new AppError(messages.user.notFound, 404))
    }

    // Handle file upload and image replacement
    if (req.file) {
        // Check if the user already has an image that is not the default one
        if (user.image && user.image.public_id !== process.env.PUBLIC_ID) {

            // Delete the old image from Cloudinary
            await cloudinary.uploader.destroy(user.image.public_id);
        }
        // Upload the new image to Cloudinary under the 'ecommerce/user' folder
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: 'c42/user',
        });

        // Update the user's image with the new details
        req.body.image = { secure_url, public_id };
    }

    // update email
    if (email) {
        // check if email already exist in another user
        const userExist = await User.findOne({ email })
        // if email exist and its not my current email
        if (userExist && email != user.email) {
            return next(new AppError("email is already in use", 409))
        }
        // if its my current email
        if (userExist && email == user.email) {
            user.email = email
        }
        // if email not exist
        else {
            user.email = email
            user.status = status.PENDING
            user.isActive = false
            const token = generateToken({ payload: { _id: user._id } })
            await sendEmail({
                to: email, subject: 'verify account', html: `<p>to verify your account please click 
    <a href='https://carrent-assignment.onrender.com/auth/verify-account?token=${token}'>Verify Account</a>
     </p>`
            })
        }
    }

    user.userName = userName || user.userName
    user.phone = phone || user.phone
    if (address) {
        user.address = JSON.parse(address) || user.address
    }
    user.image = req.body.image || user.image
    const updatedUser = await user.save()
    if (!updatedUser) {
        return next(new AppError(messages.user.failToUpdate, 500))
    }
    return res.status(200).json({ message: messages.user.updatedSuccessfully, success: true, data: updatedUser })
}


// getUserProfile
export const getUserProfile = async (req, res, next) => {
    const userId = req.authUser._id
    const user = await User.findById(userId)
    if (!user) {
        return next(new AppError(messages.user.notFound, 404))
    }
    user.password = undefined
    return res.status(200).json({ success: true, data: user })
}

// deleteUser
export const deleteUser = async (req, res, next) => {
    const userId = req.authUser._id
    const user = await User.findById(userId)
    if (!user) {
        return next(new AppError(messages.user.notFound, 404))
    }

    if (user.image && user.image.public_id !== process.env.PUBLIC_ID) {
        await cloudinary.uploader.destroy(user.image.public_id)
    }

    const deletedUser = await User.deleteOne({ _id: userId })
    if (!deletedUser) {
        return next(new AppError("fail to delete", 500))
    }

    return res.status(200).json({ message: messages.user.deletedSuccessfully, success: true })
}

// logout
export const logout = async (req, res, next) => {
    const userId = req.authUser._id
    const user = await User.findOneAndUpdate({ _id: userId }, { isActive: false }, { new: true })
    if (!user) {
        return next(new AppError(messages.user.notFound, 404))
    }
    return res.status(200).json({ message: "logged out", success: true })
}
