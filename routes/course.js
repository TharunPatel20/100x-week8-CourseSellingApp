const { Router } = require("express");
const courseRouter = Router();

const { userModel, purchaseModel, courseModel } = require("../db/mongo");
const { authUser } = require("../middlewares/Authentication");

courseRouter.post("/purchase", authUser, async function (req, res) {
  // you would expect the user to pay you money
  const { courseId, userId } = req.body;
  try {
    const courseFound = await courseModel.findOne({ _id: courseId });
    if (courseFound) {
      const courseBought = await purchaseModel.findOne({
        userId,
        courseId,
      });
      if (courseBought) {
        res.json({ course: "exist already" });
      } else {
        const data = await purchaseModel.create({
          userId: userId,
          courseId: courseId,
        });
        res.json({
          msg: "course added",
          data,
        });
      }
    } else if (!courseFound) {
      res.json({ msg: "course not found" });
    }
  } catch (error) {
    res.json({
      error: error.message,
    });
  }
});

courseRouter.get("/preview", async function (req, res) {
  try {
    const courses = await courseModel.find();
    res.json(courses);
  } catch (e) {
    res.json({ error: e.message });
  }
});

module.exports = {
  courseRouter: courseRouter,
};
