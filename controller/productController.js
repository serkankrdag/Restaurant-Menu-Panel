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
    cb(null, 'product-' + uniqueSuffix + '.' + extension);
  }
});
const upload = multer({ storage: storage });

const Product = require("../models/product");
const Category = require("../models/category");

const requireLogin = (req, res, next) => {
    if (req.cookies.login) {
      return next();
    }
  
    return res.redirect("/login");
  };
  
class productController {

    constructor() {
      this.findLeafCategories = this.findLeafCategories.bind(this);
      this.productadd = this.productadd.bind(this);
      this.productedit = this.productedit.bind(this);
    }

    async findLeafCategories() {
      const allCategories = await Category.find();
      const topLevelCategoryIds = new Set(allCategories.map(category => category.top.toString()));
      const leafCategories = allCategories.filter(category => !topLevelCategoryIds.has(category._id.toString()));
      return leafCategories;
    }
  
    async productlist(req, res) {
      requireLogin(req, res, async () => {
        try {
          let products;
          const categoryId = req.query.categoryId;
    
          if (categoryId) {
            products = await Product.find({ category: categoryId });
          } else {
            products = await Product.find();
          }
    
          res.render("layout/admin", { url1: "products", url2: "list", products: products });
        } catch (err) {
          console.error(err);
          return res.status(500).send('Ürünleri listelerken bir hata oluştu.');
        }
      });
    }     
    
    async productadd(req, res) {
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

              const { name, desc, category } = req.body;

              const newProduct = new Product({ name: name, desc: desc, category: category, file: file.filename });
              await newProduct.save();

              return res.redirect('/panel');
            } else {
              const categories = await this.findLeafCategories();
              return res.render("layout/admin", { url1: "products", url2: "add", categories: categories });
            }
          } catch (err) {
            console.error(err);
            return res.status(500).send('Ürün eklenirken bir hata oluştu.');
          }
        });
      });
    }

    async productedit(req, res) {
      requireLogin(req, res, async () => {
        try {
          const productId = req.query.id;
          const product = await Product.findById(productId);
          if (!product) {
            return res.status(404).send('Düzenlenecek ürün bulunamadı.');
          }
    
          if (req.method === "POST") {
            upload.single('file')(req, res, async (err) => {
              if (err instanceof multer.MulterError) {
                return res.status(400).send('Resim yüklenirken bir hata oluştu.');
              } else if (err) {
                console.error(err);
                return res.status(500).send('Bir hata oluştu.');
              }
    
              const { name, desc, category, retainImage } = req.body;
              const file = req.file;
    
              product.name = name;
              product.desc = desc;
              product.category = category;
              
              if (file) {
                if (retainImage) {
                  fs.unlinkSync('public/images/' + product.file);
                }
                product.file = file.filename;
              }
    
              await product.save();
              res.redirect('/panel');
            });
          } else {
            const categories = await this.findLeafCategories();
            res.render("layout/admin", { url1: "products", url2: "edit", categories: categories, product: product });
          }
        } catch (err) {
          console.error(err);
          res.status(500).send('Ürün düzenlenirken bir hata oluştu.');
        }
      });
    }    

    async productdelete(req, res) {
      requireLogin(req, res, async () => {
        try {
          if (req.method === "POST") {
            const productId = req.body.productId;
    
            const product = await Product.findByIdAndDelete(productId);
            if (!product) {
              return res.status(404).send('Silinecek ürün bulunamadı.');
            }
    
            const imagePath = `public/images/${product.file}`;
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            } else {
              console.log('Ürünün resmi bulunamadı:', imagePath);
            }
    
            return res.redirect('/productlist');
          } else {
            return res.render("layout/admin", { url1: "products", url2: "edit" });
          }
        } catch (err) {
          console.error(err);
          res.status(500).send('Ürün silinirken bir hata oluştu.');
        }
      });
    }
   
}

module.exports = new productController();
