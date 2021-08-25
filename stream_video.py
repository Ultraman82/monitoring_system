# -*- coding: utf-8 -*-
"""
Created on Thu Nov 14 18:57:44 2019

@author: seraj
"""
import os
from time import sleep
import cv2
import json
from flask import Flask, render_template, Response
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from threading import Thread, Event
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from random import random
from utility import calc_ang_gps

app = Flask(__name__)
# CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
thread = Thread()
thread_stop_event = Event()


@app.route('/')
def index():
    """Video streaming home page."""
    return render_template('index.html')


def gen():
    """Video streaming generator function."""
    # cap = cv2.VideoCapture('768x576.avi')
    imgs_path = "/home/edgar/streaming/img/drone/"
    annos_path = "/home/edgar/streaming/anno"
    img_list = os.listdir(imgs_path)
    old_lat, old_lng = 0, 0
    for i in range(1, len(img_list) + 1):
        img_path = os.path.join(imgs_path, str(i) + '.jpg')
        anno_path = os.path.join(annos_path, str(i) + '.json')
        if i % 60 == 0:
            with open(anno_path) as json_file:
                info = json.load(json_file)['info']
                lat = float(info['latitude'])
                lng = float(info['longitude'])
                ang, meters = calc_ang_gps(old_lat, old_lng, lat, lng)
                latlng = {'lat': lat, 'lng': lng, 'ang': ang, 'meters': meters}
                socketio.emit('responseMessage', latlng)
                old_lat = lat
                old_lng = lng
        img = cv2.imread(img_path)
        img = cv2.resize(img, (0, 0), fx=0.5, fy=0.5)
        frame = cv2.imencode('.jpg', img)[1].tobytes()
        yield (b'--frame\r\n'b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        sleep(0.05)


@ app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return Response(gen(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@ app.route('/members')
def members():
    return{'test': 'test1'}


class DataThread(Thread):
    def __init__(self):
        self.delay = 0.5
        super(DataThread, self).__init__()

    def dataGenerator(self):
        print("Initialising")
        try:
            while not thread_stop_event.isSet():
                socketio.emit('responseMessage', {
                              'latlng': round(random()*10, 3)})
                sleep(self.delay)
        except KeyboardInterrupt:
            # kill()
            print("Keyboard  Interrupt")

    def run(self):
        self.dataGenerator()
# Handle the webapp connecting to the websocket


@ socketio.on('connect')
def test_connect():
    print('someone connected to websocket')
    emit('responseMessage', {'data': 'Connected! ayy'})
    # need visibility of the global thread object
    global thread
    if not thread.isAlive():
        print("Starting Thread")
        thread = DataThread()
        thread.start()

# Handle the webapp connecting to the websocket, including namespace for testing


@ socketio.on('connect', namespace='/devices')
def test_connect2():
    print('someone connected to websocket!')
    emit('responseMessage', {'data': 'Connected devices! ayy'})

# Handle the webapp sending a message to the websocket


@ socketio.on('message')
def handle_message(message):
    # print('someone sent to the websocket', message)
    print('Data', message["data"])
    print('Status', message["status"])
    global thread
    global thread_stop_event
    if (message["status"] == "Off"):
        if thread.isAlive():
            thread_stop_event.set()
        else:
            print("Thread not alive")
    elif (message["status"] == "On"):
        if not thread.isAlive():
            thread_stop_event.clear()
            print("Starting Thread")
            thread = DataThread()
            thread.start()
    else:
        print("Unknown command")


# Handle the webapp sending a message to the websocket, including namespace for testing
@ socketio.on('message', namespace='/devices')
def handle_message2():
    print('someone sent to the websocket!')


# handles all namespaces without an explicit error handler
@ socketio.on_error_default
def default_error_handler(e):
    print('An error occured:')
    print(e)


# if __name__ == "__main__":
#     app.run(debug=True)
if __name__ == '__main__':
    # socketio.run(app, debug=False, host='0.0.0.0')
    http_server = WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
