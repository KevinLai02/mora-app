import { useEffect, useState } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { JoinRoomDataT } from "./type";

function App({ socket }: any) {
  const [userName, setUserName] = useState("");
  const [roomID, setRoomID] = useState("");
  const navigate = useNavigate();
  const joinRoom = ({ roomID, userName }: JoinRoomDataT) => {
    socket.emit("joinRoom", { roomID, userName });
  };
  return (
    <div className="App">
      <div className="dataDiv">
        <input
          type="text"
          placeholder="輸入暱稱"
          className="input"
          defaultValue={userName}
          onChange={(e) => {
            setUserName(e.target.value);
          }}
        />
        <input
          type="text"
          placeholder="輸入房間代碼"
          className="input"
          defaultValue={roomID}
          onChange={(e) => {
            setRoomID(e.target.value);
          }}
        />
      </div>
      <div className="buttonDiv">
        <button
          disabled={userName === "" && roomID === ""}
          onClick={() => {
            joinRoom({ userName, roomID });
            navigate(`/room/${roomID}`, { state: { myUserName: userName } });
          }}
        >
          建立房間
        </button>
        <button
          disabled={userName === "" && roomID === ""}
          onClick={() => {
            joinRoom({ userName, roomID });
            navigate(`/room/${roomID}`, { state: { myUserName: userName } });
          }}
        >
          查詢房間
        </button>
      </div>
    </div>
  );
}

export default App;
