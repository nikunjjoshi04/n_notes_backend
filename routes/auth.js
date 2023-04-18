const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

router.post(
  "/create-users",
  [
    body("name", "Enater valid name").isLength({ min: 5 }).trim(),
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
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      return res.json(user);
    } catch (error) {
      res.status(500).json({ errro: error.message });
    }
  }
);

module.exports = router;
