//Name: dbTools.js
//This is the set of tools for communicating with the database.
// const promptSync = require("prompt-sync");
// const prompt = promptSync();

const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const crypto = require('crypto');
const passTools = require('./passTools')

//gets an instance of the database. We are using SQLite3. Initial database setup is done via migrate(), and you can
//see the SQL in migrations/01-init.sql.
async function getDatabase() {
    const dbPromise = sqlite.open({
        filename: 'db.db',
        driver: sqlite3.Database})
    let db = await dbPromise
    await db.migrate()
    return db;
}

//populates the database if it is empty.
async function populate() {
    let users = await getAllUsers();
    if (users.length === 0) {
        let salt = crypto.pseudoRandomBytes(24).toString('hex');
        let hash = await passTools.hashPassword('passpasspass', salt)
        await addUser('user1', hash, salt, 'user1@gmail.com');
        let salt1 = crypto.pseudoRandomBytes(24).toString('hex');
        let hash1 = await passTools.hashPassword('passpasspass', salt1)
        await addUser('user2', hash1, salt1, 'user2@gmail.com');
        let salt2 = crypto.pseudoRandomBytes(24).toString('hex');
        let hash2 = await passTools.hashPassword('passpasspass', salt2)
        await addUser('user3', hash2, salt2, 'user3@gmail.com');
        let salt3 = crypto.pseudoRandomBytes(24).toString('hex');
        let hash3 = await passTools.hashPassword('passpasspass', salt3)
        await addUser('user4', hash3, salt3, 'user4@gmail.com');
        console.log("populated users.");
    }

    let posts = await getAllPosts();
    if (posts.length === 0) {
        let currentDate = getDate();
        await createTriggers();
        await addPost('user1', 'Internet of Things','IoT refers to interconnected devices, which relay data over the internet. The average person has 6.58 devices. This is a problem for cyber security as the attack surface is greatly increased. Keeping the data collected and processed by IoT devices safe and private is very important. They can collect a lot of data, such as home occupancy information, medical data, location data, and even conversations.', currentDate);
        await addPost('user2', 'Embedded Systems','The devices are often connected to potentially dangerous devices. Think: thermostats, smart kettles, and smart tumble dryers. These devices are often programmed in a unique language, and almost always connected to the internet. The devices must be secure and resistant to hacking. Must be adequate on every device - no one weak link. This includes: encryption, authentication problems, and safe architecture.', currentDate);
        await addPost('user1', 'Gateway','The gateway comprises of how the data is communicated to the cloud servers and to the user. This includes the tranmission format and the user\'s phone. Transmission methods include Wi-Fi connection, 3G connection, and Bluetooth (usually Bluetooth LE). Because IoT devices generate data, it needs to be transferred securely using encryption. This data may frequently be sent to multiple places, where the data may be altered or decrypted at any stage.', currentDate);
        await addPost('user1', 'Cryptocurrency','Cryptocurrency massively changes the landscape of cyber security and cyber crime. It can be used to assist in cyber security, but also can provide additional risk. Cryptocurrency allows for psuedo-anonymous transactions. No names are directly linked to bitcoin wallets, only lists of previous transactions.', currentDate);
        await addPost('user3', 'Cyber Warfare','NATO defines cyber warfare as: \"use of technology to attack a nation, causing comparable harm to actual warfare. Cyber warfare aims to cause damage through damaging digital infrastructure. It includes espionage, deletion, hacking and more. Incidents such as Stuxnet.', currentDate);
        await addPost('user4', 'What is Quantum Computing?','Computing that uses \'quantum states\' to perform calculations quickly. Any calculation that can be done by a normal computer can be done by a quantum computer, and vice-versa (Church-Turing Thesis). However, quantum computing is theoretically significantly faster, meaning calculations which would be infeasible due to time are possible.', currentDate);
        await addPost('user2', 'What are \'ethics\'?','\"Moral principles that govern a person\'s behaviour or the conducting of an activity.\" HOWEVER! Not all ethics are based in morals. What\'s the difference between morals and ethics? Morals - your guiding principles. Ethics - specific rules to follow', currentDate);
        await addPost('user4', 'Intellectual Property','Intellectual Property is protections for creations and ideas that you own. 3 types: Trademarks - protection of a branded thing. Patents - protection of an idea or invention. Copyright - protection of a creative work. We\'re mainly going to be talking about copyright.', currentDate);

        console.log("populated posts.");
    }

    let likes = await getAllLikes();
    if (likes.length === 0) {
        await addLike(1,1);
        await addLike(1,2);
        await addLike(1,3);
        await addLike(1,4);
        await addLike(2,1);
        await addLike(2,2);

        console.log("populated likes.")
    }

}


