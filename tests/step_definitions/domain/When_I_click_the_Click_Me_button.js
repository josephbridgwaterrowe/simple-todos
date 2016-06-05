module.exports = function () {
  this.When(/^I click the Click Me button$/, function () {
    browser
     .click('button');
  });
};
