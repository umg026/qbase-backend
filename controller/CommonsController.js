const MySqlPool = require("../connection");

// Get all commons
async function getCommonsController(req, res) {
    try {
        let { draw, start, length, search, order } = req.query;

        start = parseInt(start) || 0;
        length = parseInt(length) || 10;

        const searchValue = search?.value || '';
        const orderColumn = order ? parseInt(order[0].column) : 0;
        const orderDir = order ? order[0].dir : 'desc';

        const columns = ["id", "email", "phone", "employer_sponsored_visa_range", "visitor_visa_range", "graduate_visa_range"];
        const orderByColumn = columns[orderColumn] || 'id';

        // Get total number of records
        const [totalRecordsResult] = await MySqlPool.query('SELECT COUNT(*) AS total FROM commons');
        const totalRecords = totalRecordsResult[0].total;

        // Get filtered records based on search
        const [filteredRecordsResult] = await MySqlPool.query(
            `SELECT COUNT(*) AS total FROM commons WHERE email LIKE ? OR phone LIKE ?`,
            [`%${searchValue}%`, `%${searchValue}%`]
        );
        const filteredRecords = filteredRecordsResult[0].total;

        // Get data with pagination
        const [data] = await MySqlPool.query(
            `SELECT * FROM commons WHERE email LIKE ? OR phone LIKE ? 
             ORDER BY ${orderByColumn} ${orderDir}
             LIMIT ?, ?`,
            [`%${searchValue}%`, `%${searchValue}%`, start, length]
        );

        res.status(200).json({
            draw: parseInt(draw),
            recordsTotal: totalRecords,
            recordsFiltered: filteredRecords,
            data: data
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error getting commons",
            error
        });
    }
}

// Get a single common entry by ID
async function getCommonsByIdController(req, res) {
    try {
        const id = req?.params?.id;

        const [data] = await MySqlPool.query(`SELECT * FROM commons WHERE id = ?`, [id]);

        if (data.length === 0) {
            return res.status(404).send({
                success: false,
                message: "Data not found by id",
            });
        }

        res.status(200).send({
            success: true,
            message: "Data fetched successfully",
            data: data[0]
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error fetching data by id",
            error
        });
    }
}

// Create a new common entry
async function createCommonController(req, res) {
    try {
        const { email, phone, employer_sponsored_visa_range, visitor_visa_range, graduate_visa_range } = req.body;

        // Check if all required fields are provided
        if (!email || !phone) {
            return res.status(400).send({
                success: false,
                message: "Email and Phone are required",
                body: req.body,
            });
        }

        const dataInsert = await MySqlPool.query(
            `INSERT INTO commons (email, phone, employer_sponsored_visa_range, visitor_visa_range, graduate_visa_range) 
            VALUES (?, ?, ?, ?, ?)`,
            [email, phone, employer_sponsored_visa_range, visitor_visa_range, graduate_visa_range]
        );

        if (!dataInsert) {
            return res.status(400).send({
                success: false,
                message: "Failed to insert common data",
            });
        }

        return res.status(200).json({ success: true, message: 'Data Created Successfully!' });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error creating common data",
            error,
        });
    }
}

// Update a common entry by ID
async function updateCommonIdController(req, res) {
    try {
        const id = req.params.id;

        const { email, phone, employer_sponsored_visa_range, visitor_visa_range, graduate_visa_range } = req.body;

        // Update query for commons table
        let query = `UPDATE commons SET email = ?, phone = ?, employer_sponsored_visa_range = ?, visitor_visa_range = ?, graduate_visa_range = ? WHERE id = ?`;
        const queryParams = [email, phone, employer_sponsored_visa_range, visitor_visa_range, graduate_visa_range, id];

        const dataInsert = await MySqlPool.query(query, queryParams);

        if (!dataInsert) {
            return res.status(400).send({
                success: false,
                message: "Failed to update common data",
            });
        }

        return res.status(200).json({ success: true, message: 'Data Updated Successfully!' });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error updating common data",
            error
        });
    }
}

module.exports = { createCommonController, getCommonsByIdController, updateCommonIdController, getCommonsController };
