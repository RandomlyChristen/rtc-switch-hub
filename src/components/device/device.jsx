import React from 'react';
import styles from './device.module.css';
import { BsToggleOff, BsToggleOn } from "react-icons/bs";
import { FaTachometerAlt } from "react-icons/fa";
import { CgArrowLongRight, CgArrowsHAlt } from "react-icons/cg";
import { FcIdea } from "react-icons/fc";

const Device = ({deviceId, sensor, threshold, type, swi}) => {
  const lightInfo = () => {
    if (sensor === undefined) {
      return undefined;
    }
    else {
      return (<div className={styles.div}><FcIdea className={styles.light}/><div>{sensor}</div></div>);
    }
  }

  const switchInfo = () => {
    if (swi === undefined) {
      return undefined;
    }
    else if (swi === 0) {
      return (<div className={styles.div}><BsToggleOff className={styles.switch_off}/><div>꺼짐</div></div>);
    }
    else if (swi === 1) {
      return (<div className={styles.div}><BsToggleOn className={styles.switch_on}/><div>켜짐</div></div>);
    }
  }

  const thresholdInfo = () => {
    if (threshold === undefined) {
      return undefined;
    }
    else {
      return (<div className={styles.div}><FaTachometerAlt className={styles.threshold}/><div>{threshold}</div></div>);
    }
  }

  const typeInfo = () => {
    if (type === undefined) {
      return undefined;
    }
    else if (type === 0) {
      return (<div className={styles.div}><CgArrowLongRight className={styles.type}/><div>단방향</div></div>);
    }
    else if (type === 1) {
      return (<div className={styles.div}><CgArrowsHAlt className={styles.type}/><div>양방향</div></div>);
    }
  }

  return(
    <div className={styles.device_container}>
      <div className={styles.device}>
        <h3>{deviceId}</h3>
        {/*<p>현재 밝기: {sensor}</p>*/}
        {/*<p>스위치 상태: {swi}</p>*/}
        {/*<p>기준값: {threshold}</p>*/}
        {/*<p>모드: {type}</p>*/}
        <div className={styles.flex}>
          {lightInfo()}
          {switchInfo()}
        </div>
        <div className={styles.flex}>
          {thresholdInfo()}
          {typeInfo()}
        </div>
      </div>
    </div>
  );
}

export default Device;