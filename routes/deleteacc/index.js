const express = require('express');
const dbTools = require("../../javascripts/dbTools");
const validation = require("../../javascripts/validation");
const crypto = require("crypto");
const passTools = require("../../javascripts/passTools");
const router = express.Router();




/* GET home page. */
router.get('/', async function (req, res) {
    if (req.session && req.session.session_id) {
        req.session.csrf = crypto.pseudoRandomBytes(100).toString('base64');
        let user = await dbTools.getUserById(req.session.user_id);
        let popupBool = false;
        let urlParam = req.query.p;
        if (urlParam === 'p') {
            popupBool = true;
        }
        res.render('deleteacc', {title: 'MyBlogChum', user:user, csrf_token: req.session.csrf, error:popupBool, errorText: 'Incorrect password. Please try again.'});

    }
    else {
        res.redirect('/');
    }
});

router.post('/submit', async function(req, res) {
    if (!req.body.csrf) {
        console.log("CSRF Tokens not found.");
    }

    else if (req.body.csrf !== req.session.csrf) {
        console.log("CSRF Tokens dont match.");
    }
    else {
        const psw = validation.sanitise(req.body.psw);
        let potentialUser = await dbTools.getUserById(req.session.user_id);
        let potentialHash = potentialUser.password_hash;
        let potentialSalt = potentialUser.password_salt;
        let passwordToMatch = await passTools.hashPassword(psw,potentialSalt);
        if (passwordToMatch === potentialHash) {
            await dbTools.deleteAllLikesByUser(req.session.user_id);
            await dbTools.deleteAllPostsByUser(req.session.user_id);
            await dbTools.deleteUser(req.session.user_id);
            req.session = null;
            res.redirect('/');
        }
        else {
            console.log("Wrong Password.");
            res.redirect('/deleteacc?p=p');
        }
        //if validation fails, return user to the signup screen with label saying what went wrong
        //these inputs need to be sanitised
    }
});

module.exports = router;