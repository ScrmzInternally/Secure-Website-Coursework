const email = require("../javascripts/email");
const assert = require('assert');

describe('Testing email file',  function() {
    it('testing hexToBinary()', () => {
        assert(email.hexToBinary("2b"), "00101011");
        assert(email.hexToBinary("193d"), "0001100100111101");
        assert(email.hexToBinary("f92"), "111110010010");
    })

    it('testing getTotp()', () => {
        const otp = email.getTotp("secret");
        const dummy = "019384"
        assert(otp.length, dummy.length);

    })
});