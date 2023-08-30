const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

// Xu li ket noi tu client
io.on('connection', (socket) => {
    console.log("Client đã kết nối")
    // Xu li event khi client gui video len server
    socket.on('video', (data) => {
        // Gui video tu server toi robot
        io.emit('robotVideo', data)
    })
    // Xu li event khi robot gui video ve server
    socket.on('robotVideo', (data) => {
        io.emit('clientVideo', data)
    })
    // Xu li event khi client ngat ket noi
    socket.on('disconnect', () => {
        console.log('Client đã ngắt kết nối')
    })
})

const port = 3000
http.listen(port, () => {
    console.log('Server đang lắng nghe cổng ${port}')
})