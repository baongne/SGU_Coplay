let videoStream; // Biến lưu trữ stream từ camera
const videoClient = document.getElementById('videoClient');
const videoRobot = document.getElementById('videoRobot');
const openButton = document.getElementById('openButton');
const stopButton = document.getElementById('stopButton');

function openCamera() {
  // Kiểm tra xem trình duyệt có hỗ trợ truy cập camera không
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Truy cập camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function(stream) {
      // Gán stream từ camera vào thẻ video
      videoClient.srcObject = stream;
      videoStream = stream;
      // Lưu trữ stream để sử dụng khi dừng camera
      // const videoTrack = stream.getVideoTracks()[0];
      // const videoSender = socket.emit('clientVideo', videoTrack)    
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


               