import { model, Schema } from "mongoose";

// schema
const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    image: Object, // or {secure_url : String, public_id : String}
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true 
    }

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
categorySchema.virtual("subcategories", {
    localField: "_id",
    foreignField: "category",
    ref: "SubCategory"
})

// model
export const Category = model("Category", categorySchema)