const { Router } = require("express");
const jwt = require("jsonwebtoken");
const adminRouter = Router();
const { adminModel, courseModel } = require("../db/mongo");
const bcrypt = require("bcrypt");

const { InpuValidation, authAdmin } = require("../middlewares/Authentication");

require("dotenv").config();
const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
// console.log(JWT_SECRET);

adminRouter.post("/signup", InpuValidation, async function (req, res) {
  try {
    console.log("1");
    const { email, password, firstName, lastName } = req.body;
    const hashedPwd = await bcrypt.hash(password, 5);
    console.log(hashedPwd);
    const userExists = await adminModel.findOne({
      email: email,
      password: hashedPwd,
    });
    // console.log("2");
    if (userExists) {
      res.status(300).json({
        msg: "email exists",
      });
    } else {
      // console.log("hehehe");
      await adminModel.create({
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

adminRouter.post("/signin", InpuValidation, async function (req, res) {
  const { email, password } = req.body;
  try {
    const adminFound = await adminModel.findOne({ email: email });
    console.log(adminFound);
    if (adminFound) {
      const hashPwd = await bcrypt.compare(password, adminFound.password);
      console.log(hashPwd);
      if (!hashPwd) {
        res.json({ msg: "password incorrect" });
      } else {
        // console.log("jhhbddmmkmsadaskkkkkkkkkkkkkkkkkkkkkkkjjjjjjjjjjjd");
        const token = await jwt.sign({ adminId: adminFound._id }, JWT_SECRET);
        res.json({
          msg: "signin success",
          token: token,
          adminFound,
        });
      }
    }
  } catch (err) {
    res.json({ msg: err.message });
  }
});

adminRouter.post("/course", authAdmin, async function (req, res) {
  const { title, description, price, imageUrl } = req.body;
  const adminId = req.headers.id;
  try {
    const adminFound = await adminModel.findOne({ _id: adminId });
    if (adminFound) {
      const course = await courseModel.create({
        title: title,
        description: description,
        price: price,
        imageUrl: imageUrl,
        creatorId: adminId,
      });
      res.json({
        msg: "course added",
        course,
      });
    } else {
      res.json({ msg: "something went wrong" });
    }
  } catch (e) {
    res.json({ error: e.message });
  }
});

adminRouter.put("/course", authAdmin, async function (req, res) {
  try {
    // const courseId = req.courseId;
    const adminId = req.headers.id;
    const { title, description, price, imageUrl, courseId } = req.body;
    await courseModel.updateOne(
      { _id: courseId, creatorId: adminId },
      {
        title: title,
        description: description,
        price: price,
        imageUrl: imageUrl,
      }
    );
    res.json({
      message: "course updated",
      id: courseId,
    });
  } catch (error) {
    res.json({
      err: error.message,
    });
  }
});

adminRouter.get("/course/bulk", authAdmin, async function (req, res) {
  try {
    const id = req.headers.id;
    const allCourses = await courseModel.find({ creatorId: id });

    res.json({
      message: "all courses of admin",
      allCourses,
    });
  } catch (error) {
    res.json({ msg: error.message });
  }
});

module.exports = {
  adminRouter: adminRouter,
};
