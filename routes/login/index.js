const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const {performance} = require('perf_hooks');
const dbTools = require("../../javascripts/dbTools")
const passTools = require("../../javascripts/passTools")
const validation = require("../../javascripts/validation")
/* GET login page. */
router.get('/', function(req, res) {
    if (req.session.csrf === undefined) {
        req.session.csrf = crypto.pseudoRandomBytes(100).toString('base64');
    }
    let popupBool = false;
    let urlParam = req.query.p;
    if (urlParam === 'p') {
        popupBool = true;
    }
    res.render('login', { title: 'MyBlogChum', csrf_token: req.session.csrf, auth:false, error:popupBool, errorText: 'Username and/or password incorrect! Try again.'});
});



router.post('/submit', async function (req, res) {
    //console.log(req.session.csrf + " <-- csrf token currently --- DEBUG ONLY");
    if (!req.body.csrf) {
        console.log("CSRF Tokens not found.");
    } else if (req.body.csrf !== req.session.csrf) {
        console.log("CSRF Tokens dont match.");
    } else {
        let {csrf, uname, psw} = req.body;
        uname = validation.sanitise(uname)
        uname = uname.toLowerCase();
        psw = validation.sanitise(psw)
        let user = await dbTools.isValidUser(uname);
        if (user == null) {
            let rand1 = Math.floor((Math.random() * 1500) + 500);
            setTimeout(function(){
                console.log("Something went wrong!");
                res.redirect('/login?p=p');
            }, rand1);
            console.log('Random time added: ' + rand1 +"ms");
        }
        else {
            let potentialUser = await dbTools.getUserById(user.user_id);
            let potentialHash = potentialUser.password_hash;
            let potentialSalt = potentialUser.password_salt;
            let passwordToMatch = await passTools.hashPassword(psw,potentialSalt);
            if (passwordToMatch === potentialHash) {
                req.session.session_id = crypto.pseudoRandomBytes(24).toString('hex');
                req.session.date = dbTools.getDate();
                req.session.user_id = user.user_id;
                res.redirect('/');
            }
            else {
                let rand2 = Math.floor((Math.random() * 1500) + 500);
                setTimeout(function(){
                    console.log("Something went wrong!");
                    res.redirect('/login?p=p');
                }, rand2);
                console.log('Random time added: ' + rand2 +"ms");
            }
        }

    }
});

module.exports = router;
