module.exports = function () {
  this.Then(/^the count message should show (\d+) clicks$/, function (count) {
    const countMessage = browser.getText('p');

    expect(countMessage).toEqual(`You've pressed the button ${count} times.`)
  });
};
