import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

/**
 * ================================
 * GET MY CONNECTIONS
 * GET /api/users/connections
 * ================================
 */
export const getMyConnections = async (req, res) => {
  try {
    const myId = req.userId;

    console.log("\n===== 🔎 getMyConnections DEBUG START =====");
    console.log("Authenticated User ID:", myId);

    const me = await User.findById(myId)
      .populate("friends", "username profileImage")
      .lean();

    if (!me) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const pendingSent = await FriendRequest.find({
      from: myId,
      status: "pending",
    }).populate("to", "username profileImage");

    const pendingReceived = await FriendRequest.find({
      to: myId,
      status: "pending",
    }).populate("from", "username profileImage");

    console.log("✅ Friends Count:", me.friends.length);
    console.log("📤 Pending Sent:", pendingSent.length);
    console.log("📥 Pending Received:", pendingReceived.length);
    console.log("===== ✅ getMyConnections DEBUG END =====\n");

    res.status(200).json({
      friends: me.friends,
      pendingSent,
      pendingReceived,
    });
  } catch (err) {
    console.error("🔥 getMyConnections ERROR:", err);
    res.status(500).json({ message: "Failed to load connections" });
  }
};


/**
 * ================================
 * GET ALL USERS (Filters + Pagination)
 * GET /api/users
 * ================================
 */
export const listUsers = async (req, res) => {
  try {
    console.log("\n===== 🔎 listUsers DEBUG START =====");

    console.log("👉 Raw Query Received:", req.query);
    console.log("👉 Authenticated User:", req.userId);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { languages, techStack, roles } = req.query;

    // Convert query strings to arrays safely
    const selectedLanguages = languages ? languages.split(",") : [];
    const selectedTechStack = techStack ? techStack.split(",") : [];
    const selectedRoles = roles ? roles.split(",") : [];

    console.log("🎯 Selected Filters:", {
      selectedLanguages,
      selectedTechStack,
      selectedRoles,
    });

    // Always exclude logged-in user
    const baseFilter = { _id: { $ne: req.userId } };

    // Fetch ALL possible candidates first
    const allUsers = await User.find(baseFilter)
      .select("-password")
      .lean();

    console.log("📦 Total Users Pulled From DB:", allUsers.length);

    // -------------------------
    // MATCH SCORING LOGIC
    // -------------------------
    const scoredUsers = allUsers.map(user => {
      let score = 0;

      // Match languages
      if (selectedLanguages.length > 0) {
        const matches = user.languages?.filter(lang =>
          selectedLanguages.includes(lang)
        ).length || 0;

        score += matches;
      }

      // Match tech stack
      if (selectedTechStack.length > 0) {
        const matches = user.techStack?.filter(tech =>
          selectedTechStack.includes(tech)
        ).length || 0;

        score += matches;
      }

      // Match roles
      if (selectedRoles.length > 0) {
        const matches = user.roles?.filter(role =>
          selectedRoles.includes(role)
        ).length || 0;

        score += matches;
      }

      return { ...user, matchScore: score };
    });

    console.log("🧮 Example Scored User:", scoredUsers[0]);

    // Remove users with 0 matches IF filters exist
    const activeFilterCount =
      selectedLanguages.length +
      selectedTechStack.length +
      selectedRoles.length;

    let filteredUsers = scoredUsers;

    if (activeFilterCount > 0) {
      filteredUsers = scoredUsers.filter(user => user.matchScore > 0);
    }

    // Sort by highest matchScore first
    filteredUsers.sort((a, b) => b.matchScore - a.matchScore);

    console.log("📊 Users After Scoring & Filtering:", filteredUsers.length);

    // Pagination AFTER scoring
    const paginatedUsers = filteredUsers.slice(skip, skip + limit);

    // Friend detection
    const me = await User.findById(req.userId).select("friends");
    const friendIds = me.friends.map(id => id.toString());

    const usersWithFriendFlag = paginatedUsers.map(user => ({
      ...user,
      isFriend: friendIds.includes(user._id.toString()),
    }));

    console.log("===== ✅ listUsers DEBUG END =====\n");

    res.status(200).json({
      page,
      limit,
      totalUsers: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limit),
      users: usersWithFriendFlag,
    });

  } catch (err) {
    console.error("🔥 listUsers ERROR:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/**
 * ================================
 * GET USER PROFILE BY USERNAME
 * GET /api/users/username/:username
 * ================================
 */
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    console.log("\n===== 🔎 getUserProfile DEBUG START =====");
    console.log("Requested Username:", username);

    const user = await User.findOne({ username })
      .select("-password")
      .lean();

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const me = await User.findById(req.userId).select("friends");
    const isFriend = me.friends
      .map(id => id.toString())
      .includes(user._id.toString());

    console.log("Friend Status:", isFriend);
    console.log("===== ✅ getUserProfile DEBUG END =====\n");

    res.status(200).json({
      ...user,
      isFriend,
    });

  } catch (err) {
    console.error("🔥 getUserProfile ERROR:", err);
    res.status(500).json({ message: "Failed to get user profile" });
  }
};


/**
 * ================================
 * UPDATE MY PROFILE
 * PATCH /api/users/me/profile
 * ================================
 */
export const updateMyProfile = async (req, res) => {
  try {
    console.log("\n===== 🔎 updateMyProfile DEBUG START =====");
    console.log("Incoming Body:", req.body);

    const allowedFields = [
      "description",
      "languages",
      "techStack",
      "roles",
      "profileImage",
    ];

    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    console.log("Filtered Update Fields:", updates);

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true }
    ).select("-password");

    console.log("Updated User ID:", updatedUser?._id);
    console.log("===== ✅ updateMyProfile DEBUG END =====\n");

    res.status(200).json(updatedUser);

  } catch (err) {
    console.error("🔥 updateMyProfile ERROR:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};


/**
 * ================================
 * UNFRIEND USER
 * DELETE /api/users/friends/:userId
 * ================================
 */
export const unfriendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.userId;

    console.log("\n===== 🔎 unfriendUser DEBUG START =====");
    console.log("My ID:", myId);
    console.log("Removing Friend ID:", userId);

    await User.findByIdAndUpdate(myId, {
      $pull: { friends: userId },
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { friends: myId },
    });

    console.log("✅ Unfriend Successful");
    console.log("===== ✅ unfriendUser DEBUG END =====\n");

    res.status(200).json({ message: "User unfriended successfully" });

  } catch (err) {
    console.error("🔥 unfriendUser ERROR:", err);
    res.status(500).json({ message: "Failed to unfriend user" });
  }
};


/**
 * ================================
 * GET MY PROFILE
 * GET /api/users/me
 * ================================
 */
export const getMyProfile = async (req, res) => {
  try {
    console.log("\n===== 🔎 getMyProfile DEBUG START =====");

    const user = await User.findById(req.userId)
      .select("-password")
      .lean();

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Profile fetched for:", user.username);
    console.log("===== ✅ getMyProfile DEBUG END =====\n");

    res.status(200).json(user);

  } catch (err) {
    console.error("🔥 getMyProfile ERROR:", err);
    res.status(500).json({ message: "Failed to get profile" });
  }
};