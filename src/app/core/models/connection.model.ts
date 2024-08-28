import { ChatObjectI } from "./chat.model";

export interface LoginCredentialsI {
    username: string;
    password: string;
}

export interface UserRegistrationI {
    username: string,
    salt: string,
    pass: string,
    email: string,
    active: Boolean
}

export interface LoginRequestI {
    username: string;
    loginHash: string;
}

export interface HandshakeI {
    connectionHash: string;
    username: string;
    jwt: string;
}

export interface ChatHistoryResponseI {
    messages: ChatObjectI[];
    error: string;
}