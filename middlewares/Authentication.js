const { z } = require("zod");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// const userSecret = process.env.USER_JWT_SECRET;
// const adminSecret = process.env.ADMIN_JWT_SECRET;
function InpuValidation(req, res, next) {
  const { email, password, firstName, lastName } = req.body;
  const validatedSchema = z.object({
    firstName: z.string().min(3),
    lastName: z.string().min(3),
    email: z.string().email().min(5),
    password: z.string().min(6).max(12),
  });
  try {
    validatedSchema.parse({ firstName, lastName, email, password });
    next();
  } catch (error) {
    res.json({ msg: "invalid input" });
  }
}

async function authAdmin(req, res, next) {
  try {
    const token = req.headers.token;
    const success = await jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    console.log("admin token : " + token);
    if (success) {
      next();
    } else {
      res.json({ msg: "invalid token" });
    }
  } catch (error) {
    res.json({ msg: error.message });
  }
}
async function authUser(req, res, next) {
  try {
    const token = req.headers.token;
    const success = await jwt.verify(token, process.env.USER_JWT_SECRET);
    console.log("user token : " + token);
    if (success) {
      next();
    } else {
      res.json({ msg: "invalid token" });
    }
  } catch (error) {
    res.json({ msg: error.message });
  }
}
module.exports = { InpuValidation, authAdmin, authUser };
