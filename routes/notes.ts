import ex = require('express');
import { Note } from '../lib/note';
import { NoteStorage } from '../lib/storage';
const router = ex.Router();


// GETTERS
router.get('/', (req: ex.Request, res: ex.Response) => {
    res.render('notes');
});

router.get('/add', (req: ex.Request, res: ex.Response) => {
    res.render('addNote');
});

router.get('/delete', (req: ex.Request, res: ex.Response) => {
    res.render('deleteNote');
})

router.get('/view', (req: ex.Request, res: ex.Response) => {
    return new NoteStorage().getAllNotesForUser(req.session.user)
        .then(result => res.render('viewNotes', { notes: result }))
        .catch(err => res.render('notes', { error_msg: err }));
});

// ACTIONS WITH POST
router.post('/add', (req: ex.Request, res: ex.Response) => {
    const note = new Note({
        userName: req.session.user,
        noteName: req.body.noteName,
        note: req.body.note
    });

    return new NoteStorage().addNote(note, req.session.user)
        .then(result => res.render('notes', { success_msg: result }))
        .catch(err => res.render('notes', { error_msg: err }));
});

router.post('/delete', (req: ex.Request, res: ex.Response) => {
    const noteName = req.body.noteName;
    return new NoteStorage().deleteNote(noteName, req.session.user)
        .then(result => res.render('notes', { success_msg: result }))
        .catch(err => res.render('notes', { error_msg: err }));
});


export default router;