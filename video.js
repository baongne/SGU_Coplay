let videoStream; // Biến lưu trữ stream từ camera
const videoClient = document.getElementById('videoClient');
const videoRobot = document.getElementById('videoRobot');
const openButton = document.getElementById('openButton');
const stopButton = document.getElementById('stopButton');


function handleVideoStream(stream) {
  // Gửi video từ client lên server
  socket.emit('videoClient', stream);
}

function openCamera() {
  // Kiểm tra xem trình duyệt có hỗ trợ truy cập camera không
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Truy cập camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function(stream) {
      // Gán stream từ camera vào thẻ video
      videoClient.srcObject = stream;
      videoStream = stream;
      handleVideoStream(stream);   
    })
      .catch(function(error) {
        console.error('Lỗi truy cập camera: ', error);
      });
  } else {
    console.error('Trình duyệt không hỗ trợ truy cập camera.');
  }
  // Vô hiệu hóa nút "Open"
  openButton.disabled = true;
  // Kích hoạt nút "Close"
  stopButton.disabled = false;
}

function stopCamera() {
  if (videoStream) {
    // Dừng stream từ camera
    videoStream.getTracks().forEach(function(track) {
      track.stop();
    });
    videoStream = null;
    // Xóa stream từ thẻ video
    videoClient.srcObject = null; 
  }
  // Vô hiệu hóa nút "Close"
  stopButton.disabled = true;
  // Kích hoạt nút "Open"
  openButton.disabled = false;
}

// navigator.mediaDevices.getUserMedia({ video: true})
//   .then(function(streamRobot) {
//     videoRobot.srcObject = streamRobot
//   })
//   .catch(function(error) {
//     console.error('Lỗi khi truy cập camera của robot:', error);
//   });

// Kết nối tới robot và nhận video stream
// const socket = new WebSocket('ws://your-robot-ip-address:your-robot-port');
// socket.onopen = function() {
//   console.log('Đã kết nối tới robot');
// };

// socket.onmessage = function(event) {
//   // Nhận dữ liệu video từ robot
//   const videoData = event.data;

//   // Chuyển đổi dữ liệu video thành dạng blob
//   const videoBlob = new Blob([videoData], { type: 'video/mp4' });

//   // Tạo URL cho blob
//   const videoURL = URL.createObjectURL(videoBlob);

//   // Hiển thị video trên thẻ video
//   videoRobot.src = videoURL;
// };

// socket.onclose = function() {
//   console.log('Đã đóng kết nối tới robot');
// };

            