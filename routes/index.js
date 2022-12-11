const express = require('express');
const dbTools = require("../javascripts/dbTools");
const valid = require("../javascripts/validation");
const router = express.Router();



/* GET home page. */
router.get('/', async function (req, res) {
  let posts = await dbTools.getAllPosts();
  let numOfPosts = 0;
  posts.forEach((element) => {
    numOfPosts++;
    element = valid.truncatePost(element);
  });
  let likesdict = await getDict();
  let postindex = await getPostIndex(likesdict, numOfPosts)
  let postorder = await getMostPopularPosts(posts, postindex);
  if (req.session && req.session.session_id) {
    let validUser = await valid.validateSession(req.session);
    if (validUser) {
      let user = await dbTools.getUserById(req.session.user_id);
      let userslikes = await getUsersLikes(req.session.user_id, numOfPosts);
      let userslikesorder = orderUsersLikes(postindex, userslikes);
      res.render('index', {title: 'MyBlogChum', auth: true, posts: postorder, user: user,
        postindex: postindex, likesdict: likesdict, userslikes: JSON.stringify(userslikesorder)});
    }
  }
  else {
    res.render('index', {
      title: 'MyBlogChum',
      auth: false,
      posts: postorder,
      likesdict: likesdict,
      postindex: postindex
    });
  }
});

async function getDict(numberOfPosts) {

  let dict = {};
  let ids = await dbTools.getPostIds()
  ids.forEach((element) => {
    dict[element.post_id] = element.count;
  })
  for (let i = 1; i < numberOfPosts + 1; i++) {
    if (dict[i] === undefined) {
      dict[i] = 0;
    }
  }
  return dict;
}

async function getUsersLikes(user_id, numberOfPosts) {
  let usersLikes = await dbTools.getAllLikesByUser(user_id);
  let dict1 = {}
  usersLikes.forEach((element) => {
    dict1[element.post_id] = 1;
  })
  for (let i = 1; i < numberOfPosts + 1; i++) {
    if (dict1[i] === undefined) {
      dict1[i] = 0;
    }
  }
  return dict1;
}

async function getPostIndex(likes, numOfPosts) {
  let sort = Object.entries(likes);
  let sorted = sort.sort((a,b) => b[1] - a[1]);
  let arr = [];
  sorted.forEach((el) => {
    if (arr.length < 3) {
      arr.push(el[0]);
    }
  });
  for (let i = numOfPosts; i >= 1; i--) {
    if (!arr.includes(''+i+'')) {
      arr.push(''+i+'');
    }
  }
  return arr;
}

async function getMostPopularPosts(posts, arr) {
  let newPosts = [];
  arr.forEach((ele) => {
    newPosts.push(posts[parseInt(ele) - 1]);
  });
  return newPosts;
}

function orderUsersLikes(indexes, userslikes) {
  let arr = [];
  indexes.forEach((ele) => {
    if (userslikes[ele] !== 0) {
      arr.push(ele);
    }
  });
  return arr;

}

/* GET searchquery page, prints all posts if viewmore button is clicked -TEMP route */
router.get('/search:query', async function (req, res) {
  console.log('search query called');

  let postResults = '';
  const searchQuery = valid.sanitise(req.params.query);
  console.log(searchQuery);
  if (searchQuery === 'viewall') {
    postResults = await dbTools.getAllPosts();
  } else {
    postResults = await dbTools.searchPosts(searchQuery);
  }

  let posts = await dbTools.getAllPosts();
  let numOfPosts = 0;
  posts.forEach((element) => {
    numOfPosts++;
    element = valid.truncatePost(element);
  });
  let likesdict = await getDict();
  let postindex = await getPostIndex(likesdict, numOfPosts)
  let postorder = await getMostPopularPosts(posts, postindex);

  if (req.session && req.session.session_id) {
    let validUser = await valid.validateSession(req.session);
    if (validUser) {
      let user = await dbTools.getUserById(req.session.user_id);
      let userslikes = await getUsersLikes(req.session.user_id, numOfPosts);
      let userslikesorder = orderUsersLikes(postindex, userslikes);
      res.render('blogposts', {
        title: 'MyBlogChum', 
        auth: true, 
        posts: postorder, 
        user: user,
        postindex: postindex, 
        likesdict: likesdict, 
        userslikes: JSON.stringify(userslikesorder), 
        allPosts: postResults,
        searchQuery : searchQuery
      });
    }
  } else {
    res.render('blogposts', {
      title: 'MyBlogChum',
      auth: false,
      posts: postorder,
      likesdict: likesdict,
      postindex: postindex,
      allPosts: postResults,
      searchQuery : searchQuery
    });
  }
});

module.exports = router;
