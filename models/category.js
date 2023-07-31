const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  desc: { type: String, required: true },
  top: { type: String, required: true }, 
  file: { type: String },
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
