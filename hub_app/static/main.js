'use strict';

const SIGNALLING_HOST = 'http://192.168.82.155:30001';

let roomId = prompt("Enter room Id: ");

const mediaStreamConstraints = {
    video: true,
}
const localVideo = document.querySelector('video');
let localStream;
const getLocalMediaStreamHandler = (mediaStream) => {
    localStream = mediaStream;
    localVideo.srcObject = mediaStream;
}
navigator.mediaDevices.getUserMedia(mediaStreamConstraints).then(getLocalMediaStreamHandler);


// Bluetooth Server Local io connection
let devices;
const deviceSocket = io.connect();
deviceSocket.emit('client');
deviceSocket.on('devices', (data) => {
    devices = data;
    Object.keys(dataChannelById).forEach((clientId) => {
        const dataChannel = dataChannelById[clientId];
        dataChannel.send(JSON.stringify(data));
    });
});


// RTC
const PEER_CONN_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // {}
    ],
};
const peerConnById = {};
const signallingSocket = io.connect(SIGNALLING_HOST);
signallingSocket.on('clientJoin', async ({clientId}) => {
    const peerConn = peerConnById[clientId] = await createPeerConnection(clientId);
    await sendOffer(clientId, peerConn);
});
signallingSocket.on('getAnswer', async ({sdp, answerSendId, answerReceiveId}) => {
    console.log('getAnswer');
    await onGetAnswer(sdp, answerSendId);
});
signallingSocket.on('getCandidate', async ({candidate, candidateSendId}) => {
    await onGetCandidate(candidate, candidateSendId);
});
signallingSocket.on('clientDisconnect', async ({clientId}) => {
    onClientDisconnect(clientId);
});
signallingSocket.emit('consoleJoin', {
    roomId: roomId
});

let dataChannelById = {};

const createPeerConnection = (remoteId) => {
    try {
        const pc = new RTCPeerConnection(PEER_CONN_CONFIG);
        dataChannelById[remoteId] = pc.createDataChannel('test');
        pc.onicecandidate = (iceEvent) => {
            if (!iceEvent.candidate) {
                console.log('ICE Candidate is Empty');
                return;
            }
            console.log('sendCandidate');
            sendCandidate(iceEvent.candidate, remoteId);
        };
        localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
        });
        return pc;
    } catch (e) {
        console.error(e);
    }
};

const sendCandidate = (candidate, remoteId) => {
    signallingSocket.emit('candidate', {
        candidate: candidate,
        candidateSendId: signallingSocket.id,
        candidateReceiveId: remoteId
    });
};

const sendOffer = async (clientId, peerConn) => {
    try {
        const localSdp = await peerConn.createOffer();
        await peerConn.setLocalDescription(new RTCSessionDescription(localSdp));
        console.log('sendOffer');
        signallingSocket.emit('offer', {
            sdp: localSdp,
            offerSendId: signallingSocket.id,
            offerReceiveId: clientId
        });

    } catch (e) {
        console.error(e);
    }
};

const onGetAnswer = async (remoteSdp, remoteId) => {
    const peerConn = peerConnById[remoteId];
    if (!peerConn) {
        console.log('Peer Connection is not Initialized');
        return;
    }
    try {
        await peerConn.setRemoteDescription(new RTCSessionDescription(remoteSdp));
    } catch (e) {
        console.error(e);
    }
};

const onGetCandidate = async (candidate, remoteId) => {
    const peerConn = peerConnById[remoteId];
    if (!peerConn) {
        console.log('Peer Connection is not Initialized');
        return;
    }
    try {
        await peerConn.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
        console.error(e);
    }
}

const onClientDisconnect = (remoteId) => {
    if (peerConnById[remoteId]) {
        peerConnById[remoteId].close();
        delete peerConnById[remoteId];
    }

    if (dataChannelById[remoteId]) {
        dataChannelById[remoteId].close();
        delete dataChannelById[remoteId];
    }
    console.log('onClientDisconnect');
};