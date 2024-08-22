import mongoose from "mongoose";

const chatSchema = mongoose.Schema(
    {
        who: {
            userId: { type: String, required: true },
            username: { type: String, required: true },
        },
        when: { type: Date, required: true },
        what: {
            type: {
                type: String,
                required: true,
            },
            content: { type: String, required: true },
        },
    },
    {
        timestamps: true,
    }
);

export const Chat = mongoose.model("Chat", chatSchema);