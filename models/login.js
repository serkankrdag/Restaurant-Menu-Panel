const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const loginSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

loginSchema.pre('save', async function (next) {
  const login = this;
  if (!login.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(login.password, salt);
    login.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

const Login = mongoose.model('Login', loginSchema);
module.exports = Login;
