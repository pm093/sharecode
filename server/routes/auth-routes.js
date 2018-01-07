import express from 'express';
const router = express.Router();
import passport from 'passport'

router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/welcome');
});
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    res.redirect('/');
});


export default router;
