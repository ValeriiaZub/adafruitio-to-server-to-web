require('dotenv').config();
var express = require('express');
var socket = require('socket.io');
var mqtt = require('mqtt');
var app = express();

app.use(express.static('public'));
var server = app.listen(3000, () => {
    console.log('listening on *:3000');
});

//listening for web socket connections
var io = socket(server, { path: '/light/socket.io'});

//on a client connecting 
io.on('connection', (socket) => {
    // library automatically tracks all users we need to send data to
    socket.broadcast.emit('update', {data: "a user entered"})
    console.log('a user connected');
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.broadcast.emit('update', {data: "a user left"})
    });
});

//connecting to a aidafruit MQTT server for valeriiazub
var mqtt_client = mqtt.connect(`mqtts://${process.env.USERNAME}:${process.env.MQTT_SECRET_KEY}@io.adafruit.com`, {});

//wait for successfull connection to aidafruit MQTT server
mqtt_client.on('connect', function (topic, message) {
    //here we tell the server that we want to listen to digital feed
    mqtt_client.subscribe(process.env.TOPIC);
    console.log('Client publishing.. ');
});
//on any message that comes from aidafruit. if multiple topics, they
// have to be validated
mqtt_client.on('message', function(topic,message){
    console.log("received message on " + topic);
    console.log(message.toString());
    // this pushes info to web clients over web sockets
    io.emit('update', { data: message.toString() });
});