var jwt = require("jsonwebtoken");
const JWT_SECRET = "nikunjjaykishorjoshi";

const fetchUser = (req, res, next) => {
  try {
    const accessToken = req.header("access_token");
    if (!accessToken) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const data = jwt.verify(accessToken, JWT_SECRET);
    req.user = data.user;

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: error.message });
  }
};

module.exports = fetchUser;
