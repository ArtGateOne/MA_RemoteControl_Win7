
//dot2midicon v 1.2 by ArtGateOne

var pageIndex = 0; //strona flash
var wing = 1;	//bwing/fwing 1 lub 2
	
var sessionnr = 0;
var request = 0;
var interval_on = 0;
var encodervalue = 2;
var controller = 0;
var faderValue = 0;
var grandmastervalue = 100;
var blackout = false;
if (wing === 1) {
    var button = JSON.parse('{"index":[[0],[0,105,104,103,102,101,100,205,204,203,202,201,200,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,5,113,213,13,112,212,12,111,211,11,110,210,10,109,209,9,108,208,8,107,207,7,106,206,6,307,306,305,304,303,302,301,300,407,406,405,404,403,402,401,400,507,506,505,504,503,502,501,500,607,606,605,604,603,602,601,600],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84]]}');
} else if (wing === 2) {
    var button = JSON.parse('{"index":[[315,314,313,312,311,310,309,308],[415,414,413,412,411,410,409,408],[515,514,513,512,511,510,509,508],[615,614,613,612,611,610,609,608],[715,714,713,712,711,710,709,708],[815,814,813,812,811,810,809,808],[121,120,119,118,117,116,115,114],[221,220,219,218,217,216,215,214]]}');
}

var exec = JSON.parse('{"index":[[6,5,4,3,2,1,0,0,0],[14,13,12,11,10,9,8,7,6],[22,21,20,19,18,17,16,15,14]]}');

function interval() {
client.send('{"requestType":"getdata","data":"set","session":' + sessionnr + ',"maxRequests":1}');
};





var easymidi = require('easymidi');

console.log('MIDI inputs:');
console.log(easymidi.getInputs());

console.log('MIDI outputs:'); 
console.log(easymidi.getOutputs());

/*
// Monitor all MIDI inputs with a single "message" listener
easymidi.getInputs().forEach(function(inputName){
  var input = new easymidi.Input(inputName);
  input.on('message', function (msg) {
    var vals = Object.keys(msg).map(function(key){return key+": "+msg[key];});
    console.log(inputName+": "+vals.join(', '));
  });
});
*/

var input = new easymidi.Input('MIDIcon');


//send fader pos do dot2
input.on('cc', function(msg) {

    if (msg.controller <= 8) {
        if (msg.value <= 2) {
            faderValue = 0;
        } else {
		faderValue = (((msg.value) - 2) * 0.008);
        }
        client.send('{"requestType":"playbacks_userInput","execIndex":' + exec.index[wing][msg.controller] + ',"pageIndex":' + msg.channel + ',"faderValue":' + (faderValue) + ',"type":1,"session":' + sessionnr + ',"maxRequests":0}');

	}


//BlackOut invert 
	if (msg.controller === 9) {
		if (msg.value <= 2) {
		faderValue = 0;
	} else {
		faderValue = ((msg.value) - 2);
		faderValue = (faderValue * 0.8);
		}
		grandmastervalue = faderValue;
	if (blackout == false){
	client.send('{"command":"SpecialMaster 2.1 At ' + (faderValue) + '","session":' + sessionnr + ',"requestType":"command","maxRequests":0}');
		}
	}


});



input.on('noteon', function(msg) {

	if (msg.note === 28){
		if (msg.velocity === 127) {
			blackout = true;
			client.send('{"command":"SpecialMaster 2.1 At ' + 0 + '","session":' + sessionnr + ',"requestType":"command","maxRequests":0}');
		} else {
			blackout = false;
			client.send('{"command":"SpecialMaster 2.1 At ' + (grandmastervalue) + '","session":' + sessionnr + ',"requestType":"command","maxRequests":0}');
		}
	}

	if (msg.note == 13){
		client.send('{"requestType":"encoder","name":"PAN","value":' + encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 14){
		client.send('{"requestType":"encoder","name":"PAN","value":' + -1 * encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 15)encodervalue = 2;
	if (msg.note == 16){
		client.send('{"requestType":"encoder","name":"TILT","value":' + encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 17){
		client.send('{"requestType":"encoder","name":"TILT","value":' + -1 * encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 18)encodervalue = 0.2;
	if (msg.note == 19){
		client.send('{"requestType":"encoder","name":"DIM","value":' + encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 20){
		client.send('{"requestType":"encoder","name":"DIM","value":' + -1 * encodervalue + ',"session":' + sessionnr + ',"maxRequests":0}');
	}
	if (msg.note == 21)encodervalue = 0.02;


	if (msg.note <=12 || msg.note >=29 && msg.note <=84){//80

		if (msg.note === 31 || msg.note === 34 || msg.note === 37 || msg.note === 40 || msg.note === 43 || msg.note === 46 || msg.note === 49 || msg.note === 52){
	
			if (msg.velocity === 127) {
					client.send('{"requestType":"playbacks_userInput","cmdline":"","execIndex":' + button.index[wing][msg.note] + ',"pageIndex":' + msg.channel + ',"buttonId":1,"pressed":true,"released":false,"type":0,"session":' + sessionnr + ',"maxRequests":0}');
			} else {
					client.send('{"requestType":"playbacks_userInput","cmdline":"","execIndex":' + button.index[wing][msg.note] + ',"pageIndex":' + msg.channel + ',"buttonId":1,"pressed":false,"released":true,"type":0,"session":' + sessionnr + ',"maxRequests":0}');
			}
		} else {

			if (msg.velocity === 127) {
				client.send('{"requestType":"playbacks_userInput","cmdline":"","execIndex":' + button.index[wing][msg.note] + ',"pageIndex":' + msg.channel + ',"buttonId":0,"pressed":true,"released":false,"type":0,"session":' + sessionnr + ',"maxRequests":0}');
			} else {
				client.send('{"requestType":"playbacks_userInput","cmdline":"","execIndex":' + button.index[wing][msg.note] + ',"pageIndex":' + msg.channel + ',"buttonId":0,"pressed":false,"released":true,"type":0,"session":' + sessionnr + ',"maxRequests":0}');
			}			
		}
	}
});














//WEBSOCKET-------------------
var W3CWebSocket = require('websocket')
    .w3cwebsocket;

var client = new W3CWebSocket('ws://localhost:80/');


client.onerror = function() {
    console.log('Connection Error');
};

client.onopen = function() {
    console.log('WebSocket Client Connected');

    function sendNumber() {
        if (client.readyState === client.OPEN) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            client.send(number.toString());
            setTimeout(sendNumber, 1000);
        }
    }
    sendNumber();
};

client.onclose = function() {
    console.log('echo-protocol Client Closed');
};

client.onmessage = function(e) {

	request = request + 1;
	//console.log ("Request "+ request);
		if (request >= 9) {
		client.send('{"session":' + sessionnr + '}');
		//client.send('{"requestType":"getdata","data":"set","session":' + sessionnr + ',"maxRequests":1}');
		request = 0;
		}


	if (typeof e.data === 'string') {
	//console.log("Received: '" + e.data + "'");
	//console.log("-----------------");
	//console.log(e.data);
	obj = JSON.parse(e.data);
		if (obj.status == "server ready") {
		client.send('{"session":0}');
		}

	        if (obj.forceLogin === true) {
		sessionnr = (obj.session);
		client.send('{"requestType":"login","username":"remote","password":"2c18e486683a3db1e645ad8523223b72","session":' + obj.session + ',"maxRequests":10}')
        	}

	        if (obj.responseType == "login" && obj.result === true) {
				if (interval_on == 0) {
					interval_on = 1;
					setInterval(interval, 500);//80
				}
        }

}};


