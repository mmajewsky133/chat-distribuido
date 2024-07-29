export interface ChatObjectI {
    who: WhoI;
    when: Date;
    what: WhatI;
}

export interface WhoI {
    userId: string;
    username: string;
}

export interface WhatI {
    type: string;
    content: string;
}