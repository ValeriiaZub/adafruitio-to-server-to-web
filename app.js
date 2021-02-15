require('dotenv').config();
var express = require('express');
var mqtt = require('mqtt');
var app = express();

app.use(express.static('public'));
var server = app.listen(3000, () => {
    console.log('listening on *:3000');
});

let data = "0"

app.get("/light/update", (req, res) => {
    res.json({ data });
})


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
    data = message.toString();
});