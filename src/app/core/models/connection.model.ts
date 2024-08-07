export interface LoginCredentialsI {
    username: string;
    password: string;
}

export interface LoginRequestI {
    username: string;
    loginHash: string;
}

export interface HandshakeI {
    connectionHash: string;
    username: string;
}