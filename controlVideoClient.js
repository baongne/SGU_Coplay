const express = require('express')
const app = express()
const fs = require('fs')
app.use(express.json())

app.post('/upload', (req, res) => {
    const videoData = req.body.videoData
    const videoName = req.body.videoName
    fs.writeFile(`upload/${videoName}`, videoData, 'base64', (err) => {
        if (err) {
            console.error(err)
            res.status(500).send("Lỗi khi lưu video")
        }
    })
})