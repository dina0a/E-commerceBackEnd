import { model, Schema } from "mongoose";

// schema
export const subCategorySchema = new Schema({
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
    image: {
        type: Object,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }
}, { timestamps: true })


// model
export const SubCategory = model('SubCategory', subCategorySchema)