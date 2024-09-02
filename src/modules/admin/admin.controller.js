import { User } from "../../../db/models/user.model.js"
import { ApiFeature } from "../../utils/apiFeature.js"
import { AppError } from "../../utils/appError.js"
import cloudinary from "../../utils/cloudinary.js"
import { roles, status } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"

// add user
export const addUser = async (req, res, next) => {
    // get data from req 
    const { userName, email, phone, role } = req.body
    // check user admin
    const userExist = await User.findOne({ $or: [{ email }, { phone }] })// {},null
    if (userExist) {
        return next(new AppError(messages.user.alreadyExist, 409))
    }
    // Check if the admin is authorized to create the role
    const adminRole = req.authUser.role;
    if (adminRole === roles.ADMIN && ![roles.USER, roles.SELLER].includes(role)) {
        return next(new AppError("Admins can only add customers or sellers.", 403));
    }
    if (adminRole === roles.SUPER_ADMIN && ![roles.ADMIN, roles.USER, roles.SELLER].includes(role)) {
        return next(new AppError("Invalid role assignment.", 403));
    }
    // upload image
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: 'users' })
        req.body.image = { secure_url, public_id }
    }
    const createdUser = await User.create({
        userName,
        email,
        phone,
        role,
        password: "e-commerce",
        status: status.VERIFIED,
        image: req.body.image
    })
    if (!createdUser) {
        return next(new AppError(messages.user.failToCreate, 500))
    }
    // send response
    return res.status(201).json({
        message: messages.user.createdSuccessfully,
        data: createdUser,
        success: true
    })
}

// getUsers
export const getUsers = async (req, res, next) => {
    const apiFeatures = new ApiFeature(User.find(), req.query).pagination().sort().select("-password").filter();
    const users = await apiFeatures.mongooseQuery;
    if (!users) {
        return next(new AppError(messages.user.notFound, 404))
    }
    // send response
    return res.status(201).json({
        success: true,
        data: users
    })
}

// updateUser
export const updateUser = async (req, res, next) => {
    const { userId } = req.params
    const { role } = req.body
    const user = await User.findById(userId)
    if (!user) {
        return next(new AppError(messages.user.notFound, 404))
    }
    // Check if the admin is authorized to update the role
    const adminRole = req.authUser.role
    if (adminRole === roles.ADMIN && ![roles.CUSTOMER, roles.SELLER].includes(role)) {
        return next(new AppError("Admins can only update customers or sellers to the role of user or seller.", 403));
    }
    if (adminRole === roles.SUPER_ADMIN && ![roles.ADMIN, roles.CUSTOMER, roles.SELLER].includes(role)) {
        return next(new AppError("Invalid role assignment.", 403));
    }
    // update user
    user.role = role || user.role;
    const updatedUser = await user.save();
    // Send response
    return res.status(200).json({
        message: messages.user.updatedSuccessfully,
        success: true,
        data: updatedUser
    });
}

// deleteUser 
export const deleteUser = async (req, res, next) => {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) {
        return next(new AppError(messages.user.notFound, 404))
    }
    const adminRole = req.authUser.role;
    if (adminRole === roles.ADMIN && ![roles.SELLER, roles.CUSTOMER].includes(user.role)) {
        return next(new AppError("Admins can only delete users with roles seller or customer.", 403));
    }
    if (adminRole === roles.SUPER_ADMIN && ![roles.ADMIN, roles.SELLER, roles.CUSTOMER].includes(user.role)) {
        return next(new AppError("Invalid role deletion.", 403));
    }
    // Delete user image from Cloudinary if it exists
    if (user.image?.public_id) {
        await cloudinary.uploader.destroy(user.image.public_id);
    }
    // Delete the user from the database
    await user.deleteOne();
    // Send response
    return res.status(200).json({
        message: messages.user.deletedSuccessfully,
        success: true
    });
}