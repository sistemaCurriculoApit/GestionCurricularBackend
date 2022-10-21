const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['access-token'];

  if (!token) return res.status(401).json({ "Error": "access denied!'" })

  try {
    const verify = jwt.verify(token, process.env.SECRET)
    req.user = verify;
    next()
  } catch (error) {
    res.status(401).json({ "Error": "Invalid access token" })
  }
}

module.exports = verifyToken