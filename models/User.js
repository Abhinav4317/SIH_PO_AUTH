import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    postalID: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    postOfficeName: {
      type: String,
      required: true,
      unique:true,
    },
    empID:{
      type:String,
      required:true,
      unique:true
    }
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", schema);
