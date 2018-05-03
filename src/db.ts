import { MongoClient, Db } from 'mongodb';
import Promise = require('bluebird');
const uri = "mongodb://localhost:27017";
import { User } from './user';
import * as util from 'util';
const connection: Promise<Db> = getMongoConnection();

function getMongoConnection(): Promise<Db> {
    return Promise.try(() => MongoClient.connect(uri)
        .then(db => db.db("test"))
        .catch(err => Promise.reject(err)));
};

export interface IStore {
    find(criteria: any, collection: string): Promise<any[]>;
    findAll(collection: string): Promise<any>;
    insertOne(collection: string, data: any): any;
    insertMany(collection: string, data: any[]): Promise<any>;
    updateOne(collection: string, searchData: any, updateData: any): Promise<any>;
    updateMany(collection: string, searchData: any, updateData: any): Promise<any>;
    deleteOne(collection: string, searchData: any): Promise<any>;
    deleteMany(collection: string, searchData: any): Promise<any>;
};

export interface IStoreUser {
    createUser(data: User): Promise<any>;
    checkIfExists(userName: string): Promise<boolean>;
    getUserByName(userName: string): Promise<User>;
    validateApiKey(apiKey: string): Promise<any>;
    getAllUsers(): Promise<User[]>;
    deleteUser(userName: string): Promise<any>;
};

export class Store implements IStore {
    constructor() { }

    public find(collection: string, criteria: any) {
        return connection
            .then(db => db.collection(collection).find(criteria).toArray())
            .catch(err => Promise.reject(err))
    };

    public findAll(collection: string) {
        return connection
            .then(db => db.collection(collection).find({}).toArray())
            .catch(err => Promise.reject(err))
    };

    public insertOne(collection: string, data: any) {
        return connection
            .then(db => db.collection(collection).insertOne(data))
            .catch(err => { throw err });
    };

    public insertMany(collection: string, data: any[]) {
        return connection
            .then(db => db.collection(collection).insertMany(data))
            .catch(err => Promise.reject(err));
    };

    public updateOne(collection: string, searchData: any, updateData: any) {
        return connection
            .then(db => db.collection(collection).updateOne(searchData, updateData))
            .catch(err => Promise.reject(err));
    };

    public updateMany(collection: string, searchData: any, updateData: any) {
        return connection
            .then(db => db.collection(collection).updateMany(searchData, updateData))
            .catch(err => Promise.reject(err));
    };

    public deleteOne(collection: string, searchData: any) {
        return connection
            .then(db => db.collection(collection).deleteOne(searchData))
            .catch(err => Promise.reject(err));
    };

    public deleteMany(collection: string, searchData: any) {
        return connection
            .then(db => db.collection(collection).deleteMany(searchData))
            .catch(err => Promise.reject(err))
    };

};

export class UserStore extends Store implements IStoreUser {

    private static readonly COLLECTION: string = 'users';

    constructor() {
        super();
    }

    public createUser(data: User): Promise<any> {
        return this.checkIfExists(data.userName)
            .then(result => {
                if (result) {
                    return Promise.reject('user exists');
                } else {
                    return this.insertOne(UserStore.COLLECTION, data)
                        .then(() => Promise.resolve(util.format("user '%s' has been successfully added and granted key: '%s'", data.userName, data.apiKey)))
                }
            })
            .catch(err => { throw err })
    };

    public checkIfExists(userName: string): Promise<boolean> {
        return super.find(UserStore.COLLECTION, { userName: userName })
            .then(results => {
                if (results.length > 0) {
                    return true;
                } else {
                    return false;
                }
            })
            .catch(err => { throw err })
    };

    public getUserByName(userName: string): Promise<User> {
        return super.find(UserStore.COLLECTION, { userName: userName })
            .then(results => {
                if (results.length > 0) {
                    return Promise.resolve(new User(results[0]));
                } else {
                    return Promise.reject(util.format("no user with userName '%s' found", userName));
                }
            })
            .catch(err => { throw err });
    };

	public getUserByApiKey(apiKey: string): Promise<User> {
		return super.find(UserStore.COLLECTION, { apiKey: apiKey })
			.then(results => {
				if (results.length > 0) {
					return Promise.resolve(new User(results[0]));
				} else {
					return Promise.reject(util.format("no user with apiKey '%s' found", apiKey));
				}
			})
			.catch(err => { throw err });
	}
    public validateApiKey(apiKey: string): Promise<any> {
        return super.find(UserStore.COLLECTION, { apiKey: apiKey })
            .then(results => {
                if (results.length > 0) {
                    return Promise.resolve("found user");
                } else {
                    return Promise.reject(util.format("user with apiKey: '%s' not found", apiKey));
                }
            })
            .catch(err => { throw err });
    };

    public getAllUsers(): Promise<User[]> {
        return super.findAll(UserStore.COLLECTION)
            .then(results => {
                if (results.length > 0) {
                    return results.map(result => new User(result))
                } else {
                    return [];
                }
            })
            .catch(err => { throw err });
    };

    public deleteUser(userName: string): Promise<any> {
        if (userName === 'admin') {
            return Promise.reject("cannot delete admin user");
        }
        return this.getUserByName(userName)
            .then(() => super.deleteOne(UserStore.COLLECTION, { userName: userName }))
            .then(() => Promise.resolve(util.format("user '%s' successfully deleted", userName)))
            .catch(err => { throw err });
    };
};