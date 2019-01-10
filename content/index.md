<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
# CasinocoinAPI Reference

- [Introduction](#introduction)
  - [Boilerplate](#boilerplate)
  - [Offline functionality](#offline-functionality)
- [Basic Types](#basic-types)
  - [Address](#address)
  - [Account Sequence Number](#account-sequence-number)
  - [Currency](#currency)
  - [Value](#value)
  - [Amount](#amount)
- [Transaction Overview](#transaction-overview)
  - [Transaction Types](#transaction-types)
  - [Transaction Flow](#transaction-flow)
  - [Transaction Fees](#transaction-fees)
  - [Transaction Instructions](#transaction-instructions)
  - [Transaction ID](#transaction-id)
  - [Transaction Memos](#transaction-memos)
- [Transaction Specifications](#transaction-specifications)
  - [Payment](#payment)
  - [Settings](#settings)
- [API Methods](#api-methods)
  - [connect](#connect)
  - [disconnect](#disconnect)
  - [isConnected](#isconnected)
  - [getServerInfo](#getserverinfo)
  - [getFee](#getfee)
  - [getLedgerVersion](#getledgerversion)
  - [getTransaction](#gettransaction)
  - [getTransactions](#gettransactions)
  - [getBalances](#getbalances)
  - [getBalanceSheet](#getbalancesheet)
  - [getSettings](#getsettings)
  - [getAccountInfo](#getaccountinfo)
  - [getLedger](#getledger)
  - [preparePayment](#preparepayment)
  - [prepareSettings](#preparesettings)
  - [sign](#sign)
  - [combine](#combine)
  - [submit](#submit)
  - [generateAddress](#generateaddress)
  - [computeLedgerHash](#computeledgerhash)
- [API Events](#api-events)
  - [ledger](#ledger)
  - [error](#error)
  - [connected](#connected)
  - [disconnected](#disconnected)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Introduction

CasinocoinAPI is the official client library to the CSC Ledger. Currently, CasinocoinAPI is only available in JavaScript.
Using CasinocoinAPI, you can:

* [Query transactions from the CSC Ledger history](#gettransaction)
* [Sign](#sign) transactions securely without connecting to any server
* [Submit](#submit) transactions to the CSC Ledger, including [Payments](#payment), [Settings changes](#settings), and [other types](#transaction-types)
* [Generate a new CSC Ledger Address](#generateaddress)
* ... and [much more](#api-methods).

CasinocoinAPI only provides access to *validated*, *immutable* transaction data.

## Boilerplate

Use the following [boilerplate code](https://en.wikipedia.org/wiki/Boilerplate_code) to wrap your custom code using CasinocoinAPI.

```javascript
const CasinocoinAPI = require('casinocoin-libjs').CasinocoinAPI;

const api = new CasinocoinAPI({
  server: 'wss://ws01.casinocoin.org', // Public casinocoind server hosted by CasinoCoin, Inc.
  port: 4443
});
api.on('error', (errorCode, errorMessage) => {
  console.log(errorCode + ': ' + errorMessage);
});
api.on('connected', () => {
  console.log('connected');
});
api.on('disconnected', (code) => {
  // code - [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) sent by the server
  // will be 1000 if this was normal closure
  console.log('disconnected, code:', code);
});
api.connect().then(() => {
  /* insert code here */
}).then(() => {
  return api.disconnect();
}).catch(console.error);
```

CasinocoinAPI is designed to work in [Node.js](https://nodejs.org) version **6.9.0** or later. CasinocoinAPI may work on older Node.js versions if you use [Babel](https://babeljs.io/) for [ECMAScript 6](https://babeljs.io/docs/learn-es2015/) support.

The code samples in this documentation are written with ECMAScript 6 (ES6) features, but `CasinocoinAPI` also works with ECMAScript 5 (ES5). Regardless of whether you use ES5 or ES6, the methods that return Promises return [ES6-style promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

<aside class="notice">
All the code snippets in this documentation assume that you have surrounded them with this boilerplate.
</aside>

<aside class="notice">
If you omit the "catch" section, errors may not be visible.
</aside>

<aside class="notice">
The "error" event is emitted whenever an error occurs that cannot be associated with a specific request. If the listener is not registered, an exception will be thrown whenever the event is emitted.
</aside>

### Parameters

The CasinocoinAPI constructor optionally takes one argument, an object with the following options:

Name | Type | Description
---- | ---- | -----------
authorization | string | *Optional* Username and password for HTTP basic authentication to the casinocoind server in the format **username:password**.
certificate | string | *Optional* A string containing the certificate key of the client in PEM format. (Can be an array of certificates).
feeCushion | number | *Optional* Factor to multiply estimated fee by to provide a cushion in case the required fee rises during submission of a transaction. Defaults to `1.2`.
key | string | *Optional* A string containing the private key of the client in PEM format. (Can be an array of keys).
passphrase | string | *Optional* The passphrase for the private key of the client.
proxy | uri string | *Optional* URI for HTTP/HTTPS proxy to use to connect to the casinocoind server.
proxyAuthorization | string | *Optional* Username and password for HTTP basic authentication to the proxy in the format **username:password**.
server | uri string | *Optional* URI for casinocoind websocket port to connect to. Must start with `wss://` or `ws://`.
timeout | integer | *Optional* Timeout in milliseconds before considering a request to have failed.
trace | boolean | *Optional* If true, log casinocoind requests and responses to stdout.
trustedCertificates | array\<string\> | *Optional* Array of PEM-formatted SSL certificates to trust when connecting to a proxy. This is useful if you want to use a self-signed certificate on the proxy server. Note: Each element must contain a single certificate; concatenated certificates are not valid.

If you omit the `server` parameter, CasinocoinAPI operates [offline](#offline-functionality).


### Installation ###

1. Install [Node.js](https://nodejs.org) and the Node Package Manager (npm). Most Linux distros have a package for Node.js, but make sure you have version **6.9.0** or higher.
2. Use npm to install CasinocoinAPI:
      `npm install casinocoin-libjs`

After you have installed casinocoin-libjs, you can create scripts using the [boilerplate](#boilerplate) and run them using the Node.js executable, typically named `node`:

      `node script.js`

## Offline functionality

CasinocoinAPI can also function without internet connectivity. This can be useful in order to generate secrets and sign transactions from a secure, isolated machine.

To instantiate CasinocoinAPI in offline mode, use the following boilerplate code:

```javascript
const CasinocoinAPI = require('casinocoin-libjs').CasinocoinAPI;

const api = new CasinocoinAPI();
/* insert code here */
```

Methods that depend on the state of the CSC Ledger are unavailable in offline mode. To prepare transactions offline, you **must** specify  the `fee`, `sequence`, and `maxLedgerVersion` parameters in the [transaction instructions](#transaction-instructions). You can use the following methods while offline:

* [preparePayment](#preparepayment)
* [prepareSettings](#preparesettings)
* [sign](#sign)
* [generateAddress](#generateaddress)
* [computeLedgerHash](#computeledgerhash)

# Basic Types

## Address

```json
"cDarPNJEpCnpBZSfmcquydockkePkjPGA2"
```

Every CSC Ledger account has an *address*, which is a base58-encoding of a hash of the account's public key. CSC Ledger addresses always start with the lowercase letter `c`.

## Account Sequence Number

Every CSC Ledger account has a *sequence number* that is used to keep transactions in order. Every transaction must have a sequence number. A transaction can only be executed if it has the next sequence number in order, of the account sending it. This prevents one transaction from executing twice and transactions executing out of order. The sequence number starts at `1` and increments for each transaction that the account makes.

## Currency

Currencies are represented as either 3-character currency codes or 40-character uppercase hexadecimal strings. We recommend using uppercase [ISO 4217 Currency Codes](http://www.xe.com/iso4217.php) only. The string "CSC" is disallowed on trustlines because it is reserved for the CSC Ledger's native currency. The following characters are permitted: all uppercase and lowercase letters, digits, as well as the symbols `?`, `!`, `@`, `#`, `$`, `%`, `^`, `&`, `*`, `<`, `>`, `(`, `)`, `{`, `}`, `[`, `]`, and `|`.

## Value
A *value* is a quantity of a currency represented as a decimal string. Be careful: JavaScript's native number format does not have sufficient precision to represent all values. CSC has different precision from other currencies.

**CSC** has 6 significant digits past the decimal point. In other words, CSC cannot be divided into positive values smaller than `0.000001` (1e-6). CSC has a maximum value of `100000000000` (1e11).

**Non-CSC values** have 16 decimal digits of precision, with a maximum value of `9999999999999999e80`. The smallest positive non-CSC value is `1e-81`.


## Amount

Example amount:

```json
{
  "currency": "USD",
  "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ",
  "value": "100"
}
```

Example CSC amount:
```json
{
  "currency": "CSC",
  "value": "2000"
}
```

An *amount* is data structure representing a currency, a quantity of that currency, and the counterparty on the trustline that holds the value. For CSC, there is no counterparty.

A *lax amount* allows the counterparty to be omitted for all currencies. If the counterparty is not specified in an amount within a transaction specification, then any counterparty may be used for that amount.

A *lax lax amount* allows either or both the counterparty and value to be omitted.

A *balance* is an amount than can have a negative value.

Name | Type | Description
---- | ---- | -----------
currency | [currency](#currency) | The three-character code or hexadecimal string used to denote currencies
counterparty | [address](#address) | *Optional* The CasinoCoin address of the account that owes or is owed the funds (omitted if `currency` is "CSC")
value | [value](#value) | *Optional* The quantity of the currency, denoted as a string to retain floating point precision

# Transaction Overview

## Transaction Types

A transaction type is specified by the strings in the first column in the table below.

Type | Description
---- | -----------
[payment](#payment) | A `payment` transaction represents a transfer of value from one account to another. Depending on the [path](https://casinocoin.org/build/paths/) taken, additional exchanges of value may occur atomically to facilitate the payment.
[settings](#settings) | A `settings` transaction modifies the settings of an account in the CSC Ledger.

## Transaction Flow

Executing a transaction with `CasinocoinAPI` requires the following four steps:

1. Prepare - Create an unsigned transaction based on a [specification](#transaction-specifications) and [instructions](#transaction-instructions). There is a method to prepare each type of transaction:
    * [preparePayment](#preparepayment)
    * [prepareSettings](#preparesettings)
2. [Sign](#sign) - Cryptographically sign the transaction locally and save the [transaction ID](#transaction-id). Signing is how the owner of an account authorizes a transaction to take place. For multisignature transactions, the `signedTransaction` fields returned by `sign` must be collected and passed to the [combine](#combine) method.
3. [Submit](#submit) - Submit the transaction to the connected server.
4. Verify - Verify that the transaction got validated by querying with [getTransaction](#gettransaction). This is necessary because transactions may fail even if they were successfully submitted.

## Transaction Fees

Every transaction must destroy a small amount of CSC as a cost to send the transaction. This is also called a *transaction fee*. The transaction cost is designed to increase along with the load on the CSC Ledger, making it very expensive to deliberately or inadvertently overload the peer-to-peer network that powers the CSC Ledger.

You can choose the size of the fee you want to pay or let a default be used. You can get an estimate of the fee required to be included in the next ledger closing with the [getFee](#getfee) method.

## Transaction Instructions

Transaction instructions indicate how to execute a transaction, complementary with the [transaction specification](#transaction-specifications).

Name | Type | Description
---- | ---- | -----------
fee | [value](#value) | *Optional* An exact fee to pay for the transaction. See [Transaction Fees](#transaction-fees) for more information.
maxFee | [value](#value) | *Optional* The maximum fee to pay for the transaction. See [Transaction Fees](#transaction-fees) for more information.
maxLedgerVersion | integer,null | *Optional* The highest ledger version that the transaction can be included in. If this option and `maxLedgerVersionOffset` are both omitted, the `maxLedgerVersion` option will default to 3 greater than the current validated ledger version (equivalent to `maxLedgerVersionOffset=3`). Use `null` to not set a maximum ledger version.
maxLedgerVersionOffset | integer | *Optional* Offset from current validated legder version to highest ledger version that the transaction can be included in.
sequence | [sequence](#account-sequence-number) | *Optional* The initiating account's sequence number for this transaction.
signersCount | integer | *Optional* Number of signers that will be signing this transaction.

We recommended that you specify a `maxLedgerVersion` so that you can quickly determine that a failed transaction will never succeeed in the future. It is impossible for a transaction to succeed after the CSC Ledger's consensus-validated ledger version exceeds the transaction's `maxLedgerVersion`. If you omit `maxLedgerVersion`, the "prepare*" method automatically supplies a `maxLedgerVersion` equal to the current ledger plus 3, which it includes in the return value from the "prepare*" method.

## Transaction ID

```json
"7FA2EDBB668F12B3EEF8A4E03220ACB5DB69492BC8153BDE4E5E9F2782E76808"
```

A transaction ID is a 64-bit hexadecimal string that uniquely identifies the transaction. The transaction ID is derived from the transaction instruction and specifications, using a strong hash function.

You can look up a transaction by ID using the [getTransaction](#gettransaction) method.

## Transaction Memos

Every transaction can optionally have an array of memos for user applications. The `memos` field in each [transaction specification](#transaction-specifications) is an array of objects with the following structure:

Name | Type | Description
---- | ---- | -----------
data | string | *Optional* Arbitrary string, conventionally containing the content of the memo.
format | string | *Optional* Conventionally containing information on how the memo is encoded, for example as a [MIME type](http://www.iana.org/assignments/media-types/media-types.xhtml). Only characters allowed in URLs are permitted.
type | string | *Optional* Conventionally, a unique relation (according to [RFC 5988](http://tools.ietf.org/html/rfc5988#section-4)) that defines the format of this memo. Only characters allowed in URLs are permitted.

# Transaction Specifications

A *transaction specification* specifies what a transaction should do. Each [Transaction Type](#transaction-types) has its own type of specification.

## Payment

See [Transaction Types](#transaction-types) for a description.

Name | Type | Description
---- | ---- | -----------
source | object | The source of the funds to be sent.
*source.* address | [address](#address) | The address to send from.
*source.* amount | [laxAmount](#amount) | An exact amount to send. If the counterparty is not specified, amounts with any counterparty may be used. (This field is exclusive with source.maxAmount)
*source.* tag | integer | *Optional* An arbitrary unsigned 32-bit integer that identifies a reason for payment or a non-CasinoCoin account.
*source.* maxAmount | [laxAmount](#amount) | The maximum amount to send. (This field is exclusive with source.amount)
destination | object | The destination of the funds to be sent.
*destination.* address | [address](#address) | The address to receive at.
*destination.* amount | [laxAmount](#amount) | An exact amount to deliver to the recipient. If the counterparty is not specified, amounts with any counterparty may be used. (This field is exclusive with destination.minAmount).
*destination.* tag | integer | *Optional* An arbitrary unsigned 32-bit integer that identifies a reason for payment or a non-CasinoCoin account.
*destination.* minAmount | [laxAmount](#amount) | The minimum amount to be delivered. (This field is exclusive with destination.amount)
allowPartialPayment | boolean | *Optional* A boolean that, if set to true, indicates that this payment should go through even if the whole amount cannot be delivered because of a lack of liquidity or funds in the source account account
invoiceID | string | *Optional* A 256-bit hash that can be used to identify a particular payment.
limitQuality | boolean | *Optional* Only take paths where all the conversions have an input:output ratio that is equal or better than the ratio of destination.amount:source.maxAmount.
memos | [memos](#transaction-memos) | *Optional* Array of memos to attach to the transaction.
noDirectCasinocoin | boolean | *Optional* A boolean that can be set to true if paths are specified and the sender would like the CasinoCoin Network to disregard any direct paths from the source account to the destination account. This may be used to take advantage of an arbitrage opportunity or by gateways wishing to issue balances from a hot wallet to a user who has mistakenly set a trustline directly to the hot wallet
paths | string | *Optional* The paths of trustlines and orders to use in executing the payment.

### Example


```json
{
  "source": {
    "address": "cDarPNJEpCnpBZSfmcquydockkePkjPGA2",
    "maxAmount": {
      "value": "0.01",
      "currency": "USD",
      "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ"
    }
  },
  "destination": {
    "address": "csxfY7qiD9aNBpwwTAxgNQkcV1DLfL8rWn",
    "amount": {
      "value": "0.01",
      "currency": "USD",
      "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ"
    }
  }
}
```


## Settings

See [Transaction Types](#transaction-types) for a description.

Name | Type | Description
---- | ---- | -----------
defaultCasinocoin | boolean | *Optional* Enable [rippling]() on this account’s trust lines by default.
disableMasterKey | boolean | *Optional* Disallows use of the master key to sign transactions for this account.
disallowIncomingCSC | boolean | *Optional* Indicates that client applications should not send CSC to this account. Not enforced by casinocoind.
domain | string | *Optional*  The domain that owns this account, as a hexadecimal string representing the ASCII for the domain in lowercase.
emailHash | string,null | *Optional* Hash of an email address to be used for generating an avatar image. Conventionally, clients use Gravatar to display this image. Use `null` to clear.
enableTransactionIDTracking | boolean | *Optional* Track the ID of this account’s most recent transaction.
globalFreeze | boolean | *Optional* Freeze all assets issued by this account.
memos | [memos](#transaction-memos) | *Optional* Array of memos to attach to the transaction.
messageKey | string | *Optional* Public key for sending encrypted messages to this account. Conventionally, it should be a secp256k1 key, the same encryption that is used by the rest of CasinoCoin.
noFreeze | boolean | *Optional* Permanently give up the ability to freeze individual trust lines. This flag can never be disabled after being enabled.
passwordSpent | boolean | *Optional* Indicates that the account has used its free SetRegularKey transaction.
regularKey | [address](#address),null | *Optional* The public key of a new keypair, to use as the regular key to this account, as a base-58-encoded string in the same format as an account address. Use `null` to remove the regular key.
requireAuthorization | boolean | *Optional* If set, this account must individually approve other users in order for those users to hold this account’s issuances.
requireDestinationTag | boolean | *Optional* Requires incoming payments to specify a destination tag.
signers | object | *Optional* Settings that determine what sets of accounts can be used to sign a transaction on behalf of this account using multisigning.
*signers.* threshold | integer | *Optional* A target number for the signer weights. A multi-signature from this list is valid only if the sum weights of the signatures provided is equal or greater than this value. To delete the signers setting, use the value `0`.
*signers.* weights | array | *Optional* Weights of signatures for each signer.
*signers.* weights[] | object | An association of an address and a weight.
*signers.weights[].* address | [address](#address) | A CasinoCoin account address
*signers.weights[].* weight | integer | The weight that the signature of this account counts as towards the threshold.
transferRate | number,null | *Optional*  The fee to charge when users transfer this account’s issuances, as the decimal amount that must be sent to deliver 1 unit. Has precision up to 9 digits beyond the decimal point. Use `null` to set no fee.

### Example


```json
{
  "domain": "casinocoin.org",
  "memos": [
    {
      "type": "test",
      "format": "plain/text",
      "data": "texted data"
    }
  ]
}
```

# API Methods

## connect

`connect(): Promise<void>`

Tells the CasinocoinAPI instance to connect to its casinocoind server.

### Parameters

This method has no parameters.

### Return Value

This method returns a promise that resolves with a void value when a connection is established.

### Example

See [Boilerplate](#boilerplate) for code sample.

## disconnect

`disconnect(): Promise<void>`

Tells the CasinocoinAPI instance to disconnect from its casinocoind server.

### Parameters

This method has no parameters.

### Return Value

This method returns a promise that resolves with a void value when a connection is destroyed.

### Example

See [Boilerplate](#boilerplate) for code sample

## isConnected

`isConnected(): boolean`

Checks if the CasinocoinAPI instance is connected to its casinocoind server.

### Parameters

This method has no parameters.

### Return Value

This method returns `true` if connected and `false` if not connected.

### Example

```javascript
return api.isConnected();
```

```json
true
```

## getServerInfo

`getServerInfo(): Promise<object>`

Get status information about the server that the CasinocoinAPI instance is connected to.

### Parameters

This method has no parameters.

### Return Value

This method returns a promise that resolves with an object with the following structure:

Name | Type | Description
---- | ---- | -----------
buildVersion | string | The version number of the running casinocoind version.
completeLedgers | string | Range expression indicating the sequence numbers of the ledger versions the local casinocoind has in its database. It is possible to be a disjoint sequence, e.g. “2500-5000,32570-7695432”.
hostID | string | On an admin request, returns the hostname of the server running the casinocoind instance; otherwise, returns a unique four letter word.
ioLatencyMs | number | Amount of time spent waiting for I/O operations to be performed, in milliseconds. If this number is not very, very low, then the casinocoind server is probably having serious load issues.
lastClose | object | Information about the last time the server closed a ledger.
*lastClose.* convergeTimeS | number | The time it took to reach a consensus for the last ledger closing, in seconds.
*lastClose.* proposers | integer | Number of trusted validators participating in the ledger closing.
loadFactor | number | The load factor the server is currently enforcing, as a multiplier on the base transaction fee. The load factor is determined by the highest of the individual server’s load factor, cluster’s load factor, and the overall network’s load factor.
peers | integer | How many other casinocoind servers the node is currently connected to.
pubkeyNode | string | Public key used to verify this node for internal communications; this key is automatically generated by the server the first time it starts up. (If deleted, the node can just create a new pair of keys.)
serverState | string | A string indicating to what extent the server is participating in the network. See [Possible Server States](https://casinocoin.org/build/casinocoind-apis/#possible-server-states) for more details.
validatedLedger | object | Information about the fully-validated ledger with the highest sequence number (the most recent).
*validatedLedger.* age | integer | The time since the ledger was closed, in seconds.
*validatedLedger.* baseFeeCSC | [value](#value) | Base fee, in CSC. This may be represented in scientific notation such as 1e-05 for 0.00005.
*validatedLedger.* hash | string | Unique hash for the ledger, as an uppercase hexadecimal string.
*validatedLedger.* reserveBaseCSC | [value](#value) | Minimum amount of CSC necessary for every account to keep in reserve.
*validatedLedger.* reserveIncrementCSC | [value](#value) | Amount of CSC added to the account reserve for each object an account is responsible for in the ledger.
*validatedLedger.* ledgerVersion | integer | Identifying sequence number of this ledger version.
validationQuorum | number | Minimum number of trusted validations required in order to validate a ledger version. Some circumstances may cause the server to require more validations.
load | object | *Optional* *(Admin only)* Detailed information about the current load state of the server.
*load.* jobTypes | array\<object\> | *(Admin only)* Information about the rate of different types of jobs being performed by the server and how much time it spends on each.
*load.* threads | number | *(Admin only)* The number of threads in the server’s main job pool, performing various CasinoCoin Network operations.
pubkeyValidator | string | *Optional* *(Admin only)* Public key used by this node to sign ledger validations.

### Example

```javascript
return api.getServerInfo().then(info => {/* ... */});
```


```json
{
  "buildVersion": "0.24.0-rc1",
  "completeLedgers": "32570-6595042",
  "hostID": "ARTS",
  "ioLatencyMs": 1,
  "lastClose": {
    "convergeTimeS": 2.007,
    "proposers": 4
  },
  "loadFactor": 1,
  "peers": 53,
  "pubkeyNode": "n94wWvFUmaKGYrKUGgpv1DyYgDeXRGdACkNQaSe7zJiy5Znio7UC",
  "serverState": "full",
  "validatedLedger": {
    "age": 5,
    "baseFeeCSC": "0.00001",
    "hash": "4482DEE5362332F54A4036ED57EE1767C9F33CF7CE5A6670355C16CECE381D46",
    "reserveBaseCSC": "20",
    "reserveIncrementCSC": "5",
    "ledgerVersion": 6595042
  },
  "validationQuorum": 3
}
```


## getFee

`getFee(): Promise<number>`

Returns the estimated transaction fee for the casinocoind server the CasinocoinAPI instance is connected to.

### Parameters

This method has no parameters.

### Return Value

This method returns a promise that resolves with a string encoded floating point value representing the estimated fee to submit a transaction, expressed in CSC.

### Example

```javascript
return api.getFee().then(fee => {/* ... */});
```

```json
"0.012"
```

## getLedgerVersion

`getLedgerVersion(): Promise<number>`

Returns the most recent validated ledger version number known to the connected server.

### Parameters

This method has no parameters.

### Return Value

This method returns a promise that resolves with a positive integer representing the most recent validated ledger version number known to the connected server.

### Example

```javascript
return api.getLedgerVersion().then(ledgerVersion => {
  /* ... */
});
```

```json
16869039
```


## getTransaction

`getTransaction(id: string, options: Object): Promise<Object>`

Retrieves a transaction by its [Transaction ID](#transaction-id).

### Parameters

Name | Type | Description
---- | ---- | -----------
id | [id](#transaction-id) | A hash of a transaction used to identify the transaction, represented in hexadecimal.
options | object | *Optional* Options to limit the ledger versions to search.
*options.* maxLedgerVersion | integer | *Optional* The highest ledger version to search
*options.* minLedgerVersion | integer | *Optional* The lowest ledger version to search.

### Return Value

This method returns a promise that resolves with a transaction object containing the following fields.

Name | Type | Description
---- | ---- | -----------
id | [id](#transaction-id) | A hash of the transaction that can be used to identify it.
address | [address](#address) | The address of the account that initiated the transaction.
sequence | [sequence](#account-sequence-number) | The account sequence number of the transaction for the account that initiated it.
type | [transactionType](#transaction-types) | The type of the transaction.
specification | object | A specification that would produce the same outcome as this transaction. The structure of the specification depends on the value of the `type` field (see [Transaction Types](#transaction-types) for details). *Note:* This is **not** necessarily the same as the original specification.
outcome | object | The outcome of the transaction (what effects it had).
*outcome.* result | string | Result code returned by casinocoind. See [Transaction Results](https://casinocoin.org/build/transactions/#full-transaction-response-list) for a complete list.
*outcome.* fee | [value](#value) | The CSC fee that was charged for the transaction.
*outcome.balanceChanges.* \* | array\<[balance](#amount)\> | Key is the casinocoin address; value is an array of signed amounts representing changes of balances for that address.
*outcome.orderbookChanges.* \* | array | Key is the maker's casinocoin address; value is an array of changes
*outcome.orderbookChanges.* \*[] | object | A change to an order.
*outcome.orderbookChanges.\*[].* direction | string | Equal to "buy" for buy orders and "sell" for sell orders.
*outcome.orderbookChanges.\*[].* quantity | [amount](#amount) | The amount to be bought or sold by the maker.
*outcome.orderbookChanges.\*[].* totalPrice | [amount](#amount) | The total amount to be paid or received by the taker.
*outcome.orderbookChanges.\*[].* sequence | [sequence](#account-sequence-number) | The order sequence number, used to identify the order for cancellation
*outcome.orderbookChanges.\*[].* status | string | The status of the order. One of "created", "filled", "partially-filled", "cancelled".
*outcome.orderbookChanges.\*[].* expirationTime | date-time string | *Optional* The time after which the order expires, if any.
*outcome.orderbookChanges.\*[].* makerExchangeRate | [value](#value) | *Optional* The exchange rate between the `quantity` currency and the `totalPrice` currency from the point of view of the maker.
*outcome.* ledgerVersion | integer | The ledger version that the transaction was validated in.
*outcome.* indexInLedger | integer | The ordering index of the transaction in the ledger.
*outcome.* deliveredAmount | [amount](#amount) | *Optional* For payment transactions, it is impossible to reliably compute the actual delivered amount from the balanceChanges due to fixed precision. If the payment is not a partial payment and the transaction succeeded, the deliveredAmount should always be considered to be the amount specified in the transaction.
*outcome.* timestamp | date-time string | *Optional* The timestamp when the transaction was validated. (May be missing when requesting transactions in binary mode.)

### Example

```javascript
const id = '01CDEAA89BF99D97DFD47F79A0477E1DCC0989D39F70E8AACBFE68CC83BD1E94';
return api.getTransaction(id).then(transaction => {
  /* ... */
});
```


```json
{
  "type": "payment",
  "address": "cDarPNJEpCnpBZSfmcquydockkePkjPGA2",
  "sequence": 4,
  "id": "F4AB442A6D4CBB935D66E1DA7309A5FC71C7143ED4049053EC14E3875B0CF9BF",
  "specification": {
    "source": {
      "address": "cDarPNJEpCnpBZSfmcquydockkePkjPGA2",
      "maxAmount": {
        "currency": "CSC",
        "value": "1.112209"
      }
    },
    "destination": {
      "address": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ",
      "amount": {
        "currency": "USD",
        "value": "0.001"
      }
    },
    "paths": "[[{\"currency\":\"USD\",\"issuer\":\"cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo\",\"type\":48,\"type_hex\":\"0000000000000030\"},{\"account\":\"cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo\",\"currency\":\"USD\",\"issuer\":\"cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo\",\"type\":49,\"type_hex\":\"0000000000000031\"}]]"
  },
  "outcome": {
    "result": "tesSUCCESS",
    "timestamp": "2013-03-12T23:56:50.000Z",
    "fee": "0.00001",
    "deliveredAmount": {
      "currency": "USD",
      "value": "0.001",
      "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ"
    },
    "balanceChanges": {
      "cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo": [
        {
          "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ",
          "currency": "USD",
          "value": "-0.001"
        },
        {
          "counterparty": "c9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr",
          "currency": "USD",
          "value": "0.001002"
        }
      ],
      "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ": [
        {
          "counterparty": "cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo",
          "currency": "USD",
          "value": "0.001"
        }
      ],
      "cDarPNJEpCnpBZSfmcquydockkePkjPGA2": [
        {
          "currency": "CSC",
          "value": "-1.101208"
        }
      ],
      "c9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr": [
        {
          "currency": "CSC",
          "value": "1.101198"
        },
        {
          "counterparty": "cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo",
          "currency": "USD",
          "value": "-0.001002"
        }
      ]
    },
    "orderbookChanges": {
      "c9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr": [
        {
          "direction": "buy",
          "quantity": {
            "currency": "CSC",
            "value": "1.101198"
          },
          "totalPrice": {
            "currency": "USD",
            "counterparty": "cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo",
            "value": "0.001002"
          },
          "makerExchangeRate": "1099",
          "sequence": 58,
          "status": "partially-filled"
        }
      ]
    },
    "ledgerVersion": 348860,
    "indexInLedger": 0
  }
}
```


## getTransactions

`getTransactions(address: string, options: Object): Promise<Array<Object>>`

Retrieves historical transactions of an account.

### Parameters

Name | Type | Description
---- | ---- | -----------
address | [address](#address) | The address of the account to get transactions for.
options | object | *Optional* Options to filter the resulting transactions.
*options.* binary | boolean | *Optional* If true, the transactions will be sent from the server in a condensed binary format rather than JSON.
*options.* counterparty | [address](#address) | *Optional* If provided, only return transactions with this account as a counterparty to the transaction.
*options.* earliestFirst | boolean | *Optional* If true, sort transactions so that the earliest ones come first. By default, the newest transactions will come first.
*options.* excludeFailures | boolean | *Optional* If true, the result will omit transactions that did not succeed.
*options.* initiated | boolean | *Optional* If true, return only transactions initiated by the account specified by `address`. If false, return only transactions not initiated by the account specified by `address`.
*options.* limit | integer | *Optional* If specified, return at most this many transactions.
*options.* maxLedgerVersion | integer | *Optional* Return only transactions in this ledger version or lower.
*options.* minLedgerVersion | integer | *Optional* Return only transactions in this ledger verion or higher.
*options.* start | string | *Optional* If specified, this transaction will be the first transaction in the result.
*options.* types | array\<[transactionType](#transaction-types)\> | *Optional* Only return transactions of the specified [Transaction Types](#transaction-types).

### Return Value

This method returns a promise that resolves with an array of transaction object in the same format as [getTransaction](#gettransaction).

### Example

```javascript
const address = 'cDarPNJEpCnpBZSfmcquydockkePkjPGA2';
return api.getTransactions(address).then(transaction => {
  /* ... */
});
```


```json
[
  {
    "type": "payment",
    "address": "cDarPNJEpCnpBZSfmcquydockkePkjPGA2",
    "sequence": 4,
    "id": "99404A34E8170319521223A6C604AF48B9F1E3000C377E6141F9A1BF60B0B865",
    "specification": {
      "memos": [
        {
          "type": "client",
          "format": "rt1.5.2"
        }
      ],
      "source": {
        "address": "cDarPNJEpCnpBZSfmcquydockkePkjPGA2",
        "maxAmount": {
          "currency": "CSC",
          "value": "1.112209"
        }
      },
      "destination": {
        "address": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ",
        "amount": {
          "currency": "USD",
          "value": "0.001"
        }
      },
      "paths": "[[{\"issuer\":\"cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo\",\"currency\":\"USD\"},{\"account\":\"cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo\",\"issuer\":\"cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo\",\"currency\":\"USD\"}]]"
    },
    "outcome": {
      "result": "tesSUCCESS",
      "fee": "0.00001",
      "deliveredAmount": {
        "currency": "USD",
        "value": "0.001",
        "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ"
      },
      "balanceChanges": {
        "cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo": [
          {
            "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ",
            "currency": "USD",
            "value": "-0.001"
          },
          {
            "counterparty": "c9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr",
            "currency": "USD",
            "value": "0.001002"
          }
        ],
        "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ": [
          {
            "counterparty": "cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo",
            "currency": "USD",
            "value": "0.001"
          }
        ],
        "cDarPNJEpCnpBZSfmcquydockkePkjPGA2": [
          {
            "currency": "CSC",
            "value": "-1.101208"
          }
        ],
        "c9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr": [
          {
            "currency": "CSC",
            "value": "1.101198"
          },
          {
            "counterparty": "cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo",
            "currency": "USD",
            "value": "-0.001002"
          }
        ]
      },
      "orderbookChanges": {
        "cDarPNJEpCnpBZSfmcquydockkePkjPGA2": [
          {
            "direction": "buy",
            "quantity": {
              "currency": "CSC",
              "value": "1.101198"
            },
            "totalPrice": {
              "currency": "USD",
              "counterparty": "cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo",
              "value": "0.001002"
            },
            "makerExchangeRate": "1099",
            "sequence": 58,
            "status": "partially-filled"
          }
        ]
      },
      "ledgerVersion": 348859,
      "indexInLedger": 0
    }
  },
  {
    "type": "payment",
    "address": "cDarPNJEpCnpBZSfmcquydockkePkjPGA2",
    "id": "99404A34E8170319521223A6C604AF48B9F1E3000C377E6141F9A1BF60B0B865",
    "sequence": 4,
    "specification": {
      "memos": [
        {
          "type": "client",
          "format": "rt1.5.2"
        }
      ],
      "source": {
        "address": "cDarPNJEpCnpBZSfmcquydockkePkjPGA2",
        "maxAmount": {
          "currency": "CSC",
          "value": "1.112209"
        }
      },
      "destination": {
        "address": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ",
        "amount": {
          "currency": "USD",
          "value": "0.001"
        }
      },
      "paths": "[[{\"issuer\":\"cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo\",\"currency\":\"USD\"},{\"account\":\"cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo\",\"issuer\":\"cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo\",\"currency\":\"USD\"}]]"
    },
    "outcome": {
      "result": "tesSUCCESS",
      "fee": "0.00001",
      "deliveredAmount": {
        "currency": "USD",
        "value": "0.001",
        "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ"
      },
      "balanceChanges": {
        "cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo": [
          {
            "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ",
            "currency": "USD",
            "value": "-0.001"
          },
          {
            "counterparty": "c9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr",
            "currency": "USD",
            "value": "0.001002"
          }
        ],
        "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ": [
          {
            "counterparty": "cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo",
            "currency": "USD",
            "value": "0.001"
          }
        ],
        "cDarPNJEpCnpBZSfmcquydockkePkjPGA2": [
          {
            "currency": "CSC",
            "value": "-1.101208"
          }
        ],
        "c9tGqzZgKxVFvzKFdUqXAqTzazWBUia8Qr": [
          {
            "currency": "CSC",
            "value": "1.101198"
          },
          {
            "counterparty": "cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo",
            "currency": "USD",
            "value": "-0.001002"
          }
        ]
      },
      "orderbookChanges": {
        "cDarPNJEpCnpBZSfmcquydockkePkjPGA2": [
          {
            "direction": "buy",
            "quantity": {
              "currency": "CSC",
              "value": "1.101198"
            },
            "totalPrice": {
              "currency": "USD",
              "counterparty": "cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo",
              "value": "0.001002"
            },
            "makerExchangeRate": "1099",
            "sequence": 58,
            "status": "partially-filled"
          }
        ]
      },
      "ledgerVersion": 348858,
      "indexInLedger": 0
    }
  }
]
```

## getBalances

`getBalances(address: string, options: Object): Promise<Array<Object>>`

Returns balances for a specified account.

### Parameters

Name | Type | Description
---- | ---- | -----------
address | [address](#address) | The address of the account to get balances for.
options | object | *Optional* Options to filter and determine which balances to return.
*options.* counterparty | [address](#address) | *Optional* Only return balances with this counterparty.
*options.* currency | [currency](#currency) | *Optional* Only return balances for this currency.
*options.* ledgerVersion | integer | *Optional* Return balances as they were in this historical ledger version.
*options.* limit | integer | *Optional* Return at most this many balances.

### Return Value

This method returns a promise that resolves with an array of objects with the following structure:

Name | Type | Description
---- | ---- | -----------
currency | [currency](#currency) | The three-character code or hexadecimal string used to denote currencies
value | [signedValue](#value) | The balance on the trustline
counterparty | [address](#address) | *Optional* The CasinoCoin address of the account that owes or is owed the funds.

### Example

```javascript
const address = 'cDarPNJEpCnpBZSfmcquydockkePkjPGA2';
return api.getBalances(address).then(balances =>
  {/* ... */});
```


```json
[
  {
    "value": "922.913243",
    "currency": "CSC"
  },
  {
    "value": "0",
    "currency": "ASP",
    "counterparty": "c3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z"
  },
  {
    "value": "0",
    "currency": "XAU",
    "counterparty": "c3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z"
  },
  {
    "value": "2.497605752725159",
    "currency": "USD",
    "counterparty": "cMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
  },
  {
    "value": "481.992867407479",
    "currency": "MXN",
    "counterparty": "cHpXfibHgSb64n8kK9QWDpdbfqSpYbM9a4"
  },
  {
    "value": "0.793598266778297",
    "currency": "EUR",
    "counterparty": "cLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun"
  },
  {
    "value": "0",
    "currency": "CNY",
    "counterparty": "cnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK"
  },
  {
    "value": "1.294889190631542",
    "currency": "DYM",
    "counterparty": "cGwUWgN5BEg3QGNY3RX2HfYowjUTZdid3E"
  },
  {
    "value": "0.3488146605801446",
    "currency": "CHF",
    "counterparty": "cvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
  },
  {
    "value": "2.114103174931847",
    "currency": "BTC",
    "counterparty": "cvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
  },
  {
    "value": "0",
    "currency": "USD",
    "counterparty": "cvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
  },
  {
    "value": "-0.00111",
    "currency": "BTC",
    "counterparty": "cpgKWEmNqSDAGFhy5WDnsyPqfQxbWxKeVd"
  },
  {
    "value": "-0.1010780000080207",
    "currency": "BTC",
    "counterparty": "cBJ3YjwXi2MGbg7GVLuTXUWQ8DjL7tDXh4"
  },
  {
    "value": "1",
    "currency": "USD",
    "counterparty": "cLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun"
  },
  {
    "value": "8.07619790068559",
    "currency": "CNY",
    "counterparty": "cazqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA"
  },
  {
    "value": "7.292695098901099",
    "currency": "JPY",
    "counterparty": "cvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
  },
  {
    "value": "0",
    "currency": "AUX",
    "counterparty": "c3vi7mWxru9rJCxETCyA1CHvzL96eZWx5z"
  },
  {
    "value": "0",
    "currency": "USD",
    "counterparty": "c9vbV3EHvXWjSkeQ6CAcYVPGeq7TuiXY2X"
  },
  {
    "value": "12.41688780720394",
    "currency": "EUR",
    "counterparty": "cvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
  },
  {
    "value": "35",
    "currency": "USD",
    "counterparty": "cfF3PNkwkq1DygW2wum2HK3RGfgkJjdPVD"
  },
  {
    "value": "-5",
    "currency": "JOE",
    "counterparty": "cwUVoVMSURqNyvocPCcvLu3ygJzZyw8qwp"
  },
  {
    "value": "0",
    "currency": "USD",
    "counterparty": "cE6R3DWF9fBD7CyiQciePF9SqK58Ubp8o2"
  },
  {
    "value": "0",
    "currency": "JOE",
    "counterparty": "cE6R3DWF9fBD7CyiQciePF9SqK58Ubp8o2"
  },
  {
    "value": "0",
    "currency": "015841551A748AD2C1F76FF6ECB0CCCD00000000",
    "counterparty": "cs9M85karFkCRjvc6KMWn8Coigm9cbcgcx"
  },
  {
    "value": "0",
    "currency": "USD",
    "counterparty": "cEhDDUUNxpXgEHVJtC2cjXAgyx5VCFxdMF"
  }
]
```


## getBalanceSheet

`getBalanceSheet(address: string, options: Object): Promise<Object>`

Returns aggregate balances by currency plus a breakdown of assets and obligations for a specified account.

### Parameters

Name | Type | Description
---- | ---- | -----------
address | [address](#address) | The CasinoCoin address of the account to get the balance sheet of.
options | object | *Optional* Options to determine how the balances will be calculated.
*options.* excludeAddresses | array\<[address](#address)\> | *Optional* Addresses to exclude from the balance totals.
*options.* ledgerVersion | integer | *Optional* Get the balance sheet as of this historical ledger version.

### Return Value

This method returns a promise that resolves with an object with the following structure:

Name | Type | Description
---- | ---- | -----------
assets | array\<[amount](#amount)\> | *Optional* Total amounts held that are issued by others. For the recommended gateway configuration, there should be none.
balances | array\<[amount](#amount)\> | *Optional* Amounts issued to the hotwallet accounts from the request. The keys are hot wallet addresses and the values are arrays of currency amounts they hold. The issuer (omitted from the currency amounts) is the account from the request.
obligations | array | *Optional* Total amounts issued to accounts that are not hot wallets, as a map of currencies to the total value issued.
obligations[] | object | An amount that is owed.
*obligations[].* currency | [currency](#currency) | The three-character code or hexadecimal string used to denote currencies
*obligations[].* value | [value](#value) | A string representation of a non-negative floating point number

### Example

```javascript
const address = 'cDarPNJEpCnpBZSfmcquydockkePkjPGA2';
return api.getBalanceSheet(address).then(balanceSheet =>
  {/* ... */});
```


```json
{
  "balances": [
    {
    "counterparty": "cKm4uWpg9tfwbVSeATv4KxDe6mpE9yPkgJ",
    "currency": "EUR",
    "value": "29826.1965999999"
  },
  {
    "counterparty": "cKm4uWpg9tfwbVSeATv4KxDe6mpE9yPkgJ",
    "currency": "USD",
    "value": "10.0"
  },
  {
    "counterparty": "ca7JkEzrgeKHdzKgo4EUUVBnxggY4z37kt",
    "currency": "USD",
    "value": "13857.70416"
  }
  ],
  "assets": [
    {
    "counterparty": "c9F6wk8HkXrgYWoJ7fsv4VrUBVoqDVtzkH",
    "currency": "BTC",
    "value": "5444166510000000e-26"
  },
  {
    "counterparty": "c9F6wk8HkXrgYWoJ7fsv4VrUBVoqDVtzkH",
    "currency": "USD",
    "value": "100.0"
  },
  {
    "counterparty": "cwmUaXsWtXU4Z843xSYwgt1is97bgY8yj6",
    "currency": "BTC",
    "value": "8700000000000000e-30"
  }
  ],
  "obligations": [
    {
      "currency": "BTC",
      "value": "5908.324927635318"
    },
    {
      "currency": "EUR",
      "value": "992471.7419793958"
    },
    {
      "currency": "GBP",
      "value": "4991.38706013193"
    },
    {
      "currency": "USD",
      "value": "1997134.20229482"
    }
  ]
}
```

## getSettings

`getSettings(address: string, options: Object): Promise<Object>`

Returns settings for the specified account. Note: For account data that is not modifiable by the user, see [getAccountInfo](#getaccountinfo).

### Parameters

Name | Type | Description
---- | ---- | -----------
address | [address](#address) | The address of the account to get the settings of.
options | object | *Optional* Options that affect what to return.
*options.* ledgerVersion | integer | *Optional* Get the settings as of this historical ledger version.

### Return Value

This method returns a promise that resolves with an array of objects with the following structure (Note: all fields are optional as they will not be shown if they are set to their default value):

Name | Type | Description
---- | ---- | -----------
defaultCasinocoin | boolean | *Optional* Enable [rippling]() on this account’s trust lines by default.
disableMasterKey | boolean | *Optional* Disallows use of the master key to sign transactions for this account.
disallowIncomingCSC | boolean | *Optional* Indicates that client applications should not send CSC to this account. Not enforced by casinocoind.
domain | string | *Optional*  The domain that owns this account, as a hexadecimal string representing the ASCII for the domain in lowercase.
emailHash | string,null | *Optional* Hash of an email address to be used for generating an avatar image. Conventionally, clients use Gravatar to display this image. Use `null` to clear.
enableTransactionIDTracking | boolean | *Optional* Track the ID of this account’s most recent transaction.
globalFreeze | boolean | *Optional* Freeze all assets issued by this account.
memos | [memos](#transaction-memos) | *Optional* Array of memos to attach to the transaction.
messageKey | string | *Optional* Public key for sending encrypted messages to this account. Conventionally, it should be a secp256k1 key, the same encryption that is used by the rest of CasinoCoin.
noFreeze | boolean | *Optional* Permanently give up the ability to freeze individual trust lines. This flag can never be disabled after being enabled.
passwordSpent | boolean | *Optional* Indicates that the account has used its free SetRegularKey transaction.
regularKey | [address](#address),null | *Optional* The public key of a new keypair, to use as the regular key to this account, as a base-58-encoded string in the same format as an account address. Use `null` to remove the regular key.
requireAuthorization | boolean | *Optional* If set, this account must individually approve other users in order for those users to hold this account’s issuances.
requireDestinationTag | boolean | *Optional* Requires incoming payments to specify a destination tag.
signers | object | *Optional* Settings that determine what sets of accounts can be used to sign a transaction on behalf of this account using multisigning.
*signers.* threshold | integer | *Optional* A target number for the signer weights. A multi-signature from this list is valid only if the sum weights of the signatures provided is equal or greater than this value. To delete the signers setting, use the value `0`.
*signers.* weights | array | *Optional* Weights of signatures for each signer.
*signers.* weights[] | object | An association of an address and a weight.
*signers.weights[].* address | [address](#address) | A CasinoCoin account address
*signers.weights[].* weight | integer | The weight that the signature of this account counts as towards the threshold.
transferRate | number,null | *Optional*  The fee to charge when users transfer this account’s issuances, as the decimal amount that must be sent to deliver 1 unit. Has precision up to 9 digits beyond the decimal point. Use `null` to set no fee.

### Example

```javascript
const address = 'cDarPNJEpCnpBZSfmcquydockkePkjPGA2';
return api.getSettings(address).then(settings =>
  {/* ... */});
```


```json
{
  "requireDestinationTag": true,
  "disallowIncomingCSC": true,
  "emailHash": "23463B99B62A72F26ED677CC556C44E8",
  "domain": "example.com",
  "transferRate": 1.002
}
```


## getAccountInfo

`getAccountInfo(address: string, options: Object): Promise<Object>`

Returns information for the specified account. Note: For account data that is modifiable by the user, see [getSettings](#getsettings).

### Parameters

Name | Type | Description
---- | ---- | -----------
address | [address](#address) | The address of the account to get the account info of.
options | object | *Optional* Options that affect what to return.
*options.* ledgerVersion | integer | *Optional* Get the account info as of this historical ledger version.

### Return Value

This method returns a promise that resolves with an object with the following structure:

Name | Type | Description
---- | ---- | -----------
sequence | [sequence](#account-sequence-number) | The next (smallest unused) sequence number for this account.
cscBalance | [value](#value) | The CSC balance owned by the account.
ownerCount | integer | Number of other ledger entries (specifically, trust lines and offers) attributed to this account. This is used to calculate the total reserve required to use the account.
previousAffectingTransactionID | string | Hash value representing the most recent transaction that affected this account node directly. **Note:** This does not include changes to the account’s trust lines and offers.
previousAffectingTransactionLedgerVersion | integer | The ledger version that the transaction identified by the `previousAffectingTransactionID` was validated in.
previousInitiatedTransactionID | string | *Optional* Hash value representing the most recent transaction that was initiated by this account.

### Example

```javascript
const address = 'cDarPNJEpCnpBZSfmcquydockkePkjPGA2';
return api.getAccountInfo(address).then(info =>
  {/* ... */});
```


```json
{
  "sequence": 23,
  "cscBalance": "922.913243",
  "ownerCount": 1,
  "previousAffectingTransactionID": "19899273706A9E040FDB5885EE991A1DC2BAD878A0D6E7DBCFB714E63BF737F7",
  "previousAffectingTransactionLedgerVersion": 6614625
}
```

## getLedger

`getLedger(options: Object): Promise<Object>`

Returns header information for the specified ledger (or the most recent validated ledger if no ledger is specified). Optionally, all the transactions that were validated in the ledger or the account state information can be returned with the ledger header.

### Parameters

Name | Type | Description
---- | ---- | -----------
options | object | *Optional* Options affecting what ledger and how much data to return.
*options.* includeAllData | boolean | *Optional* Include full transactions and/or state information if `includeTransactions` and/or `includeState` is set.
*options.* includeState | boolean | *Optional* Return an array of hashes for all state data or an array of all state data in this ledger version, depending on whether `includeAllData` is set.
*options.* includeTransactions | boolean | *Optional* Return an array of hashes for each transaction or an array of all transactions that were validated in this ledger version, depending on whether `includeAllData` is set.
*options.* ledgerVersion | integer | *Optional* Get ledger data for this historical ledger version.

### Return Value

This method returns a promise that resolves with an object with the following structure:

Name | Type | Description
---- | ---- | -----------
stateHash | string | Hash of all state information in this ledger.
closeTime | date-time string | The time at which this ledger was closed.
closeTimeResolution | integer | Approximate number of seconds between closing one ledger version and closing the next one.
closeFlags | integer | A bit-map of flags relating to the closing of this ledger. Currently, the ledger has only one flag defined for `closeFlags`: **sLCF_NoConsensusTime** (value 1). If this flag is enabled, it means that validators were in conflict regarding the correct close time for the ledger, but built otherwise the same ledger, so they declared consensus while "agreeing to disagree" on the close time. In this case, the consensus ledger contains a `closeTime` value that is 1 second after that of the previous ledger. (In this case, there is no official close time, but the actual real-world close time is probably 3-6 seconds later than the specified `closeTime`.)
ledgerHash | string | Unique identifying hash of the entire ledger.
ledgerVersion | integer | The ledger version of this ledger.
parentLedgerHash | string | Unique identifying hash of the ledger that came immediately before this one.
parentCloseTime | date-time string | The time at which the previous ledger was closed.
totalDrops | [value](#value) | Total number of drops (1/100,000,000th of an CSC) in the network, as a quoted integer. (This decreases as transaction fees cause CSC to be destroyed.)
transactionHash | string | Hash of the transaction information included in this ledger.
rawState | string | *Optional* A JSON string containing all state data for this ledger in casinocoind JSON format.
rawTransactions | string | *Optional* A JSON string containing casinocoind format transaction JSON for all transactions that were validated in this ledger.
stateHashes | array\<string\> | *Optional* An array of hashes of all state data in this ledger.
transactionHashes | array\<[id](#transaction-id)\> | *Optional* An array of hashes of all transactions that were validated in this ledger.
transactions | array\<[getTransaction](#gettransaction)\> | *Optional* Array of all transactions that were validated in this ledger. Transactions are represented in the same format as the return value of [getTransaction](#gettransaction).

### Example

```javascript
return api.getLedger()
  .then(ledger => {/* ... */});
```


```json
{
  "stateHash": "EC028EC32896D537ECCA18D18BEBE6AE99709FEFF9EF72DBD3A7819E918D8B96",
  "closeTime": "2014-09-24T21:21:50.000Z",
  "closeTimeResolution": 10,
  "closeFlags": 0,
  "ledgerHash": "0F7ED9F40742D8A513AE86029462B7A6768325583DF8EE21B7EC663019DD6A0F",
  "ledgerVersion": 9038214,
  "parentLedgerHash": "4BB9CBE44C39DC67A1BE849C7467FE1A6D1F73949EA163C38A0121A15E04FFDE",
  "parentCloseTime": "2014-09-24T21:21:40.000Z",
  "totalDrops": "99999973964317514",
  "transactionHash": "ECB730839EB55B1B114D5D1AD2CD9A932C35BA9AB6D3A8C2F08935EAC2BAC239"
}
```


## preparePayment

`preparePayment(address: string, payment: Object, instructions: Object): Promise<Object>`

Prepare a payment transaction. The prepared transaction must subsequently be [signed](#sign) and [submitted](#submit).

### Parameters

Name | Type | Description
---- | ---- | -----------
address | [address](#address) | The address of the account that is creating the transaction.
payment | [payment](#payment) | The specification of the payment to prepare.
instructions | [instructions](#transaction-instructions) | *Optional* Instructions for executing the transaction

### Return Value

This method returns a promise that resolves with an object with the following structure:

<aside class="notice">
All "prepare*" methods have the same return type.
</aside>

Name | Type | Description
---- | ---- | -----------
txJSON | string | The prepared transaction in casinocoind JSON format.
instructions | object | The instructions for how to execute the transaction after adding automatic defaults.
*instructions.* fee | [value](#value) | An exact fee to pay for the transaction. See [Transaction Fees](#transaction-fees) for more information.
*instructions.* sequence | [sequence](#account-sequence-number) | The initiating account's sequence number for this transaction.
*instructions.* maxLedgerVersion | integer,null | The highest ledger version that the transaction can be included in. Set to `null` if there is no maximum.

### Example

```javascript
const address = 'cDarPNJEpCnpBZSfmcquydockkePkjPGA2';
const payment = {
  "source": {
    "address": "cDarPNJEpCnpBZSfmcquydockkePkjPGA2",
    "maxAmount": {
      "value": "0.01",
      "currency": "USD",
      "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ"
    }
  },
  "destination": {
    "address": "cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo",
    "amount": {
      "value": "0.01",
      "currency": "USD",
      "counterparty": "cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ"
    }
  }
};
return api.preparePayment(address, payment).then(prepared =>
  {/* ... */});
```


```json
{
  "txJSON": "{\"Flags\":2147483648,\"TransactionType\":\"Payment\",\"Account\":\"cDarPNJEpCnpBZSfmcquydockkePkjPGA2\",\"Destination\":\"cpZc4mVfWUif9CRoHRKKcmhu1nx2xktxBo\",\"Amount\":{\"value\":\"0.01\",\"currency\":\"USD\",\"issuer\":\"cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ\"},\"SendMax\":{\"value\":\"0.01\",\"currency\":\"USD\",\"issuer\":\"cJzUdHEh7MF7xwzxF7Tww7H6uWvfKRX5wJ\"},\"LastLedgerSequence\":8820051,\"Fee\":\"12\",\"Sequence\":23}",
  "instructions": {
    "fee": "0.000012",
    "sequence": 23,
    "maxLedgerVersion": 8820051
  }
}
```

## prepareSettings

`prepareSettings(address: string, settings: Object, instructions: Object): Promise<Object>`

Prepare a settings transaction. The prepared transaction must subsequently be [signed](#sign) and [submitted](#submit).

### Parameters

Name | Type | Description
---- | ---- | -----------
address | [address](#address) | The address of the account that is creating the transaction.
settings | [settings](#settings) | The specification of the settings to prepare.
instructions | [instructions](#transaction-instructions) | *Optional* Instructions for executing the transaction

### Return Value

This method returns a promise that resolves with an object with the following structure:

<aside class="notice">
All "prepare*" methods have the same return type.
</aside>

Name | Type | Description
---- | ---- | -----------
txJSON | string | The prepared transaction in casinocoind JSON format.
instructions | object | The instructions for how to execute the transaction after adding automatic defaults.
*instructions.* fee | [value](#value) | An exact fee to pay for the transaction. See [Transaction Fees](#transaction-fees) for more information.
*instructions.* sequence | [sequence](#account-sequence-number) | The initiating account's sequence number for this transaction.
*instructions.* maxLedgerVersion | integer,null | The highest ledger version that the transaction can be included in. Set to `null` if there is no maximum.

### Example

```javascript
const address = 'cDarPNJEpCnpBZSfmcquydockkePkjPGA2';
const settings = {
  "domain": "casinocoin.org",
  "memos": [
    {
      "type": "test",
      "format": "plain/text",
      "data": "texted data"
    }
  ]
};
return api.prepareSettings(address, settings)
  .then(prepared => {/* ... */});
```


```json
{
  "domain": "casinocoin.org",
  "memos": [
    {
      "type": "test",
      "format": "plain/text",
      "data": "texted data"
    }
  ]
}
```

## sign

`sign(txJSON: string, secret: string, options: Object): {signedTransaction: string, id: string}`

Sign a prepared transaction. The signed transaction must subsequently be [submitted](#submit).

### Parameters

Name | Type | Description
---- | ---- | -----------
txJSON | string | Transaction represented as a JSON string in casinocoind format.
secret | secret string | The secret of the account that is initiating the transaction.
options | object | *Optional* Options that control the type of signature that will be generated.
*options.* signAs | [address](#address) | *Optional* The account that the signature should count for in multisigning.

### Return Value

This method returns an object with the following structure:

Name | Type | Description
---- | ---- | -----------
signedTransaction | string | The signed transaction represented as an uppercase hexadecimal string.
id | [id](#transaction-id) | The [Transaction ID](#transaction-id) of the signed transaction.

### Example

```javascript
const txJSON = '{"Flags":2147483648,"TransactionType":"AccountSet","Account":"cDarPNJEpCnpBZSfmcquydockkePkjPGA2","Domain":"726970706C652E636F6D","LastLedgerSequence":8820051,"Fee":"12","Sequence":23}';
const secret = 'shsWGZcmZz6YsWWmcnpfr6fLTdtFV';
return api.sign(txJSON, secret);
```


```json
{
  "signedTransaction": "12000322800000002400000017201B0086955368400000000000000C732102F89EAEC7667B30F33D0687BBA86C3FE2A08CCA40A9186C5BDE2DAA6FA97A37D874473045022100BDE09A1F6670403F341C21A77CF35BA47E45CDE974096E1AA5FC39811D8269E702203D60291B9A27F1DCABA9CF5DED307B4F23223E0B6F156991DB601DFB9C41CE1C770A726970706C652E636F6D81145E7B112523F68D2F5E879DB4EAC51C6698A69304",
  "id": "02ACE87F1996E3A23690A5BB7F1774BF71CCBA68F79805831B42ABAD5913D6F4"
}
```


## combine

`combine(signedTransactions: Array<string>): {signedTransaction: string, id: string}`

Combines signed transactions from multiple accounts for a multisignature transaction. The signed transaction must subsequently be [submitted](#submit).

### Parameters

Name | Type | Description
---- | ---- | -----------
signedTransactions | array\<string\> | An array of signed transactions (from the output of [sign](#sign)) to combine.

### Return Value

This method returns an object with the following structure:

Name | Type | Description
---- | ---- | -----------
signedTransaction | string | The signed transaction represented as an uppercase hexadecimal string.
id | [id](#transaction-id) | The [Transaction ID](#transaction-id) of the signed transaction.

### Example

```javascript
const signedTransactions = [ "12000322800000002400000004201B000000116840000000000F42407300770B6578616D706C652E636F6D811407C532442A675C881BA1235354D4AB9D023243A6F3E0107321026C784C1987F83BACBF02CD3E484AFC84ADE5CA6B36ED4DCA06D5BA233B9D382774473045022100E484F54FF909469FA2033E22EFF3DF8EDFE62217062680BB2F3EDF2F185074FE0220350DB29001C710F0450DAF466C5D819DC6D6A3340602DE9B6CB7DA8E17C90F798114FE9337B0574213FA5BCC0A319DBB4A7AC0CCA894E1F1",
  "12000322800000002400000004201B000000116840000000000F42407300770B6578616D706C652E636F6D811407C532442A675C881BA1235354D4AB9D023243A6F3E01073210287AAAB8FBE8C4C4A47F6F1228C6E5123A7ED844BFE88A9B22C2F7CC34279EEAA74473045022100B09DDF23144595B5A9523B20E605E138DC6549F5CA7B5984D7C32B0E3469DF6B022018845CA6C203D4B6288C87DDA439134C83E7ADF8358BD41A8A9141A9B631419F8114517D9B9609229E0CDFE2428B586738C5B2E84D45E1F1" ];
return api.combine(signedTransactions);
```


```json
{
  "signedTransaction": "12000322800000002400000004201B000000116840000000000F42407300770B6578616D706C652E636F6D811407C532442A675C881BA1235354D4AB9D023243A6F3E01073210287AAAB8FBE8C4C4A47F6F1228C6E5123A7ED844BFE88A9B22C2F7CC34279EEAA74473045022100B09DDF23144595B5A9523B20E605E138DC6549F5CA7B5984D7C32B0E3469DF6B022018845CA6C203D4B6288C87DDA439134C83E7ADF8358BD41A8A9141A9B631419F8114517D9B9609229E0CDFE2428B586738C5B2E84D45E1E0107321026C784C1987F83BACBF02CD3E484AFC84ADE5CA6B36ED4DCA06D5BA233B9D382774473045022100E484F54FF909469FA2033E22EFF3DF8EDFE62217062680BB2F3EDF2F185074FE0220350DB29001C710F0450DAF466C5D819DC6D6A3340602DE9B6CB7DA8E17C90F798114FE9337B0574213FA5BCC0A319DBB4A7AC0CCA894E1F1",
  "id": "8A3BFD2214B4C8271ED62648FCE9ADE4EE82EF01827CF7D1F7ED497549A368CC"
}
```


## submit

`submit(signedTransaction: string): Promise<Object>`

Submits a signed transaction. The transaction is not guaranteed to succeed; it must be verified with [getTransaction](#gettransaction).

### Parameters

Name | Type | Description
---- | ---- | -----------
signedTransaction | string | A signed transaction as returned by [sign](#sign).

### Return Value

This method returns an object with the following structure:

Name | Type | Description
---- | ---- | -----------
resultCode | string | The result code returned by casinocoind. [List of transaction responses](https://casinocoin.org/build/transactions/#full-transaction-response-list)
resultMessage | string | Human-readable explanation of the status of the transaction.

### Example

```javascript
const signedTransaction = '12000322800000002400000017201B0086955368400000000000000C732102F89EAEC7667B30F33D0687BBA86C3FE2A08CCA40A9186C5BDE2DAA6FA97A37D874473045022100BDE09A1F6670403F341C21A77CF35BA47E45CDE974096E1AA5FC39811D8269E702203D60291B9A27F1DCABA9CF5DED307B4F23223E0B6F156991DB601DFB9C41CE1C770A726970706C652E636F6D81145E7B112523F68D2F5E879DB4EAC51C6698A69304';
return api.submit(signedTransaction)
  .then(result => {/* ... */});
```


```json
{
  "resultCode": "tesSUCCESS",
  "resultMessage": "The transaction was applied. Only final in a validated ledger."
}
```


## generateAddress

`generateAddress(): {address: string, secret: string}`

Generate a new CSC Ledger address and corresponding secret.

### Parameters

Name | Type | Description
---- | ---- | -----------
options | object | *Optional* Options to control how the address and secret are generated.
*options.* algorithm | string | *Optional* The digital signature algorithm to generate an address for. Can be `ecdsa-secp256k1` (default) or `ed25519`.
*options.* entropy | array\<integer\> | *Optional* The entropy to use to generate the seed.

### Return Value

This method returns an object with the following structure:

Name | Type | Description
---- | ---- | -----------
address | [address](#address) | A randomly generated CasinoCoin account address.
secret | secret string | The secret corresponding to the `address`.

### Example

```javascript
return api.generateAddress();
```


```json
{
  "address": "cGCkuB7PBr5tNy68tPEABEtcdno4hE6Y7f",
  "secret": "sp6JS7f14BuwFY8Mw6bTtLKWauoUs"
}
```

## computeLedgerHash

`computeLedgerHash(ledger: Object): string`

Compute the hash of a ledger.

### Parameters

<aside class="notice">
The parameter to this method has the same structure as the return value of getLedger.
</aside>

Name | Type | Description
---- | ---- | -----------
ledger | object | The ledger header to hash.
*ledger.* stateHash | string | Hash of all state information in this ledger.
*ledger.* closeTime | date-time string | The time at which this ledger was closed.
*ledger.* closeTimeResolution | integer | Approximate number of seconds between closing one ledger version and closing the next one.
*ledger.* closeFlags | integer | A bit-map of flags relating to the closing of this ledger. Currently, the ledger has only one flag defined for `closeFlags`: **sLCF_NoConsensusTime** (value 1). If this flag is enabled, it means that validators were in conflict regarding the correct close time for the ledger, but built otherwise the same ledger, so they declared consensus while "agreeing to disagree" on the close time. In this case, the consensus ledger contains a `closeTime` value that is 1 second after that of the previous ledger. (In this case, there is no official close time, but the actual real-world close time is probably 3-6 seconds later than the specified `closeTime`.)
*ledger.* ledgerHash | string | Unique identifying hash of the entire ledger.
*ledger.* ledgerVersion | integer | The ledger version of this ledger.
*ledger.* parentLedgerHash | string | Unique identifying hash of the ledger that came immediately before this one.
*ledger.* parentCloseTime | date-time string | The time at which the previous ledger was closed.
*ledger.* totalDrops | [value](#value) | Total number of drops (1/100,000,000th of an CSC) in the network, as a quoted integer. (This decreases as transaction fees cause CSC to be destroyed.)
*ledger.* transactionHash | string | Hash of the transaction information included in this ledger.
*ledger.* rawState | string | *Optional* A JSON string containing all state data for this ledger in casinocoind JSON format.
*ledger.* rawTransactions | string | *Optional* A JSON string containing casinocoind format transaction JSON for all transactions that were validated in this ledger.
*ledger.* stateHashes | array\<string\> | *Optional* An array of hashes of all state data in this ledger.
*ledger.* transactionHashes | array\<[id](#transaction-id)\> | *Optional* An array of hashes of all transactions that were validated in this ledger.
*ledger.* transactions | array\<[getTransaction](#gettransaction)\> | *Optional* Array of all transactions that were validated in this ledger. Transactions are represented in the same format as the return value of [getTransaction](#gettransaction).

### Return Value

This method returns an uppercase hexadecimal string representing the hash of the ledger.

### Example

```javascript
const ledger = {
  "stateHash": "D9ABF622DA26EEEE48203085D4BC23B0F77DC6F8724AC33D975DA3CA492D2E44",
  "closeTime": "2015-08-12T01:01:10.000Z",
  "parentCloseTime": "2015-08-12T01:01:00.000Z",
  "closeFlags": 0,
  "closeTimeResolution": 10,
  "ledgerVersion": 15202439,
  "parentLedgerHash": "12724A65B030C15A1573AA28B1BBB5DF3DA4589AA3623675A31CAE69B23B1C4E",
  "totalDrops": "99998831688050493",
  "transactionHash": "325EACC5271322539EEEC2D6A5292471EF1B3E72AE7180533EFC3B8F0AD435C8"
};
return api.computeLedgerHash(ledger);
```

```json
"F4D865D83EB88C1A1911B9E90641919A1314F36E1B099F8E95FE3B7C77BE3349"
```

# API Events

## ledger

This event is emitted whenever a new ledger version is validated on the connected server.

### Return Value

Name | Type | Description
---- | ---- | -----------
baseFeeCSC | [value](#value) | Base fee, in CSC.
ledgerHash | string | Unique hash of the ledger that was closed, as hex.
ledgerTimestamp | date-time string | The time at which this ledger closed.
reserveBaseCSC | [value](#value) | The minimum reserve, in CSC, that is required for an account.
reserveIncrementCSC | [value](#value) | The increase in account reserve that is added for each item the account owns, such as offers or trust lines.
transactionCount | integer | Number of new transactions included in this ledger.
ledgerVersion | integer | Ledger version of the ledger that closed.
validatedLedgerVersions | string | Range of ledgers that the server has available. This may be discontiguous.

### Example

```javascript
api.on('ledger', ledger => {
  console.log(JSON.stringify(ledger, null, 2));
});
```


```json
{
  "baseFeeCSC": "0.00001",
  "ledgerVersion": 14804627,
  "ledgerHash": "9141FA171F2C0CE63E609466AF728FF66C12F7ACD4B4B50B0947A7F3409D593A",
  "ledgerTimestamp": "2015-07-23T05:50:40.000Z",
  "reserveBaseCSC": "20",
  "reserveIncrementCSC": "5",
  "transactionCount": 19,
  "validatedLedgerVersions": "13983423-14804627"
}
```


## error

This event is emitted when there is an error on the connection to the server that cannot be associated to a specific request.

### Return Value

The first parameter is a string indicating the error type:
* `badMessage` - casinocoind returned a malformed message
* `websocket` - the websocket library emitted an error
* one of the error codes found in the [casinocoind Universal Errors](https://casinocoin.org/build/casinocoind-apis/#universal-errors).

The second parameter is a message explaining the error.

The third parameter is:
* the message that caused the error for `badMessage`
* the error object emitted for `websocket`
* the parsed response for casinocoind errors

### Example

```javascript
api.on('error', (errorCode, errorMessage, data) => {
  console.log(errorCode + ': ' + errorMessage);
});
```

```
tooBusy: The server is too busy to help you now.
```

## connected

This event is emitted after connection successfully opened.

### Example

```javascript
api.on('connected', () => {
  console.log('Connection is open now.');
});
```

## disconnected

This event is emitted when connection is closed.

### Return Value

The only parameter is a number containing the [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) send by the server.

### Example

```javascript
api.on('disconnected', (code) => {
  if (code !== 1000) {
    console.log('Connection is closed due to error.');
  } else {
    console.log('Connection is closed normally.');
  }
});
```
