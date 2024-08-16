import fs from 'fs'
import path from 'path'

export const deleteFile = (filePath) => {
    let fullPath = path.resolve(filePath)
    // Check if the file exists before trying to delete it
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
} 