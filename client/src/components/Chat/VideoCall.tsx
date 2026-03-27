import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../hooks/useAuth';

interface VideoCallProps {
  chatId?: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  isVideoCall?: boolean;
  onClose: () => void;
}

interface PeerConnection {
  pc: RTCPeerConnection;
  stream?: MediaStream;
}

const VideoCall: React.FC<VideoCallProps> = ({
  chatId,
  participantId,
  participantName,
  participantAvatar,
  isVideoCall = true,
  onClose,
}) => {
  const { socket } = useWebSocket();
  const { user } = useAuth();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(isVideoCall);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isIncoming, setIsIncoming] = useState(false);
  const peerConnection = useRef<PeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = async (data: { from: string; signal: RTCSessionDescriptionInit; isVideo: boolean }) => {
      if (data.from === participantId) {
        setIsIncoming(true);
        await setupPeerConnection();
        if (peerConnection.current) {
          await peerConnection.current.pc.setRemoteDescription(new RTCSessionDescription(data.signal));
          const answer = await peerConnection.current.pc.createAnswer();
          await peerConnection.current.pc.setLocalDescription(answer);
          socket.emit('answerCall', { to: data.from, signal: peerConnection.current.pc.localDescription });
        }
      }
    };

    const handleCallAnswered = async (data: { from: string; signal: RTCSessionDescriptionInit }) => {
      if (peerConnection.current && data.from === participantId) {
        await peerConnection.current.pc.setRemoteDescription(new RTCSessionDescription(data.signal));
      }
    };

    const handleCallEnded = () => {
      endCall();
    };

    socket.on('incomingCall', handleIncomingCall);
    socket.on('callAnswered', handleCallAnswered);
    socket.on('callEnded', handleCallEnded);

    return () => {
      socket.off('incomingCall');
      socket.off('callAnswered');
      socket.off('callEnded');
    };
  }, [socket, participantId]);

  useEffect(() => {
    initCall();
    return () => cleanup();
  }, []);

  const initCall = async () => {
    try {
      await setupPeerConnection();
      if (isVideoCall) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        stream.getTracks().forEach(track => {
          peerConnection.current?.pc.addTrack(track, stream);
        });
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.current = stream;
        stream.getTracks().forEach(track => {
          peerConnection.current?.pc.addTrack(track, stream);
        });
      }

      if (peerConnection.current && socket) {
        const offer = await peerConnection.current.pc.createOffer();
        await peerConnection.current.pc.setLocalDescription(offer);
        socket.emit('callUser', { to: participantId, signal: peerConnection.current.pc.localDescription, isVideo: isVideoCall });
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setCallStatus('ended');
    }
  };

  const setupPeerConnection = async () => {
    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('iceCandidate', { to: participantId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setCallStatus('ended');
      }
    };

    peerConnection.current = { pc };
  };

  const handleIceCandidate = async (data: { from: string; candidate: RTCIceCandidate }) => {
    if (peerConnection.current && data.from === participantId) {
      try {
        await peerConnection.current.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  };

  const toggleMic = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (socket) {
      socket.emit('endCall', { to: participantId });
    }
    cleanup();
    setCallStatus('ended');
    onClose();
  };

  const cleanup = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.pc.close();
      peerConnection.current = null;
    }
  };

  if (callStatus === 'ended') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-2xl p-8 text-center max-w-md">
          <PhoneOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl text-white mb-2">Звонок завершён</h3>
          <p className="text-gray-400 mb-6">Разговор с {participantName} окончен</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900/95 flex items-center justify-center z-50">
      <div className="relative w-full max-w-5xl h-[80vh] bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={participantAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participantId}`}
                alt={participantName}
                className="w-10 h-10 rounded-full border-2 border-purple-500"
              />
              <div>
                <h3 className="text-white font-semibold">{participantName}</h3>
                <p className="text-sm text-gray-300">
                  {callStatus === 'connecting' ? 'Подключение...' : callStatus === 'connected' ? 'В звонке' : 'Завершено'}
                </p>
              </div>
            </div>
            <button
              onClick={endCall}
              className="p-2 rounded-full bg-red-500/80 hover:bg-red-600 transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Local Video (Picture-in-Picture) */}
          {isVideoCall && (
            <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-lg overflow-hidden shadow-lg border border-gray-600">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Connecting State */}
          {callStatus === 'connecting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white text-lg">Подключение к звонку...</p>
              </div>
            </div>
          )}

          {/* Audio Only State */}
          {!isVideoCall && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <img
                  src={participantAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participantId}`}
                  alt={participantName}
                  className="w-32 h-32 rounded-full border-4 border-purple-500 mx-auto mb-4"
                />
                <h3 className="text-2xl text-white font-semibold">{participantName}</h3>
                <p className="text-gray-400 mt-2">Голосовой звонок</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleMic}
              className={`p-4 rounded-full transition ${
                isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {isMicOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
            </button>

            {isVideoCall && (
              <button
                onClick={toggleCamera}
                className={`p-4 rounded-full transition ${
                  isCameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isCameraOn ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
              </button>
            )}

            <button
              onClick={endCall}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
