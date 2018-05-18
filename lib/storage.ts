import * as Promise from 'bluebird';
import { MongoClient, Db } from 'mongodb';
import { User } from './user';
import { Session } from './session';
import { Note } from './note';
import ex = require('express');
const uri = 'mongodb://localhost:27017/what';
const cn = getConnection();

export class Collections {
    public static readonly USERS: string = 'users';
};

export interface IStorage {
    findOne(collection: string, query: any): Promise<any>;
    findAll(collection: string): Promise<any>;
    insertOne(collection: string, doc: any): Promise<any>;
    insertMany(collection: string, doc: any[]): Promise<any>;
    updateOne(collection: string, searchQuery: any, updateQuery: any): Promise<any>;
    updateMany(collection: string, searchQuery: any, updateQuery: any): Promise<any>;
    deleteOne(collection: string, filter: any): Promise<any>;
    deleteMany(collection: string, filter: any): Promise<any>;
};

export interface ISessionStorage {
    insertSession(session: Session): Promise<any>;
    getSessionTimeout(sessionHash: string): Promise<string>;
    updateSessionAction(sessionHash: string, curPage: string): Promise<any>;
    destroySession(req: ex.Request): Promise<any>;
};

export interface IUserStorage {
    addUser(data: User): Promise<any>;
    getUserByName(userName: string): Promise<User>;
    getUserByFullMatch(userName: string, password: string): Promise<User>;
    getUsers(): Promise<User[]>;
    validateUser(password: string): Promise<any>;
    deleteUser(userId: string): Promise<any>;
    checkIfExists(userName: string): Promise<boolean>;
};

export interface INoteStorage {
    addNote(note: Note, userName: string): Promise<any>;
    getNote(noteName: string, userName: string): Promise<Note>;
    getAllNotesForUser(userName: string): Promise<Note[]>;
    deleteNote(noteName: string, userName: string): Promise<any>;
}

export class Storage implements IStorage {
    constructor() { }

    public findOne(collection: string, query: any) {
        return cn
            .then(db => db.collection(collection).findOne(query));
    };

    public findAll(collection: string) {
        return cn
            .then(db => db.collection(collection).find({}).toArray());
    };

    public findMany(collection: string, query: any) {
        return cn
            .then(db => db.collection(collection).find(query).toArray());
    }

    public insertOne(collection: string, doc: any) {
        return cn
            .then(db => db.collection(collection).insertOne(doc));
    };

    public insertMany(collection: string, doc: any[]) {
        return cn
            .then(db => db.collection(collection).insertMany(doc));
    };

    public updateOne(collection: string, searchQuery: any, updateQuery: any) {
        return cn
            .then(db => db.collection(collection).updateOne(searchQuery, updateQuery, { upsert: true }));
    };

    public updateMany(collection: string, searchQuery: any, updateQuery: any) {
        return cn
            .then(db => db.collection(collection).updateMany(searchQuery, updateQuery));
    };

    public deleteOne(collection: string, filter: any) {
        return cn
            .then(db => db.collection(collection).deleteOne(filter))
    };

    public deleteMany(collection: string, filter: any) {
        return cn
            .then(db => db.collection(collection).deleteMany(filter))
    };
};

// USER MANIPULATION
export class UserStorage extends Storage implements IUserStorage {

    private static readonly COLLECTION: string = Collections.USERS;

    constructor() {
        super();
    }

    public addUser(data: User) {
        const user = new User(data);
        return this.checkIfExists(user.userName)
            .then(result => {
                return (!result)
                    ? super.insertOne(UserStorage.COLLECTION, user)
                        .then(result => Promise.resolve(`Successfully added ${user.userName} to system`))
                    : Promise.reject(`user with username: ${user.userName} already exists`)
            })
            .catch(err => Promise.reject(err))
    };

    public getUserByName(userName: string) {
        let query = { userName: userName };
        return super.findOne(UserStorage.COLLECTION, query)
            .then(result => {
                return (result)
                    ? Promise.resolve(new User(result))
                    : Promise.reject(`Cannot find ${userName} in database`)
            }
            )
            .catch(err => Promise.reject(err));
    };

    public getUserByFullMatch(userName: string, password: string) {
        let query = { userName: userName, password: password };
        return super.findOne(UserStorage.COLLECTION, query)
            .then(result => {
                return (result)
                    ? Promise.resolve(new User(result))
                    : Promise.reject(`Incorrect username or password`)
            })
            .catch(err => Promise.reject(err));
    };

    public getUsers() {
        return super.findAll(UserStorage.COLLECTION)
            .then(result => result.map(user => new User(user)))
            .catch(err => Promise.reject(err));
    };

