const mongoose = require('mongoose');
const conn = require('../settings/mongodb');

const dbURL = `mongodb+srv://${conn.username}:${conn.password},1@homm.tgayvpp.mongodb.net/menu`;

async function connectToDatabase() {
  try {
    await mongoose.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Bağlantısı Başarılı!");
  } catch (error) {
    console.error("Bağlantı Hatası:", error.message);
  }
}

connectToDatabase()
  .then(() => {
    console.log("Database connection successful!");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error.message);
  });


module.exports = { connectToDatabase, mongoose };

