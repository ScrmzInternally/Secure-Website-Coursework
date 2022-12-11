const express = require('express');
const dbTools = require("../../javascripts/dbTools");
const crypto = require("crypto");
const router = express.Router();
const validation = require("../../javascripts/validation");
let postId = 0;

router.get('/', async function (req, res) {
    postId = validation.sanitise(req.query.id);
    let post = await dbTools.getPostById(postId)
    let numLikes = await dbTools.countLikesById(postId);

    if (req.session && req.session.session_id) {
        let user = await dbTools.getUserById(req.session.user_id);
        let bool = await dbTools.hasUserLikedPost(postId, req.session.user_id);
        let posted = await dbTools.didUserMakePost(req.session.user_id, postId);
        req.session.csrf = crypto.pseudoRandomBytes(100).toString('base64');
        res.render('viewpost', {title: 'MyBlogChum', auth:true, user: user, post: post, likes: numLikes.num, bool: bool, mypost: posted, csrf_token: req.session.csrf});
    }
    else {
        res.render('viewpost', {title: 'MyBlogChum', auth:false, post: post, likes: numLikes.num, mypost: false});
    }
});

router.post('/delete', async function (req, res) {
    if (!req.body.csrf) {
        console.log("CSRF Tokens not found.");
    }

    else if (req.body.csrf !== req.session.csrf) {
        console.log("CSRF Tokens dont match.");
    }
    else {
        if (postId !== 0 && req.session) {
            await dbTools.deletePost(postId);
            res.redirect("/");
        }
    }
})

router.post('/edit', async (req, res) => {
    console.log('entered get viewpost/edit');
    if (!req.body.csrf) {
        console.log("CSRF Tokens not found.");
    } else if (req.body.csrf !== req.session.csrf) {
        console.log("CSRF Tokens dont match.");
    } else {
        if (postId !== 0 && req.session) {
            //get selected post
            // req.session.postId = postId;
            console.log('entered get viewpost/edit');
            const user = await dbTools.getUserById(req.session.user_id);
            const post = await dbTools.getPostById(postId);
            req.session.postId = postId;
            res.render('editpost', {title: 'MyBlogChum', auth:true, user: user, post: post, csrf_token: req.session.csrf});
            //const currentPost = await dbTools.getPostById(postId);
            
            //take to edit post page
        }
    }
})



module.exports = router;