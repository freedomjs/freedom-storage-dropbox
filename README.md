freedom-storage-dropbox
=======================

Dropbox Storage Provider for freedom.js

This provider uses the Dropbox JavaScript SDK to persist data
and exports a provider that conforms to the `freedom.js` storage API

## Using
Install the dependency through NPM

```
  npm --save freedom-storage-dropbox
```

## Building
This provider requires no build step to use
However, remember to install dependencies before running any
of the tasks below

```
  npm install
```

## Running the Demo
Run the following to try a tictaktoe demo that persists
all game stats to Dropbox.
Remember to log into Dropbox using the panel on the bottom

```
  grunt demo
```

## Running Tests
Before contributing any pull requests, please remember to run
our integration tests by running the following commands

Configure your credentials by creating a `config.js` in
the top level directory. `config.template.js` shows the required
fields. Once this is ready, run the tests by:

```
  grunt test
```

If any tests fail, we have a task that helps you debug your code: `grunt debug`

