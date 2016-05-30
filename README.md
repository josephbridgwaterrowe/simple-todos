# simple-todos
Meteor Todo App Tutorial

## About This Repository

This tutorial app has been based upon the automated-testing-best-practices
repository from xolvio, which can be found [here](https://github.com/xolvio/automated-testing-best-practices).

Refer to that repository for further information.

## Installation & Usage

#### Locally
1. Clone this repo<br/>
   ```
   git clone https://github.com/josephbridgwaterrowe/simple-todos.git
   cd simple-todos
   npm install
   ```

1. Start Chimp + Meteor without Mirror<br/>
   ```
   npm start
   ```
   Or if you like to have a Mirror (another Meteor app for Chimp to run against):<br/>
   ```
   WITH_MIRROR=1 npm start
   ```

3. Start the unit testing runner by either starting Wallaby from your IDE (highly recommended! See above), or you can start Karma with:
   ```
   npm run karma
   ```

   NOTES:
   * You need to run Meteor before you run the Wallaby server testing mode as it requires a connection to the running database
   * Currently the only way to run server unit tests is using Wallaby locally, CI tests will not work until Meteor 1.3 is released

4. Test and Develop!

  If you'd like to run a full build locally, exit the process and run:

  ```
  npm test
  ```

#### On CI
All you need to do is this:
```
npm run ci
```

You might need to do a little more setup depending on your specific CI environment.

This repository already includes a `circle.yml` and `travis.yml` files that runs Chimp on CircleCI and TravisCI, as well as taking care of all the dependency caching.
