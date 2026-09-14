import multer from "multer";
import path from "path";
import fs from "fs";
import imagekit from "../config/imagekit.config.js";
import AppError from "../utils/AppError.js";

// Multer — temp disk storage before ImageKit upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "./uploads/temp";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        cb(null, unique + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError("Only images allowed (JPG, PNG, WebP, GIF)", 400), false);
    }
};

export const multerUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("image");

export const handleUpload = (req, res, next) => {
    multerUpload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return next(new AppError("Image must be under 5MB", 400));
            }
            return next(new AppError(err.message, 400));
        }
        if (err) return next(err);
        if (!req.file) return next(new AppError("Image is required", 400));
        next();
    });
};

// Upload buffer/file to ImageKit
export const uploadToImageKit = async (filePath, fileName, folder = "chat") => {
    const fileBuffer = fs.readFileSync(filePath);

    const result = await imagekit.upload({
        file: fileBuffer,
        fileName,
        folder: `/astroask/${folder}`,
        useUniqueFileName: true,
        tags: [folder],
    });

    // Cleanup temp file
    fs.unlinkSync(filePath);

    return {
        url: result.url,
        fileId: result.fileId,
        name: result.name,
        size: result.size,
        mimeType: result.fileType,
    };
};

// Delete from ImageKit
export const deleteFromImageKit = async (fileId) => {
    await imagekit.deleteFile(fileId);
};

export const handleOptionalUpload = (req, res, next) => {
    multerUpload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return next(new AppError("Image must be under 5MB", 400));
            }
            return next(new AppError(err.message, 400));
        }
        if (err) return next(err);
        next();
    });
};