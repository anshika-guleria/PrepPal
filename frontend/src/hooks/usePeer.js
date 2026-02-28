import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";

export function usePeer(callId) {
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [peerId, setPeerId] = useState(null);
  const [connected, setConnected] = useState(false);

  // ===== get media =====
  const getUserMedia = async () => {
    if (localStreamRef.current) return localStreamRef.current;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    return stream;
  };

  // ===== start peer =====
  useEffect(() => {
    const peer = new Peer(undefined, {
      debug: 1,
    });

    peerRef.current = peer;

    peer.on("open", (id) => {
      setPeerId(id);
    });

    // answer incoming call
    peer.on("call", async (call) => {
      const stream = await getUserMedia();
      call.answer(stream);

      call.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setConnected(true);
      });
    });

    return () => {
      peer.destroy();
    };
  }, []);

  // ===== auto-call based on callId =====
  useEffect(() => {
    if (!peerId || !callId) return;

    // Host logic: first user waits
    // Second user calls host
    if (callId !== peerId) {
      (async () => {
        const stream = await getUserMedia();

        const call = peerRef.current.call(callId, stream);

        call.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setConnected(true);
        });
      })();
    }
  }, [peerId, callId]);

  // ===== end call =====
  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    setConnected(false);
  };

  return {
    peerId,
    localVideoRef,
    remoteVideoRef,
    endCall,
    connected,
  };
}
