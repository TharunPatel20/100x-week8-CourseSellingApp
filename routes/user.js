const { Router } = require("express");
const bcrypt = require("bcrypt");
require("dotenv").config();
const userRouter = Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.USER_JWT_SECRET;

const { userModel, courseModel, purchaseModel } = require("../db/mongo");

const { InpuValidation, authUser } = require("../middlewares/Authentication");

userRouter.post("/signup", InpuValidation, async function (req, res) {
  try {
    // console.log("1");
    const { email, password, firstName, lastName } = req.body;
    const hashedPwd = await bcrypt.hash(password, 5);
    // console.log(hashedPwd);
    const userExists = await userModel.findOne({
      email: email,
    });
    // console.log("2");
    if (userExists) {
      res.status(300).json({
        msg: "email exists",
      });
    } else {
      // console.log("hehehe");
      await userModel.create({
        email: email,
        password: hashedPwd,
        firstName: firstName,
        lastName: lastName,
      });
      res.json({ msg: "signup sucessful" });
    }
  } catch (err) {
    res.json({ msg: err.message });
  }
});

userRouter.post("/signin", InpuValidation, async function (req, res) {
  const { email, password } = req.body;
  try {
    const userFound = await userModel.findOne({ email: email });
    // console.log(userFound);
    if (userFound) {
      const hashPwd = await bcrypt.compare(password, userFound.password);
      // console.log(hashPwd);
      if (!hashPwd) {
        res.json({ msg: "password incorrect" });
      } else {
        const token = await jwt.sign({ userId: userFound._id }, JWT_SECRET);
        res.json({
          msg: "signin success",
          token: token,
        });
      }
    }
  } catch (err) {
    res.json({ msg: err.message });
  }
});

userRouter.get("/purchases", authUser, async function (req, res) {
  const userId = req.body.userId;

  try {
    const userPurchases = await purchaseModel.find({ userId: userId });
    let courseIds = [];
    for (let i = 0; i < userPurchases.length; i++) {
      courseIds.push(userPurchases[i].courseId);
    }
    const courses = await courseModel.find({
      _id: { $in: courseIds },
    });
    res.json({ "user purchased courses ": courses });
  } catch (e) {
    error: e.message;
  }
});

module.exports = {
  userRouter: userRouter,
};
