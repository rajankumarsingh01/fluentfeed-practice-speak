import mongoose, { Document, Model, Schema } from "mongoose";

// TypeScript interface describing a User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // adds createdAt automatically
  }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;