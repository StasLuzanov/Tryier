import * as crypto from 'crypto-js';

export class User {

    public userName: string;
    public apiKey: string;
    public email: string;
    public age: number;
    public fullName: string;

    constructor(data: any) {
        this.userName = data['userName'];
        this.apiKey = this.generateApiKey(data);
        this.email = data['email'];
        this.age = data['age'];
        this.fullName = data['name'];
    }

    public generateApiKey(data: any): string {
        if (data['apiKey']) {
            let key = data['apiKey'];
            return key;
        } else {
            let date = (new Date).getTime();
            let key = crypto.MD5(date + data['userName']).toString();
            return key;
        }
    };

};