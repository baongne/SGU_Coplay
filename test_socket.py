from flask import Flask, render_template, Response, jsonify, request, session
from ultralytics import YOLO
import cv2
import math
import socket
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app)

def video_detection(path_x):
    video_capture = path_x
    #Create a Webcam Object
    cap=cv2.VideoCapture(video_capture)
    frame_width=int(cap.get(3))
    frame_height=int(cap.get(4))

    model=YOLO("best.pt")
    classNames = ["go", "stop"]
    while True:
        success, img = cap.read()
        results=model(img,stream=True)
        for r in results:
            boxes=r.boxes
            
            for box in boxes:
                cls=int(box.cls[0])
                class_name=classNames[cls]
                # Truyền class_name qua socket
                print(class_name)
                
                socketio.emit('class_name', class_name)
        yield img

def generate_frames(path_x=''):
    yolo_output = video_detection(path_x)
    for detection in yolo_output:
        ref,buffer = cv2.imencode('.jpg',detection)
        frame= buffer.tobytes()
        yield (b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame +b'\r\n')
@app.route('/video')
def video():
    #return Response(generate_frames(path_x='static/files/bikes.mp4'), mimetype='multipart/x-mixed-replace; boundary=frame')
    return Response(generate_frames(path_x = 0),mimetype='multipart/x-mixed-replace; boundary=frame')

@socketio.on('connect')
def on_connect():
    print('Client connected')

@socketio.on('disconnect')
def on_disconnect():
    print('Client disconnected')

if __name__ == "__main__":
    app.run(debug=True)
