const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: "djjt6uuib",
  api_key: "636298832497668",
  api_secret: "_py38H_X-cb5XQJ-TsymR5N2go0",
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });

  return result;
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };
