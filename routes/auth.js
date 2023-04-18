const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
var fetchUser = require("../middleware/auth");
var jwt = require("jsonwebtoken");
const JWT_SECRET = "nikunjjaykishorjoshi";

router.post(
  "/create-users",
  [
    body("name", "Enter valid name").isLength({ min: 5 }).trim(),
    body("email")
      .isEmail()
      .custom(async (value) => {
        if (await User.findOne({ email: value })) {
          throw new Error("User already exists");
        }
      }),
    body("password").trim().isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      var salt = await bcrypt.genSalt(10);
      var hash = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash,
      });
      return res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/login",
  [
    body("email").trim().isEmail(),
    body("password").trim().isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // check user is exists
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({ errors: "User not found" });
      }

      // compare passwords
      const passwordCompare = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!passwordCompare) {
        return res.status(401).json({ errors: "Enter valid credentials" });
      }

      // sign and return jwt token
      const data = { user: { id: user.id } };
      const accessToken = jwt.sign(data, JWT_SECRET);
      res.json({ access_token: accessToken, type: "bearer" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/me", fetchUser, async (req, res) => {
  try {
    // get user
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ errors: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
