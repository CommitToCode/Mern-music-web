

// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, Date.now() + ext);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /mp3|jpeg|jpg|png/;
//   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//   cb(null, extname);
// };

// const upload = multer({ storage, fileFilter });

// module.exports = upload;







const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    let folder = "uploads"; 
    let resource_type = "auto"; 

    
    if (file.mimetype.startsWith("image/")) {
      folder = "images";
    } else if (file.mimetype === "audio/mpeg" || file.mimetype === "audio/mp3") {
      folder = "audios";
      resource_type = "video"; 
    }

    return {
      folder: folder,
      resource_type: resource_type,
      public_id: Date.now().toString(), 
    };
  },
});


const upload = multer({ storage });

module.exports = upload;
