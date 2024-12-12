import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";

export const isAdminAuth = async (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token)
      return res.status(403).json({
        message: "Please login as admin",
      });

    const decode = jwt.verify(token, process.env.Jwt_sec);

    req.admin = await Admin.findById(decode._id);

    if (!req.admin)
      return res.status(403).json({
        message: "Admin not found",
      });

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Login First",
    });
  }
};
