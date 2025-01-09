import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import sendMail from "../middlewares/sendMail.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const isValidPostalID = async (postalID) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const csvFilePath = path.resolve(__dirname, "../all_india_pin_code.csv");
  return new Promise((resolve, reject) => {
    let isValid = false;
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on("data", (row) => {
        if (row.pincode && row.pincode.trim() === postalID) {
          isValid = true;
        }
      })
      .on("end", () => {
        resolve(isValid);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};
function validateIndiapostEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@indiapost\.gov\.in$/;
  return regex.test(email);
}
export const loginUser = async (req, res) => {
  try {
    const { email, postalID, password, postOfficeName, empID } = req.body;

    // Validate postalID
    const postalIDExists = await isValidPostalID(postalID);
    if (!postalIDExists) {
      return res.status(400).json({
        message: "Invalid Postal ID. Please enter a valid Postal ID.",
      });
    }
    // const validMail = validateIndiapostEmail(email);
    // if (!validMail) {
    //   return res.status(400).json({
    //     message:
    //       "Invalid Email ID. Please use the allotted official government MailID.",
    //   });
    // }

    let user = await User.findOne({ postalID });
    if (!user) {
      if (password) {
        const hashedPassword=await bcrypt.hash(password,10);
        user = await User.create({
          email,
          postalID,
          password:hashedPassword,
          postOfficeName,
          empID,
        });
      } else {
        user = await User.create({
          email,
          postalID,
          postOfficeName,
          empID,
        });
      }
    } else {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (empID !== user.empID) {
        res.status(500).json({
          message: "Employee ID does not match for given Email ID",
        });
      } else if (postOfficeName !== user.postOfficeName) {
        res.status(500).json({
          message: "Post Office Name does not match for given Email ID",
        });
      } else if (!passwordMatch) {
        res.status(500).json({
          message: "Password does not match for given Email ID",
        });
      }
    }
    const otp = Math.floor(Math.random() * 1000000);
    const verifyToken = jwt.sign({ user, otp }, process.env.Activation_sec, {
      expiresIn: "5m",
    });
    await sendMail(email, "Post Office Scheme Analysis", otp);
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

export const verifyUser = async (req, res) => {
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

    const token = jwt.sign({ _id: verify.user._id }, process.env.Jwt_sec, {
      expiresIn: "5d",
    });

    res.json({
      message: "Logged in successfully",
      user: verify.user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};
