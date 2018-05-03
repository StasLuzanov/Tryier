/*
 * GET home page.
 */
import express = require('express');
const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
    res.render('login');
});

router.get('/add', (req: express.Request, res: express.Response) => {
	res.render('addUser');
});

function addUser() {
	
};

export default router;