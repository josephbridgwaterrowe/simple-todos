module.exports = function() {
  this.Given(/^the Click Me button has been clicked before$/, function () {
    browser
     .click('button');
  });
};
