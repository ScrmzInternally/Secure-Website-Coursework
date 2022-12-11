const dbTools = require("../javascripts/dbTools");
const passTools = require("../javascripts/passTools");
const crypto = require('crypto');
const assert = require('assert');

describe('Testing dbTools file', async () => {

    it('getUserById(1)', async () => {
        
        const user = await dbTools.getUserById(1);
        assert.equal(user.username, 'User1');
        assert.equal(user.email, 'user1@gmail.com');
    });

    it('addUser()', async () => {

        const username = 'MattReid22';
        let salt = crypto.pseudoRandomBytes(24).toString('hex');
        let hash = await passTools.hashPassword('qwertyuiop', salt);
        const email = 'matt@gmail.com';

        await dbTools.addUser(username, hash, salt, email);
        const addedUser = await dbTools.getUserById(5);
        assert.equal(addedUser.username, username);
        assert.equal(addedUser.password_salt, salt);
        assert.equal(addedUser.password_hash, hash);
        assert.equal(addedUser.email, email);
    });

    it('deleteUser(5)', async () => {
        await dbTools.deleteUser(5);
        const addedUser = await dbTools.getUserById(5);
        assert.equal(addedUser, null);
    });

    it('getAllUsers()', async () => {
        const users = await dbTools.getAllUsers();
        assert.equal(users[0].username, 'User1');
        assert.equal(users[1].username, 'User2');
        assert.equal(users[2].username, 'User3');
        assert.equal(users[3].username, 'User4');
    });

    it('getAllLikesByUser(1)', async () => {
        const likes = await dbTools.getAllLikesByUser(1);
        //should be 2 likes by user 1
        assert.equal(likes.length, 2);
    });

    it('addLike(3,1)', async () => {
        await dbTools.addLike(3,1);
        const likes = await dbTools.getAllLikesByUser(1);
        assert.equal(likes.length, 3);
    });

    it('deleteLike(3,1)', async () => {
        await dbTools.deleteLike(3,1);
        const likes = await dbTools.getAllLikesByUser(1);
        assert.equal(likes.length, 2);
    });

    it('addPost()', async () => {
        const currentDate = new Date().toLocaleString();
        const username = 'User4';
        const title = 'new post title';
        const content = 'new post content';

        await dbTools.addPost(username, title, content, currentDate);
        const addedPost = await dbTools.getPostById(9);
        assert.equal(addedPost.username, username);
        assert.equal(addedPost.title, title);
        assert.equal(addedPost.content, content);
        assert.equal(addedPost.date, currentDate);
    });

    it('updatePost()', async () => {
        const currentDate = new Date().toLocaleString();
        const username = 'User4';
        const post_id = 9;
        const title = 'updated post title';
        const content = 'updated post content';

        await dbTools.updatePost(post_id, title, content, currentDate);
        const updatedPost = await dbTools.getPostById(9);
        assert.equal(updatedPost.username, username);
        assert.equal(updatedPost.title, title);
        assert.equal(updatedPost.content, content);
        assert.equal(updatedPost.date, currentDate);
    });

    it('deletePost()', async () => {
        await dbTools.deletePost(9);
        const deletedPost = await dbTools.getPostById(9);
        assert.equal(deletedPost, null);
    });

    it('getAllPosts()', async () => {
        const posts = await dbTools.getAllPosts();
        assert.equal(posts.length, 8);
    });

    it('isValidUser()', async () => {
        let username = 'User1';
        let result = await dbTools.isValidUser(username);
        assert.equal(result.username, username);

        username = 'User900';
        result = await dbTools.isValidUser(username);
        assert.equal(result, null);
    });

    it('getNumberOfPosts()', async () => {
        const numPosts = await dbTools.getNumberOfPosts();
        assert.equal(numPosts.num, 8);
    });

    it('getNumberOfLikes()', async () => {
        const numLikes = await dbTools.getNumberOfLikes();
        assert.equal(numLikes.num, 6);
    });

    it('countLikesById()', async () => {
        const numLikes = await dbTools.countLikesById(1);
        assert.equal(numLikes.num, 4); 
    });

    it('hasUserLikedPost()', async () => {
        let liked = await dbTools.hasUserLikedPost(1, 1);
        assert.equal(liked, true);
        liked = await dbTools.hasUserLikedPost(2,3);
        assert.equal(liked, false);
    });

    it('didUserMakePost()', async () => {
        let result = await dbTools.didUserMakePost(1,1);
        assert.equal(result, true);
        result = await dbTools.didUserMakePost(1,2);
        assert.equal(result, false);
    });

    
    it('getPostIds()', async () => {
        const posts = await dbTools.getPostIds();
        assert.equal(posts[0].post_id, 1);
        assert.equal(posts[0].count, 4);
    });

    it('searchPosts()', async () => {
        let query = 'iot';
        let results = await dbTools.searchPosts(query);
        assert.equal(results.length, 2);
        assert.equal(results[0].post_id, 1);
        assert.equal(results[1].post_id, 3);

        query = 'user1';
        results = await dbTools.searchPosts(query);
        assert.equal(results.length, 3);
        assert.equal(results[0].post_id, 1);
        assert.equal(results[1].post_id, 3);
        assert.equal(results[2].post_id, 4);

        query = 'user7';
        results = await dbTools.searchPosts(query);
        assert.equal(results.length, 0);
    });

    it('sendEmail() and shouldMailBeSent()', async () => {
        const email = 'test@gmail.com';
        await dbTools.sendEmail(email);
        const result = await dbTools.shouldMailBeSent(email);
        assert.equal(result, false);
    });

    it('deleteAllLikesByUser(1)', async () => {
        await dbTools.deleteAllLikesByUser(1);
        const results = await dbTools.getAllLikesByUser(1);
        assert.deepEqual(results, []);
    });

    it('deleteAllPostsByUser(1)', async () => {
        await dbTools.deleteAllPostsByUser(1);
        const results = await dbTools.getAllPostsByUser(1);
        assert.deepEqual(results, []);
    });


});
