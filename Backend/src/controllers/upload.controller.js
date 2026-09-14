import asyncHandler from "../utils/asyncHandler.js";
import { uploadToImageKit } from "../services/upload.service.js";

// POST /api/upload/chat-image
// Uploads image to ImageKit, returns URL to use in chat message
export const uploadChatImage = asyncHandler(async (req, res) => {
    const { path: filePath, originalname } = req.file;

    const result = await uploadToImageKit(filePath, originalname, "chat");

    res.status(201).json({
        success: true,
        image: {
            url: result.url,
            fileId: result.fileId,
            name: result.name,
            size: result.size,
            mimeType: result.mimeType,
        },
    });
});