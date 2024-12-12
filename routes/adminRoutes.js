import express from "express";
import { isAdminAuth } from "../middlewares/isAdminAuth.js"; // The new isAdminAuth middleware
import {
  loginAdmin,
  verifyAdmin,
  myAdminProfile,
} from "../controllers/admin.controller.js"; // The admin controller file we created
const router = express.Router();

// Route to login an admin
router.post("/login", loginAdmin);

// Route to verify the OTP for an admin
router.post("/verify", verifyAdmin);

// Route to get the profile of the logged-in admin (protected by isAdminAuth middleware)
router.get("/me", isAdminAuth, myAdminProfile);

export default router;
