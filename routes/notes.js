const express = require("express");
const router = express.Router();
var fetchUser = require("../middleware/auth");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

router.get("/", fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json({ data: notes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", fetchUser, async (req, res) => {
  try {
    // check note is exist and user allowed to access it
    const note = await Notes.findOne({ user: req.user.id, _id: req.params.id });
    if (!note) {
      return res.status(404).json({ errors: "Note not found" });
    }

    res.json({ data: note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/",
  [
    body("title", "Enter valid title").trim().isLength({ min: 5 }),
    body("description").trim().isLength({ min: 5 }),
    body("tag").trim().optional(),
  ],
  fetchUser,
  async (req, res) => {
    try {
      // check validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // check user have note with same title
      const notes = await Notes.find({
        user: req.user.id,
        title: req.body.title,
      });
      if (notes.length) {
        return res.status(404).json({ errors: "Note already exists" });
      }

      // create note
      var data = {
        user: req.user.id,
        title: req.body.title,
        description: req.body.description,
      };
      if (req.body.tag) {
        data["tag"] = req.body.tag;
      }
      note = await Notes.create(data);

      res.json({ data: note });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.put(
  "/:id",
  [
    body("title", "Enter valid title").trim(),
    body("description").trim(),
    body("tag").trim(),
  ],
  fetchUser,
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      // check note is exist and user allowed to access it
      const note = await Notes.findOne({
        user: req.user.id,
        _id: req.params.id,
      });
      if (!note) {
        return res.status(404).json({ errors: "Note not found" });
      }

      // if title is not null and not same as current note title
      // then check another note is exist with same title
      if (title && note.title != title) {
        const notes = await Notes.find({
          user: req.user.id,
          _id: req.params.id,
        });
        if (notes.length) {
          return res
            .status(404)
            .json({ errors: `Another note is exists with [${title}] title` });
        }
      }

      // update note
      var newNote = {};
      if (title) {
        newNote.title = title;
      }
      if (description) {
        newNote.description = description;
      }
      if (tag) {
        newNote.tag = tag;
      }
      await Notes.updateOne({ _id: req.params.id }, newNote);

      res.json({ data: await Notes.findById(req.params.id) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.delete("/:id", fetchUser, async (req, res) => {
  try {
    // check note is exist and user allowed to access it
    const note = await Notes.findOne({ user: req.user.id, _id: req.params.id });
    if (!note) {
      return res.status(404).json({ errors: "Note not found" });
    }

    // delete note
    await note.deleteOne();
    res.json({ data: note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
