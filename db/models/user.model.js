// import modules
import path from 'path'
import dotenv from 'dotenv'
import { model, Schema } from "mongoose";
import { roles, status } from "../../src/utils/constant/enums.js";
import { hashPassword } from '../../src/utils/hash-and-commpare.js';
dotenv.config({ path: path.resolve('./config/.env') })

// schema 
const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true
        },
        phone: {
            type: String,
            unique: true
        },
        password: {
            type: String,
            required: true,
        },
        // isVerified: {
        //     type: Boolean,
        //     default: false
        // }, // confirm email
        role: {
            type: String, // customer , admin , seller
            enum: Object.values(roles), //['customer','admin','seller']
            default: roles.CUSTOMER,
        },
        status: {
            type: String,
            enum: Object.values(status),
            default: status.PENDING
        },
        isActive: {
            type: Boolean,
            default: false
        },
        image: {
            type: Object,
            default: {
                secure_url: process.env.SECURE_URL,
                public_id: process.env.PUBLIC_ID
            }
        },// {secure_url ,public_id}
        DOB: Date,
        address: [
            {
                street: String,
                city: String,
                phone: String,
            }
        ]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    })
// hooks
userSchema.pre('save', function () {
    this.password = hashPassword({ password: this.password })
})
// model
export const User = model('User', userSchema)