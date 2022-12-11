const express = require('express');
const dbTools = require("../../javascripts/dbTools");
const crypto = require("crypto");
const router = express.Router();
const fetch = require('node-fetch');
const querystring = require('querystring');
const validation = require("../../javascripts/validation");




/* GET home page. */
router.get('/', async function (req, res) {
    if (req.session && req.session.session_id) {
        req.session.csrf = crypto.pseudoRandomBytes(100).toString('base64');
        let user = await dbTools.getUserById(req.session.user_id);
        res.render('post', {title: 'MyBlogChum', user:user, csrf_token: req.session.csrf});
    }
    else {
        res.redirect('/');
    }
});

router.post('/submit', async function (req, res) {
    const query = querystring.stringify({
        secret: "6Ld4GXgfAAAAAMOhjYwAA3WLhMBDlM_gjiIQM0V5",
        response: req.body['g-recaptcha-response'],
        remoteip: req.connection.remoteAddress
    });
    const URL = `https://google.com/recaptcha/api/siteverify?${query}`;
    const result = await fetch(URL).then(res => res.json());
    console.log(result);
    if (result.success !== undefined && !result.success) {
        console.log("recaptcha failed");
        res.redirect('/post');
    }
    else {
        console.log('post/submit called');
        if (req.session && req.session.session_id) {
            if (!req.body.csrf) {
                console.log("CSRF Tokens not found.");
            } else if (req.body.csrf !== req.session.csrf) {
                console.log("CSRF Tokens dont match.");
            } else {
                //write new post to the database
                let title = validation.sanitise(req.body.title);
                let content = validation.sanitise(req.body.content);


                //addPost(username, title, content, date)
                let user = await dbTools.getUserById(req.session.user_id);
                await dbTools.addPost(user.username, title, content, dbTools.getDate());

                let posts = await dbTools.getAllPosts();
                //verification ? Add captcha?
                res.redirect('/viewpost?id=' + posts.slice(-1)[0].post_id);
            }
        } else {
            res.redirect('/');
        }
    }
        //redirect to individual post page? or homepage
})

router.post('/edit-submit', async (req, res) => {
    const query = querystring.stringify({
        secret: "6Ld4GXgfAAAAAMOhjYwAA3WLhMBDlM_gjiIQM0V5",
        response: req.body['g-recaptcha-response'],
        remoteip: req.connection.remoteAddress
    });
    const URL = `https://google.com/recaptcha/api/siteverify?${query}`;
    const result = await fetch(URL).then(res => res.json());
    console.log(result);
    if (result.success !== undefined && !result.success) {
        console.log("recaptcha failed");
        
        //redirect user back to edit post page but with updated post title and content values so their changes aren't lost
        if (!req.body.csrf) {
            console.log("CSRF Tokens not found.");
        } else if (req.body.csrf !== req.session.csrf) {
            console.log("CSRF Tokens dont match.");
        } else {
        const post = {
            title : validation.sanitise(req.body.title),
            content : validation.sanitise(req.body.content)
        }
        let user = await dbTools.getUserById(req.session.user_id);

        res.render('editpost', {title: 'MyBlogChum', auth:true, user: user, post: post, csrf_token: req.session.csrf});
        }

    }
    else {
        console.log('post/edit-submit called');
        if (req.session && req.session.session_id) {
            if (!req.body.csrf) {
                console.log("CSRF Tokens not found.");
            } else if (req.body.csrf !== req.session.csrf) {
                console.log("CSRF Tokens dont match.");
            } else {
                //write new post to the database
                let title = validation.sanitise(req.body.title);
                let content = validation.sanitise(req.body.content);

                //update post in database
                await dbTools.updatePost(req.session.postId, title, content, dbTools.getDate());

                res.redirect('/viewpost?id=' + req.session.postId);
            }
        } else {
            res.redirect('/');
        }
    }
        //redirect to individual post page? or homepage
})

module.exports = router;
