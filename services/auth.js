const jwt = require('jsonwebtoken');
let auth = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Token is not valid'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(500).json({
      success: false,
      message: 'Unauthorised request'
    });
  }
};

module.exports = {
  auth: auth
}