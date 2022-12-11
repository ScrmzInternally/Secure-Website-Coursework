const validation = require("../javascripts/validation");
const assert = require('assert');


//example test file
describe('Testing validation file',  function() {

    it("Testing parseDate()", () => {
        const currentDate = new Date();
        const currentDateString = currentDate.toLocaleString();
        const returnedDate = validation.parseDate(currentDateString);
        assert(returnedDate.toDateString(), currentDate.toDateString());
    });

    it('Testing validateUser()', () => {
        assert(validation.validateUser("username"), true);
        assert(validation.validateUser("a user"), false);
        assert(validation.validateUser("another us@r"), false);
    })

    it('Testing validatePassword()', () => {
        assert(validation.validatePassword("password"), false);
        assert(validation.validatePassword("amoresecurepassword"), true);
        assert(validation.validatePassword("nrwe98372urh_lk@"), true);
    })

    it('Testing validateEmail()', () => {
        assert(validation.validateEmail("email@email.com"), true);
        assert(validation.validateEmail("notanemail"), false);
        assert(validation.validateEmail("fakeemail.com"), false);
        assert(validation.validateEmail("fake@mailcom"), false);
    })

    it('Testing sanitise()', () => {
        assert(validation.sanitise("a nice string"), "a nice string");
        assert(validation.sanitise("<script>"), "&lt;script&gt;");
        assert(validation.sanitise("//&"), "&#x2F;&#x2F;&amp;");
    })
});