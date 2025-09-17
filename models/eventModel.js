const MySqlPool = require("../connection");

const getAllEvents = async (searchValue, start, length, orderByColumn, orderDir) => {
    // Fetch total records
    const [totalRecordsResult] = await MySqlPool.query('SELECT COUNT(*) AS total FROM events');
    const totalRecords = totalRecordsResult[0].total;

    // Get filtered records count and data
    const [filteredRecordsResult] = await MySqlPool.query(
        `SELECT COUNT(*) AS total FROM events WHERE title LIKE ? OR description LIKE ?`,
        [`%${searchValue}%`, `%${searchValue}%`]
    );
    const filteredRecords = filteredRecordsResult[0].total;

    // Fetch the paginated and filtered data
    const [data] = await MySqlPool.query(
        `SELECT * FROM events WHERE title LIKE ? OR slug LIKE ? 
         ORDER BY ${orderByColumn} ${orderDir}
         LIMIT ?, ?`,
        [`%${searchValue}%`, `%${searchValue}%`, start, length]
    );

    return { totalRecords, filteredRecords, data };
};

const getEventById = async (id) => {
    const [data] = await MySqlPool.query(`SELECT * FROM events WHERE ID = ?`, [id]);
    return data[0] || null;
};

const createEvent = async (title, slug,sub_header, description, status, image, tags,publish_at) => {
    const [result] = await MySqlPool.query(
        `INSERT INTO events (title, slug,sub_header, description, status, image, tags, publish_at) VALUES (?, ?,?, ?, ?, ?, ?, ?)`,
        [title, slug, sub_header, description, status, image, tags,publish_at]
    );
    return result.insertId;  // Return the inserted event ID
};

const updateEventById = async (id, title,sub_header, description, status, tags, imagePath, publish_at) => {
    let query = `UPDATE events SET title = ?,sub_header = ?, description = ?, status = ?, tags = ?`;
    const params = [title,sub_header, description, status, tags];

    // Include the imagePath if provided
    if (imagePath) {
        query += `, image = ?`;
        params.push(imagePath);
    }

    // Include the published_at field if it's provided
    if (publish_at) {
        query += `, publish_at = ?`;
        params.push(publish_at);
    }

    query += ` WHERE ID = ?`;
    params.push(id);

    const [result] = await MySqlPool.query(query, params);

    // Logging to verify update success
    // console.log("Update result:", result);
    return result.affectedRows > 0;
};


const deleteEventById = async (id) => {
    const [result] = await MySqlPool.query(`DELETE FROM events WHERE id = ?`, [id]);
    return result.affectedRows > 0;
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEventById,
    deleteEventById,
};
