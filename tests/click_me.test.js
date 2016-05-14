describe('click the click me link', function () {
  describe('when the button is clicked for the first time', function() {
    it('the counter will be equal to 1', function () {
      browser
       .url('http://localhost:3000')
       .click('button');

      const countMessage = browser.getText('p');

      assert.equal(countMessage, 'You\'ve pressed the button 1 times.');
    });
  });

  describe('when the button is clicked twice', function() {
    it('the counter will be equal to 2', function () {
      browser
       .url('http://localhost:3000')
       .click('button')
       .click('button');

      const countMessage = browser.getText('p');

      assert.equal(countMessage, 'You\'ve pressed the button 2 times.');
    });
  });
});
