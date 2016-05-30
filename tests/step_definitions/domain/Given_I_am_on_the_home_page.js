module.exports = function() {
  this.Given(/^I am on the home page$/, function () {
    browser
     .url('http://localhost:3000')
  });
};
