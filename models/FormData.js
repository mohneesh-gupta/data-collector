const mongoose = require("mongoose");

const formDataSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: /.+\@.+\..+/, // basic email format check
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 15,
    match: /^[0-9]+$/, // only numbers
  },
}, { timestamps: true }); // adds createdAt and updatedAt

const FormData = mongoose.model("FormData", formDataSchema); // making collection named 'formdatas'

module.exports = FormData;