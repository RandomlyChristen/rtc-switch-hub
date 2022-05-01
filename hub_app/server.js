'use strict';

const PORT = 8080;
const HOST = 'http://localhost'

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);

app.use('/', express.static('static'));

const options = {
    hostname: HOST,
    port: Number(PORT)
};

server.listen(options, () => {
    console.log(options);
    console.log(`Local Hub server started: ${PORT}`);
});

let hubClientIds = [];
let deviceHubId;

io.on('connection', (socket) => {
    socket.on('dataSource', () => {
        deviceHubId = socket;
        console.log('Data source connected');
    });
    socket.on('client', () => {
        hubClientIds.push(socket.id);
        console.log('Client connected');
    });
    socket.on('disconnect', () => {
        if (socket.id !== deviceHubId) {
            hubClientIds = hubClientIds.splice(hubClientIds.indexOf(socket.id), 1);
            console.log('Client disconnected');
        }
    });
    socket.on('devices', (devices) => {
        hubClientIds.forEach((clientId) => {
            socket.to(clientId).emit('devices', devices);
        });
        console.log(devices);
    });
});