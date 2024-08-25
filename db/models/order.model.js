// import modules 
import { model, Schema } from "mongoose";
import { orderStatus } from "../../src/utils/constant/enums.js";

// schema
const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
            title: String,
            itemPrice: Number,
            quantity: Number,
            finalPrice: Number
        }
    ],
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    coupon: {
        couponId: { type: Schema.Types.ObjectId, ref: "Coupon", required: true },
        code: String,
        discount: Number
    },
    status: {
        type: String,
        enum: Object.values(orderStatus),
        default: orderStatus.PLACED
    },
    payment: {
        type: String,
        enum: ['cash', 'visa'],
        required: true
    },
    orderPrice: Number,
    name: String,
    finalPrice: Number
}, { timestamps: true })

// model
export const Order = model('Order', orderSchema)
