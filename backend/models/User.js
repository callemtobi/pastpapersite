import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  //   username: {
  //     type: String,
  //     required: [true, "Username is required"],
  //     unique: true,
  //   },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
