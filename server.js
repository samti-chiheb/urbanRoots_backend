require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const credentials = require("./middleware/credentials");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const corsOptions = require("./config/corsOptions");
const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 3500;

connectDB();

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/user", require("./routes/userRoutes"));
app.use("/forum", require("./routes/formRoutes"));
app.use("/forum/category", require("./routes/formCategoryRoutes"));
app.use("/post", require("./routes/forumPostRoutes"));

mongoose.connection.once("open", () => {
  console.log("Connected to mangoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
