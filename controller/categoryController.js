const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.mimetype.split('/')[1];
    cb(null, 'category-' + uniqueSuffix + '.' + extension);
  }
});
const upload = multer({ storage: storage });

const Category = require("../models/category");

const requireLogin = (req, res, next) => {
    if (req.cookies.login) {
      return next();
    }
  
    return res.redirect("/login");
  };
  
  class categoryController {
  
    async categorylist(req, res) {
      requireLogin(req, res, async () => {
        try {
          let categories;
    
          if (req.query.top !== undefined) {
            categories = await Category.find({ top: req.query.top });
          } else {
            categories = await Category.find({ top: 0 });
          }
    
          if (categories.length === 0) {
            return res.redirect("/productlist" + (req.query.top ? "?categoryId=" + req.query.top : ""));
          }
    
          res.render("layout/admin", { url1: "category", url2: "list", categories: categories });
        } catch (err) {
          console.error(err);
          res.status(500).send('Kategorileri alırken bir hata oluştu.');
        }
      });
    }
    
    
    async categoryadd(req, res) {
      requireLogin(req, res, async () => {
        upload.single('file')(req, res, async (err) => {
          if (err instanceof multer.MulterError) {
            return res.status(400).send('Resim yüklenirken bir hata oluştu.');
          } else if (err) {
            console.error(err);
            return res.status(500).send('Bir hata oluştu.');
          }
    
          try {
            if (req.method === "POST") {
              const file = req.file;
              if (!file) {
                return res.status(400).send('Lütfen bir resim dosyası yükleyin.');
              }
    
              const { name, desc, top } = req.body;
    
              const newCategory = new Category({ name: name, desc: desc, top: top, file: file.filename });
              await newCategory.save();
    
              return res.redirect('/panel');
            } else {
              const categories = await Category.find();
              return res.render("layout/admin", { url1: "category", url2: "add", categories: categories });
            }
          } catch (err) {
            console.error(err);
            return res.status(500).send('Kategori eklenirken bir hata oluştu.');
          }
        });
      });
    }
  
    async categoryedit(req, res) {
      requireLogin(req, res, async () => {
        try {
          const categoryId = req.query.id;
          const category = await Category.findById(categoryId);
          if (!category) {
            return res.status(404).send('Düzenlenecek kategori bulunamadı.');
          }
    
          if (req.method === "POST") {
            upload.single('file')(req, res, async (err) => {
              if (err instanceof multer.MulterError) {
                return res.status(400).send('Resim yüklenirken bir hata oluştu.');
              } else if (err) {
                console.error(err);
                return res.status(500).send('Bir hata oluştu.');
              }
    
              const { name, desc, top } = req.body;
              const file = req.file;
    
              category.name = name;
              category.desc = desc;
              category.top = top;
              if (file) {
                category.file = file.filename;
              }
    
              await category.save();
              res.redirect('/panel');
            });
          } else {
            const categories = await Category.find();
            res.render("layout/admin", { url1: "category", url2: "edit", categories: categories, category: category });
          }
        } catch (err) {
          console.error(err);
          res.status(500).send('Kategori düzenlenirken bir hata oluştu.');
        }
      });
    }

    async categorydelete(req, res) {
      requireLogin(req, res, async () => {
        try {
          if (req.method === "POST") {
            const categoryId = req.body.categoryId;
  
            const category = await Category.findByIdAndDelete(categoryId);
            if (!category) {
              return res.status(404).send('Silinecek kategori bulunamadı.');
            }
  
            const imagePath = `public/images/${category.file}`;
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            } else {
              console.log('Kategorinin resmi bulunamadı:', imagePath);
            }
  
            return res.redirect('/categorylist');
          } else {
            return res.render("layout/admin", { url1: "category", url2: "edit" });
          }
        } catch (err) {
          console.error(err);
          res.status(500).send('Kategori silinirken bir hata oluştu.');
        }
      });
    }
     
  }
  
  module.exports = new categoryController();
  