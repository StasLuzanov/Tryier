import ex = require('express');
import * as Promise from 'bluebird';
import parseurl = require('parseurl');
import { Storage, UserStorage, SessionStorage } from '../lib/storage';
import { Session } from '../lib/session';
const router = ex.Router();
let sesInfo;

// LANDING
router.get('/action', (req: ex.Request, res: ex.Response) => {
    res.render('actions', { userName: req.session.displayName });
});

// LOGIN BLOCK
router.get('/login', (req: ex.Request, res: ex.Response) => {
    res.render('login');
});

router.post('/login', (req: ex.Request, res: ex.Response) => {
    const userName = req.body.username;
    const password = req.body.password;
    return (userName && password)
        ? new UserStorage().getUserByFullMatch(userName, password)
            .then(result => {
                req.session.user = result.userName;
                req.session.displayName = result.fullName;
                return (result.isAdmin)
                    ? req.session.admin = true
                    : req.session.admin = false
            })
            .then(() => {
                let session = {
                    userName: req.session.user
                };
                sesInfo = new Session(session);
                return new SessionStorage().insertSession(sesInfo)
            })
            .then(result => req.session.sessionHash = sesInfo.sessionHash)
            .then(() => res.render('actions', { userName: req.session.displayName }))
            .catch(err => res.render('login', { error_msg: err }))
        : res.render('login', { error_msg: "Please, provide username and password" });
});

// ADD USER BLOCK
router.get('/add', (req: ex.Request, res: ex.Response) => {
    res.render('addUser');
});

router.post('/add', (req: ex.Request, res: ex.Response) => {
    if (req.body.isAdmin === "true") {
        req.body.isAdmin = true;
    } else {
        req.body.isAdmin = false;
    }
    return Promise.try(() => {
        return new UserStorage().addUser(req.body)
            .then(result => res.render('actions', { userName: req.session.displayName, success_msg: result }))
    })
        .catch(err => res.render('addUser', { error_msg: err }));
});

// VIEW USERS BLOCK
router.get('/list', (req: ex.Request, res: ex.Response) => {
    return new UserStorage().getUsers()
        .then(result => res.render('list', {
            users: result.sort(function (a, b) { return (a.userName > b.userName) ? 1 : ((b.userName > a.userName) ? -1 : 0) })
        }))
        .catch(err => res.render('list', { error_msg: err }));
});

// REMOVE USER BLOCK
router.get('/remove', (req: ex.Request, res: ex.Response) => {
    res.render('delete');
});

router.post('/remove', (req: ex.Request, res: ex.Response) => {
    const userName = req.body.userName;
    return new UserStorage().deleteUser(userName)
        .then(result => res.render('actions', { userName: req.session.displayName, success_msg: result }))
        .catch(err => res.render('delete', { error_msg: err }))
});

export default router;