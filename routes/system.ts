import ex = require('express');
const router = ex.Router();
const os = require('os');

router.get('/', (req: ex.Request, res: ex.Response) => {
    const val = os.cpus();
    res.render('index', { title: 'Express' , message: JSON.stringify(val)});
});

export default router;