import imageCompression from "browser-image-compression";
import { File, FileText, ImageIcon, Paperclip, Send, X } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";

function MessageInput({ onSend, socket, friendId, currentUserId }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const typingTimeoutRef = useRef(null);

  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ================= FILE HANDLER ================= */
  const resetInput = (ref) => {
    if (ref?.current) ref.current.value = "";
  };

  const handleFileChange = async (e, type, ref) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const sizeMB = selectedFile.size / 1024 / 1024;
    const limits = { image: 2, pdf: 5, file: 10 };

    if (sizeMB > limits[type]) {
      alert(`${type.toUpperCase()} must be ≤ ${limits[type]} MB`);
      resetInput(ref);
      return;
    }

    let fileToSend = selectedFile;

    // Compress images only
    if (type === "image") {
      try {
        fileToSend = await imageCompression(selectedFile, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });
      } catch (err) {
        console.error("Image compression failed", err);
      }
    }

    setLoadingFile(true);

    const reader = new FileReader();
    reader.onload = () => {
      setFile({
        name: selectedFile.name,
        type,
        base64: reader.result, // sent to backend
      });
      setLoadingFile(false);
      resetInput(ref);
    };

    reader.readAsDataURL(fileToSend);
  };

  /* ================= HANDLE SEND ================= */
  const handleSend = (e) => {
    e?.preventDefault();

    if (!text.trim() && !file) return;
    if (!friendId || !currentUserId) return;

    onSend({
      text: text.trim(),
      file: file
        ? {
            name: file.name,
            type: file.type,
            base64: file.base64,
          }
        : null,
    });

    setText("");
    setFile(null);

    if (socket && friendId) {
      socket.emit("stopTyping", { userId: friendId });
    }
  };

  /* ================= TYPING INDICATOR ================= */
  const handleTyping = (e) => {
    setText(e.target.value);

    if (!socket || !friendId) return;

    socket.emit("typing", { userId: friendId });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { userId: friendId });
    }, 1000);
  };

  /* ================= HANDLE ENTER ================= */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);

  return (
    <form onSubmit={handleSend} className="flex flex-col gap-1 w-full relative">
      {/* FILE PREVIEW */}
      {file && (
        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md">
          {file.type === "image" ? (
            <img
              src={file.base64}
              alt={file.name}
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            <div className="flex items-center gap-1 text-gray-700">
              {file.type === "pdf" ? <FileText size={16} /> : <File size={16} />}
              <span className="underline truncate max-w-xs">
                {file.name}
              </span>
            </div>
          )}

          <button
            type="button"
            className="ml-auto text-red-500"
            onClick={() => setFile(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* INPUT ROW */}
      <div className="flex items-center gap-2">
        {/* ATTACHMENT MENU */}
        <div className="relative">
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-base-200 hover:bg-base-300 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute bottom-10 left-0 bg-white shadow-md rounded-md w-44 z-50 flex flex-col">
              <button
                type="button"
                onClick={() => imageInputRef.current.click()}
                className="px-3 py-2 hover:bg-indigo-50 flex gap-2 items-center"
              >
                <ImageIcon className="w-4 h-4 text-blue-500" />
                Upload Image
              </button>

              <button
                type="button"
                onClick={() => pdfInputRef.current.click()}
                className="px-3 py-2 hover:bg-indigo-50 flex gap-2 items-center"
              >
                <FileText className="w-4 h-4 text-red-500" />
                Upload PDF
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="px-3 py-2 hover:bg-indigo-50 flex gap-2 items-center"
              >
                <File className="w-4 h-4 text-green-500" />
                Upload File
              </button>
            </div>
          )}

          <input
            type="file"
            className="hidden"
            accept="image/*"
            ref={imageInputRef}
            onChange={(e) => handleFileChange(e, "image", imageInputRef)}
          />

          <input
            type="file"
            className="hidden"
            accept="application/pdf"
            ref={pdfInputRef}
            onChange={(e) => handleFileChange(e, "pdf", pdfInputRef)}
          />

          <input
            type="file"
            className="hidden"
            accept="*/*"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e, "file", fileInputRef)}
          />
        </div>

        {/* TEXT INPUT */}
        <input
          type="text"
          placeholder="Type your message..."
          value={text}
          onChange={handleTyping}
          onKeyDown={handleKeyPress}
          className="input input-bordered input-sm flex-1 rounded-full text-sm"
        />

        {/* SEND BUTTON */}
        <button
          type="submit"
          disabled={loadingFile}
          className="btn btn-primary btn-circle btn-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

MessageInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  socket: PropTypes.object.isRequired,
  friendId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
};

export default MessageInput;