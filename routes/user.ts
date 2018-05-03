import express = require('express');
const router = express.Router();
import { UserStore } from '../src/db';
import * as Promise from 'bluebird';
import * as util from 'util';
import { User } from '../src/user';
const storeUser = new UserStore();

router.get('/login', (req: express.Request, res: express.Response) => {
    res.render('login');
});

router.post('/login', (req: express.Request, res: express.Response) => {
    const apiKey = req.body.apiKey;
    console.log(apiKey);
    return storeUser.validateApiKey(apiKey)
        .then(result => storeUser.getUserByApiKey(apiKey))
        .then(result => res.status(200).render('main', { userName: result.userName }))
        .catch(err => res.status(400).render('error', ({ error: { message: err, status: 400 } })))
});

// router.post('/create', (req: express.Request, res: express.Response) => {
// 	const user = new User(req.body);
//     return storeUser.createUser(user)
//         .then(result => res.status(200).render('main'))
//         .catch(err => res.status(409).send({ error: err }));
// });

// router.get('/login', (req: express.Request, res: express.Response) => {
// 	res.render('login');
// });

// router.post('/login', (req: express.Request, res: express.Response) => {
// 	const apiKey = req.body.apiKey;
// 	return storeUser.validateApiKey(apiKey)
// 		.then(result => storeUser.getUserByApiKey(apiKey))
// 		.then(user => res.render('main', { userName: user.userName }))
// 		.catch(err => res.status(400).send({ error: err }));
// });

// router.get('/:username', (req: express.Request, res: express.Response) => {
//     const user = req.params['username'];
//     const apiKey = req.query['apiKey'];
//     return storeUser.validateApiKey(apiKey)
//         .then(() => storeUser.getUserByName(user))
//         .then(result => res.status(200).send(result))
//         .catch(err => res.status(400).send({ error: err }));
// });

// router.get('/', (req: express.Request, res: express.Response) => {
//     const apiKey = req.query['apiKey'];
//     return storeUser.validateApiKey(apiKey)
//         .then(() => storeUser.getAllUsers())
//         .then(result => res.status(200).send(result))
//         .catch(err => res.status(400).send({ error: err }));
// });

// router.delete('/:username', (req: express.Request, res: express.Response) => {
//     const user = req.params['username'];
//     const apiKey = req.query['apiKey'];
//     return storeUser.validateApiKey(apiKey)
//         .then(() => storeUser.deleteUser(user))
//         .then(result => res.status(200).send({ message: result }))
//         .catch(err => res.status(400).send({ error: err }));
// });

// router.post('/list', (req: express.Request, res: express.Response) => {
// 	const userName = req.body.username;
// 	return storeUser.getUserByName(userName)
// 		.then(result => storeUser.getAllUsers())
// 		.then(result => res.render('userList', { users: result }))
// 		.catch(err => res.status(400).send({ error: err }));
// });

export default router;