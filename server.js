const express = require("express");
//const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { readdirSync } = require("fs");
const cors = require("cors");
const fileUpload = require("express-fileupload");


require("dotenv").config();

// import routes
//const authRoutes = require("./routes/auth");
const { connectToDB } = require("./dbConnection");

// app
const app = express();

// db
try{
    connectToDB();
    // console.log("DB CONNECTED");
}
catch{
    (err) => console.log("DB CONNECTION ERR", err)
};

// middlewares
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(cors());

// route
readdirSync("./routes").map((r) => app.use("", require("./routes/" + r)));

// port
const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Server is running on port ${port}`));