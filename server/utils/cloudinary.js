const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (filePath, folder = 'groot1') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto'
    });
    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    throw new Error('Cloudinary upload failed: ' + error.message);
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Cloudinary deletion failed:', error.message);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
