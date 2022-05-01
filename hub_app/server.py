# python-socketio==4.3.2
# python-engineio==4.6.1
# tornado==6.1
# websocket-client==1.3.2
# PyBluez==0.23
import json
from json import JSONDecodeError

import socketio
from bthread import *

HOST = 'http://localhost'
PORT = 8080

sio = socketio.Client()
sio.connect(HOST + ':' + str(PORT))
sio.emit('dataSource')

# 페어링 된 디바이스 목록
device_list = ['98:D3:71:F9:E4:7E', '98:D3:51:FD:81:05']
device_map = {}
device_info = {}


@synchronized
def on_data_received(key, d):
    print(key, d)
    try:
        device_info[key] = json.loads(d)
    except JSONDecodeError:
        pass
    sio.emit('devices', {'devices': device_info})


for device_mac in device_list:
    socket = BluetoothSocket(RFCOMM)
#     socket.connect((device_mac, 1))  # 로컬 디버깅 시 주석 처리 할 것
    d_id = device_mac.replace(':', '_')
    device_map[d_id] = BSocket(d_id, socket, on_data_received)
    device_map[d_id].start()

print('start')

while True:
    pass
