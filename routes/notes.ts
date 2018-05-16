import ex = require('express');
const router = ex.Router();

router.get('/', (req: ex.Request, res: ex.Response) => {
    res.render('notes');
});

router.get('/add', (req: ex.Request, res: ex.Response) => {
    res.render('addNote');
});

router.get('/view', (req: ex.Request, res: ex.Response) => {
    res.render('viewNotes');
});
export default router;