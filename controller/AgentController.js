const MySqlPool = require("../connection");
const path = require("path");
const slugify = require("slugify");


// ========================
// CREATE AGENT
// ========================
exports.createAgent = async (req, res) => {
  try {
    const { name, location, duration, type, timeSlots } = req.body;
   
    const slug = slugify(name, {
      lower: true,
      strict: true
    });

    // File Uploaded?
    const imagePath = req.file
      ? `/assets/images/agents/${req.file.filename}`
      : null;

    const sql = `
      INSERT INTO agents 
      (slug, name, location, duration, image, type, timeSlots)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      slug,
      name,
      location,
      duration,
      imagePath,
      type,
      JSON.stringify(timeSlots)
    ];

    const [result] = await MySqlPool.query(sql, params);

    res.status(201).json({
      success: true,
      message: "Agent created successfully",
      agentId: result.insertId
    });
  } catch (err) {
    console.error("Create Agent Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========================
// LIST ALL AGENTS
// ========================
exports.listAgents = async (req, res) => {
  try {
    // DataTables Sends These
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const searchValue = req.query.search?.value || "";

    // 🔍 Filtering Support
    let whereCondition = "";
    if (searchValue) {
      whereCondition = `WHERE 
        name LIKE '%${searchValue}%' OR 
        location LIKE '%${searchValue}%' OR
        type LIKE '%${searchValue}%'`;
    }

    // 1️⃣ Get total record count
    const [totalRows] = await MySqlPool.query(`SELECT COUNT(*) AS total FROM agents`);
    const recordsTotal = totalRows[0].total;

    // 2️⃣ Get filtered count
    const [filteredRows] = await MySqlPool.query(
      `SELECT COUNT(*) AS total FROM agents ${whereCondition}`
    );
    const recordsFiltered = filteredRows[0].total;

    // 3️⃣ Fetch paginated + filtered data
    const [rows] = await MySqlPool.query(`
      SELECT * FROM agents 
      ${whereCondition}
      ORDER BY id DESC
      LIMIT ${length} OFFSET ${start}
    `);

    // Parse timeSlots JSON
    const agents = rows.map(agent => ({
      ...agent,
      timeSlots: agent.timeSlots ? JSON.parse(agent.timeSlots) : null
    }));

    // ✅ DataTables response format
    res.json({
      draw,
      recordsTotal,
      recordsFiltered,
      data: agents
    });

  } catch (err) {
    console.error("List Agents Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========================
// GET SINGLE AGENT (BY SLUG)
// ========================
exports.getAgent = async (req, res) => {
  try {
    const { slug } = req.params;

    const [rows] = await MySqlPool.query(
      `SELECT * FROM agents WHERE slug = ?`,
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    const agent = {
      ...rows[0],
      timeSlots: rows[0].timeSlots ? JSON.parse(rows[0].timeSlots) : null
    };

    res.json({ success: true, agent });
  } catch (err) {
    console.error("Get Agent Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========================
// UPDATE AGENT
// ========================
exports.updateAgent = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, location, duration, type, timeSlots } = req.body;

    // Image uploaded?
    const imagePath = req.file
      ? `/assets/images/agents/${req.file.filename}`
      : null;

    let sql, params;

    if (imagePath) {
      sql = `
        UPDATE agents 
        SET name = ?, location = ?, duration = ?, image = ?, type = ?, timeSlots = ?
        WHERE slug = ?
      `;
      params = [
        name,
        location,
        duration,
        imagePath,
        type,
        JSON.stringify(timeSlots),
        slug
      ];
    } else {
      sql = `
        UPDATE agents 
        SET name = ?, location = ?, duration = ?, type = ?, timeSlots = ?
        WHERE slug = ?
      `;
      params = [
        name,
        location,
        duration,
        type,
        JSON.stringify(timeSlots),
        slug
      ];
    }

    const [result] = await MySqlPool.query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    res.json({ success: true, message: "Agent updated successfully" });
  } catch (err) {
    console.error("Update Agent Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========================
// DELETE AGENT
// ========================
exports.deleteAgent = async (req, res) => {
  try {
    const { slug } = req.params;

    const [result] = await MySqlPool.query(
      `DELETE FROM agents WHERE slug = ?`,
      [slug]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    res.json({ success: true, message: "Agent deleted successfully" });
  } catch (err) {
    console.error("Delete Agent Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
