const passTools = require("../javascripts/passTools");
const assert = require('assert');
const crypto = require('crypto');

describe('Testing passTools file',  function() {
   it('testing hashPassword()', async () => {
       const salt = "knownSalt"
       const returnedPassword = await passTools.hashPassword("password", salt);
       const shouldBe = "484f0b980e082853587d72b956a0479b849bb560402d5cbccd3e1da771f953daf68b4843027db68bfea9bf1fe4ab9c91f40658a993fd0c13cc78f44a919cb825";
       assert(returnedPassword, shouldBe);
   })
});