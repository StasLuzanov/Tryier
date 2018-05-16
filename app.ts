import ex = require('express');
import session = require('express-session');
import path = require('path');
import parseurl = require('parseurl');
import * as Promise from 'bluebird';

import index from './routes/index';
import user from './routes/user';
import notes from './routes/notes';

import { UserStorage, SessionStorage } from './lib/storage';
import { User } from './lib/user';

const app = ex();

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

app.use(authChecker)
app.use('/', index);
app.use('/user', user);
app.use('/notes', notes);

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
    const userToAdd: User = new User(superUser);
    return Promise.try(() => {
        return new UserStorage().checkIfExists('systemAdmin')
            .then(result => {
                return (result)
                    ? console.log(`user ${userToAdd.userName} already exists`)
                    : new UserStorage().addUser(userToAdd)
                        .then(result => console.log(`user ${result}`))
            })
    })
        .catch(err => { throw err });

};

function authChecker(req: ex.Request, res: ex.Response, next: ex.NextFunction) {
    if (req.path === "/user/login") {
        next();
    } else {
        return (req.session.user != null)
            ? new SessionStorage().getSessionTimeout(req.session.sessionHash)
                .then(result => (result === 'Good')
                    ? new SessionStorage().updateSessionAction(req.session.sessionHash, parseurl(req).pathname)
                        .then(() => next())
                    : new SessionStorage().destroySession(req)
                        .then(() => res.render('login', { error_msg: result })))
                .catch(err => {
                    new SessionStorage().destroySession(req)
                        .then(() => res.render('login', { error_msg: err }))
                })
            : res.render('login', { error_msg: `Not Authorized` });
    };
};