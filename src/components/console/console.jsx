import React, {useEffect, useState} from 'react';
import Header from "../header/header";
import Video from "../video/video";
import Device from "../device/device";
import styles from './console.module.css';
import {
  connectSignalling,
  disconnectSignalling,
  setOnDataChanged,
  setOnRemoteTrack
} from "../../service/socket_service";

const Console = ({roomId}) => {
  const [devices, setDevices] = useState({});
  const [stream, setStream] = useState(null);

  useEffect(()=> {
    if(roomId !== '') {
      connectSignalling(roomId);
      setOnDataChanged((devices) => {
        console.log(devices);
        setDevices(JSON.parse(devices).devices);
      });
      setOnRemoteTrack((stream) => {
        setStream(stream);
      });
    }
    return disconnectSignalling;
  }, [roomId]);

  const userName = 'Easy';

  return(
    <div>
      <Header userName={userName}/>
      <div className={styles.console_wrap}>
        <Video stream={stream}/>
        <div className={styles.device_wrap}>
          <p className={styles.device_title}>Device 목록</p>
          <div className={styles.device_ids}>
            {Object.keys(devices).map((deviceId) =>
              <p key={deviceId} className={styles.device_id}>{deviceId}</p>
            )}
          </div>
          {Object.keys(devices).map((deviceId) =>
            <Device
              key={deviceId}
              deviceId={deviceId}
              sensor={devices[deviceId].sensor}
              threshold={devices[deviceId].threshold}
              type={devices[deviceId].type}
              swi={devices[deviceId].switch}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Console;