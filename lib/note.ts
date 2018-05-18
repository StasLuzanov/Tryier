import { Validate } from "./validate";

export class Note {
    public noteName: string;
    public note: string;
    public createdDate: Date;
    public updatedDate: Date;
    public userName: string;
    
    constructor(data: any) {
        this.noteName = Validate.string(data, 'noteName', true, null);
        this.note = Validate.string(data, 'note', true, null);
        this.createdDate = Validate.date(data, 'createdDate', false, new Date());
        this.updatedDate = Validate.date(data, 'updatedDate', false, new Date());
        this.userName = Validate.string(data, 'userName', true, null);
    }

}