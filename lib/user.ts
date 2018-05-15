import { Validate } from './validate';

export class User {
    public userName: string;
    public email: string;
    public fullName: string;
    public password: string;
    public isAdmin: boolean;

    constructor(data: any) {
        this.userName = Validate.string(data, 'userName', true, null);
        this.email = Validate.string(data, 'email', true, null);
        this.fullName = Validate.string(data, 'fullName', true, null);
        this.password = Validate.string(data, 'password', true, null);
        this.isAdmin = Validate.boolean(data, 'isAdmin', false, false);
    };

};