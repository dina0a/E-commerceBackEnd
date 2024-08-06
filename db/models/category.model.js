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
    image: Object,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false // todo true
    }

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
categorySchema.virtual("subcategories", {
    localField: "_id",
    foreignField: "category",
    ref: "SubCategory"
})

// model
export const Category = model("Category", categorySchema)