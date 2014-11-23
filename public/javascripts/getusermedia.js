navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

//var num = $('#id').html();

var socket = io.connect();
var audioContext = new AudioContext();
var sampleRate = 44100;
var bufferSize = 8192;
var lowBit = 1;
var osc = null;
//var javascriptnode = audioContext.createScriptProcessor(bufferSize, 1, 1);
//var javascriptnode = audioContext.createJavaScriptNode(bufferSize, 1, 1);
//var mediastreamsource;
//var scheduled_time = 0;

var audioData = [];
var streamBuffer = [];

socket.emit('status_from_client', num);

socket.on('stream_from_server',function(data) {
  streamBuffer.push(data.stream);
});

function playAudioStream(flo32arr) {
  var audio_buf = audioContext.createBuffer(1, bufferSize, sampleRate),
      audio_src = audioContext.createBufferSource(),
      current_time = audioContext.currentTime;
  var audioData = audio_buf.getChannelData(0);
  for(var i = 0; i < audioData.length; i++){
    audioData[i] = flo32arr[i];
  }
  audio_src.buffer = audio_buf;
  audio_src.connect(audioContext.destination);
  audio_src.start(0);
}

function onAudioProcess(e) {
  var input = e.inputBuffer.getChannelData(0);
  var bufferData = new Float32Array(bufferSize);
  var j=0;      
  for (var i = 0; i < bufferSize; i++) {
	  bufferData[i] = input[j];
    j= j+lowBit;
  }
  socket.json.emit('stream_from_client',{
    id: num,
    stream: bufferData
  });
  playAudioStream(streamBuffer.shift());
}

function initialize() {
  var javascriptnode = audioContext.createScriptProcessor(8192, 1, 1);

	navigator.getUserMedia(
		{video : false, audio : true},
		function(stream) {
		  var mediastreamsource;
			mediastreamsource = audioContext.createMediaStreamSource(stream);
    	mediastreamsource.connect(javascriptnode);
		},
		function(e) {
			console.log(e);
		}
	);
  javascriptnode.onaudioprocess = onAudioProcess;
  javascriptnode.connect(audioContext.destination);
}

window.addEventListener("load", initialize, false);
