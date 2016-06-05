Feature: Click the Click Me button

  As a user
  I want to click the Click Me button
  So that the counter increases

  Background:
    Given I am on the home page

  Scenario: First click
    When I click the Click Me button
    Then the count message should show 1 clicks

  Scenario: Second click
    Given the Click Me button has been clicked before
    When I click the Click Me button
    Then the count message should show 2 clicks
