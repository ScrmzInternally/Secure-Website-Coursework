const express = require('express');
const router = express.Router();
const email = require("../../javascripts/email");
const dbTools = require("../../javascripts/dbTools");
const crypto = require('crypto');
const validation = require("../../javascripts/validation");
let secret;

router.get('/', async function (req, res) {
    let user = req.session.potentialUser;
    let emailAddress = user[0];
    let sendMailBoolean = await dbTools.shouldMailBeSent(emailAddress);
    console.log(sendMailBoolean);
    if (sendMailBoolean) {
        secret = await email.verifyEmail(emailAddress);
        await dbTools.sendEmail(emailAddress);
    }
    let popupBool = false;
    let urlParam = req.query.p;
    if (urlParam === 'p') {
        popupBool = true;
    }
    res.render('2fa', {title: 'MyBlogChum', auth:false, user: user, error:popupBool, errorText: 'Invalid OTP. Try again!'});
});

router.post('/submit', async function(req, res) {
    let {code} = req.body;
    code = validation.sanitise(code);
    let bool = email.validateTotp(code, secret);
    let user = req.session.potentialUser;
    if (bool) {
        await dbTools.addUser(user[1],user[2],user[3],user[0]);
        let newUser = await dbTools.isValidUser(user[1]);
        req.session.session_id = crypto.pseudoRandomBytes(24).toString('hex');
        req.session.date = dbTools.getDate();
        req.session.user_id = newUser.user_id;
        res.redirect('/');
    }
    else {
        res.redirect('/2fa?p=p');
    }
});
module.exports = router;
