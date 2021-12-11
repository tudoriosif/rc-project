const express = require('express');
const app = express();
const server = require('http').Server(app);
const WebSocket = require('ws');

const port = 9000;

// Websocket used for ESP - CAM
const wss1 = new WebSocket.Server({ noServer: true });
// Websocket used for Client (Browsers) 
const wss2 = new WebSocket.Server({ noServer: true });
// Websocket user for PIR sensor
const wss3 = new WebSocket.Server({ noServer: true });

wss1.on('connection', function connection(ws) {
    console.log('Camera connection!');
    ws.on('message', function incoming(message, isBinary) {
        wss2.clients.forEach(function each(client) {
            if(client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

wss2.on('connection', function connection(ws) {
    console.log('Web connection!');
    ws.on('message', function incoming(message) {
        console.log('Received from web browser: ' + message);
    });
});

wss3.on('connection', function connection(ws) {
    console.log('PIR connection!');
    ws.on('message', function incoming(message, isBinary) {
        const newMessage = isBinary ? message : message.toString();
        wss3.clients.forEach(function each(client) {
            if(client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(newMessage);
            }
        });
    });
});



server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = request.url;

    if(pathname === '/jpgstream_server') {
        wss1.handleUpgrade(request, socket, head, function done(ws) {
            wss1.emit('connection', ws, request);
        })
    } else if(pathname === '/jpgstream_client') {
        wss2.handleUpgrade(request, socket, head, function done(ws) { 
            wss2.emit('connection', ws, request);
        });
    } else if(pathname === '/pir_sensor') {
        wss3.handleUpgrade(request, socket, head, function done(ws) { 
            wss3.emit('connection', ws, request);
        });
    } else{
        socket.distroy();
    }
});

server.listen(port, () => {
    console.log('Server is listening on port: ' + port);
});
