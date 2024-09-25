const express = require("express");
const { userRouter } = require("./routes/user");
const { courseRouter } = require("./routes/course");
const { adminRouter } = require("./routes/admin");
const { rateLimiter } = require("./middlewares/Authentication");
const mongoose = require("mongoose");
require("dotenv").config();
// console.log(process.env.MONGO_URL);

const app = express();
app.use(express.json());

// - Add a rate limiting middleware
app.use(rateLimiter);
app.use("/user", userRouter);
app.use("/course", courseRouter);
app.use("/admin", adminRouter);

app.get("/", (req, res) => {
  res.json({ msg: "check" });
});

app.listen(4000, async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("server started");
});
