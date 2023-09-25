const DEFAULT_ROBOT_PROFILE = "RPI_BW_001";

const deviceNamePrefixMap = {
  ESP_CW_001: "CoPlay",
  RPI_BW_001: "BBC",
};

const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const UART_TX_CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

const {
  pairButton,
  sendButton,
  openButton,
  stopButton,
} = initializeDOMElements();
let {
  device,
  websocket,
  networkConfig,
  controlCommandMap,
  lastDirection,
} = initializeVariables();

function initializeDOMElements() {
  const pairButton = document.getElementById("pairButton");
  const sendButton = document.getElementById("sendButton");
  const openButton = document.getElementById("openButton");
  const stopButton = document.getElementById("stopButton");

  return {
    pairButton,
    sendButton,
    openButton,
    stopButton,
  };
}
function initializeVariables() {
  let device;
  let websocket;
  let networkConfig = {};
  let controlCommandMap = {
    KeyW: "N",
    KeyA: "CCW",
    KeyS: "S",
    KeyD: "CW",
    KeyM: "STOP",
  };
  let lastDirection;

  return {
    device,
    websocket,
    networkConfig,
    controlCommandMap,
    lastDirection,
  };
}

async function bluetoothPairing() {
  const robotProfile = document.getElementById("robotProfile");
  const robotNameInput = document.getElementById("robotNameInput");
  device = await connectToBluetoothDevice(
    deviceNamePrefixMap[robotProfile.value] ?? undefined
  );
  robotNameInput.value = device.name;
}

function sendMediaServerInfo() {
  const ssidInput = document.getElementById("ssidInput");
  const passwordInput = document.getElementById("passwordInput");
  const hostInput = document.getElementById("hostInput");
  const portInput = document.getElementById("portInput");
  const channelNameInput = document.getElementById("channelNameInput");
  const robotProfile = document.getElementById("robotProfile");

  networkConfig = {
    ssid: ssidInput.value,
    password: passwordInput.value,
    host: hostInput.value,
    port: portInput.value,
    channel: "instant",

    channel_name: "zugiv",

  };

  const devicePort =
    window.location.protocol.replace(/:$/, "") === "http"
      ? networkConfig.port
      : networkConfig.port - 1;

  if (device) {
    const metricData = {
      type: "metric",
      data: {
        server: {
          ssid: networkConfig.ssid,
          password: networkConfig.password,
          host: networkConfig.host,
          port: devicePort,
          path: `pang/ws/pub?channel=instant&name=${networkConfig.channel_name}&track=video&mode=bundle`,
        },
        profile: robotProfile.value,
      },
    };
    sendMessageToDeviceOverBluetooth(JSON.stringify(metricData), device);
  }
}

function stop() {
  websocket.close();
  disconnectFromBluetoothDevice(device);
}

async function connectToBluetoothDevice(deviceNamePrefix) {
  const options = {
    filters: [
      { namePrefix: deviceNamePrefix },
      { services: [UART_SERVICE_UUID] },
    ].filter(Boolean),
  };

  try {
    device = await navigator.bluetooth.requestDevice(options);
    console.log("Found Bluetooth device: ", device);

    await device.gatt?.connect();
    console.log("Connected to GATT server");

    return device;
  } catch (error) {
    console.error(error);
  }
}

function disconnectFromBluetoothDevice(device) {
  if (device.gatt?.connected) {
    device.gatt.disconnect();
  } else {
    console.log("Bluetooth Device is already disconnected");
  }
}

async function sendMessageToDeviceOverBluetooth(message, device) {
  const MAX_MESSAGE_LENGTH = 15;
  const messageArray = [];

  // Split message into smaller chunks
  while (message.length > 0) {
    const chunk = message.slice(0, MAX_MESSAGE_LENGTH);
    message = message.slice(MAX_MESSAGE_LENGTH);
    messageArray.push(chunk);
  }

  if (messageArray.length > 1) {
    messageArray[0] = `${messageArray[0]}#${messageArray.length}$`;
    for (let i = 1; i < messageArray.length; i++) {
      messageArray[i] = `${messageArray[i]}$`;
    }
  }

  console.log("Connecting to GATT Server...");
  const server = await device.gatt?.connect();

  console.log("Getting UART Service...");
  const service = await server?.getPrimaryService(UART_SERVICE_UUID);

  console.log("Getting UART RX Characteristic...");
  const rxCharacteristic = await service?.getCharacteristic(
    UART_RX_CHARACTERISTIC_UUID
  );

  // Check GATT operations is ready to write
  if (rxCharacteristic?.properties.write) {
    // Send each chunk to the device
    for (const chunk of messageArray) {
      try {
        await rxCharacteristic?.writeValue(new TextEncoder().encode(chunk));
        console.log(`Message sent: ${chunk}`);
      } catch (error) {
        console.error(`Error sending message: ${error}`);
      }
    }
  }
}


function drawVideoFrameOnCanvas(canvas, frame) {
  console.log("drawing video frame on canvas");
  
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
}

