import { FaHandPaper } from "react-icons/fa";
import { FaHandScissors } from "react-icons/fa";
import { FaHandBackFist } from "react-icons/fa6";
import { useLocation } from "react-router-dom";

import { useEffect, useRef, useState } from "react";
import { GAME_STATE, HAND_STATUS, IGameState, UserT } from "./type";

export default function Room({ socket }: any) {
  const location = useLocation();
  const roomID = location.pathname.split("/")[2];
  const [gameState, setGameState] = useState<IGameState>({
    state: GAME_STATE.PREPARE,
    winner: "",
  });
  const [opponent, setOpponent] = useState<UserT>({
    userName: "",
    isReady: false,
    mora: HAND_STATUS.NULL,
  });
  const [user, setUser] = useState<UserT>({
    userName: location.state.myUserName,
    isReady: false,
    mora: HAND_STATUS.NULL,
  });
  const [isUserMora, setIsUserMora] = useState(false);
  const intervalRef = useRef<NodeJS.Timer>();
  const [timer, setTimer] = useState(10);
  const winMoraState = {
    ROCK: "PAPER",
    PAPER: "SCISSORS",
    SCISSORS: "ROCK",
  };
  const reset = () => {
    setGameState({ state: GAME_STATE.PREPARE, winner: "" });
    setOpponent({ ...opponent, isReady: false, mora: HAND_STATUS.NULL });
    setUser({ ...user, isReady: false, mora: HAND_STATUS.NULL });
    setTimer(10);
    setIsUserMora(false)
  };

  useEffect(() => {
    socket.on("broadcast", (res: any) => {
      if (res.userName !== user.userName) {
        setOpponent({
          isReady: false,
          mora: HAND_STATUS.NULL,
          userName: res.userName,
        });
      }
    });
    socket.on("joinRoom", (res: any) => {
      if (res.userName !== user.userName) {
        setOpponent({
          isReady: opponent.isReady,
          mora: opponent.mora,
          userName: res.userName,
        });
        socket.emit("broadcast", { userName: user.userName, roomID });
      }
    });
    socket.on("onReady", (res: any) => {
      if (res.userName !== user.userName) {
        setOpponent({
          mora: opponent.mora,
          userName: res.userName,
          isReady: true,
        });
      }
    });
    socket.on("start", () => {
      setGameState({ winner: "", state: GAME_STATE.START });
    });
    socket.on("mora", (res: any) => {
      if (res.userName !== user.userName) {
        setOpponent({
          isReady: opponent.isReady,
          userName: res.userName,
          mora: res.mora,
        });
        setIsUserMora(true);
      }
    });
  }, [socket]);

  useEffect(() => {
    if (gameState.state === GAME_STATE.START) {
      const id = setInterval(() => {
        setTimer((timer) => timer - 1);
      }, 1000);
      intervalRef.current = id;
    }

    if (timer === 0 && gameState.state === GAME_STATE.START) {
      clearInterval(intervalRef.current);
      socket.emit("mora", { roomID, mora: user.mora, userName: user.userName });
      setGameState({ winner: gameState.winner, state: GAME_STATE.MORA });
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [gameState, roomID, socket, timer, user.mora, user.userName]);
  useEffect(() => {
    if (gameState.state === GAME_STATE.MORA && isUserMora) {
      if (user.mora === opponent.mora) {
        return setGameState({
          state: GAME_STATE.TIE,
          winner: gameState.winner,
        });
      } else if (user.mora === HAND_STATUS.NULL) {
        return setGameState({
          state: GAME_STATE.RESULT,
          winner: opponent.userName,
        });
      } else if (opponent.mora === HAND_STATUS.NULL) {
        return setGameState({
          state: GAME_STATE.RESULT,
          winner: user.userName,
        });
      } else if (winMoraState[user.mora] === opponent.mora) {
        return setGameState({
          state: GAME_STATE.RESULT,
          winner: opponent.userName,
        });
      } else {
        return setGameState({
          state: GAME_STATE.RESULT,
          winner: user.userName,
        });
      }
    }
    if(gameState.state === GAME_STATE.RESULT || gameState.state === GAME_STATE.TIE) {
      setTimeout(() => { 
        reset()
      }, 3000)
    }
  }, [gameState, isUserMora]);
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-400">
        <div className="flex-1 flex items-center">
          {opponent.mora === HAND_STATUS.NULL && (
            <div className="w-[150px] h-[150px] border rounded-full"></div>
          )}
          {opponent.mora === HAND_STATUS.PAPER && (
            <FaHandPaper
              color="gray"
              className="border rounded-full p-2"
              size={150}
            />
          )}
          {opponent.mora === HAND_STATUS.ROCK && (
            <FaHandBackFist
              color="gray"
              className="border rounded-full p-2"
              size={150}
            />
          )}
          {opponent.mora === HAND_STATUS.SCISSORS && (
            <FaHandScissors
              color="gray"
              className="border rounded-full p-2"
              size={150}
            />
          )}
        </div>
        <div className="flex flex-col items-center py-2">
          <div className="text-lg font-bold text-green-600">
            {opponent.isReady && gameState.state === GAME_STATE.PREPARE
              ? "已準備"
              : ""}
          </div>
          <div className="flex flex-row items-center gap-2">
            {gameState.state === GAME_STATE.RESULT &&
              gameState.winner === opponent.userName && (
                <div className="text-xl font-bold text-green-700">獲勝</div>
              )}
            {gameState.state === GAME_STATE.TIE && (
              <div className="text-xl font-bold text-green-700">平手</div>
            )}
            <div className="text-lg font-bold">
              {opponent.userName === "" ? "等待加入..." : opponent.userName}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 ">
        <div className="flex flex-row items-center gap-2">
          {gameState.state === GAME_STATE.RESULT &&
            gameState.winner === user.userName && (
              <div className="text-xl font-bold text-green-700">獲勝</div>
            )}
          {gameState.state === GAME_STATE.TIE && (
            <div className="text-xl font-bold text-green-700">平手</div>
          )}
          <div className="text-lg font-bold py-2">{`我 (${user.userName})`}</div>
        </div>
        <div className="flex-1 flex items-center gap-20">
          <button
            onClick={() => {
              setUser({ ...user, mora: HAND_STATUS.PAPER });
            }}
            className={`border rounded-full p-4 ${
              user.mora === HAND_STATUS.PAPER
                ? "border-red-500"
                : "border-gray-400"
            }`}
          >
            <FaHandPaper color="gray" size={100} />
          </button>
          <button
            onClick={() => {
              setUser({ ...user, mora: HAND_STATUS.SCISSORS });
            }}
            className={`border rounded-full p-4 ${
              user.mora === HAND_STATUS.SCISSORS
                ? "border-red-500"
                : "border-gray-400"
            }`}
          >
            <FaHandScissors color="gray" size={100} />
          </button>
          <button
            onClick={() => {
              setUser({ ...user, mora: HAND_STATUS.ROCK });
            }}
            className={`border rounded-full p-4 ${
              user.mora === HAND_STATUS.ROCK
                ? "border-red-500"
                : "border-gray-400"
            }`}
          >
            <FaHandBackFist color="gray" size={100} />
          </button>
        </div>
        <div className="flex flex-col items-center my-7">
          {gameState.state === GAME_STATE.START && (
            <div className="text-2xl text-red-500">{timer}</div>
          )}
          {!opponent.isReady && !user.isReady && (
            <button
              className="border py-2 px-5 rounded-lg bg-gray-400"
              disabled={!opponent.userName}
              onClick={() => {
                socket.emit("onReady", { userName: user.userName, roomID });
                setUser({ ...user, isReady: true });
              }}
            >
              發起挑戰
            </button>
          )}
          {opponent.isReady && !user.isReady && (
            <button
              className="border py-2 px-5 rounded-lg bg-gray-400"
              onClick={() => {
                socket.emit("start", { roomID });
                setUser({ ...user, isReady: true });
              }}
            >
              開始
            </button>
          )}
          {gameState.state === GAME_STATE.START && (
            <button
              className="border py-2 px-5 rounded-lg bg-gray-400"
              disabled
            >
              等待...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
