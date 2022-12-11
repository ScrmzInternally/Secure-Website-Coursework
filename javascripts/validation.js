//Name: Validation.js
//This is where all the validation methods are found.

const dbTools = require('./dbTools');

//This function validates if the current user session has a valid start time -- AKA not longer than 60 minutes ago
async function validateSession(session) {
    let user = await dbTools.getUserById(session.user_id);
    if (user === undefined)
        return false;
    let currentDate = dbTools.getDate();
    let d1 = parseDate(session.date);
    let d2 = parseDate(currentDate);
    //calculating the difference between the session start date and current date (/1000 /60 is done to get minutes)
    let diff = ((d2 - d1) / 1000) / 60;
    //if valid, return true
    return diff <= 60;
}

//This is a helper function to pass a localeDate string, and convert it into a JS Date() object.
function parseDate(date) {
    const [day, time] = date.split(',').map(item => item.trim());
    const [d, m, y] = day.split('/');
    const [hours, minutes, seconds] = time.split(':');
    return new Date(parseInt(y), parseInt(m)-1, parseInt(d), parseInt(hours), parseInt(minutes), parseInt(seconds));
}

//These are to be completed later
async function validateUser(username) {
    var nameRegex = /^[a-zA-Z0-9_]+$/;
    if (username.match(nameRegex)) {
        if (username.length < 21) {
            let user = await dbTools.isValidUser(username);
            //if user already exists
            return user === undefined;
        }
    }
    return false;
}

async function validatePassword(password) {
    return (password.length > 9 && password.length < 64);
}


async function validateEmail(email) {
    //TODO - MAKE THIS SAME AS VALIDATE USER SO CAN ONLY HAVE UNIQUE EMAILS
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.match(emailRegex)) {
        let address = await dbTools.isValidEmail(email);
        return address === undefined;
    }
    return false;
}

function truncatePost(post) {
    if (post.content.length > 250) {
        post.content = post.content.substring(0, post.content.lastIndexOf(' ', 250));
        post.content += "..."
    }
    return post
}

function sanitise(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
        "=": '&#61;'
    };
    const reg = /[&<>"'/=]/ig;
    return string.replace(reg, (match)=>(map[match]));
  }

module.exports = {
    validateUser, validatePassword, validateEmail, validateSession, truncatePost, sanitise, parseDate
}
