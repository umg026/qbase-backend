const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure folder exists
const uploadPath = path.join(__dirname, "..", "public/assets/images/agents");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = "agent-" + Date.now() + ext;
    cb(null, uniqueName);
  }
});

// File Filter (Optional)
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"), false);
};

module.exports = multer({
  storage,
  fileFilter
});
