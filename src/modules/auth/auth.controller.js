import bcrypt from 'bcrypt'
import { User } from "../../../db/models/user.model.js"
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"
import { comparePassword, hashPassword } from '../../utils/hash-and-commpare.js'
import { sendEmail } from '../../utils/email.js'
import { generateToken, verifyToken } from '../../utils/token.js'
import { status } from '../../utils/constant/enums.js'
import { Cart } from '../../../db/index.js'
import { generateOTP } from '../../utils/otp.js'

// signup
export const signup = async (req, res, next) => {
    // get data from req
    let { userName, email, password, phone, DOB } = req.body
    // check existence
    const userExist = await User.findOne({ $or: [{ email }, { phone }] })
    if (userExist) {
        return next(new AppError(messages.user.alreadyExist, 409))
    }
    // if(userExist.email == email){}
    // else if(userExist.phone == phone){}

    // hash password
    password = hashPassword({ password })

    // prepare data
    const user = new User({
        userName,
        email,
        password,
        phone,
        DOB
    })
    // save to db
    const createdUser = await user.save()
    if (!createdUser) {
        return next(new AppError(messages.user.failToCreate, 500))
    }
    // send email
    const token = generateToken({ payload: { _id: createdUser._id } })
    await sendEmail({ to: email, subject: "verify account", html: `<p>to verify your account click <a href='${req.protocol}://${req.headers.host}/auth/verify-account?token=${token}'>here</a></p>` })
    // send response
    return res.status(201).json({
        message: messages.user.createdSuccessfully,
        data: createdUser,
        success: true
    })
}

// verifyAccount
export const verifyAccount = async (req, res, next) => {
    // get data from req
    const { token } = req.query
    const decoded = verifyToken({ token })
    const user = await User.findByIdAndUpdate(decoded._id, { status: status.VERIFIED }, { new: true })//.select('-password')
    if (!user) {
        return next(new AppError(messages.user.notFound, 404))
    }
    await Cart.create({ user: user._id, products: [] })
    // send response
    return res.status(200).json({
        message: messages.user.verifyAccount,
        success: true
    })
}

// login
export const login = async (req, res, next) => {
    // get data from req
    const { email, phone, password } = req.body
    // chex existence
    const userExist = await User.findOne({ $or: [{ email }, { phone }], status: status.VERIFIED })
    if (!userExist) {
        return next(new AppError(messages.user.notFound, 404))
    }
    // check password 
    const match = comparePassword({ password, hashPassword: userExist.password })
    if (!match) {
        return next(new AppError(messages.password.invalidCredentials, 401))
    }
    userExist.isActive = true
    await userExist.save()
    const accessToken = generateToken({ payload: { _id: userExist._id } })
    // send response
    return res.status(200).json({
        message: "login successfully",
        success: true,
        accessToken
    })
}

// forgetPassword
export const forgetPassword = async (req, res, next) => {
    // get data from req
    const { email } = req.body
    const userExist = await User.findOne({ email }) // {}, null
    if (!userExist) {
        return next(new AppError(messages.user.notFound, 404))
    }
    // if already have email
    if (userExist.otp && userExist.expireDateOtp > Date.now()) {
        return next(new AppError('you already has OTP', 400))
    }
    // generate otp
    const otp = generateOTP()
    // update user
    userExist.otp = otp
    userExist.expireDateOtp = Date.now() + 15 * 60 * 1000
    // save to db
    await userExist.save()
    // send email
    await sendEmail({ to: email, subject: "forget password", html: `<h1>your OTP is ${otp} </h1>` })
    // send response
    return res.status(200).json({
        message: "check your email",
        success: true,
    })
}

// changePassword
export const changePassword = async (req, res, next) => {
    // get data from password
    const { otp, newPassword, email } = req.body
    // check email
    const user = await User.findOne({ email })//{}, null
    if (!user) {
        return next(new AppError(messages.user.notFound, 404))
    }
    if (user.otp != otp) {
        return next(new AppError('invalid otp', 401))
    }
    if (user.expireDateOtp < Date.now()) {
        const secondOTP = generateOTP()
        user.otp = secondOTP
        user.expireDateOtp = Date.now() + 5 * 60 * 1000
        await user.save()
        await sendEmail({ to: email, subject: "resent otp", html: `<h1>your otp is ${secondOTP}</h1>` })
        // send response
        return res.status(200).json({
            message: "check your email",
            success: true,
        })
    }
    // hash new password
    const hashedPassword = hashPassword({ password: newPassword })
    // user.password = hashedPassword
    // user.otp = undefined
    // user.expireDateOtp = undefined
    // await user.save()
    await User.updateOne({ email }, { password: hashedPassword, $unset: { otp: "", expireDateOtp: "" } })
    return res.status(200).json({
        message: "password updated successfully",
        success: true,
    })
}

