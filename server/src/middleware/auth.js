const jwt = require("jsonwebtoken");

module.exports = function auth(required = true) {
  return (req, res, next) => {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token)
      return required ? res.status(401).json({ message: "No token" }) : next();
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};
