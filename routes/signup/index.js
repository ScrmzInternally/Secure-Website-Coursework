const express = require('express');
const {performance} = require('perf_hooks');
const router = express.Router();
const crypto = require('crypto');
const validation = require('../../javascripts/validation');
const passTools = require("../../javascripts/passTools");


/* GET signup page. */
router.get('/', function(req, res, next) {
    req.session.csrf = crypto.pseudoRandomBytes(100).toString('base64');
    let popupBool = false;
    let urlParam = req.query.p;
    if (urlParam === 'p') {
        popupBool = true;
    }
    res.render('signup', { title: 'MyBlogChum', csrf_token: req.session.csrf, auth:false, error:popupBool, errorText: 'Something went wrong while trying to sign up. Please try again.' });
});

router.post('/submit', async function(req, res) {
    if (!req.body.csrf) {
        console.log("CSRF Tokens not found.");
    }

    else if (req.body.csrf !== req.session.csrf) {
        console.log("CSRF Tokens dont match.");
    }
    else {
        let {csrf, email, uname, psw, privacy} = req.body;
        email = validation.sanitise(email)
        uname = validation.sanitise(uname)
        psw = validation.sanitise(psw)
        if (await validation.validateEmail(email) && await validation.validateUser(uname) && await validation.validatePassword(psw)) {
            let salt = crypto.pseudoRandomBytes(24).toString('hex');
            let hash = await passTools.hashPassword(psw, salt);
            req.session.potentialUser = [];
            req.session.potentialUser = [email, uname, hash, salt];
            res.redirect('/2fa');
        }
        else {
            let rand = Math.floor((Math.random() * 1500) + 500);
            setTimeout(function(){
                res.redirect('/signup?p=p');
            }, rand);
            console.log('Random time added: ' + rand +"ms");
        }
        //if validation fails, return user to the signup screen with label saying what went wrong
        //these inputs need to be sanitised
    }
});

module.exports = router;