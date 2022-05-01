import React from 'react';
import styles from './header.module.css';

const Header = ({userName}) => {

  return (
    <div className={styles.header}>
      <div className={styles.div}>PATH-HACK</div>
      <div className={styles.div}>Room {userName}</div>
    </div>
  );
}

export default Header;