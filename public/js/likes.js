let socket = io("http://localhost:3000");
function socketLike(postid, userid) {
    // let p = parseInt(postid);
    // p = p - 1;
    // p = "" + p + "";
    socket.emit('like', {post: postid, user: userid});

}
socket.on('likeadded', (postid) => {
    let img = document.getElementById(postid);
    img.src = "../images/icons/likeG.png";
    window.location.reload();
});
socket.on('likedeleted', (postid) => {
    let img = document.getElementById(postid);
    img.src = "../images/icons/like.png";
    window.location.reload();
});

function loadLikes(arr) {
    arr.forEach((el) => {
        let img1 = document.getElementById(el);
        img1.src = "../images/icons/likeG.png";
    });

}
function loadLikesSingle(post_id) {
    let img1 = document.getElementById(post_id);
    img1.src = "../images/icons/likeG.png";
}