const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client.html');
  })

// Xu li ket noi tu client
io.on('connection', (socket) => {
    console.log("Client đã kết nối")
    // Xu li event khi client gui video len moth server
    socket.on('videoClient', (data) => {
        // Gui video tu server toi robot
        io.emit('videoRobot', data)
        console.log('Nhận được video từ client', data)
    })
    // Xu li event khi robot gui video ve server
    socket.on('videoRobot', (data) => {
        // Gui video tu server toi client
        io.emit('videoClient', data)
        console.log('Nhận được video từ robot', data)
    })
    // Xu li event khi client ngat ket noi
    socket.on('disconnect', () => {
        console.log('Client đã ngắt kết nối')
    })
})

server.listen(3000, () => {
    console.log('Server đang lắng nghe cổng 3000')
})
//-----------------------------------------------------//

// const {
//     pairButton,
//     sendButton,
//     openButton,
//     stopButton,
//   } = initializeDOMElements();
// let {
//     device,
//     websocket,
//     networkConfig,
//     gestureRecognizer,
//     runningMode,
//     controlCommandMap,
//     lastDirection,
// } = initializeVariables();
  
// function initializeDOMElements() {
//     const pairButton = document.getElementById("pairButton");
//     const sendButton = document.getElementById("sendButton");
//     const openButton = document.getElementById("openButton");
//     const stopButton = document.getElementById("stopButton");
//     return {
//       pairButton,
//       sendButton,
//       openButton,
//       stopButton,
//     };
// }

// function initializeVariables() {
//     let device;
//     let websocket;
//     let networkConfig = {};
//     let gestureRecognizer;
//     // let runningMode = "IMAGE";
//     // let controlCommandMap = {
//     //   Closed_Fist: "N",
//     //   Open_Palm: "W",
//     //   Pointing_Up: "S",
//     //   Thumb_Up: "E",
//     //   Victory: "STOP",
//     // };
//     let lastDirection;
  
//     return {
//       device,
//       websocket,
//       networkConfig,
//       gestureRecognizer,
//       runningMode,
//       controlCommandMap,
//       lastDirection,
//     };
// }

// function sendMediaServerInfo() {
//     const ssidInput = document.getElementById("ssidInput");
//     const passwordInput = document.getElementById("passwordInput");
//     const hostInput = document.getElementById("hostInput");
//     const portInput = document.getElementById("portInput");
//     const chanelNameInput = document.getElementById("chanelNameInput");
//     const robotProfile = document.getElementById("robotProfile");
  
//     networkConfig = {
//       ssid: ssidInput.value,
//       password: passwordInput.value,
//       host: hostInput.value,
//       port: portInput.value,
//       channel: "instant",
//       channel_name: chanelNameInput.value,
//     };
  
//     const devicePort =
//       window.location.protocol.replace(/:$/, "") === "http"
//         ? networkConfig.port
//         : networkConfig.port - 1;
  
//     if (device) {
//       const metricData = {
//         type: "metric",
//         data: {
//           server: {
//             ssid: networkConfig.ssid,
//             password: networkConfig.password,
//             host: networkConfig.host,
//             port: devicePort,
//             path: `pang/ws/pub?channel=instant&name=zugiv&track=video&mode=bundle`,
//           },
//           profile: robotProfile.value,
//         },
//       };
//       sendMessageToDeviceOverBluetooth(JSON.stringify(metricData), device);
//     }
//   }


// function openWebSocket() {
//     const videoClient = document.getElementById("videoClient");
  
//     const path = `pang/ws/sub?channel=instant&name=zugiv&track=video&mode=bundle`;
//     const serverURL = `${
//       window.location.protocol.replace(/:$/, "") === "https" ? "wss" : "ws"
//     }://${networkConfig.host}:${networkConfig.port}/${path}`;
  
//     websocket = new WebSocket(serverURL);
//     websocket.binaryType = "arraybuffer";
//     websocket.onopen = async () => {
//       if (device) {
//         await getVideoStream({
//           deviceId: device.id,
//         }).then(async (stream) => {
//           videoClient.srcObject = stream;
  
//           await createGestureRecognizer().then(() => {
//             detectHandGestureFromVideo(gestureRecognizer, stream);
//           });
//         });
//       }
//     };
//     displayMessage("Open Video WebSocket");
//     keepWebSocketAlive(websocket);
// }


// let videoStream; // Biến lưu trữ stream từ camera
// const videoClient = document.getElementById('videoClient');
// const videoRobot = document.getElementById('videoRobot');
// const openButton = document.getElementById('openButton');
// const stopButton = document.getElementById('stopButton');

// function openCamera() {
//   // Kiểm tra xem trình duyệt có hỗ trợ truy cập camera không
//   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//     // Truy cập camera
//     navigator.mediaDevices.getUserMedia({ video: true })
//       .then(function(stream) {
//       // Gán stream từ camera vào thẻ video
//       videoClient.srcObject = stream;
//       videoStream = stream;
//       // Lưu trữ stream để sử dụng khi dừng camera
//       // const videoTrack = stream.getVideoTracks()[0];
//       // const videoSender = socket.emit('clientVideo', videoTrack)    
//     })
//       .catch(function(error) {
//         console.error('Lỗi truy cập camera: ', error);
//       });
//   } else {
//     console.error('Trình duyệt không hỗ trợ truy cập camera.');
//   }
//   // Vô hiệu hóa nút "Open"
//   openButton.disabled = true;
//   // Kích hoạt nút "Close"
//   stopButton.disabled = false;
// }

// function stopCamera() {
//     if (videoStream) {
//       // Dừng stream từ camera
//       videoStream.getTracks().forEach(function(track) {
//         websocket.close();
//         track.stop();
//       });
//       videoStream = null;
//       // Xóa stream từ thẻ video
//       videoClient.srcObject = null; 
//     }
//     // Vô hiệu hóa nút "Close"
//     stopButton.disabled = true;
//     // Kích hoạt nút "Open"
//     openButton.disabled = false;
//   }

// document.addEventListener("DOMContentLoaded", () => {
//     // pairButton.addEventListener("click", bluetoothPairing);
//     sendButton.addEventListener("click", sendMediaServerInfo);
//     openButton.addEventListener("click", openWebSocket);
//     stopButton.addEventListener("click", stopCamera);
//   });
