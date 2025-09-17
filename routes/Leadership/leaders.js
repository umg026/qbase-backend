const express = require("express");
const { isAuthenticated } = require("../../middleware/isAuth");
const { default: axios } = require("axios");
const { baseurl } = require("../../constant/constant");
const checkHeader = require("../../middleware/checkApiAcces");
const {
  getLeadersController,
  createLeaderController,
  deleteLeaderController,
  getLeaderByIdController,
  updateLeaderIdConrtoller,
} = require("../../controller/leadersController");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const leaderRouter = express.Router();


const uploadDirLeaders = path.join(
  __dirname, "../../public/assets/uploads/leaders"
);

if (!fs.existsSync(uploadDirLeaders)) {
  fs.mkdirSync(uploadDirLeaders, { recursive: true });
  console.log("Uploads directory created:", uploadDirLeaders);
}

// storage create
const storageforLeaders = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirLeaders);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// multer instance
const upload = multer({ storage: storageforLeaders });

// Admin Routes --------------
leaderRouter.get("/admin/leadership", isAuthenticated, async (req, res) => {
  try {
    const response = await axios.get(baseurl + "/api/leaders", {
      headers: {
        Authorization: `Bearer ${process.env.API_ACCESS_KEY}`,
      },
    });

    if (response.data.success) {
      return res.render("leadership/index", {
        leaders: response.data.data[0],
      });
    } else {
      return res.render("leadership/index", {
        errorMessage: "No user found",
      });
    }
  } catch (error) {
    console.log("Something went wrong", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
});


leaderRouter.get("/admin/leadership/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.get(`${baseurl}/api/leaders/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.API_ACCESS_KEY}`,
      },
    });
    if (response.data.success) {
      return res.render("leadership/editLeader.ejs", { leader: response.data.data[0] });
    } else {
      return res.render("leadership/index", { errorMessage: "Leader not found" });
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

leaderRouter.get("/admin/leaders/create", isAuthenticated, async (req, res) => {
  res.render("leadership/createLeader.ejs");
});

// API ROUTES --------------

leaderRouter.get("/api/leaders", checkHeader, getLeadersController);
leaderRouter.get("/api/leaders/:id", checkHeader, getLeaderByIdController);
leaderRouter.put("/api/leaders/update/:id", checkHeader, upload.single("image"), updateLeaderIdConrtoller);
leaderRouter.post("/api/leaders/create", checkHeader, upload.single("image"), createLeaderController);
leaderRouter.delete("/api/leaders/delete/:id", checkHeader, deleteLeaderController);


module.exports = leaderRouter