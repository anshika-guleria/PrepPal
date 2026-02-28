import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      trim: true,
      default: "",
    },

    type: {
      type: String,
      enum: ["text", "attachment", "call"],
      default: "text",
    },

    callLink: {
      type: String,
    },

    attachment: {
      url: { type: String },
      type: { type: String },
      publicId: { type: String },
    },
  },
  { timestamps: true }
);

// 🔥 THIS WAS MISSING
const Message = mongoose.model("Message", messageSchema);

export default Message;