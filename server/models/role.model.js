import mongoose from "mongoose";

const roleSchema = mongoose.Schema(
    {
        codigo: { type: String, unique:true, required: true },
        label: { type: String, unique:true, required: true }
    },
    {
        timestamps: true,
    }
);

export const Role = mongoose.model("Role", roleSchema);