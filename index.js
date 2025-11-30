const express = require("express")
const path = require("path");
const router = require("./routes/routes");
const MySqlPool = require("./connection");
const PORT = process.env.PORT
const cors = require('cors');
const app = express();
const methodOverride = require("method-override");
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();
const controller = require("./controller/AgentController");
const upload = require("./middleware/agentUpload");
const checkHeader = require("./middleware/checkApiAcces");
const { isAuthenticated } = require("./middleware/isAuth");
const { baseurl } = require("./constant/constant");
const { default: axios } = require("axios");

app.use(express.static(path.join(__dirname, "public")));
// set the ejs view engine
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))


//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
}));
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(flash());


// app.get("/",(req,res)=>{
//     res.end("hello from nodejs")
// })
app.use("/", router)


// ================================
// LIST ALL AGENTS
// ================================
app.get("/admin/agents", isAuthenticated, async (req, res) => {
    const flashInfo = req.flash("info");

    try {
        const response = await axios.get(`${baseurl}/agents/list`, {
            headers: {
                Authorization: `Bearer ${process.env.API_ACCESS_KEY}`,
            },
        });

        return res.render("agents/index", {
            agents: response.data.agents,
            sessionTime: req.session.uid,
            info: flashInfo.length > 0 ? flashInfo[0] : null,
        });
    } catch (error) {
        console.log("Error loading agents:", error);
        return res.render("agents/index", { agents: [], errorMessage: "Failed to load agents" });
    }
});

// ================================
// CREATE AGENT - PAGE
// ================================
app.get("/admin/agents/create", isAuthenticated, async (req, res) => {
    return res.render("agents/createAgent");
});

// ================================
// CREATE AGENT - SUBMIT FORM
// ================================
app.post("/admin/agents/create", isAuthenticated, async (req, res) => {
    try {
        const formData = req.body;

        const response = await axios.post(`${baseurl}/agents/create`, formData, {
            headers: {
                Authorization: `Bearer ${process.env.API_ACCESS_KEY}`,
            },
        });

        if (response.data.success) {
            req.flash("info", "Agent created successfully!");
            return res.redirect("/admin/agents");
        }

        req.flash("info", "Failed to create agent");
        return res.redirect("/admin/agents/create");

    } catch (error) {
        console.log("Create Agent Error:", error);
        req.flash("info", "Something went wrong");
        return res.redirect("/admin/agents/create");
    }
});

// ================================
// EDIT AGENT PAGE
// ================================
app.get("/admin/agents/:slug", isAuthenticated, async (req, res) => {
    try {
        const slug = req.params.slug;

        const response = await axios.get(`${baseurl}/agents/${slug}`, {
            headers: {
                Authorization: `Bearer ${process.env.API_ACCESS_KEY}`,
            },
        });

        if (response.data.success) {
            return res.render("agents/editAgent", {
                agent: response.data.agent,
            });
        }

        return res.render("agents/index", { errorMessage: "Agent not found" });

    } catch (error) {
        console.log("Get Agent Error:", error);
        return res.render("agents/index", { errorMessage: "Error while loading agent" });
    }
});

// ================================
// UPDATE AGENT - SUBMIT FORM
// ================================
app.post("/admin/agents/update/:slug", isAuthenticated, async (req, res) => {
    try {
        const slug = req.params.slug;

        const response = await axios.put(
            `${baseurl}/api/agents/${slug}`,
            req.body,
            {
                headers: {
                    Authorization: `Bearer ${process.env.API_ACCESS_KEY}`,
                },
            }
        );

        if (response.data.success) {
            req.flash("info", "Agent updated successfully");
            return res.redirect("/admin/agents");
        }

        req.flash("info", "Failed to update agent");
        return res.redirect(`/admin/agents/${slug}`);

    } catch (error) {
        console.log("Update Agent Error:", error);
        req.flash("info", "Something went wrong");
        return res.redirect(`/admin/agents/${slug}`);
    }
});


// Agenst API Routes
app.post("/agents/create", upload.single("image"), controller.createAgent);
app.get("/agents/list", controller.listAgents);
app.get("/agents/:slug", controller.getAgent);
app.put("/agents/:slug", upload.single("image"), controller.updateAgent);
app.delete("/agents/:slug", controller.deleteAgent);

// DB connection and server connection
MySqlPool.query('SELECT 1').then(() => {
    console.log("MySql Connected");
    // If sql connect then this line execute
    app.listen(PORT, () => {
        // console.table(getEndpoints(app));
        console.log(`server started at http://localhost:${PORT}`)
    })
})
    .catch((err) => console.log("error on start", err))
