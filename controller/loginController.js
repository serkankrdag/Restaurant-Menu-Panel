const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Login = require("../models/login");

class loginController {
  async login(req, res) {
    if (req.method === "POST") {
      const { username, password } = req.body;

      try {
        const login = await Login.findOne({ username });
        if (!login) {
          return res.status(401).json({ error: 'Kullanıcı bulunamadı.' });
        }

        const isPasswordValid = await bcrypt.compare(password, login.password);
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Geçersiz şifre.' });
        }

        const generateSecretKey = () => {
            return crypto.randomBytes(32).toString('hex');
          };
          
          const secretKey = generateSecretKey();

        const token = jwt.sign({ userId: login._id }, secretKey, { expiresIn: '1h' });
        res.cookie('login', login._id, { maxAge: 3600000, httpOnly: true });
        res.redirect("/panel");
      } catch (error) {
        res.status(500).json({ error: 'Giriş işlemi sırasında bir hata oluştu.' });
      }
    } else {
      res.render("admin/auth/login");
    }
  }

  async register(req, res) {
    if (req.method === "POST") {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      try {
        const login = new Login({ username, password });
        await login.save();
        res.status(201).json({ message: 'Kayıt başarıyla tamamlandı.' });
      } catch (error) {
        res.status(500).json({ error: 'Kayıt işlemi sırasında bir hata oluştu.' });
      }
    } else {
      res.render("admin/auth/register");
    }
  }
}

module.exports = new loginController();
