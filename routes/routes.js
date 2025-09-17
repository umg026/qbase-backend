const express = require("express");
const {
  createBlogController,
  getBlogsController,
  getBlogByIdController,
  updateBlogIdConrtoller,
  deleteBlogsController,
} = require("../controller/blogsController");
const { default: axios } = require("axios");
const { getFormDataEmail, getUserResponse, viewResponse, checkTheClientResponse } = require("../controller/formdata");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const checkHeader = require("../middleware/checkApiAcces");
const { isAuthenticated } = require("../middleware/isAuth");
const { baseurl } = require("../constant/constant");
const { getCommonsController, getCommonsByIdController, updateCommonIdController } = require("../controller/CommonsController");

const uploadDirBlog = path.join(
  __dirname,
  "..",
  "public",
  "assets",
  "uploads",
  "blogs"
);

// for upload blog image disk
if (!fs.existsSync(uploadDirBlog)) {
  fs.mkdirSync(uploadDirBlog, { recursive: true });
  console.log("Uploads directory created:", uploadDirBlog);
}

const storageforBlog = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirBlog); // Use the absolute path to the uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});


const upload = multer({ storage: storageforBlog });

router.get("/", (req, res) => {
  return res.redirect("/admin/blogs");
});
router.get("/admin", isAuthenticated, (req, res) => {
  return res.redirect("/admin/blogs");
});

// ---------------------------------------------- Blog Routes -----------------------------------------
router.get("/admin/login", async (req, res) => {
  res.render("login");
});

// Ensure user is logged in for blogs-related routes
router.get("/admin/blogs", isAuthenticated, async (req, res) => {
  const flashInfo = req.flash("info");
  // console.log("Flash message:", flashInfo);
  return res.render("blogs/index", {
    sessionTime: req.session.uid,
    info: flashInfo.length > 0 ? flashInfo[0] : null,
  });
});

router.get("/admin/blogs/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.get(`${baseurl}/api/blogs/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.API_ACCESS_KEY}`,
      },
    });
    if (response.data.success) {
      return res.render("blogs/editBlogs", { blog: response.data.data[0] });
    } else {
      return res.render("blogs/index", { errorMessage: "Blog not found" });
    }
  } catch (error) {
    console.log("Something went wrong", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred",
        error: error.message,
      });
  }
});

router.get("/admin/blog/create", isAuthenticated, async (req, res) => {
  res.render("blogs/createBlogs");
});

// ---------------------------------------- User Response -------------------------------------
router.get("/admin/user-response", isAuthenticated, async (req, res) => {
  const flashInfo = req.flash("info");
  // console.log("Flash message:", flashInfo);
  return res.render("userDemo/user-demo", {
    sessionTime: req.session.uid,
    info: flashInfo.length > 0 ? flashInfo[0] : null,
  });
});

router.get("/admin/user-response/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.get(`${baseurl}/api/user-response/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.API_ACCESS_KEY}`,
      },
    });
    if (response.data.success) {
      return res.render("userDemo/viewRes", { res: response.data.data[0] });
    } else {
      return res.render("userDemo/viewRes", {
        errorMessage: "No response found",
      });
    }
  } catch (error) {
    console.log("Something went wrong", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred",
        error: error.message,
      });
  }
});

// Common -------------------------------------------------

router.get("/admin/common", isAuthenticated, async (req, res) => {
  const flashInfo = req.flash("info");
  return res.render("common/index", {
    sessionTime: req.session.uid,
    info: flashInfo.length > 0 ? flashInfo[0] : null,
  });
});

router.get("/admin/common/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.get(`${baseurl}/api/common/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.API_ACCESS_KEY}`,
      },
    });
    if (response.data.success) {
      return res.render("common/editBlogs", { blog: response.data.data[0] });
    } else {
      return res.render("common/index", { errorMessage: "common not found" });
    }
  } catch (error) {
    console.log("Something went wrong", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred",
        error: error.message,
      });
  }
});



// ---------------------------------------- Login API ----------------------------------------
router.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_LOGIN_EMAIL &&
    password === process.env.ADMIN_LOGIN_PASSWORD
  ) {
    req.session.uid = Date.now();
    return res.redirect("/admin/blogs");
  } else {
    return res.render("login", {
      errorMessage: "Invalid credentials, please try again.",
    });
  }
});

// ---------------------------------------- Logout API ----------------------------------------
router.get("/api/logout", (req, res) => {
  // Destroy the session and redirect to the login page
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send({
        success: false,
        message: "Error while logging out, please try again.",
      });
    }
    // Redirect to the login page after destroying the session
    return res.redirect("/admin/login");
  });
});

// ------------------------------------------------ Blog API Routes -----------------------------------

router.get("/api/blogs", checkHeader, getBlogsController);
router.get("/api/blogs/:id", checkHeader, getBlogByIdController);
router.put(
  "/api/blogs/update/:id",
  checkHeader,
  upload.single("image"),
  updateBlogIdConrtoller
);
router.post("/api/blogs/create", checkHeader, upload.single("image"), createBlogController);
router.delete("/api/blogs/delete/:id", checkHeader, deleteBlogsController)

// common ------------------------------------------------

router.get("/api/common", checkHeader, getCommonsController);
router.get("/api/common/:id", checkHeader, getCommonsByIdController);
router.put(
  "/api/common/update/:id",
  checkHeader,
  updateCommonIdController
);
router.post("/api/common/create", checkHeader, upload.single("image"), createBlogController);
router.delete("/api/common/delete/:id", checkHeader, deleteBlogsController)


// Form data routes (for user demo)
router.post("/api/post-user-enquiry", checkHeader, getFormDataEmail);
router.get("/api/user-response", checkHeader, getUserResponse);
router.get("/api/user-response/:id", checkHeader, viewResponse);



router.post("/api/blog/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  const imageUrl = `http://localhost:7080/assets/uploads/blogs/${req.file.filename}`;

  res.json({ success: true, imageUrl });
});

// -------------------------------Career ---------------------------------
module.exports = router;
