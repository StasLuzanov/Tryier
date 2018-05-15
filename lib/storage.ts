import * as Promise from 'bluebird';
import { MongoClient, Db } from 'mongodb';
import { User } from './user';
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

export interface IUserStorage {
    addUser(data: User): Promise<any>;
    getUserByName(userName: string): Promise<User>;
    getUserByFullMatch(userName: string, password: string): Promise<User>;
    getUsers(): Promise<User[]>;
    validateUser(password: string): Promise<any>;
    deleteUser(userId: string): Promise<any>;
    checkIfExists(userName: string): Promise<boolean>;
};

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
            .then(db => db.collection(collection).updateOne(searchQuery, updateQuery));
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

// CONNECTION
function getConnection() {
    return Promise.try(() => {
        return MongoClient.connect(uri)
            .then(db => db.db())
    })
        .catch(err => { throw err });
};