    public validateUser(password: string) {
        let query = { password: password };
        return super.findOne(UserStorage.COLLECTION, query)
            .then(result => result ? Promise.resolve() : Promise.reject(`Incorrect Password`))
            .catch(err => Promise.reject(err));
    };

    public deleteUser(userName: string) {
        let query = { userName: userName }
        return this.checkIfExists(userName)
            .then(result => {
                return (result)
                    ? super.deleteOne(UserStorage.COLLECTION, query)
                        .then(result => Promise.resolve(`Successfully deleted ${userName}`))
                    : Promise.reject(`User with name: ${userName} not found`);
            })
            .catch(err => Promise.reject(err));
    };

    public checkIfExists(userName: string) {
        let query = { userName: userName };
        return super.findOne(UserStorage.COLLECTION, query)
            .then(result => {
                return (result) ? true : false
            })
            .catch(err => Promise.reject(err));
    };

};

// SESSION STORAGE
export class SessionStorage extends Storage implements ISessionStorage {

    private static readonly COLLECTION: string = 'session';

    constructor() {
        super();
    }

    public insertSession(session: Session) {
        return super.insertOne(SessionStorage.COLLECTION, session)
            .then(result => Promise.resolve(`Initiated session for user ${session.userName}`))
            .catch(err => Promise.reject(err));
    };

    public getSessionTimeout(sessionHash: string) {
        let query = { sessionHash: sessionHash };
        return super.findOne(SessionStorage.COLLECTION, query)
            .then(session => {
                return ((Math.ceil(
                    (new Date().getTime()
                        - session.lastAction.getTime()
                    )
                    / (1000 * 60)))
                    > 27)
                    ? Promise.reject(`Session is expired`)
                    : Promise.resolve(`Good`)
            })
            .catch(err => Promise.reject(err));
    };

    public updateSessionAction(sessionHash: string, curPage: string) {
        let searchQuery = { sessionHash: sessionHash };
        let updateQuery = { $set: { lastAction: new Date(), curPage: curPage } };
        return super.updateOne(SessionStorage.COLLECTION, searchQuery, updateQuery)
            .then(result => console.log(`Session Action Was Updated`))
            .catch(err => Promise.reject(err));
    };

    public destroySession(req: ex.Request) {
        return this.removeSession(req.session.sessionHash)
            .then(result => req.session = null)
            .then(() => Promise.resolve('Session destroyed'))
            .catch(err => Promise.reject(err))
    };

    public removeSession(sessionHash: string) {
        let searchQuery = { sessionHash: sessionHash };
        return super.deleteOne(SessionStorage.COLLECTION, searchQuery)
            .then(result => Promise.resolve('Removed session record from database'))
            .catch(err => Promise.reject(err));
    };

};

export class NoteStorage extends Storage implements INoteStorage {

    private static readonly COLLECTION: string = 'notes';

    public addNote(note: Note, userName: string) {
        return super.insertOne(NoteStorage.COLLECTION, note)
            .then(result => Promise.resolve(`Successfully added note ${note.noteName} for user ${userName} in database`))
            .catch(err => Promise.reject(err));
    };

    public getNote(noteName: string, userName: string) {
        let query = { 'userName': userName, 'noteName': noteName };
        return super.findOne(NoteStorage.COLLECTION, query)
            .then(result => Promise.resolve(new Note(result)))
            .catch(err => Promise.reject(err));
    };

    public getAllNotesForUser(userName: string) {
        let query = { 'userName': userName };
        return super.findMany(NoteStorage.COLLECTION, query)
            .then(result => Promise.resolve(result))
            .catch(err => Promise.reject(err));
    };

    public deleteNote(noteName: string, userName: string) {
        let query = { 'noteName': noteName, 'userName': userName };
        return this.noteExists(noteName, userName)
            .then(result => super.deleteOne(NoteStorage.COLLECTION, result))
            .then(result => Promise.resolve(`Successfully deleted note: ${noteName} from database`))
            .catch(err => Promise.reject(err));
    };

    private noteExists(noteName: string, userName: string) {
        let query = { 'noteName': noteName, 'userName': userName };
        return super.findOne(NoteStorage.COLLECTION, query)
            .then(result => 
            (result)
                ? Promise.resolve(query)
                : Promise.reject(`No note with name: ${noteName} exists for user: ${userName}`)
            )
            .catch(err => Promise.reject(err))
    };

};

// CONNECTION
function getConnection() {
    return Promise.try(() => {
        return MongoClient.connect(uri)
            .then(db => db.db())
    })
        .catch(err => { throw err });
};