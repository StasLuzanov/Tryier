import { Validate } from './validate';
import * as crypto from 'crypto-js';

export class Session {

    public userName: string;
    public timestamp: Date;
    public sessionHash: string;
    public timesLoggedIn: number;
    public lastAction: Date;

    constructor(data: any) {
        this.userName = Validate.string(data, 'userName', true, null);
        this.timestamp = Validate.date(data, 'timestamp', false, new Date());
        this.lastAction = Validate.date(data, 'lastAction', false, new Date());
        this.sessionHash = Validate.string(data, 'sessionHash', false, crypto.MD5(this.userName + this.timestamp).toString());
        this.timesLoggedIn = 0;
    }
};