navigator.bluetooth.requestDevice({ 
    acceptAllDevices: true 
  })
  .then(device => {
    // Thiết bị Bluetooth đã được chọn
    console.log('Đã chọn thiết bị Bluetooth:', device);
  })
  .catch(error => {
    // Xử lý lỗi
    console.error('Lỗi khi yêu cầu thiết bị Bluetooth:', error);
  });

  navigator.mediaDevices.getUserMedia({ 
    video: true 
  })
  .then(stream => {
    // Truy cập vào Camera thành công
    console.log('Đã truy cập vào Camera');
  })
  .catch(error => {
    // Xử lý lỗi
    console.error('Lỗi khi truy cập vào Camera:', error);
  });
  