async function addUser(username, password_hash, password_salt, email) {
    username = username.toLowerCase();
    let db = await getDatabase();
    return db.run(`INSERT INTO users (username, password_hash, password_salt, email) VALUES (?, ?, ?, ?)`, [username, password_hash, password_salt, email]
    )
}

async function deleteUser(user_id) {
    let db = await getDatabase();
    return db.run(`DELETE FROM users WHERE user_id = ?`, [user_id]
    );
}

async function getUserById(user_id) {
    let db = await getDatabase();
    return db.get(`SELECT * FROM users WHERE user_id = ?`, [user_id]
    );
}

async function getAllUsers() {
    let db = await getDatabase();
    return await db.all(`SELECT * FROM users`);
}


async function getAllLikesByUser(user_id) {
    let db = await getDatabase();
    return await db.all(`SELECT * FROM likes WHERE user_id = ?`, [user_id]);
}
async function addLike(post_id, user_id) {
    let db = await getDatabase();
    return await db.run(`INSERT INTO likes (post_id, user_id) VALUES (?, ?)`, [post_id, user_id]);
}

async function deleteLike(post_id, user_id) {
    let db = await getDatabase();
    return await db.run(`DELETE FROM likes WHERE post_id = ? AND user_id = ?`, [post_id, user_id]);
}

async function getLikeById(like_id) {
    let db = await getDatabase();
    return await db.get(`SELECT * FROM likes WHERE like_id = ?`, [like_id]
    );
}

async function getAllLikes() {
    let db = await getDatabase();
    return await db.all(`SELECT * FROM likes`);
}
async function addPost(username, title, content, date) {
    let db = await getDatabase();
    return await db.run(`INSERT INTO posts (username, title, content, date) VALUES (?, ?, ?, ?)` , [username, title, content, date]);
}

async function updatePost(post_id, title, content, date) {
    let db = await getDatabase();
    return await db.run(`UPDATE posts SET title = ?, content = ?, date = ? WHERE post_id = ? `, [title, content, date, post_id]
    );
}

async function deletePost(post_id) {
    let db = await getDatabase();
    return await db.run(`DELETE FROM posts WHERE post_id = ?`, [post_id]
    );
}

async function getPostById(post_id) {
    let db = await getDatabase();
    return await db.get(`SELECT * FROM posts WHERE post_id = ?`, [post_id]
    );
}

async function getAllPosts() {
    let db = await getDatabase();
    return await db.all(`SELECT * FROM posts`);
}

async function getAllPostsByUser(username) {
    let db = await getDatabase();
    return await db.all(`SELECT * FROM posts WHERE username = ?`, [username]
    );
}
async function isValidUser(username) {
    let db = await getDatabase();
    return await db.get(`SELECT * FROM users WHERE username = ?`, [username]);
}

async function isValidEmail(email) {
    let db = await getDatabase();
    return await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
}

function getDate() {
    return new Date().toLocaleString();
}
async function deleteAllPostsByUser(user_id) {
    let user = await getUserById(user_id);
    let db = await getDatabase();
    return await db.run(`DELETE FROM posts WHERE username = ?`, [user.username]);
}
async function deleteAllLikesByUser(user_id) {
    let db = await getDatabase();
    return await db.run(`DELETE FROM likes WHERE user_id = ?`, [user_id]);
}
async function hasUserLikedPost(post_id, user_id) {
    let db = await getDatabase();
    let like = await db.get(`SELECT * FROM likes WHERE post_id = ? AND user_id = ?`, [post_id, user_id]);
    return like !== undefined;
}

