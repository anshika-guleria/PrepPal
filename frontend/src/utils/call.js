// src/utils/call.js

export const generateCallLink = () => {
  // browser-safe unique room id
  const roomId = crypto.randomUUID();

  // full absolute link so it works in chat, reloads, sharing
  return `${window.location.origin}/call/${roomId}`;
};
