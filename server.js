const express = require("express");
const db = require("./db");
require("dotenv").config();
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json()); //req.body
const PORT = process.env.PORT || 3000;

const {jwtAuthMiddleware} = require("./jwt");

// Import the router files
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

// Use the routers
app.use("/user",userRoutes);
app.use("/candidate", jwtAuthMiddleware, candidateRoutes);

app.listen(PORT, () => {
    console.log("Listening on port 3000");
});