async function getPostIds() {
    let db = await getDatabase();
    return await db.all(`SELECT post_id, COUNT(*) as count FROM likes GROUP by post_id ORDER BY post_id`);
}

async function getNumberOfPosts() {
    let db = await getDatabase();
    return await db.get(`SELECT COUNT(*) AS num FROM posts`);
}

async function getNumberOfLikes() {
    let db = await getDatabase();
    return await db.get(`SELECT COUNT(*) AS num FROM likes`);
}

async function countLikesById(post_id) {
    let db = await getDatabase();
    return await db.get(`SELECT COUNT(*) AS num FROM likes WHERE post_id = ?`, [post_id]);
}

async function didUserMakePost(user_id, post_id) {
    let user = await getUserById(user_id);
    let db = await getDatabase();
    let b = await db.all(`SELECT * FROM posts WHERE post_id = ? AND username = ?`, [post_id, user.username]);
    return b.length !== 0;
}
async function createTriggers() {
    let db = await getDatabase();
    await db.run(`CREATE TRIGGER post_ai AFTER INSERT ON posts BEGIN
        INSERT INTO virt(rowid, username, title, content, date)
        VALUES (new.post_id, new.username, new.title, new.content, new.date);
        END;`);
    await db.run(`CREATE TRIGGER post_ad AFTER DELETE ON posts BEGIN
        INSERT INTO virt(virt, rowid, username, title, content, date)
        VALUES ('delete', old.post_id, old.username, old.title, old.content, old.date);
        END;`);
    await db.run(`CREATE TRIGGER post_au AFTER UPDATE ON posts BEGIN
        INSERT INTO virt(virt, rowid, username, title, content, date)
        VALUES ('delete', old.post_id, old.username, old.title, old.content, old.date);
        INSERT INTO virt(rowid, username, title, content, date)
        VALUES (new.post_id, new.username, new.title, new.content, new.date);
        END;`);
    console.log("created triggers.");
}

async function searchPosts(query) {
    query = query.replace(/[\W_]+/g," ");
    let db = await getDatabase();
    return await db.all(`SELECT rowid AS post_id, username, title, content, date FROM virt WHERE virt MATCH ?`, [query]);
}

async function sendEmail(email)  {
    let db = await getDatabase();
    let date = getDate();
    return await db.run(`INSERT INTO email (email, date) VALUES (?, ?)`, [email, date]);
}

async function shouldMailBeSent(address) {
    let currentDate = new Date();
    let db = await getDatabase();
    let emailList = await db.all(`SELECT date FROM email WHERE email = ?`, [address]);
    if (emailList !== undefined) {
        for (let i = 0; i < emailList.length; i++) {
            let dateString = emailList[i].date.toString();
            const [day, time] = dateString.split(',').map(item => item.trim());
            const [d, m, y] = day.split('/');
            const [hours, minutes, seconds] = time.split(':');
            let databaseDate = new Date(parseInt(y), parseInt(m)-1, parseInt(d), parseInt(hours), parseInt(minutes), parseInt(seconds));

            //console.log(databaseDate);
            //console.log(currentDate);
            const secondDiff = Math.abs((currentDate.getTime() - databaseDate.getTime())) / 1000;
            //console.log(secondDiff)
            if (secondDiff <= 60) {
                return false;
            }
        }
    }
    return true;
}

module.exports = {
    addUser, deleteUser, getUserById, getAllUsers, getAllLikesByUser,
    addLike, deleteLike, getLikeById, getAllLikes,
    addPost, deletePost, getPostById, getAllPosts, getAllPostsByUser, updatePost,
    isValidUser, populate, getDatabase, getDate, deleteAllPostsByUser, deleteAllLikesByUser, hasUserLikedPost,
    getPostIds, getNumberOfPosts, getNumberOfLikes, countLikesById, didUserMakePost, searchPosts, sendEmail,
    shouldMailBeSent, isValidEmail
}