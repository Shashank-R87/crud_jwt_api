const express = require('express');
const Item = require('../models/Item');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const router = express.Router();

// all routes protected
router.use(auth);

// CREATE
router.post('/', role(['admin','user']), async (req, res) => {
  const item = await Item.create({ ...req.body, createdBy: req.user.id });
  res.json(item);
});

// READ
router.get('/', role(['admin','user']), async (req, res) => {
  const items = await Item.find().populate('createdBy', 'username');
  res.json(items);
});

// UPDATE
router.put('/:id', role(['admin','user']), async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});

// DELETE *ADMIN ONLY*
router.delete('/:id', role(['admin']), async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
