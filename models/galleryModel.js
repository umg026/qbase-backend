const MySqlPool = require("../connection");

const getAllGalleryImages = async (searchValue, start, length, orderByColumn, orderDir) => {
    // Fetch total records
    const [totalRecordsResult] = await MySqlPool.query('SELECT COUNT(*) AS total FROM gallery');
    const totalRecords = totalRecordsResult[0].total;

    // Get filtered records count and data
    const [filteredRecordsResult] = await MySqlPool.query(
        `SELECT COUNT(*) AS total FROM gallery WHERE tag LIKE ?`,
        [`%${searchValue}%`]
    );
    const filteredRecords = filteredRecordsResult[0].total;

    // Fetch the paginated and filtered data
    const [data] = await MySqlPool.query(
        `SELECT * FROM gallery WHERE tag LIKE ? 
         ORDER BY ${orderByColumn} ${orderDir}
         LIMIT ?, ?`,
        [`%${searchValue}%`, start, length]
    );

    return { totalRecords, filteredRecords, data };
};

const createGalleryInstance = async (tag, imagePath, is_deleted) => {
    const [result] = await MySqlPool.query(
        `INSERT INTO gallery (tag, img_url, is_deleted) VALUES (?, ?, ?)`,
        [tag, imagePath, is_deleted]
    );
    return result.insertId;  // Return the inserted gallery ID
};


const getGalleryImageByID = async (id) => {
    const [result] = await MySqlPool.query(`SELECT img_url FROM gallery WHERE id = ?`, [id]);
    return result[0]; // Ensure it returns the first result in case of multiple rows
};

const deleteGalleryImageById = async (id) => {
    const [result] = await MySqlPool.query(`DELETE FROM gallery WHERE id = ?`, [id]);
    return result.affectedRows > 0;
};

module.exports = {
    getAllGalleryImages,
    createGalleryInstance,
    deleteGalleryImageById,
    getGalleryImageByID
};
