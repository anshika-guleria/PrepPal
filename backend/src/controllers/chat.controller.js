import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import FriendRequest from "../models/FriendRequest.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { getIO } from "../socket/socket.js";

/* =======================
   FRIEND REQUESTS
======================= */

// SEND FRIEND REQUEST
export const sendFriendRequest = async (req, res) => {
  try {
    const from = req.userId;
    const { toUserId } = req.body;

    console.log("[DEBUG] sendFriendRequest called:", { from, toUserId });

    if (!toUserId)
      return res.status(400).json({ message: "toUserId is required" });

    if (from.toString() === toUserId)
      return res.status(400).json({ message: "Cannot add yourself" });

    // Check user exists
    const targetUser = await User.findById(toUserId);
    if (!targetUser) {
      console.log("[DEBUG] Target user not found:", toUserId);
      return res.status(404).json({ message: "User not found" });
    }

    // Already friends?
    const alreadyFriends = await User.findOne({
      _id: from,
      friends: toUserId,
    });

    if (alreadyFriends) {
      console.log("[DEBUG] Already friends:", from, toUserId);
      return res.status(400).json({ message: "Already friends" });
    }

    // CHECK REVERSE REQUEST
    const reverseRequest = await FriendRequest.findOne({
      from: toUserId,
      to: from,
      status: "pending",
    });

    if (reverseRequest) {
      console.log("[DEBUG] Reverse request found. Auto-accepting");
      await User.findByIdAndUpdate(from, { $addToSet: { friends: toUserId } });
      await User.findByIdAndUpdate(toUserId, { $addToSet: { friends: from } });

      reverseRequest.status = "accepted";
      await reverseRequest.save();

      const io = getIO();
      io.to(toUserId.toString()).emit("friendRequestAccepted", { userId: from });

      return res.status(200).json({ message: "Friend request accepted automatically" });
    }

    // Check already sent request
    const alreadyRequested = await FriendRequest.findOne({
      from,
      to: toUserId,
      status: "pending",
    });

    if (alreadyRequested) {
      console.log("[DEBUG] Request already sent:", from, toUserId);
      return res.status(400).json({ message: "Request already sent" });
    }

    // Create new request
    const request = await FriendRequest.create({
      from,
      to: toUserId,
      status: "pending",
    });

    console.log("[DEBUG] Friend request created:", request._id);

    const io = getIO();
    io.to(toUserId.toString()).emit("friendRequest", request);

    res.status(201).json({ message: "Friend request sent" });
  } catch (err) {
    console.error("[ERROR] sendFriendRequest:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Request already sent" });
    }
    res.status(500).json({ message: "Failed to send friend request" });
  }
};

