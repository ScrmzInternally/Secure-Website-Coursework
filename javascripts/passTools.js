//Name: passTools.js
//This is the set of tools that relate to passwords.

const crypto = require('crypto');

//Here is our password hashing function. We are using Password-Based Key Derivation Function 2 (PBKDF2). You should
//always use key derivation formulas when storing passwords instead of the usual cryptographic hashes. This is because
//this uses a HMAC algorithm (we're using SHA-512) over and over again to eventually end up with a 'derived key'. We
//have the number of iterations set to 100,000 currently. Of course, the passwords are also salted with a unique random
//string, which is 24 bytes long (this part is done in the database addUser() function, which calls hashPassword(). )
async function hashPassword(data, salt) {
    return new Promise((res, rej) => {
        crypto.pbkdf2(data, salt, 120000, 64, 'sha512', (err, key) => {
            if (err) {
                rej(err);
            } else {
                res(key.toString('hex'));
            }
            })
        });
    }





module.exports = {hashPassword}