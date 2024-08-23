import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        username: { type: String, unique:true, required: true },
        email: { type: String, unique:true, required: true },
        salt: { type: String, required: true },
        pass: { type: String, required: true },
        active: { type: Boolean, required: true },
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model("User", userSchema);