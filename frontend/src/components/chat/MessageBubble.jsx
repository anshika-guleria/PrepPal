import { File, Video } from "lucide-react";
import PropTypes from "prop-types";

function MessageBubble({ message, sentByMe = false, deleted = false, onDelete }) {
  const timeString = message?.createdAt || message?.timestamp;
  const formattedTime = timeString
    ? new Date(timeString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const handleContextMenu = (e) => {
    if (!sentByMe || !onDelete) return;
    e.preventDefault();
    console.log("[DEBUG] Deleting message:", message._id);
    onDelete(message._id);
  };

  // ================= VIDEO CALL =================
  if (message?.callLink) {
    return (
      <div className={`flex ${sentByMe ? "justify-end" : "justify-start"} my-1`}>
        <a
          href={message.callLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-2xl
                     bg-indigo-100 text-indigo-700 hover:bg-indigo-200
                     text-sm shadow-sm"
        >
          <Video className="w-4 h-4" />
          Join Video Call
        </a>
        <span className="ml-2 text-[10px] self-end text-gray-500">
          {formattedTime}
        </span>
      </div>
    );
  }

  // ================= CLOUDINARY ATTACHMENT =================
  const attachmentUrl = message?.file?.url || null;
  const attachmentType = message?.file?.type || null;

  return (
    <div
      className={`flex ${sentByMe ? "justify-end" : "justify-start"} my-1`}
      onContextMenu={handleContextMenu}
    >
      <div
        className={`flex flex-col max-w-xs md:max-w-md px-4 py-2 break-words rounded-2xl
          ${
            deleted
              ? "bg-base-200 text-base-content/70 italic"
              : sentByMe
              ? "bg-primary text-primary-content rounded-br-none"
              : "bg-base-100 text-base-content rounded-bl-none shadow-sm"
          }`}
      >
        {!deleted ? (
          <>
            {/* TEXT */}
            {message.text && <p className="text-sm">{message.text}</p>}

            {/* IMAGE */}
            {attachmentType === "image" && attachmentUrl && (
              <img
                src={attachmentUrl}
                alt="attachment"
                className="mt-2 max-h-60 rounded-lg object-cover"
                onError={() =>
                  console.error("[DEBUG] Failed to load image:", message)
                }
              />
            )}

            {/* PDF */}
            {attachmentType === "pdf" && attachmentUrl && (
              <a
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-sm text-indigo-600 underline block"
              >
                Open PDF
              </a>
            )}

            {/* GENERIC FILE */}
            {attachmentType &&
              attachmentType !== "image" &&
              attachmentType !== "pdf" &&
              attachmentUrl && (
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1 text-sm text-green-700 underline"
                >
                  <File className="w-4 h-4" />
                  Download File
                </a>
              )}

            {/* TIME */}
            <span
              className={`mt-1 text-[10px] self-end ${
                sentByMe ? "text-primary-content/70" : "text-gray-500"
              }`}
            >
              {formattedTime}
            </span>
          </>
        ) : (
          <p className="text-sm">This message was deleted</p>
        )}
      </div>
    </div>
  );
}

MessageBubble.propTypes = {
  message: PropTypes.object,
  sentByMe: PropTypes.bool,
  deleted: PropTypes.bool,
  onDelete: PropTypes.func,
};

export default MessageBubble;