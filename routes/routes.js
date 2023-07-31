const express = require('express');
const router = express.Router();

const loginController = require('../controller/loginController');
const categoryController = require('../controller/categoryController');
const productController = require('../controller/productController');

router.use('/login', loginController.login);
router.use('/register', loginController.register);

router.use('/categorylist', categoryController.categorylist);
router.use('/categoryadd', categoryController.categoryadd);
router.use('/categoryedit', categoryController.categoryedit);
router.post("/categorydelete", categoryController.categorydelete);

router.use('/productlist', productController.productlist);
router.use('/productadd', productController.productadd);
router.use('/productedit', productController.productedit);
router.post("/productdelete", productController.productdelete);

router.get('/', (req, res) => {
  res.render("layout/site", { url1: "", url2: "home" });
});

router.get('/panel', (req, res) => {
  res.render("layout/admin", { url1: "", url2: "home" });
});

router.get('/logout', (req, res) => {
  res.clearCookie('login');
  res.redirect('/login');
});

module.exports = router;
