# from flask import Flask, Response
# from flask_socketio import SocketIO, emit, send
# from ultralytics import YOLO
# import json
# import cv2

# app = Flask(__name__)
# socketio = SocketIO(app, cors_allowed_origins="*")

# # @socketio.on('my event')
# # def handle_connect(data):
# #     print(data)

# @socketio.on('test event')
# def handle_testevent():
#     emit('test event', "{data:" + "Hello" + "}")

# def video_detection(path_x):
#     with app.app_context():
#         video_capture = path_x
#         cap = cv2.VideoCapture(video_capture)
#         model = YOLO("best.pt")
#         classNames = ["go", "stop"]
#         while True:
#             success, img = cap.read()
#             results = model(img, stream=True)
#             for r in results:
#                 boxes = r.boxes
#                 for box in boxes:
#                     class_name = classNames[int(box.cls[0])]
#                     socketio.emit("test event", {'data': class_name})
                    
#             yield img

# def generate_frames(path_x=''):
#     yolo_output = video_detection(path_x)
#     for detection in yolo_output:
#         ref, buffer = cv2.imencode('.jpg', detection)
#         frame = buffer.tobytes()
#         yield (b'--frame\r\n'
#                 b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# @app.route('/video')
# def video():
#     return Response(generate_frames(path_x=0), mimetype='multipart/x-mixed-replace; boundary=frame')

# if __name__ == "__main__":
#     socketio.run(app, debug=True, allow_unsafe_werkzeug=True)




from flask import Flask, Response
from flask_socketio import SocketIO, emit, send
from ultralytics import YOLO
import json
import cv2

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# @socketio.on('my event')
# def handle_connect(data):
#     print(data)

@socketio.on('test event')
def handle_testevent():
    emit('test event', "{data:" + "Hello" + "}")

def video_detection(path_x):
    with app.app_context():
        video_capture = path_x
        cap = cv2.VideoCapture(video_capture)
        model = YOLO("best.pt")
        classNames = ["go", "stop"]
        # classNames = ['Hitsuji-Ram-', 'I-Boar-', 'Inu-Dog-', 'Mi-Snake-', 'Ne-Rat-', 'Saru-Monkey-', 'Tatsu-Dragon-', 'Tora-Tiger-', 'Tori-Bird-', 'U-Hare-', 'Uma-Horse-', 'Ushi-Ox-']
        while True:
            _, img = cap.read()
            results = model.predict(img, stream=True)
            for r in results:
                print(type(r))
                for box in r.boxes:
                    print(type(box))
                    class_name = classNames[int(box.cls[0])]                    
                    socketio.emit("test event", {'data': class_name})
                    # if(class_name == "go"):
                    #     press('w')
                    # if(class_name == "stop"):
                    #     press('s')
                    
                    
            yield img

def generate_frames(path_x=''):
    yolo_output = video_detection(path_x)
    for detection in yolo_output:
        ref, buffer = cv2.imencode('.jpg', detection)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video')
def video():
    return Response(generate_frames(path_x=0), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    socketio.run(app, debug=True, allow_unsafe_werkzeug=True)



#hello