import React, {useEffect, useRef} from 'react';
import styles from './video.module.css';

const Video = ({stream}) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (!videoRef || !stream) return;
    videoRef.current.srcObject = stream;
  }, [stream]);

  return(
    <div className={styles.video_container}>
      <video autoPlay="autoplay" className={styles.video} ref={videoRef}>
      </video>
    </div>
  );
}

export default Video;