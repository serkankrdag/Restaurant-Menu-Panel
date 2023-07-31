const { connectToDatabase, mongoose } = require('./config/database/conn');
const http = require("http");
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const routes = require('./routes/routes');

app.use(express.static('public'));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extanded: false }));
app.use('/', routes); 

app.listen(8000, function() {
    console.log("Uygulama 8000 Portundan Başlatıldı");
});