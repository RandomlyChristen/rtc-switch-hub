import './App.module.css';
import Console from "./components/console/console";
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from "./components/login/login";
import {useState} from "react";

function App() {
  const [roomId, setRoomId] = useState("");

  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <Login setRoomId={setRoomId}/>
          </Route>
          <Route path="/console">
            <Console roomId={roomId}/>
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
