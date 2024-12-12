import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import sendMail from "../middlewares/sendMail.js";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";
import { fileURLToPath } from "url";

// Validate email format for administrative level officials
function validateAdminEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@(gov\.in|pmo\.gov\.in)$/;
  return regex.test(email);
}

// Admin Login Function
export const loginAdmin = async (req, res) => {
  try {
    const { email, empID, password } = req.body;

    // Validate email ID (assuming this is specific for administrative level users)
    // const validMail = validateAdminEmail(email);
    // if (!validMail) {
    //   return res.status(400).json({
    //     message:
    //       "Invalid Email ID. Please use the official government or PMO MailID.",
    //   });
    // }

    let admin = await Admin.findOne({ empID });
    if (!admin) {
      if (password) {
        admin = await Admin.create({
          email,
          empID,
          password,
        });
      } else {
        admin = await Admin.create({
          email,
          empID,
        });
      }
    } else {
      if (empID !== admin.empID) {
        res.status(500).json({
          message: "Employee ID does not match.",
        });
      } else if (password !== admin.password) {
        res.status(500).json({
          message: "Password does not match.",
        });
      }
    }

    const otp = Math.floor(Math.random() * 1000000);
    const verifyToken = jwt.sign({ admin, otp }, process.env.Activation_sec, {
      expiresIn: "5m",
    });
    await sendMail(email, "Admin Portal Access Verification", otp);
    res.json({
      message: "Otp sent to your mail",
      verifyToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// Verify Admin (verify OTP and create token)
export const verifyAdmin = async (req, res) => {
  try {
    const { otp, verifyToken } = req.body;

    const verify = jwt.verify(verifyToken, process.env.Activation_sec);

    if (!verify)
      return res.status(400).json({
        message: "Otp Expired",
      });

    if (verify.otp !== otp)
      return res.status(400).json({
        message: "Wrong otp",
      });

    const token = jwt.sign({ _id: verify.admin._id }, process.env.Jwt_sec, {
      expiresIn: "5d",
    });

    res.json({
      message: "Logged in successfully",
      admin: verify.admin,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// Admin Profile (to fetch details of the logged-in admin)
export const myAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    res.json(admin);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};
