import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  PhoneOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePeer } from "../../hooks/usePeer";

export default function VideoCall() {
  const { callId } = useParams(); // from /call/:callId
  const navigate = useNavigate();
  const { localVideoRef, remoteVideoRef, endCall } = usePeer(callId);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [showEndAlert, setShowEndAlert] = useState(false);

  // ================= AUTO END CALL ON UNMOUNT =================
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  // ================= TOGGLE MICROPHONE =================
  const toggleMic = () => {
    const tracks = localVideoRef.current?.srcObject?.getAudioTracks();
    if (!tracks) return;
    tracks.forEach((t) => (t.enabled = !t.enabled));
    setMicOn((prev) => !prev);
  };

  // ================= TOGGLE CAMERA =================
  const toggleCamera = () => {
    const tracks = localVideoRef.current?.srcObject?.getVideoTracks();
    if (!tracks) return;
    tracks.forEach((t) => (t.enabled = !t.enabled));
    setCamOn((prev) => !prev);
  };

  // ================= LEAVE CALL =================
  const leaveCall = () => {
    // Stop all local tracks
    const stream = localVideoRef.current?.srcObject;
    stream?.getTracks().forEach((track) => track.stop());

    endCall();             // End peer connection
    setShowEndAlert(true); // Show alert

    // Auto close alert & navigate back after 1.5s
    setTimeout(() => {
      setShowEndAlert(false);
      window.close();
      navigate(-1);
    }, 1500);
  };

  return (
    <div className="h-screen flex flex-col bg-base-200 relative">

      {/* Header */}
      <div className="p-3 text-sm text-center bg-base-300 font-semibold text-slate-700">
        Video Call
      </div>

      {/* Video Streams */}
      <div className="flex-1 grid grid-cols-2 gap-2 p-2">
        {/* Local Video */}
        <div className="relative bg-black rounded-lg overflow-hidden border-2 border-indigo-400">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-2 left-2 badge badge-info">You</span>
        </div>

        {/* Remote Video */}
        <div className="relative bg-black rounded-lg overflow-hidden border-2 border-indigo-400">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-2 left-2 badge badge-neutral">Peer</span>
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 bg-base-300 flex justify-center gap-4">
        <button
          className="btn btn-circle"
          onClick={toggleMic}
          title={micOn ? "Mute Mic" : "Unmute Mic"}
        >
          {micOn ? <Mic /> : <MicOff />}
        </button>

        <button
          className="btn btn-circle"
          onClick={toggleCamera}
          title={camOn ? "Turn Off Camera" : "Turn On Camera"}
        >
          {camOn ? <Camera /> : <CameraOff />}
        </button>

        <button
          className="btn btn-circle btn-error hover:btn-error-focus"
          onClick={leaveCall}
          title="End Call"
        >
          <PhoneOff />
        </button>
      </div>

      {/* ================= END CALL ALERT ================= */}
      {showEndAlert && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center gap-2">
            <PhoneOff className="w-8 h-8 text-red-500" />
            <p className="text-lg font-semibold text-gray-700">Call Ended</p>
            <p className="text-sm text-gray-500">This call has been closed</p>
          </div>
        </div>
      )}
    </div>
  );
}