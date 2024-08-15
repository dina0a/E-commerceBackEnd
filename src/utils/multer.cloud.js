// import modules
import multer, { diskStorage } from "multer"
const fileValidation = {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    file: ['application/pdf'],
    vedio: ['video/mp4', 'video/mpeg', 'video/ogg']
}
export const cloudUpload = ({ allowFile = fileValidation.image } = {}) => {
    const storage = diskStorage({
        
    })
    const fileFilter = (req, file, cb) => {
        if (allowFile.includes(file.mimetype)) {
            return cb(null, true)
        }
        return cb(new Error("invalid file format", false))
    }
    return multer({ storage, fileFilter })
}