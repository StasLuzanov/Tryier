"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ex = require("express");
var Promise = require("bluebird");
var storage_1 = require("../lib/storage");
var router = ex.Router();
var auth = function (req, res, next) {
    return (req.session.user != null) ? next() : res.render('login', { error_msg: "Not authenticated" });
};
// LANDING
router.get('/action', auth, function (req, res) {
    res.render('actions', { userName: req.session.displayName });
});
// LOGIN BLOCK
router.get('/login', function (req, res) {
    res.render('login');
});
router.post('/login', function (req, res) {
    var userName = req.body.username;
    var password = req.body.password;
    return (userName && password)
        ? new storage_1.UserStorage().getUserByFullMatch(userName, password)
            .then(function (result) {
            req.session.user = result.userName;
            req.session.displayName = result.fullName;
            return (result.isAdmin)
                ? req.session.admin = true
                : req.session.admin = false;
        })
            .then(function () { return res.render('actions', { userName: req.session.displayName }); })
            .catch(function (err) { return res.render('login', { error_msg: err }); })
        : res.render('login', { error_msg: "Please, provide username and password" });
});
// ADD USER BLOCK
router.get('/add', auth, function (req, res) {
    res.render('addUser');
});
router.post('/add', auth, function (req, res) {
    if (req.body.isAdmin === "true") {
        req.body.isAdmin = true;
    }
    else {
        req.body.isAdmin = false;
    }
    return Promise.try(function () {
        return new storage_1.UserStorage().addUser(req.body)
            .then(function (result) { return res.render('actions', { userName: req.session.displayName, success_msg: result }); });
    })
        .catch(function (err) { return res.render('addUser', { error_msg: err }); });
});
// VIEW USERS BLOCK
router.get('/list', auth, function (req, res) {
    return new storage_1.UserStorage().getUsers()
        .then(function (result) { return res.render('list', {
        users: result.sort(function (a, b) { return (a.userName > b.userName) ? 1 : ((b.userName > a.userName) ? -1 : 0); })
    }); })
        .catch(function (err) { return res.render('list', { error_msg: err }); });
});
// REMOVE USER BLOCK
router.get('/remove', auth, function (req, res) {
    res.render('delete');
});
router.post('/remove', auth, function (req, res) {
    var userName = req.body.userName;
    return new storage_1.UserStorage().deleteUser(userName)
        .then(function (result) { return res.render('actions', { userName: req.session.displayName, success_msg: result }); })
        .catch(function (err) { return res.render('delete', { error_msg: err }); });
});
function pages(path) {
    var page = '';
    switch (path) {
        case '/user/add': {
            page = 'actions';
            break;
        }
        default: {
            page = 'login';
            break;
        }
    }
    return page;
}
;
exports.default = router;
//# sourceMappingURL=user.js.map