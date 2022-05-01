import React, {useState} from 'react';
import styles from './login.module.css';
import {useHistory} from "react-router-dom";

const Login = ({setRoomId}) => {
  const [id, setId] = useState("");

  const history = useHistory();

  const goToConsole = () => {
    history.push({
      pathname: "./console"
    });
  };

  const onChangeHandler = (event) => {
    const type = event.target.name;
    if (type === "text") {
      setId(event.target.value);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (id !== "") {
      setRoomId(id);
      goToConsole();
    } else {
      alert("아이디를 입력해주세요.");
    }
  };

  return(
    <div className={styles.login}>
      <div className={styles.wrap}>
        <h1 className={styles.h1}>Smart IoT</h1>
        <div>
          <input
            type="text"
            name="text"
            placeholder="아이디를 입력해주세요."
            onChange={onChangeHandler}
            className={styles.input}
          />
          <button
            type="submit"
            className={styles.button}
            onClick={onSubmit}>
            완료
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;