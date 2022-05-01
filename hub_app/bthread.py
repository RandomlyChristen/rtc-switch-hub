import time
import random

import threading
from bluetooth import *


def synchronized(func):
    func.__lock__ = threading.Lock()

    def synced_func(*args, **kws):
        with func.__lock__:
            return func(*args, **kws)

    return synced_func


class BSocket(threading.Thread):
    def __init__(self, key, soc: BluetoothSocket, on_data_received):
        super().__init__()
        self.soc = soc
        self.on_data_received = on_data_received
        self.key = key

    def run(self) -> None:
        data = []
        while True:
            # 로컬 디버깅 용
            self.on_data_received(self.key, '{\"sensor\":%d, \"threshold\":%d, \"type\":%d, \"switch\":%d}' %
                                  (random.randint(0, 100), random.randint(0, 100),
                                   random.randint(0, 100), random.randint(0, 100)))
            time.sleep(1)
#             char = self.soc.recv(1).decode()
#             if char != '\n':
#                 data.append(char)
#             else:
#                 self.on_data_received(self.key, ''.join(data))
#                 data.clear()
