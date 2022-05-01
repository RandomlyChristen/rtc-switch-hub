import io from "socket.io-client";

const PORT = process.env.REACT_APP_SIGNALING_PORT || 30001
const HOST = process.env.REACT_APP_SIGNALING_HOSTNAME || 'http://localhost'

const PEER_CONN_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // {}
  ],
};

let peerConn;
let socket;

let _onRemoteTrack = () => {};
let _onDataChanged = () => {};

let remoteStream;

const setOnRemoteTrack = (onRemoteTrackHandler) => {
  _onRemoteTrack = onRemoteTrackHandler;
};
const setOnDataChanged = (onDataChangedHandler) => {
  _onDataChanged = onDataChangedHandler;
};

const connectSignalling = (roomId) => {
  const uri = HOST + ':' + PORT;
  socket = io.connect(uri);
  console.log(`Signaling Socket on ${uri}`);
  socket.on('getOffer', async ({sdp, offerSendId}) => {
    await onGetOffer(sdp, offerSendId);
  });
  socket.on('getCandidate', async ({candidate, candidateSendId}) => {
    await onGetCandidate(candidate, candidateSendId);
  });
  socket.emit('clientJoin', {
    roomId: roomId
  });
};

const createPeerConnection = async (remoteId) => {
  try {
    const pc = new RTCPeerConnection(PEER_CONN_CONFIG);
    pc.onicecandidate = (iceEvent) => {
      if (!iceEvent.candidate) {
        console.log('ICE Candidate is Empty');
        return;
      }
      console.log('sendCandidate');
      sendCandidate(iceEvent.candidate, remoteId);
    };
    pc.ontrack = (trackEvent) => {
      remoteStream = trackEvent.streams[0];
      _onRemoteTrack(remoteStream);
    };
    pc.ondatachannel = (dataChannelEvent) => {
      const channel = dataChannelEvent.channel;
      channel.onmessage = (event) => {
        _onDataChanged(event.data);
      }
    }
    return pc;
  } catch (e) {
    console.error(e);
  }
};

const onGetOffer = async (remoteSdp, remoteId) => {
  peerConn = await createPeerConnection(remoteId);
  await sendAnswer(remoteId, peerConn, remoteSdp);
};

const sendCandidate = (candidate, remoteId) => {
  socket.emit('candidate', {
    candidate: candidate,
    candidateSendId: socket.id,
    candidateReceiveId: remoteId
  });
};

const sendAnswer = async (remoteId, peerConn, remoteSdp) => {
  try {
    await peerConn.setRemoteDescription(new RTCSessionDescription(remoteSdp));
    const localSdp = await peerConn.createAnswer();
    await peerConn.setLocalDescription(new RTCSessionDescription(localSdp));

    socket.emit('answer', {
      sdp: localSdp,
      answerSendId: socket.id,
      answerReceiveId: remoteId
    });
  } catch (e) {
    console.error(e);
  }
}

const onGetCandidate = async (candidate) => {
  if (!peerConn) {
    console.log('Peer Connection is not Initialized');
    return;
  }
  try {
    await peerConn.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (e) {
    console.error(e);
  }
};

const disconnectSignalling = () => {
  if (socket) {
    socket.disconnect();
  }
};

export {connectSignalling, disconnectSignalling, setOnRemoteTrack, setOnDataChanged};
