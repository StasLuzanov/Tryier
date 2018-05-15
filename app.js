"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ex = require("express");
var session = require("express-session");
var path = require("path");
var Promise = require("bluebird");
var index_1 = require("./routes/index");
var user_1 = require("./routes/user");
var storage_1 = require("./lib/storage");
var user_2 = require("./lib/user");
var app = ex();
init();
app.use(session({
    secret: 'why-the-fuck',
    resave: true,
    saveUninitialized: true
}));
//view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(ex.static(path.join(__dirname, 'public')));
app.use(ex.urlencoded({ extended: false }));
app.use(ex.json());
app.use('/', index_1.default);
app.use('/user', user_1.default);
app.listen(50003);
console.log("app running at http://localhost:50003");
function init() {
    var superUser = {
        userName: 'systemAdmin',
        fullName: 'Super User',
        password: 'System@dmin',
        email: 'luzanau@gmail.com',
        isAdmin: true
    };
    var userToAdd = new user_2.User(superUser);
    return Promise.try(function () {
        return new storage_1.UserStorage().checkIfExists('systemAdmin')
            .then(function (result) {
            return (result)
                ? console.log("user " + userToAdd.userName + " already exists")
                : new storage_1.UserStorage().addUser(userToAdd)
                    .then(function (result) { return console.log("user " + result); });
        });
    })
        .catch(function (err) { return err; });
}
;
//# sourceMappingURL=app.js.map