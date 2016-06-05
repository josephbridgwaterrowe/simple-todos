#!/usr/bin/env node
var path = require('path'),
   fs = require('fs'),
   extend = require('util')._extend,
   exec = require('child_process').exec,
   processes = [];

var baseDir = path.resolve(__dirname, '..'),
   srcDir = path.resolve(baseDir, 'src'),
   chimpBin = path.resolve(baseDir, '.scripts/node_modules/.bin/chimp'),
   features = [];

process.argv.slice(2).forEach(function(featureFile) { features.push(path.resolve(featureFile))});

var appOptions = {
  settings: 'settings.json',
  port: 3000,
  env: {
    ROOT_URL: 'http://localhost:3000'
  }
};

var mirrorOptions = {
  settings: appOptions.settings,
  port: 3100,
  env: {
    IS_MIRROR: 1,
    MONGO_URL: 'mongodb://localhost:' + 3001 + '/chimp_db',
    ROOT_URL: 'http://localhost:3100'
  },
  logFile: './chimp-mirror.log'
};


var chimpSwitches = '';

if (features.length > 0) {
  chimpSwitches += ' --path=' + path.resolve('tests') + ' ' + features.join(" ");
} else {
  chimpSwitches = ' --path=' + path.resolve('tests/specifications') + chimpSwitches;
}
chimpSwitches +=
   ' --domainSteps=' + path.resolve('tests/step_definitions/domain') +
   ' --criticalSteps=' + path.resolve('tests/step_definitions/critical') +
   ' --watchSource=' + path.resolve('tests') +
   ' --singleSnippetPerFile=1' +
   ' --no-source';

if (!process.env.CI && !process.env.TRAVIS && !process.env.CIRCLECI) {
  // when not in Watch mode, Chimp existing will exit Meteor too
  chimpSwitches += ' --watch';
}

if (process.env.CIRCLECI) {
  chimpSwitches += ' --screenshotsPath="' + process.env.CIRCLE_ARTIFACTS + '"';
}

if (process.env.SIMIAN_API && process.env.SIMIAN_REPOSITORY) {
  chimpSwitches += ' --simianRepositoryId=' + process.env.SIMIAN_REPOSITORY;
  chimpSwitches += ' --simianAccessToken=' + process.env.SIMIAN_API;
}

if (process.env.CUCUMBER_JSON_OUTPUT) {
  chimpSwitches += ' --jsonOutput=' + process.env.CUCUMBER_JSON_OUTPUT;
}

// set this flag to start with a mirror locally (ala Velocity xolvio:cucumber style)
if (process.env.WITH_MIRROR) {
  chimpWithMirror();
} else if (process.env.NO_METEOR) {
  startChimp('--ddp=' + appOptions.env.ROOT_URL + chimpSwitches);
} else {
  // *************************************************
  // THIS IS THE DEFAULT
  // *************************************************
  chimpNoMirror();
}

// *************************************************

function chimpWithMirror() {
  appOptions.waitForMessage = 'Started MongoDB';
  startApp(function () {
    startMirror(function () {
      console.log('=> Test App running at:', mirrorOptions.env.ROOT_URL);
      console.log('=> Log file: tail -f', path.resolve(mirrorOptions.logFile), '\n');
      startChimp('--ddp=' + mirrorOptions.env.ROOT_URL + chimpSwitches);
    });
  });
}

function chimpNoMirror() {
  appOptions.waitForMessage = 'App running at';
  startApp(function () {
    console.log("inside no mirror ", chimpSwitches);
    startChimp('--ddp=' + appOptions.env.ROOT_URL + chimpSwitches);
  });
}

function startApp(callback) {
  startProcess({
    name: 'Meteor App',
    command: 'meteor --settings ' + appOptions.settings + ' --port ' + appOptions.port,
    waitForMessage: appOptions.waitForMessage,
    options: {
      cwd: srcDir,
      env: extend(appOptions.env, process.env)
    }
  }, callback);
}

function startMirror(callback) {
  startProcess({
    // TODO check if settings file exists first
    name: 'Meteor Mirror',
    command: 'meteor --settings ' + mirrorOptions.settings + ' --port ' + mirrorOptions.port,
    silent: true,
    logFile: mirrorOptions.logFile,
    waitForMessage: 'App running at',
    options: {
      cwd: srcDir,
      env: extend(mirrorOptions.env, process.env)
    }
  }, callback);
}

function startChimp(command) {
  console.log("chimpBin ", chimpBin);
  console.log("command ", command);
  startProcess({
    name: 'Chimp',
    command: chimpBin + ' ' + command,
    options: {
      env: Object.assign({}, process.env, {
        NODE_PATH: process.env.NODE_PATH +
          path.delimiter + srcDir +
          path.delimiter + srcDir + '/node_modules',
      }),
    },
  });
}

function startProcess(opts, callback) {
  var proc = exec(
     opts.command,
     opts.options
  );
  if (opts.waitForMessage) {
    proc.stdout.on('data', function waitForMessage(data) {
      if (data.toString().match(opts.waitForMessage)) {
        if (callback) {
          callback();
        }
      }
    });
  }
  if (!opts.silent) {
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
  }
  if (opts.logFile) {
    var logStream = fs.createWriteStream(opts.logFile, {flags: 'a'});
    proc.stdout.pipe(logStream);
    proc.stderr.pipe(logStream);
  }
  proc.on('close', function (code) {
    console.log(opts.name, 'exited with code ' + code);
    for (var i = 0; i < processes.length; i += 1) {
      processes[i].kill();
    }
    process.exit(code);
  });
  processes.push(proc);
}

