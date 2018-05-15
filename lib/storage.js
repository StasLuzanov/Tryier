"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var mongodb_1 = require("mongodb");
var user_1 = require("./user");
var uri = 'mongodb://localhost:27017/what';
var cn = getConnection();
var Collections = /** @class */ (function () {
    function Collections() {
    }
    Collections.USERS = 'users';
    return Collections;
}());
exports.Collections = Collections;
;
;
;
var Storage = /** @class */ (function () {
    function Storage() {
    }
    Storage.prototype.findOne = function (collection, query) {
        return cn
            .then(function (db) { return db.collection(collection).findOne(query); });
    };
    ;
    Storage.prototype.findAll = function (collection) {
        return cn
            .then(function (db) { return db.collection(collection).find({}).toArray(); });
    };
    ;
    Storage.prototype.insertOne = function (collection, doc) {
        return cn
            .then(function (db) { return db.collection(collection).insertOne(doc); });
    };
    ;
    Storage.prototype.insertMany = function (collection, doc) {
        return cn
            .then(function (db) { return db.collection(collection).insertMany(doc); });
    };
    ;
    Storage.prototype.updateOne = function (collection, searchQuery, updateQuery) {
        return cn
            .then(function (db) { return db.collection(collection).updateOne(searchQuery, updateQuery); });
    };
    ;
    Storage.prototype.updateMany = function (collection, searchQuery, updateQuery) {
        return cn
            .then(function (db) { return db.collection(collection).updateMany(searchQuery, updateQuery); });
    };
    ;
    Storage.prototype.deleteOne = function (collection, filter) {
        return cn
            .then(function (db) { return db.collection(collection).deleteOne(filter); });
    };
    ;
    Storage.prototype.deleteMany = function (collection, filter) {
        return cn
            .then(function (db) { return db.collection(collection).deleteMany(filter); });
    };
    ;
    return Storage;
}());
exports.Storage = Storage;
;
// USER MANIPULATION
var UserStorage = /** @class */ (function (_super) {
    __extends(UserStorage, _super);
    function UserStorage() {
        return _super.call(this) || this;
    }
    UserStorage.prototype.addUser = function (data) {
        var _this = this;
        var user = new user_1.User(data);
        return this.checkIfExists(user.userName)
            .then(function (result) {
            return (!result)
                ? _super.prototype.insertOne.call(_this, UserStorage.COLLECTION, user)
                    .then(function (result) { return Promise.resolve("Successfully added " + user.userName + " to system"); })
                : Promise.reject("user with username: " + user.userName + " already exists");
        })
            .catch(function (err) { return Promise.reject(err); });
    };
    ;
    UserStorage.prototype.getUserByName = function (userName) {
        var query = { userName: userName };
        return _super.prototype.findOne.call(this, UserStorage.COLLECTION, query)
            .then(function (result) {
            return (result)
                ? Promise.resolve(new user_1.User(result))
                : Promise.reject("Cannot find " + userName + " in database");
        })
            .catch(function (err) { return Promise.reject(err); });
    };
    ;
    UserStorage.prototype.getUserByFullMatch = function (userName, password) {
        var query = { userName: userName, password: password };
        return _super.prototype.findOne.call(this, UserStorage.COLLECTION, query)
            .then(function (result) {
            return (result)
                ? Promise.resolve(new user_1.User(result))
                : Promise.reject("Incorrect username or password");
        })
            .catch(function (err) { return Promise.reject(err); });
    };
    ;
    UserStorage.prototype.getUsers = function () {
        return _super.prototype.findAll.call(this, UserStorage.COLLECTION)
            .then(function (result) { return result.map(function (user) { return new user_1.User(user); }); })
            .catch(function (err) { return Promise.reject(err); });
    };
    ;
    UserStorage.prototype.validateUser = function (password) {
        var query = { password: password };
        return _super.prototype.findOne.call(this, UserStorage.COLLECTION, query)
            .then(function (result) { return result ? Promise.resolve() : Promise.reject("Incorrect Password"); })
            .catch(function (err) { return Promise.reject(err); });
    };
    ;
    UserStorage.prototype.deleteUser = function (userName) {
        var _this = this;
        var query = { userName: userName };
        return this.checkIfExists(userName)
            .then(function (result) {
            return (result)
                ? _super.prototype.deleteOne.call(_this, UserStorage.COLLECTION, query)
                    .then(function (result) { return Promise.resolve("Successfully deleted " + userName); })
                : Promise.reject("User with name: " + userName + " not found");
        })
            .catch(function (err) { return Promise.reject(err); });
    };
    ;
    UserStorage.prototype.checkIfExists = function (userName) {
        var query = { userName: userName };
        return _super.prototype.findOne.call(this, UserStorage.COLLECTION, query)
            .then(function (result) {
            return (result) ? true : false;
        })
            .catch(function (err) { return Promise.reject(err); });
    };
    ;
    UserStorage.COLLECTION = Collections.USERS;
    return UserStorage;
}(Storage));
exports.UserStorage = UserStorage;
;
// CONNECTION
function getConnection() {
    return Promise.try(function () {
        return mongodb_1.MongoClient.connect(uri)
            .then(function (db) { return db.db(); });
    })
        .catch(function (err) { throw err; });
}
;
//# sourceMappingURL=storage.js.map