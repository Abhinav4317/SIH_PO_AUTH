import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    occupation: {
      type: String,
      required: true,
    },
    annualIncome: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Farmer = mongoose.model("Farmer", schema);
