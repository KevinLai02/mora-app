export interface JoinRoomDataT{
    userName:string,
    roomID:string
}
export interface UserT {
    userName: string;
    isReady: boolean;
    mora: HAND_STATUS;
}
  
export enum GAME_STATE {
    PREPARE = "PREPARE",
    START = "START",
    MORA = "MORA",
    RESULT = "RESULT",
    TIE = "TIE",
}
export interface IGameState {
    state: GAME_STATE;
    winner: string;
}
export enum HAND_STATUS {
    NULL = "NULL",
    ROCK = "ROCK",
    PAPER = "PAPER",
    SCISSORS = "SCISSORS",
}
export interface SocketResT{
    roomID:string,
    userName:string,
}
export interface MoraT extends SocketResT{
    mora: HAND_STATUS
}