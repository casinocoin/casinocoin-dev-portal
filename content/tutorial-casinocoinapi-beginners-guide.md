# CasinocoinAPI Beginners Guide

This tutorial guides you through the basics of building an CSC Ledger-connected application using [Node.js](http://nodejs.org/) and [CasinocoinAPI](reference-casinocoinapi.html), a JavaScript API for accessing the CSC Ledger.

The scripts and configuration files used in this guide are [available in the CasinoCoin Dev Portal GitHub Repository](https://github.com/casinocoin/casinocoin-dev-portal/tree/master/content/code_samples/casinocoinapi_quickstart).

# Environment Setup

The first step to using CasinocoinAPI is setting up your development environment.

## Install Node.js and npm

CasinocoinAPI is built as an application for the Node.js runtime environment, so the first step is getting Node.js installed. CasinocoinAPI requires Node.js version 8.9.3+, or higher.  We recommend using the current Node LTS Version.

This step depends on your operating system. We recommend [the official instructions for installing Node.js using a package manager](https://nodejs.org/en/download/package-manager/) for your operating system. If the packages for Node.js and `npm` (Node Package Manager) are separate, install both. (This applies to Arch Linux, CentOS, Fedora, and RHEL.)

After you have installed Node.js, you can check the version of the `node` binary from a command line:

```
node --version
```

On some platforms, the binary is named `nodejs` instead:

```
nodejs --version
```

## Use NPM to install CasinocoinAPI and dependencies

CasinocoinAPI uses the newest version of JavaScript, ECMAScript 6 (also known as ES2015) supported by Node 8+.

#### 1. Create a new directory for your project

Create a folder called (for example) `my_casinocoin_experiment`:

```
mkdir my_casinocoin_experiment && cd my_casinocoin_experiment
```

Optionally, start a [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) repository in that directory so you can track changes to your code.

```
git init
```

Alternatively, you can [create a repo on GitHub](https://help.github.com/articles/create-a-repo/) to version and share your work. After setting it up, [clone the repo](https://help.github.com/articles/cloning-a-repository/) to your local machine and `cd` into that directory.

#### 2. Create a new `package.json` file for your project.

Use the following template, which includes:

* CasinocoinAPI itself (`casinocoin-libjs`)
* (Optional) [ESLint](http://eslint.org/) (`eslint`) for checking code quality.

```
{% include 'code_samples/casinocoinapi_quickstart/package.json' %}
```


#### 3. Use NPM to install the dependencies.

```
npm install
```

This automatically installs all the dependencies defined in the `package.json` into the local folder `node_modules/`. (We recommend _not_ using `npm -g` to install the dependencies globally.)

The install process may take a while and end with a few warnings. You may safely ignore the following warnings:

```
npm WARN optional Skipping failed optional dependency /chokidar/fsevents:
npm WARN notsup Not compatible with your operating system or architecture: fsevents@1.0.6
npm WARN ajv@1.4.10 requires a peer of ajv-i18n@0.1.x but none was installed.
```

# First CasinocoinAPI Script

This script, `get-account-info.js`, fetches information about a hard-coded account. Use it to test that CasinocoinAPI works:

```
{% include 'code_samples/casinocoinapi_quickstart/get-account-info.js' %}
```

## Running the script

We will invoke node to run our CasinocoinAPI scripts.

```
node get-account-info.js
```

Output:

```
getting account info for cDarPNJEpCnpBZSfmcquydockkePkjPGA2
{ sequence: 1017,
  cscBalance: '3903371321.76246857',
  ownerCount: 0,
  previousAffectingTransactionID: '6EBE2B44BAE805D7540449411163E0800CC5A64F67F0E3F7B90424A08A52F108',
  previousAffectingTransactionLedgerVersion: 45259 }
getAccountInfo done
done and disconnected.
```

## Understanding the script

In addition to CasinocoinAPI-specific code, this script uses syntax and conventions that are recent developments in JavaScript. Let's divide the sample code into smaller chunks to explain each one.

### Script opening

```
'use strict';
const CasinocoinAPI = require('casinocoin-libjs').CasinocoinAPI;
```

The opening line enables [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode). This is purely optional, but it helps you avoid some common pitfalls of JavaScript. See also: [Restrictions on Code in Strict Mode](https://msdn.microsoft.com/library/br230269%28v=vs.94%29.aspx#Anchor_1).

The second line imports CasinocoinAPI into the current scope using Node.js's require function. CasinocoinAPI is one of [the modules `casinocoin-libjs` exports](https://github.com/casinocoin/casinocoin-libjs/blob/master/src/index.js).

### Instantiating the API

```
const api = new CasinocoinAPI({
  server: 'wss://ws01.casinocoin.org:4443' // Public casinocoind server
});
```

This section creates a new instance of the CasinocoinAPI class, assigning it to the variable `api`. (The [`const` keyword](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) means you can't reassign the value `api` to some other value. The internal state of the object can still change, though.)

The one argument to the constructor is an options object, which has [a variety of options](reference-casinocoinapi.html#parameters). The `server` parameter tells it where it should connect to a `casinocoind` server.

* The example `server` setting uses a secure WebSocket connection to connect to one of the public servers that CasinoCoin (the company) operates.
* If you don't include the `server` option, CasinocoinAPI runs in [offline mode](reference-casinocoinapi.html#offline-functionality) instead, which only provides methods that don't need network connectivity.
* You can specify a [CasinoCoin Test Net](https://casinocoin.org/build/casinocoin-test-net/) server instead to connect to the parallel-world Test Network instead of the production CSC Ledger.
* If you [run your own `casinocoind`](tutorial-casinocoind-setup.html), you can instruct it to connect to your local server. For example, you might say `server: 'ws://localhost:5005'` instead.

### Connecting and Promises

```
api.connect().then(() => {
```

The [connect() method](reference-casinocoinapi.html#connect) is one of many CasinocoinAPI methods that returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), which is a special kind of JavaScript object. A Promise is designed to do an asynchronous operation that returns a value later, such as querying the CSC Ledger.

When you get a Promise back from some expression (like `api.connect()`), you call the Promise's `then` method and pass in a callback function. Passing a function as an argument is conventional in JavaScript, taking advantage of how JavaScript functions are [first-class objects](https://en.wikipedia.org/wiki/First-class_function).

When a Promise finishes with its asynchronous operations, the Promise runs the callback function you passed it. The return value from the `then` method is another Promise object, so you can "chain" that into another `then` method, or the Promise's `catch` method, which also takes a callback. The callback you pass to `catch` gets called if something goes wrong.

Finally, we have more new ECMAScript 6 syntax - an [arrow function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions). Arrow functions are a shorter way of defining anonymous functions. This is convenient for defining lots of one-off functions as callbacks. The syntax `()=> {...}` is mostly equivalent to `function() {...}`. If you want an anonymous function with one parameter, you can use a syntax like `info => {...}` instead, which is almost the same as `function(info) {...}` syntax.

### Custom code

```
  /* begin custom code ------------------------------------ */
  const myAddress = 'cDarPNJEpCnpBZSfmcquydockkePkjPGA2';

  console.log('getting account info for', myAddress);
  return api.getAccountInfo(myAddress);

}).then(info => {
  console.log(info);
  console.log('getAccountInfo done');

  /* end custom code -------------------------------------- */
```

This is the part that you change to do whatever you want the script to do.

The example code looks up an CSC Ledger account by its address. Try running the code with different addresses to see different results.

The `console.log()` function is built into both Node.js and web browsers, and writes out to the console. This example includes lots of console output to make it easier to understand what the code is doing.

Keep in mind that the example code starts in the middle of a callback function (called when CasinocoinAPI finishes connecting). That function calls CasinocoinAPI's [`getAccountInfo`](reference-casinocoinapi.html#getaccountinfo) method, and returns the results.

The `getAccountInfo` API method returns another Promise, so the line `}).then( info => {` defines another anonymous callback function to run when this Promise's asynchronous work is done. Unlike the previous case, this callback function takes one argument, called `info`, which holds the asynchronous return value from the `getAccountInfo` API method. The rest of this callback function outputs that return value to the console.

### Cleanup

```
}).then(() => {
  return api.disconnect();
}).then(() => {
  console.log('done and disconnected.');
}).catch(console.error);
```

The rest of the sample code is mostly more [boilerplate code](reference-casinocoinapi.html#boilerplate). The first line ends the previous callback function, then chains to another callback to run when it ends. That method disconnects cleanly from the CSC Ledger, and has yet another callback which writes to the console when it finishes. If your script waits on [CasinocoinAPI events](reference-casinocoinapi.html#api-events), do not disconnect until you are done waiting for events.

The `catch` method ends this Promise chain. The callback provided here runs if any of the Promises or their callback functions encounters an error. In this case, we pass the standard `console.error` function, which writes to the console, instead of defining a custom callback. You could define a smarter callback function here to intelligently catch certain error types.

# Waiting for Validation

One of the biggest challenges in using the CSC Ledger (or any decentralized system) is knowing the final, immutable transaction results. Even if you [follow the best practices](tutorial-reliable-transaction-submission.html) you still have to wait for the [consensus process](https://casinocoin.org/build/casinocoin-ledger-consensus-process/) to finally accept or reject your transaction. The following example code demonstrates how to wait for the final outcome of a transaction:

```
{% include 'code_samples/casinocoinapi_quickstart/submit-and-verify.js' %}
```

This code creates and submits an order transaction, although the same principles apply to other types of transactions as well. After submitting the transaction, the code uses a new Promise, which queries the ledger again after using setTimeout to wait a fixed amount of time, to see if the transaction has been verified. If it hasn't been verified, the process repeats until either the transaction is found in a validated ledger or the returned ledger is higher than the LastLedgerSequence parameter.

In rare cases (particularly with a large delay or a loss of power), the `casinocoind` server may be missing a ledger version between when you submitted the transaction and when you determined that the network has passed the `maxLedgerVersion`. In this case, you cannot be definitively sure whether the transaction has failed, or has been included in one of the missing ledger versions. CasinocoinAPI returns `MissingLedgerHistoryError` in this case.

If you are the administrator of the `casinocoind` server, you can [manually request the missing ledger(s)](reference-casinocoind.html#ledger-request). Otherwise, you can try checking the ledger history using a different server. (CasinoCoin runs a public full-history server at `ws01.casinocoin.org` for this purpose.)

See [Reliable Transaction Submission](tutorial-reliable-transaction-submission.html) for a more thorough explanation.

# CasinocoinAPI in Web Browsers

CasinocoinAPI can also be used in a web browser if you compile a browser-compatible version and include [lodash](https://www.npmjs.com/package/lodash) as a dependency before the CasinocoinAPI script.

## Build Instructions

To use CasinocoinAPI in a browser, you need to build a browser-compatible version. The following process compiles CasinocoinAPI into a single JavaScript file you can include in a webpage.

#### 1. Download a copy of the CasinocoinAPI git repository.

If you have [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed, you can clone the repository and check out the **master** branch, which always has the latest official release:

```
git clone https://github.com/casinocoin/casinocoin-libjs.git
cd casinocoin-libjs
git checkout master
```

Alternatively, you can download an archive (.zip or .tar.gz) of a specific release from the [CasinocoinAPI releases page](https://github.com/casinocoin/casinocoin-libjs/releases) and extract it.

#### 2. Install dependencies using NPM

You need to have [NPM (Node.js Package Manager) installed](#install-nodejs-and-npm) first.

Then, from within the `casinocoin-libjs` directory, you can use NPM to install all the necessary dependencies:

```
npm install
```

(We recommend _not_ using `npm -g` to install dependencies globally.)

This can take a while, and may include some warnings. The following warnings are benign and do not indicate a problem:

```
npm WARN optional Skipping failed optional dependency /chokidar/fsevents:
npm WARN notsup Not compatible with your operating system or architecture: fsevents@1.0.6
```

#### 3. Use Gulp to build a single JavaScript output

CasinocoinAPI comes with code to use the [gulp](http://gulpjs.com/) package to compile all its source code into browser-compatible JavaScript files. Gulp is automatically installed as one of the dependencies, so all you have to do is run it. CasinocoinAPI's configuration makes this easy:

```
npm run build
```

Output:

```
> casinocoin-libjs@0.16.5 build /home/username/casinocoin-libjs
> gulp

[16:30:18] Using gulpfile ~/Code/casinocoin-libjs/gulpfile.js
[16:30:18] Starting 'build'...
[16:30:18] Starting 'build-debug'...
[16:30:26] Finished 'build-debug' after 7.79 s
[16:30:26] Finished 'build' after 7.85 s
[16:30:26] Starting 'default'...
[16:30:26] Finished 'default' after 36 μss
```

This may take a while. At the end, the build process creates a new `build/` folder, which contains the files you want.

The file `build/casinocoin-<VERSION NUMBER>.js` is a straight export of CasinocoinAPI (whatever version you built) ready to be used in browsers. 

## Example Browser Usage

The following HTML file demonstrates basic usage of the browser version of CasinocoinAPI to connect to a public `casinocoind` server and report information about that server. Instead of using Node.js's "require" syntax, the browser version creates a global variable named `casinocoin`, which contains the `CasinocoinAPI` class.

To use this example, you must first [build CasinocoinAPI](#build-instructions) and then copy one of the resulting output files to the same folder as this HTML file. (You can use either the minified or full-size version.) Change the first `<script>` tag in this example to use the correct file name for the version of CasinocoinAPI you built.

[**browser-demo.html:**](https://github.com/casinocoin/casinocoin-dev-portal/blob/master/content/code_samples/casinocoinapi_quickstart/browser-demo.html "Source on GitHub")

```
{% include 'code_samples/casinocoinapi_quickstart/browser-demo.html' %}
```