async function handleKeyDown(e) {
  const direction = controlCommandMap[e.code];
  if (direction === lastDirection) return;
  lastDirection = direction;

  const controlCommand = {
    type: "control",
    direction,
  };

  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(controlCommand));
    displayMessage(direction);
  }
}
async function sendcontrol(e) {
  const direction = e;
  if (direction === lastDirection) return;
  lastDirection = direction;

  const controlCommand = {
    type: "control",
    direction,
  };

  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(controlCommand));
    displayMessage(direction);
  }
}

var socket2 = io.connect('http://127.0.0.1:5000/');
socket2.on('connect', function() {
    socket2.emit('my event', {data: "Hello"})
});

socket2.on('test event', function(data) {
  console.log(data['data']);
  // Đi thẳng
  if (data['data'] == "LopenRopen" ||data['data'] == "RopenLopen"||data['data'] == "Ropen"||data['data'] == "Lopen" ) {
    sendcontrol('N');
  }
  // Đi chéo tới phải
  else if (data['data'] == "LopenRhi" ||data['data'] == "RhiLopen") {
    sendcontrol('FL');
  }
  // Đi quẹo phải
  else if (data['data'] == "LopenRgun" ||data['data'] == "RgunLopen") {
    sendcontrol('FCW');
  }
  // Đi qua phải không xoay
  else if (data['data'] == "LopenRpunch" ||data['data'] == "RpunchLopen") {
    sendcontrol('L');
  }
  // Đi chéo tới trái
  else if (data['data'] == "LhiRopen" ||data['data'] == "RopenLhi") {
    sendcontrol('FR');
  }
  // Đi quẹo trái
  else if (data['data'] == "LgunRopen" ||data['data'] == "RopenLgun") {
    sendcontrol('FCC');
  }
  // Đi qua trái không xoay
  else if (data['data'] == "RopenLpunch" ||data['data'] == "LpunchRopen") {
    sendcontrol('R');
  }
  
  
  // Tại Chỗ
  //Dừng
  else if (data['data'] == "LpunchRpunch" ||data['data'] == "RpunchLpunch"||data['data'] == "Lpunch"||data['data'] == "Rpunch") {
    sendcontrol('STOP');
  }
  // Xoay Trái
  else if (data['data'] == "LhiRpunch" ||data['data'] == "RpunchLhi") {
    sendcontrol('CCW');
  }
  // Xoay Phải
  else if (data['data'] == "RhiLpunch" ||data['data'] == "LpunchRhi") {
    sendcontrol('CW');
  }
  
  
  
  // Đi Lùi
  else if (data['data'] == "LpointerRpointer" ||data['data'] == "RpointerLpointer" ||data['data'] == "Rpointer" ||data['data'] == "Lpointer") {
    sendcontrol('S');
  }
  // Đi Lùi Chéo Phải
  else if (data['data'] == "LpointerRhi" ||data['data'] == "RhiLpointer" ) {
    sendcontrol('BL');
  }
  // Đi Lùi Quẹo Phải
  else if (data['data'] == "LpointerRgun" ||data['data'] == "RgunLpointer" ) {
    sendcontrol('BCC');
  }
  // Đi Lùi Chéo Trái
  else if (data['data'] == "LhiRpointer" ||data['data'] == "RpointerLhi") {
    sendcontrol('BR');
  }
  // Đi Lùi Quẹo Trái
  else if (data['data'] == "LgunRpointer" ||data['data'] == "RpointerLgun") {
    sendcontrol('BCW');
  }
  
  else if (data['data'] == "RgunLgun" ||data['data'] == "LgunRgun") {
    sendcontrol('TURN180');
  }
  
  
  
  
});

async function handleKeyUp(e) {
  const direction = "STOP";
  if (direction === lastDirection) return;
  lastDirection = direction;

  const controlCommand = {
    type: "control",
    direction,
  };

  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(controlCommand));
    displayMessage(direction);
  }
}

function displayMessage(messageContent) {
  const messageView = document.getElementById("messageView");

  if (typeof messageContent == "object") {
    messageContent = JSON.stringify(messageContent);
  }
  messageView.innerHTML += `${messageContent}\n`;
  messageView.scrollTop = messageView.scrollHeight;
}

function keepWebSocketAlive(webSocket, interval) {
  const pingInterval = interval ?? 10000;
  let pingTimer;

  function sendPing() {
    if (webSocket.readyState === WebSocket.OPEN) {
      webSocket.send("ping");
    }
  }

  function schedulePing() {
    pingTimer = setInterval(sendPing, pingInterval);

  }
  sendButton.addEventListener("click", sendMediaServerInfo);
});

function openWebSocket() {
  const videoRobot = document.getElementById("videoRobot");

  const path = `pang/ws/sub?channel=instant&name=zugiv&track=video&mode=bundle`;
  const serverURL = `${
    window.location.protocol.replace(/:$/, "") === "https" ? "wss" : "ws"
  }://agilertc.com:8277/${path}`;

  websocket = new WebSocket(serverURL);
  websocket.binaryType = "arraybuffer";
  websocket.onopen = async () => {
    if (device) {
      await getVideoStream({
        deviceId: device.id,
      }).then(async (stream) => {
        videoRobot.srcObject = stream;
      });
    }
  };
  displayMessage("Open Video WebSocket");
}