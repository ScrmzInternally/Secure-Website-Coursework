//Name: Email.js
//This set of tools is for 2FA and completion of signup route. Time-Based One-Time-Passwords are used (see RFC 6238).

const crypto = require('crypto');

//This function is called from the 2FA route. A random hexadecimal secret is computed. Then, it calls a second function
//to calculate a TOTP based on this secret. An email is constructed, and passed to another function where this is
//then sent. The secret is then returned, back to the original function caller, so the TOTP can be verified later.

async function verifyEmail(email) {
    let secret = crypto.pseudoRandomBytes(24).toString('hex');
    let totp = getTotp(secret);
    let emailToSend = {
        from: 'myblogchum@gmail.com',
        to: email,
        subject: 'Your Login Verification Code',
        text: 'Your code to access MyBlogChum is ' + totp + '.\n Do not share this with anyone else.',
    };
    sendMail(emailToSend);
    return secret;
}

//How TOTPs Work: We want a specific hash function that, when a specific secret key is hashed, the output will be the
//same code for a certain period of time (set to 60 seconds currently). First, the time is retrieved, and the time step
//is set. T represents the number of time steps from the initial time t0 to the current Unix time. I have not
//implemented a 'window' function, so as long as T is 0, the hash will be the same. As soon as T = 1 (AKA as soon as
//60 seconds has passed), the hash will change.
//The hash is calculated using a 4-step process, to make it secure and unique for all users.
//1.    Create a HMAC -- this is a type of message that is encrypted with a secret key. This is the
//      same secret key we generated earlier in the previous function. The HMAC is made by encrypting the time step.
//      This HMAC hash is way too long for the user to type in as a code, so the rest of the steps are 'dynamic
//      truncation' -- getting a 6 digit sample of the hash. This dynamic truncation algorithm was specified in
//      RFC 4226, for the predecessor of TOTPs (HOTPs).
//2.    Convert the hash into binary (from hex - base 16, into bin - base 2). Then, get the last 4 bits of the binary
//      number, and convert this into a base 10 integer.
//3.    This integer is used as an 'offset' -- we then select a 32 bit sample of the binary string : the position
//      of where we take this sample from is based from that offset integer.
//4.    Cast that 32 bit binary 'substring' into a base 10 integer. The output is still a little long, so we will get
//      the last 6 digits of this.

function getTotp(secret) {
    let seconds = Math.floor(new Date().getTime() / 1000);
    let timeStepSeconds = 60;
    let t = Math.floor(seconds / timeStepSeconds).toString();
    //we are using SHA-512 for our hash algorithm.
    let hash = crypto.createHmac('sha512', secret).update(t).digest('hex');
    let binary = hexToBinary(hash);
    let last4bits = binary.slice(-4);
    let offset = parseInt(last4bits, 2 );
    let chosen32bits = binary.toString().substring(offset*8, (offset*8) + 32);
    return parseInt(chosen32bits, 2).toString().slice(-6);
}

//Takes in 2 parameters - 'totp' is the code the user enters on the 2FA page (which they got via email). Secret is the
//same secret generated before. All this function has to do, is get another TOTP by running the previous function
//again. If the TOTPs match, the user is authenticated.

function validateTotp(totp, secret) {
    console.log(totp === getTotp(secret));
    return totp === getTotp(secret);
}

//https://stackoverflow.com/questions/17204912/javascript-need-functions-to-convert-a-string-containing-binary-to-hex-then-co
//A helper function to convert hex into binary since javascript has no support for this

function hexToBinary(s) {
    let i, string = '';
    let lookup = {
        '0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100',
        '5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001',
        'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
        'e': '1110', 'f': '1111',
        'A': '1010', 'B': '1011', 'C': '1100', 'D': '1101',
        'E': '1110', 'F': '1111'
    };
    for (i = 0; i < s.length; i += 1) {
        if (lookup.hasOwnProperty(s[i])) {
            string += lookup[s[i]];
        } else {
            return null;
        }
    }
    return string;
}

//This function is in charge of the backend mail server (just a gmail account). An email JSOn object is passed to this
//function, and the email is sent here.

function sendMail(email) {
    const nodemailer = require('nodemailer');
    const trans = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'myblogchum@gmail.com',
            pass: 'DontLookRight177'
        }
    });
    trans.sendMail(email, function(error, info) {
        if (error) {
            console.log(error);
        }
        else {
            console.log('Successfully sent email: ' + info.response);
        }
    });
}
//todo on MAY 30th, GMAIL DOESNT SUPPORT THIS KIND OF LOGGING IN ANYMORE HOPEFULLY THAT'S NOT TOO SOON

module.exports = {verifyEmail, validateTotp, getTotp, hexToBinary}

