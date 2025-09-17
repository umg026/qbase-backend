const checkHeader = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    if (token === process.env.API_ACCESS_KEY) {
      return next();
    }
  }

  res.status(403).json({ message: 'Forbidden: Invalid or missing token' });
};

module.exports = checkHeader;
