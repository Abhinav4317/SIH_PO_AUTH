import express from "express";
import dotenv from "dotenv";
import connectDb from "./database/db.js";
import cors from "cors";
dotenv.config();
const app = express();

// using middleware
app.use(express.json());
app.use(cors());

// importing routes
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // Import admin routes
import { isAuth } from "./middlewares/isAuth.js";

// using routes
app.use("/api/user", userRoutes); // User-related routes
app.use("/api/admin", adminRoutes); // Admin-related routes

app.post("/api/farmer-info",async (req, res) => {
  try {
    const { name, age, gender, occupation, annualIncome } = req.body;
    const farmerDoc = await Farmer.create({
      name,
      age,
      gender,
      occupation,
      annualIncome,
    });
    res.status(200).json(farmerDoc);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
});
// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log(`server is working on port ${process.env.PORT}`);
  connectDb(); // Connecting to the database
});
