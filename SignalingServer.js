'use strict';

const PORT = process.env.REACT_APP_SIGNALING_PORT || 30001
const HOST = process.env.REACT_APP_SIGNALING_HOSTNAME || 'http://localhost'

const app = require('express')();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);

const options = {
    hostname: HOST,
    port: Number(PORT),
};

server.listen(options, () => {
    console.log(options);
    console.log(`WebRTC Signaling on port: ${PORT}`);
});

const consoleByRoomId = {};
const roomIdByClient = {};

io.on('connection', (socket) => {
    socket.on('consoleJoin', ({roomId}) => {
        consoleByRoomId[roomId] = socket.id;
        console.log(`[${roomId}] Console Joined : ${socket.id}`);
    });
    socket.on('clientJoin', ({roomId}) => {
        const consoleId = consoleByRoomId[roomId];
        roomIdByClient[socket.id] = roomId;
        if (!consoleId) return;
        io.sockets.to(consoleId).emit('clientJoin', {
            clientId: socket.id
        });
        console.log(`[${roomId}] Client Joined : ${socket.id}`);
    });
    socket.on('offer', ({sdp, offerSendId, offerReceiveId}) => {
        console.log(`${offerSendId}: sent offer to ${offerReceiveId}`);
        console.log(`\t${sdp}`);
        socket.to(offerReceiveId).emit('getOffer', {
            sdp: sdp,
            offerSendId: offerSendId
        });
    });
    socket.on('answer', ({sdp, answerSendId, answerReceiveId}) => {
        console.log(`${answerSendId}: sent answer to ${answerReceiveId}`);
        console.log(`\t${sdp}`);
        socket.to(answerReceiveId).emit('getAnswer', {
            sdp: sdp,
            answerSendId: answerSendId
        });
    });
    socket.on('candidate', ({candidate, candidateSendId, candidateReceiveId}) => {
        console.log(`${candidateSendId}: Attempt to share ICE candidate with ${candidateReceiveId}`);
        console.log(`\t${candidate}`);
        socket.to(candidateReceiveId).emit('getCandidate', {
            candidate: candidate,
            candidateSendId: candidateSendId
        });
    });
    socket.on('disconnect', () => {
        const roomId = roomIdByClient[socket.id];
        const consoleId = consoleByRoomId[roomId];
        console.log(`${socket.id} disconnected`);

        if (roomId) {
            if (consoleId) {
                socket.to(consoleId).emit('clientDisconnect', {
                    clientId: socket.id
                });
            }
            delete roomIdByClient[socket.id];
        }
    });
});