// ACCEPT FRIEND REQUEST
export const acceptFriendRequest = async (req, res) => {
  try {
    const myId = req.userId;
    const { requestId } = req.body;

    console.log("[DEBUG] acceptFriendRequest called:", { myId, requestId });

    if (!requestId)
      return res.status(400).json({ message: "requestId is required" });

    const request = await FriendRequest.findOne({
      _id: requestId,
      to: myId,
      status: "pending",
    });

    if (!request) {
      console.log("[DEBUG] Friend request not found:", requestId);
      return res.status(404).json({ message: "Request not found" });
    }

    const senderId = request.from;

    await User.findByIdAndUpdate(myId, { $addToSet: { friends: senderId } });
    await User.findByIdAndUpdate(senderId, { $addToSet: { friends: myId } });

    request.status = "accepted";
    await request.save();

    const io = getIO();
    io.to(senderId.toString()).emit("friendRequestAccepted", { userId: myId });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (err) {
    console.error("[ERROR] acceptFriendRequest:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// REJECT FRIEND REQUEST
export const rejectFriendRequest = async (req, res) => {
  try {
    const myId = req.userId;
    const { requestId } = req.body;

    console.log("[DEBUG] rejectFriendRequest called:", { myId, requestId });

    if (!requestId)
      return res.status(400).json({ message: "requestId is required" });

    const request = await FriendRequest.findOneAndDelete({
      _id: requestId,
      to: myId,
      status: "pending",
    });

    if (!request) {
      console.log("[DEBUG] Friend request not found for rejection:", requestId);
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ message: "Friend request rejected" });
  } catch (err) {
    console.error("[ERROR] rejectFriendRequest:", err);
    res.status(500).json({ message: "Failed to reject request" });
  }
};

/* =======================
   MESSAGING
======================= */

// SEND MESSAGE
// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const {
      receiverId,
      text = "",
      type = "text",
      callLink = "",
      attachmentBase64,
      attachmentType,
    } = req.body;

    console.log("[DEBUG] sendMessage called:", { senderId, receiverId, type });

    if (!receiverId)
      return res.status(400).json({ message: "Receiver required" });

    if (!mongoose.Types.ObjectId.isValid(receiverId))
      return res.status(400).json({ message: "Invalid receiver ID" });

    if (!text && !attachmentBase64 && type !== "call")
      return res.status(400).json({ message: "Message cannot be empty" });

    if (type === "call" && !callLink)
      return res.status(400).json({ message: "Call link required" });

    if (attachmentBase64 && !["image", "pdf"].includes(attachmentType))
      return res.status(400).json({ message: "Invalid attachment type" });

    // check friendship
    const isFriend = await User.findOne({
      _id: senderId,
      friends: receiverId,
    });

    if (!isFriend)
      return res.status(403).json({ message: "You can only chat with friends" });

    let messageData = {
      sender: senderId,
      receiver: receiverId,
      text,
      type,
      callLink,
    };

    /* ============================
       CLOUDINARY UPLOAD SECTION
       ============================ */

    if (attachmentBase64 && attachmentType) {
      const upload = await cloudinary.uploader.upload(attachmentBase64, {
        folder: "prepPal/chat",
        resource_type: attachmentType === "pdf" ? "raw" : "image",
      });

      messageData = {
        ...messageData,
        attachment: {
          url: upload.secure_url,     // ✅ Store ONLY Cloudinary URL
          type: attachmentType,
          publicId: upload.public_id,
        },
        type: "attachment",
        text: "", // ensure no accidental base64 text stored
      };

      console.log("[DEBUG] Attachment uploaded:", upload.secure_url);
    }

    /* ============================
       SAVE MESSAGE
       ============================ */

    let message = await Message.create(messageData);

    message = await message.populate([
      { path: "sender", select: "username profileImage" },
      { path: "receiver", select: "username profileImage" },
    ]);

    /* ============================
       REALTIME EMIT (UNCHANGED)
       ============================ */

    const io = getIO();
    io.to(senderId.toString()).emit("newMessage", message);
    io.to(receiverId.toString()).emit("newMessage", message);

    res.status(201).json(message);
  } catch (err) {
    console.error("[ERROR] sendMessage:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET CONVERSATION
export const getConversation = async (req, res) => {
  try {
    const myId = req.userId;
    const otherUserId = req.params.userId;

    console.log("[DEBUG] getConversation called:", { myId, otherUserId });

    // check friendship
    const isFriend = await User.findOne({ _id: myId, friends: otherUserId });
    if (!isFriend) return res.status(403).json({ message: "Not friends" });

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username profileImage")
      .populate("receiver", "username profileImage");

    console.log("[DEBUG] Messages fetched:", messages.length);
    res.status(200).json(messages.reverse());
  } catch (err) {
    console.error("[ERROR] getConversation:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET MY CHATS
export const getMyChats = async (req, res) => {
  try {
    const myId = req.userId;
    console.log("[DEBUG] getMyChats called:", myId);

    const messages = await Message.find({ $or: [{ sender: myId }, { receiver: myId }] })
      .sort({ createdAt: -1 })
      .limit(300)
      .populate("sender", "username profileImage")
      .populate("receiver", "username profileImage");

    const chatsMap = new Map();
    messages.forEach((msg) => {
      const otherUser = msg.sender._id.toString() === myId ? msg.receiver : msg.sender;
      if (!chatsMap.has(otherUser._id.toString())) {
        chatsMap.set(otherUser._id.toString(), { user: otherUser, lastMessage: msg });
      }
    });

    console.log("[DEBUG] Chats map size:", chatsMap.size);
    res.status(200).json([...chatsMap.values()]);
  } catch (err) {
    console.error("[ERROR] getMyChats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE MESSAGE
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    console.log("[DEBUG] deleteMessage called:", { messageId, userId });

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== userId && message.receiver.toString() !== userId)
      return res.status(403).json({ message: "Not authorized" });

    if (message.attachment?.publicId) {
      await cloudinary.uploader.destroy(message.attachment.publicId, {
        resource_type: message.attachment.type === "pdf" ? "raw" : "image",
      });
      console.log("[DEBUG] Attachment deleted:", message.attachment.publicId);
    }

    await Message.findByIdAndDelete(messageId);

    const io = getIO();
    io.to(message.sender.toString()).emit("messageDeleted", messageId);
    io.to(message.receiver.toString()).emit("messageDeleted", messageId);

    res.status(200).json({ message: "Message deleted for both users" });
  } catch (err) {
    console.error("[ERROR] deleteMessage:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET MY CONNECTIONS
export const getMyConnections = async (req, res) => {
  try {
    const myId = req.userId;
    console.log("[DEBUG] getMyConnections called:", myId);

    const user = await User.findById(myId).populate("friends", "username profileImage");

    const pendingSent = await FriendRequest.find({ from: myId, status: "pending" })
      .populate("to", "username profileImage");

    const pendingReceived = await FriendRequest.find({ to: myId, status: "pending" })
      .populate("from", "username profileImage");

    res.status(200).json({
      friends: user.friends,
      pendingSent,
      pendingReceived,
    });
  } catch (err) {
    console.error("[ERROR] getMyConnections:", err);
    res.status(500).json({ message: "Failed to fetch connections" });
  }
};