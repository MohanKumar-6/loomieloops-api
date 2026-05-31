import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadImage = async (fileStr: string) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: "ml_default", // You may need to create this in Cloudinary
      folder: "loomieloops",
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};

export default cloudinary;
