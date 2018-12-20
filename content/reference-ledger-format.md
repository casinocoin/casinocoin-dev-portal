# CSC Ledger Data Format

The CSC Ledger is a shared, global ledger that is open to all. Individual participants can trust the integrity of the ledger without having to trust any single institution to manage it. The `casinocoind` server software accomplishes this by managing a ledger database that can only be updated according to very specific rules. Each instance of `casinocoind` keeps a full copy of the ledger, and the peer-to-peer network of `casinocoind` servers distributes candidate transactions among themselves. The consensus process determines which transactions get applied to each new version of the ledger. See also: [The Consensus Process](https://casinocoin.org/build/casinocoin-ledger-consensus-process/).

![Diagram: Each ledger is the result of applying transactions to the previous ledger version.](img/ledger-process.png)

The shared global ledger is actually a series of individual ledgers, or ledger versions, which `casinocoind` keeps in its internal database. Every ledger version has a [ledger index](#ledger-index) which identifies the order in which ledgers occur. Each closed ledger version also has an identifying hash value, which uniquely identifies the contents of that ledger. At any given time, a `casinocoind` instance has an in-progress "current" open ledger, plus some number of closed ledgers that have not yet been approved by consensus, and any number of historical ledgers that have been validated by consensus. Only the validated ledgers are certain to be correct and immutable.

A single ledger version consists of several parts:

![Diagram: A ledger has transactions, a state tree, and a header with the close time and validation info](img/ledger-components.png)

* A **header** - The [ledger index](#ledger-index), hashes of its other contents, and other metadata.
* A **transaction tree** - The [transactions](reference-transaction-format.html) that were applied to the previous ledger to make this one. Transactions are the _only_ way to change the ledger.
* A **state tree** - All the [ledger objects](#ledger-object-types) that contain the settings, balances, and objects in the ledger as of this version.


## Tree Format

As its name might suggest, a ledger's state tree is a tree data structure. Each object in the state tree is identified by a 256-bit object ID. In JSON, a ledger object's ID is the `index` field, which contains a 64-character hexadecimal string like `"193C591BF62482468422313F9D3274B5927CA80B4DD3707E42015DD609E39C94"`. Every object in the state tree has an ID that you can use to look up that object; every transaction has an indentifying hash that you can use to look up the transaction in the transaction tree. Do not confuse the `index` (ID) of a ledger object with the [`ledger_index` (sequence number) of a ledger](#ledger-index).

**Tip:** Sometimes, an object in the ledger's state tree is called a "ledger node". For example, transaction metadata returns a list of `AffectedNodes`. Do not confuse this with a "node" (server) in the peer-to-peer network.

In the case of transactions, the identifying hash is based on the signed transaction instructions, but the contents of the transaction object when you look it up also contain the results and metadata of the transaction, which are not taken into account when generating the hash.

## Object IDs
<a id="sha512half"></a>

All objects in a ledger' state tree have a unique ID. This field is returned as the `index` field in JSON, at the same level as the object's contents. The ID is derived by hashing important contents of the object, along with a [namespace identifier](https://github.com/casinocoin/casinocoind/blob/master/src/casinocoin/protocol/LedgerFormats.h#L97). The ledger object type determines which namespace identifier to use and which contents to include in the hash. This ensures every ID is unique. To calculate the hash, `casinocoind` uses SHA-512 and then truncates the result to the first 256 bytes. This algorithm, informally called **SHA-512Half**, provides an output that has comparable security to SHA-256, but runs faster on 64-bit processors.

![Diagram: casinocoind uses SHA-512Half to generate IDs for ledger objects. The space key prevents IDs for different object types from colliding.](img/ledger-indexes.png)


## Header Format
[[Source]<br>](https://github.com/casinocoin/casinocoind/blob/master/src/casinocoin/ledger/ReadView.h#L71 "Source")

Every ledger version has a unique header that describes the contents. You can look up a ledger's header information with the [`ledger` command](reference-casinocoind.html#ledger). The contents of the ledger header are as follows:

| Field           | JSON Type | [Internal Type][] | Description |
|-----------------|-----------|-------------------|-------------|
| [`ledger_index`](#ledger-index)   | String    | UInt32            | The sequence number of the ledger. Some API methods display this as a quoted integer; some display it as a native JSON number. |
| `ledger_hash`    | String    | Hash256           | The [SHA-512Half](#sha512half) of the ledger header, excluding the `ledger_hash` itself. This serves as a unique identifier for this ledger and all its contents. |
| `account_hash`   | String    | Hash256           | The [SHA-512Half](#sha512half) of this ledger's state tree information. |
| `close_time`     | Number    | UInt32            | The approximate time this ledger closed, as the number of seconds since the CasinoCoin Epoch of 2000-01-01 00:00:00. This value is rounded based on the `close_time_resolution`, so later ledgers can have the same value. |
| `closed`          | Boolean   | bool              | If true, this ledger version is no longer accepting new transactions. (However, unless this ledger version is validated, it might be replaced by a different ledger version with a different set of transactions.) |
| `parent_hash`    | String    | Hash256           | The `ledger_hash` value of the previous ledger that was used to build this one. If there are different versions of the previous ledger index, this indicates from which one the ledger was derived. |
| `total_coins`    | String    | UInt64            | The total number of [drops of CSC][CSC, in drops] owned by accounts in the ledger. This omits CSC that has been destroyed by transaction fees. The actual amount of CSC in circulation is lower because some accounts are "black holes" whose keys are not known by anyone. |
| `transaction_hash` | String  | Hash256           | The [SHA-512Half](#sha512half) of the transactions included in this ledger. |
| `close_time_resolution` | Number | Uint8        | An integer in the range \[2,120\] indicating the maximum number of seconds by which the `close_time` could be rounded. |
| [`closeFlags`](#close-flags) | (Omitted) | UInt8             | A bit-map of flags relating to the closing of this ledger. |

[Internal Type]: https://github.com/casinocoin/casinocoind/blob/master/src/casinocoin/protocol/impl/SField.cpp


### Ledger Index
{% include 'data_types/ledger_index.md' %}
[Hash]: reference-casinocoind.html#hashes

### Close Flags

The ledger has only one flag defined for closeFlags: **sLCF_NoConsensusTime** (value `1`). If this flag is enabled, it means that validators had different close times for the ledger, but built otherwise the same ledger, so they declared consensus while "agreeing to disagree" on the close time. In this case, the consensus ledger version contains a `close_time` value that is 1 second after that of the previous ledger. (In this case, there is no official close time, but the actual real-world close time is probably 3-6 seconds later than the specified `close_time`.)

The `closeFlags` field is not included in any JSON representations of a ledger, but is included in the binary representation of a ledger, and is one of the fields that determine the ledger's hash.



# Ledger Object Types

There are several different kinds of objects that can appear in the ledger's state tree:

* [**AccountRoot** - The settings, CSC balance, and other metadata for one account.](#accountroot)
* [**Amendments** - Singleton object with status of enabled and pending amendments.](#amendments)
* [**DirectoryNode** - Contains links to other objects.](#directorynode)
* [**FeeSettings** - Singleton object with consensus-approved base transaction cost and reserve requirements.](#feesettings)
* [**LedgerHashes** - Lists of prior ledger versions' hashes for history lookup.](#ledgerhashes)
* [**CasinocoinState** - Links two accounts, tracking the balance of one currency between them. The concept of a _trust line_ is really an abstraction of this object type.](#casinocoinstate)
* [**SignerList** - A list of addresses for multi-signing transactions.](#signerlist)

Each ledger object consists of several fields. In the peer protocol that `casinocoind` servers use to communicate with each other, ledger objects are represented in their raw binary format. In other [`casinocoind` APIs](reference-casinocoind.html), ledger objects are represented as JSON objects.

## AccountRoot
[[Source]<br>](https://github.com/casinocoin/casinocoind/blob/4.0.1/src/casinocoin/protocol/impl/LedgerFormats.cpp#L27 "Source")

The `AccountRoot` object type describes a single _account_ object. Example `AccountRoot` object:

```json
{
    "Account": "cDarPNJEpCnpBZSfmcquydockkePkjPGA2",
    "AccountTxnID": "0D5FB50FA65C9FE1538FD7E398FFFE9D1908DFA4576D8D7A020040686F93C77D",
    "Balance": "148446663",
    "Domain": "6D64756F31332E636F6D",
    "EmailHash": "98B4375E1D753E5B91627516F6D70977",
    "Flags": 8388608,
    "LedgerEntryType": "AccountRoot",
    "MessageKey": "0000000000000000000000070000000300",
    "OwnerCount": 3,
    "PreviousTxnID": "0D5FB50FA65C9FE1538FD7E398FFFE9D1908DFA4576D8D7A020040686F93C77D",
    "PreviousTxnLgrSeq": 14091160,
    "Sequence": 336,
    "TransferRate": 1004999999,
    "index": "13F1A95D7AAB7108D5CE7EEAF504B2894B8C674E6D68499076441C4837282BF8"
}
```

The `AccountRoot` object has the following fields:

| Field           | JSON Type | [Internal Type][] | Description |
|-----------------|-----------|---------------|-------------|
| `LedgerEntryType` | String | UInt16 | The value `0x0061`, mapped to the string `AccountRoot`, indicates that this object is an AccountRoot object. |
| `Account`         | String | AccountID | The identifying address of this account, such as cDarPNJEpCnpBZSfmcquydockkePkjPGA2. |
| [Flags](#accountroot-flags) | Number | UInt32 | A bit-map of boolean flags enabled for this account. |
| `Sequence`        | Number | UInt32 | The sequence number of the next valid transaction for this account. (Each account starts with Sequence = 1 and increases each time a transaction is made.) |
| `Balance`         | String | Amount | The account's current [CSC balance in drops][CSC, in drops], represented as a string. |
| `OwnerCount`      | Number | UInt32 | The number of objects this account owns in the ledger, which contributes to its owner reserve. |
| `PreviousTxnID`   | String | Hash256 | The identifying hash of the transaction that most recently modified this object. |
| `PreviousTxnLgrSeq` | Number | UInt32 | The [index of the ledger](#ledger-index) that contains the transaction that most recently modified this object. |
| `AccountTxnID`    | String | Hash256 | (Optional) The identifying hash of the transaction most recently submitted by this account. |
| `RegularKey`      | String | AccountID | (Optional) The address of a keypair that can be used to sign transactions for this account instead of the master key. Use a [SetRegularKey transaction][] to change this value. |
| `EmailHash`       | String | Hash128 | (Optional) The md5 hash of an email address. Clients can use this to look up an avatar through services such as [Gravatar](https://en.gravatar.com/). |
| `WalletLocator`   | String | Hash256 | (Optional) **DEPRECATED**. Do not use. |
| `WalletSize`      | Number | UInt32  | (Optional) **DEPRECATED**. Do not use. |
| `MessageKey`      | String | VariableLength  | (Optional) A public key that may be used to send encrypted messages to this account. In JSON, uses hexadecimal. No more than 33 bytes. |
| `TickSize`        | Number | UInt8   | (Optional) How many significant digits to use for exchange rates of Offers involving currencies issued by this address. Valid values are `3` to `15`, inclusive. _(Requires the [TickSize amendment](reference-amendments.html#ticksize).)_ |
| `TransferRate`    | Number | UInt32  | (Optional) A transfer fee to charge other users for sending currency issued by this account to each other. |
| `Domain`          | String | VariableLength | (Optional) A domain associated with this account. In JSON, this is the hexadecimal for the ASCII representation of the domain. |

### AccountRoot Flags

There are several options which can be either enabled or disabled for an account. These options can be changed with an [AccountSet transaction][]. In the ledger, flags are represented as binary values that can be combined with bitwise-or operations. The bit values for the flags in the ledger are different than the values used to enable or disable those flags in a transaction. Ledger flags have names that begin with _lsf_.

AccountRoot objects can have the following flag values:

| Flag Name | Hex Value | Decimal Value | Description | Corresponding [AccountSet Flag](reference-transaction-format.html#accountset-flags) |
|-----------|-----------|---------------|-------------|-------------------------------|
| lsfPasswordSpent | 0x00010000 | 65536 | Indicates that the account has used its free SetRegularKey transaction. | (None) |
| lsfRequireDestTag | 0x00020000 | 131072 | Requires incoming payments to specify a Destination Tag. | asfRequireDest |
| lsfRequireAuth | 0x00040000 | 262144 | This account must individually approve other users for those users to hold this account's issuances. | asfRequireAuth |
| lsfDisallowCSC | 0x00080000 | 524288 | Client applications should not send CSC to this account. Not enforced by `casinocoind`. | asfDisallowCSC |
| lsfDisableMaster | 0x00100000 | 1048576 | Disallows use of the master key to sign transactions for this account. | asfDisableMaster |
| lsfNoFreeze | 0x00200000 | 2097152 | This address cannot freeze trust lines connected to it. Once enabled, cannot be disabled. | asfNoFreeze |
| lsfGlobalFreeze | 0x00400000 | 4194304 |　All assets issued by this address are frozen. | asfGlobalFreeze |
| lsfDefaultCasinocoin | 0x00800000 | 8388608 | Enable [rippling](concept-nocasinocoin.html) on this addresses's trust lines by default. Required for issuing addresses; discouraged for others. | asfDefaultCasinocoin |

### AccountRoot ID Format

The ID of an AccountRoot object is the [SHA-512Half](#sha512half) of the following values put together:

* The Account space key (`0x0061`)
* The AccountID of the account


## Amendments
[[Source]<br>](https://github.com/casinocoin/casinocoind/blob/develop/src/casinocoin/protocol/impl/LedgerFormats.cpp#L110-L113 "Source")

The `Amendments` object type contains a list of [Amendments](concept-amendments.html) that are currently active. Each ledger version contains **at most one** `Amendments` object.

Example `Amendments` object:

```json
{
    "Majorities": [
        {
            "Majority": {
                "Amendment": "1562511F573A19AE9BD103B5D6B9E01B3B46805AEC5D3C4805C902B514399146",
                "CloseTime": 535589001
            }
        }
    ],
    "Amendments": [
        "42426C4D4F1009EE67080A9B7965B44656D7714D104A72F9B4369F97ABF044EE",
        "4C97EBA926031A7CF7D7B36FDE3ED66DDA5421192D63DE53FFB46E43B9DC8373",
        "6781F8368C4771B83E8B821D88F580202BCB4228075297B19E4FDC5233F1EFDC",
        "740352F2412A9909880C23A559FCECEDA3BE2126FED62FC7660D628A06927F11"
    ],
    "Flags": 0,
    "LedgerEntryType": "Amendments",
    "index": "7DB0788C020F02780A673DC74757F23823FA3014C1866E72CC4CD8B226CD6EF4"
}
```

| Name              | JSON Type | [Internal Type][] | Description |
|-------------------|-----------|-------------------|-------------|
| `Amendments`      | Array     | STI_VECTOR256     | _(Optional)_ Array of 256-bit [amendment IDs](concept-amendments.html#about-amendments) for all currently-enabled amendments. If omitted, there are no enabled amendments. |
| `Majorities`      | Array     | STI_ARRAY | _(Optional)_ Array of objects describing the status of amendments that have majority support but are not yet enabled. If omitted, there are no pending amendments with majority support. |
| `Flags`           | Number    | UInt32    | Not used. |
| `LedgerEntryType` | String    | UInt16    |  The value `0x0066`, mapped to the string `Amendments`, indicates that this is object describes status of amendments to the CSC Ledger. |

Each member of the `Majorities` field, if it is present, is an object with a one field, `Majority`, whose contents are a nested object with the following fields:

| Name              | JSON Type | [Internal Type][] | Description |
|-------------------|-----------|-------------------|-------------|
| `Amendment`       | String    | Hash256           | The Amendment ID of the pending amendment. |
| `CloseTime`       | Number    | UInt32            | The [`close_time` field](#header-format) of the ledger version where this amendment most recently gained a majority. |

In the [amendment process](concept-amendments.html#amendment-process), a consensus of validators adds a new amendment to the `Majorities` field using an [EnableAmendment][] pseudo-transaction with the `tfGotMajority` flag when 80% or more of validators support it. If support for a pending amendment goes below 80%, an [EnableAmendment][] pseudo-transaction with the `tfLostMajority` flag removes the amendment from the `Majorities` array. If an amendment remains in the `Majorities` field for at least 2 weeks, an [EnableAmendment][] pseudo-transaction with no flags removes it from `Majorities` and permanently adds it to the `Amendments` field.

**Note:** Technically, all transactions in a ledger are processed based on which amendments are enabled in the ledger version immediately before it. While applying transactions to a ledger version where an amendment becomes enabled, the rules don't change mid-ledger. After the ledger is closed, the next ledger uses the new rules as defined by any new amendments that applied.

### Amendments ID Format

The `Amendments` object ID is the hash of the `Amendments` space key (`0x0066`) only. This means that the ID of the `Amendments` object in a ledger is always:

```
7DB0788C020F02780A673DC74757F23823FA3014C1866E72CC4CD8B226CD6EF4
```

(Don't mix up the ID of the `Amendments` ledger object type with the Amendment ID of an individual amendment.)


## DirectoryNode
[[Source]<br>](https://github.com/casinocoin/casinocoind/blob/4.0.1/src/casinocoin/protocol/impl/LedgerFormats.cpp#L44 "Source")

The `DirectoryNode` object type provides a list of links to other objects in the ledger's state tree. A single conceptual _Directory_　takes the form of a doubly linked list, with one or more DirectoryNode objects each containing up to 32 [IDs](#tree-format) of other objects. The first object is called the root of the directory, and all objects other than the root object can be added or deleted as necessary.

There are two kinds of Directories:

* **Owner directories** list other objects owned by an account, such as `CasinocoinState`.

Example Directories:

<!-- MULTICODE_BLOCK_START -->

*Owner Directory*

```json
{
    "Flags": 0,
    "Indexes": [
        "AD7EAE148287EF12D213A251015F86E6D4BD34B3C4A0A1ED9A17198373F908AD",
        "E83BBB58949A8303DF07172B16FB8EFBA66B9191F3836EC27A4568ED5997BAC5"
    ],
    "LedgerEntryType": "DirectoryNode",
    "Owner": "cpR95n1iFkTqpoy1e878f4Z1pVHVtWKMNQ",
    "RootIndex": "193C591BF62482468422313F9D3274B5927CA80B4DD3707E42015DD609E39C94",
    "index": "193C591BF62482468422313F9D3274B5927CA80B4DD3707E42015DD609E39C94"
}
```

<!-- MULTICODE_BLOCK_END -->

| Name              | JSON Type | [Internal Type][] | Description |
|-------------------|-----------|---------------|-------------|
| `LedgerEntryType`   | String    | UInt16    | The value `0x0064`, mapped to the string `DirectoryNode`, indicates that this object is part of a Directory. |
| `Flags`             | Number    | UInt32    | A bit-map of boolean flags enabled for this directory. Currently, the protocol defines no flags for DirectoryNode objects. |
| `RootIndex`         | Number    | Hash256   | The ID of root object for this directory. |
| `Indexes`           | Array     | Vector256 | The contents of this Directory: an array of IDs of other objects. |
| `IndexNext`         | Number    | UInt64    | (Optional) If this Directory consists of multiple pages, this ID links to the next object in the chain, wrapping around at the end. |
| `IndexPrevious`     | Number    | UInt64    | (Optional) If this Directory consists of multiple pages, this ID links to the previous object in the chain, wrapping around at the beginning. |
| `Owner`             | String    | AccountID | (Owner Directories only) The address of the account that owns the objects in this directory. |

### Directory ID Formats

There are three different formulas for creating the ID of a DirectoryNode, depending on which of the following the DirectoryNode represents:

* The first page (also called the root) of an Owner Directory
* Later pages of either type

**The first page of an Owner Directory** has an ID that is the [SHA-512Half](#sha512half) of the following values put together:

* The Owner Directory space key (`0x004F`)
* The AccountID from the `Owner` field.

**If the DirectoryNode is not the first page in the Directory** (regardless of whether it is an Owner Directory), then it has an ID that is the [SHA-512Half](#sha512half) of the following values put together:

* The DirectoryNode space key (`0x0064`)
* The ID of the root DirectoryNode
* The page number of this object. (Since 0 is the root DirectoryNode, this value is an integer 1 or higher.)


## FeeSettings
[[Source]<br>](https://github.com/casinocoin/casinocoind/blob/master/src/casinocoin/protocol/impl/LedgerFormats.cpp#L115-L120 "Source")

The `FeeSettings` object type contains the current base [transaction cost](concept-transaction-cost.html) and [reserve amounts](concept-reserves.html) as determined by [fee voting](concept-fee-voting.html). Each ledger version contains **at most one** `FeeSettings` object.

Example `FeeSettings` object:

```json
{
   "BaseFee": "000000000000000A",
   "Flags": 0,
   "LedgerEntryType": "FeeSettings",
   "ReferenceFeeUnits": 10,
   "ReserveBase": 20000000,
   "ReserveIncrement": 5000000,
   "index": "4BC50C9B0D8515D3EAAE1E74B29A95804346C491EE1A95BF25E4AAB854A6A651"
}
```

The `FeeSettings` object has the following fields:

| Name                | JSON Type | [Internal Type][] | Description            |
|:--------------------|:----------|:------------------|:-----------------------|
| `LedgerEntryType`   | String    | UInt16            | The value `0x0073`, mapped to the string `FeeSettings`, indicates that this object contains the ledger's fee settings. |
| `BaseFee`           | String    | UInt64            | The [transaction cost](concept-transaction-cost.html) of the "reference transaction" in drops of CSC as hexadecimal. |
| `ReferenceFeeUnits` | Number    | UInt32            | The `BaseFee` translated into "fee units". |
| `ReserveBase`       | Number    | UInt32            | The [base reserve](concept-reserves.html#base-reserve-and-owner-reserve) for an account in the CSC Ledger, as drops of CSC. |
| `ReserveIncrement`  | Number    | UInt32            | The incremental [owner reserve](concept-reserves.html#base-reserve-and-owner-reserve) for owning objects, as drops of CSC. |
| `Flags`             | Number    | UInt32            | A bit-map of boolean flags for this object. No flags are defined for this type. |

**Warning:** The JSON format for this ledger object type is unusual. The `BaseFee`, `ReserveBase`, and `ReserveIncrement` indicate drops of CSC but ***not*** in the usual format for [specifying CSC](reference-casinocoind.html#specifying-currency-amounts).

### FeeSettings ID Format

The `FeeSettings` object ID is the hash of the `FeeSettings` space key (`0x0065`) only. This means that the ID of the `FeeSettings` object in a ledger is always:

```
4BC50C9B0D8515D3EAAE1E74B29A95804346C491EE1A95BF25E4AAB854A6A651
```


## LedgerHashes
[[Source]<br>](https://github.com/casinocoin/casinocoind/blob/master/src/casinocoin/protocol/impl/LedgerFormats.cpp#L104-L107 "Source")

(Not to be confused with the ["ledger hash" string data type][Hash], which uniquely identifies a ledger version. This section describes the `LedgerHashes` ledger object type.)

The `LedgerHashes` object type contains a history of prior ledgers that led up to this ledger version, in the form of their hashes. Objects of this ledger type are modified automatically in the process of closing a ledger. (This is the only time the ledger's "state" tree is modified without a transaction or pseudo-transaction.) The `LedgerHashes` objects exist to make it possible to look up a previous ledger's hash with only the current ledger version and at most one lookup of a previous ledger version.

There are two kinds of `LedgerHashes` object. Both types have the same fields. Each ledger version contains:

- Exactly one "recent history" `LedgerHashes` object
- A number of "previous history" `LedgerHashes` objects based on the current ledger index (that is, the length of the ledger history). Specifically, the CSC Ledger adds a new "previous history" object every 65536 ledger versions.

**Note:** As an exception, a new genesis ledger has no `LedgerHashes` objects at all, because it has no ledger history.

Example `LedgerHashes` object (trimmed for length):

```json
{
  "LedgerEntryType": "LedgerHashes",
  "Flags": 0,
  "FirstLedgerSequence": 2,
  "LastLedgerSequence": 33872029,
  "Hashes": [
    "D638208ADBD04CBB10DE7B645D3AB4BA31489379411A3A347151702B6401AA78",
    "254D690864E418DDD9BCAC93F41B1F53B1AE693FC5FE667CE40205C322D1BE3B",
    "A2B31D28905E2DEF926362822BC412B12ABF6942B73B72A32D46ED2ABB7ACCFA",
    "AB4014846DF818A4B43D6B1686D0DE0644FE711577C5AB6F0B2A21CCEE280140",
    "3383784E82A8BA45F4DD5EF4EE90A1B2D3B4571317DBAC37B859836ADDE644C1",
    ... (up to 256 ledger hashes) ...
  ],
  "index": "B4979A36CDC7F3D3D5C31A4EAE2AC7D7209DDA877588B9AFC66799692AB0D66B"
}
```

A `LedgerHashes` object has the following fields:

| Name              | JSON Type | [Internal Type][] | Description |
|-------------------|-----------|-------------------|-------------|
| `LedgerEntryType` | String    | UInt16    | The value `0x0068`, mapped to the string `LedgerHashes`, indicates that this object is a list of ledger hashes. |
| `FirstLedgerSequence` | Number | UInt32   | **DEPRECATED** Do not use. (The "recent hashes" object of the production CSC Ledger has the value `2` in this field as a result of a previous `casinocoind` software. That value gets carried forward as the "recent hashes" object is updated. New "previous history" objects do not have this field, nor do "recent hashes" objects in [parallel networks](tutorial-casinocoind-setup.html#parallel-networks) started with more recent versions of `casinocoind`.) |
| `LastLedgerSequence` | Number | UInt32 | The [ledger index](#ledger-index) of the last entry in this object's `Hashes` array. |
| `Hashes` | Array of Strings | STI_VECTOR256 | An array of up to 256 ledger hashes. The contents depend on which sub-type of `LedgerHashes` object this is. |
| `Flags`             | Number    | UInt32    | A bit-map of boolean flags for this object. No flags are defined for this type. |

### Recent History LedgerHashes

There is exactly one `LedgerHashes` object of the "recent history" sub-type in every ledger after the genesis ledger. This object contains the identifying hashes of the most recent 256 ledger versions (or fewer, if the ledger history has less than 256 ledgers total) in the `Hashes` array. Whenever a new ledger is closed, part of the process of closing it involves updating the "recent history" object with the hash of the previous ledger version this ledger version is derived from (also known as this ledger version's _parent ledger_). When there are more than 256 hashes, the oldest one is removed.

Using the "recent history" `LedgerHashes` object of a given ledger, you can get the hash of any ledger index within the 256 ledger versions before the given ledger version.

### Previous History LedgerHashes

The "previous history" `LedgerHashes` entries collectively contain the hash of every 256th ledger version (also called "flag ledgers") in the full history of the ledger. When the child of a flag ledger closes, the flag ledger's hash is added to the `Hashes` array of the newest "previous history" `LedgerHashes` object. Every 65536 ledgers, `casinocoind` creates a new `LedgerHashes` object, so that each "previous history" object has the hashes of 256 flag ledgers.

**Note:** The oldest "previous history" `LedgerHashes` object contains only 255 entries because the genesis ledger has ledger index 1, not 0.

The "previous history" `LedgerHashes` objects act as a [skip list](https://en.wikipedia.org/wiki/Skip_list) so you can get the hash of any historical flag ledger from its index. From there, you can use that flag ledger's "recent history" object to get the hash of any other ledger.

### LedgerHashes ID Formats
[[Source]<br>](https://github.com/casinocoin/casinocoind/blob/develop/src/casinocoin/protocol/impl/Indexes.cpp#L28-L43)

There are two formats for `LedgerHashes` object IDs, depending on whether the object is a "recent history" sub-type or a "previous history" sub-type.

The **"recent history"** `LedgerHashes` object has an ID that is the [SHA-512Half](#sha512half) of the `LedgerHashes` space key (`0x0073`). In other words, the "recent history" always has the ID `B4979A36CDC7F3D3D5C31A4EAE2AC7D7209DDA877588B9AFC66799692AB0D66B`.

The **"previous history"** `LedgerHashes` objects have an ID that is the [SHA-512Half](#sha512half) of the following values put together:

- The `LedgerHashes` space key (`0x0073`)
- The 32-bit [ledger index](#ledger-index) of a flag ledger in the object's `Hashes` array, divided by 65536.

    **Tip:** Dividing by 65536 keeps the most significant 16 bits, which are the same for all the flag ledgers listed in a "previous history" object, and only those ledgers. You can use this fact to look up the `LedgerHashes` object that contains the hash of any flag ledger.



## CasinocoinState
[[Source]<br>](https://github.com/casinocoin/casinocoind/blob/4.0.1/src/casinocoin/protocol/impl/LedgerFormats.cpp#L70 "Source")

The `CasinocoinState` object type connects two accounts in a single currency. Conceptually, a `CasinocoinState` object represents two _trust lines_ between the accounts, one from each side. Each account can change the settings for its side of the `CasinocoinState` object, but the balance is a single shared value. A trust line that is entirely in its default state is considered the same as trust line that does not exist, so `casinocoind` deletes `CasinocoinState` objects when their properties are entirely default.

Since no account is privileged in the CSC Ledger, a `CasinocoinState` object sorts their account addresses numerically, to ensure a canonical form. Whichever address is numerically lower is deemed the "low account" and the other is the "high account".

Example `CasinocoinState` object:

```json
{
    "Balance": {
        "currency": "USD",
        "issuer": "cccccccccccccccccccBZbvji",
        "value": "-10"
    },
    "Flags": 393216,
    "HighLimit": {
        "currency": "USD",
        "issuer": "cDarPNJEpCnpBZSfmcquydockkePkjPGA2",
        "value": "110"
    },
    "HighNode": "0000000000000000",
    "LedgerEntryType": "CasinocoinState",
    "LowLimit": {
        "currency": "USD",
        "issuer": "csA2LpzuawewSBQXkiju3YQTMzW13pAAdW",
        "value": "0"
    },
    "LowNode": "0000000000000000",
    "PreviousTxnID": "E3FE6EA3D48F0C2B639448020EA4F03D4F4F8FFDB243A852A0F59177921B4879",
    "PreviousTxnLgrSeq": 14090896,
    "index": "9CA88CDEDFF9252B3DE183CE35B038F57282BC9503CDFA1923EF9A95DF0D6F7B"
}
```

A CasinocoinState object has the following fields:

| Name            | JSON Type | Internal Type | Description |
|-----------------|-----------|---------------|-------------|
| `LedgerEntryType` | String    | UInt16 | The value `0x0072`, mapped to the string `CasinocoinState`, indicates that this object is a CasinocoinState object. |
| `Flags`           | Number    | UInt32 | A bit-map of boolean options enabled for this object. |
| `Balance`         | Object    | Amount | The balance of the trust line, from the perspective of the low account. A negative balance indicates that the low account has issued currency to the high account. The issuer in this is always set to the neutral value [ACCOUNT_ONE](concept-accounts.html#special-addresses). |
| `LowLimit`        | Object    | Amount | The limit that the low account has set on the trust line. The `issuer` is the address of the low account that set this limit. |
| `HighLimit`       | Object    | Amount | The limit that the high account has set on the trust line. The `issuer` is the address of the high account that set this limit. |
| `PreviousTxnID`   | String    | Hash256 | The identifying hash of the transaction that most recently modified this object. |
| `PreviousTxnLgrSeq` | Number  | UInt32 | The [index of the ledger](#ledger-index) that contains the transaction that most recently modified this object. |
| `LowNode`         | String    | UInt64 | (Omitted in some historical ledgers) A hint indicating which page of the low account's owner directory links to this object, in case the directory consists of multiple pages. |
| `HighNode`        | String    | UInt64 | (Omitted in some historical ledgers) A hint indicating which page of the high account's owner directory links to this object, in case the directory consists of multiple pages. |
| `LowQualityIn`    | Number    | UInt32 | (Optional) The inbound quality set by the low account, as an integer in the implied ratio LowQualityIn:1,000,000,000. The value 0 is equivalent to 1 billion, or face value. |
| `LowQualityOut`   | Number    | UInt32 | (Optional) The outbound quality set by the low account, as an integer in the implied ratio LowQualityOut:1,000,000,000. The value 0 is equivalent to 1 billion, or face value. |
| `HighQualityIn`   | Number    | UInt32 | (Optional) The inbound quality set by the high account, as an integer in the implied ratio HighQualityIn:1,000,000,000. The value 0 is equivalent to 1 billion, or face value. |
| `HighQualityOut`  | Number    | UInt32 | (Optional) The outbound quality set by the high account, as an integer in the implied ratio HighQualityOut:1,000,000,000. The value 0 is equivalent to 1 billion, or face value. |

### CasinocoinState Flags

There are several options which can be either enabled or disabled for a trust line. These options can be changed with a [TrustSet transaction](reference-transaction-format.html#trustset). In the ledger, flags are represented as binary values that can be combined with bitwise-or operations. The bit values for the flags in the ledger are different than the values used to enable or disable those flags in a transaction. Ledger flags have names that begin with _lsf_.

CasinocoinState objects can have the following flag values:

| Flag Name | Hex Value | Decimal Value | Description | Corresponding [TrustSet Flag](reference-transaction-format.html#trustset-flags) |
|-----------|-----------|---------------|-------------|------------------------|
| lsfLowReserve | 0x00010000 | 65536 | This CasinocoinState object [contributes to the low account's owner reserve](#contributing-to-the-owner-reserve). | (None) |
| lsfHighReserve | 0x00020000 |131072 | This CasinocoinState object [contributes to the high account's owner reserve](#contributing-to-the-owner-reserve). | (None) |
| lsfLowAuth | 0x00040000 | 262144 | The low account has authorized the high account to hold the low account's issuances. | tfSetAuth |
| lsfHighAuth | 0x00080000 | 524288 |  The high account has authorized the low account to hold the high account's issuances. | tfSetAuth |
| lsfLowNoCasinocoin | 0x00100000 | 1048576 | The low account [has disabled rippling](concept-nocasinocoin.html) from this trust line to other trust lines with the same account's NoCasinocoin flag set. | tfSetNoCasinocoin |
| lsfHighNoCasinocoin | 0x00200000 | 2097152 | The high account [has disabled rippling](concept-nocasinocoin.html) from this trust line to other trust lines with the same account's NoCasinocoin flag set. | tfSetNoCasinocoin |
| lsfLowFreeze | 0x00400000 | 4194304 | The low account has frozen the trust line, preventing the high account from transferring the asset. | tfSetFreeze |
| lsfHighFreeze | 0x00800000 | 8388608 | The high account has frozen the trust line, preventing the low account from transferring the asset. | tfSetFreeze |

### Contributing to the Owner Reserve

If an account modifies a trust line to put it in a non-default state, then that trust line counts towards the account's [owner reserve](concept-reserves.html#owner-reserves). In a CasinocoinState object, the `lsfLowReserve` and `lsfHighReserve` flags indicate which account(s) are responsible for the owner reserve. The `casinocoind` server automatically sets these flags when it modifies a trust line.

The values that count towards a trust line's non-default state are as follows:

| High account responsible if... | Low account responsible if... |
|-----------------------|----------------------|
| `Balance` is negative (the high account holds currency) | `Balance` is positive (the low account holds currency) |
| `HighLimit` is not `0` | `LowLimit` is not `0`  |
| `LowQualityIn` is not `0` and not `1000000000` | `HighQualityIn` is not `0` and not `1000000000` |
| `LowQualityOut` is not `0` and not `1000000000` | `HighQualityOut` is not `0` and not `1000000000` |
| **lsfHighNoCasinocoin** flag is not in its default state | **lsfLowNoCasinocoin** flag is not in its default state |
| **lsfHighFreeze** flag is enabled | **lsfLowFreeze** flag is enabled |

The **lsfLowAuth** and **lsfHighAuth** flags do not count against the default state, because they cannot be disabled.

The default state of the two NoCasinocoin flags depends on the state of the [lsfDefaultCasinocoin flag](#accountroot-flags) in their corresponding AccountRoot objects. If DefaultCasinocoin is disabled (the default), then the default state of the lsfNoCasinocoin flag is _enabled_ for all of an account's trust lines. If an account enables DefaultCasinocoin, then the lsfNoCasinocoin flag is _disabled_ (rippling is enabled) for an account's trust lines by default.

**Note:** Prior to the introduction of the DefaultCasinocoin flags in `casinocoind` version 0.27.3 (March 10, 2015), the default state for all trust lines was with both NoCasinocoin flags disabled (rippling enabled).

Fortunately, `casinocoind` uses lazy evaluation to calculate the owner reserve. This means that even if an account changes the default state of all its trust lines by changing the DefaultCasinocoin flag, that account's reserve stays the same initially. If an account modifies a trust line, `casinocoind` re-evaluates whether that individual trust line is in its default state and should contribute the owner reserve.

### CasinocoinState ID Format

The ID of a CasinocoinState object is the [SHA-512Half](#sha512half) of the following values put together:

* The CasinocoinState space key (`0x0072`)
* The AccountID of the low account
* The AccountID of the high account
* The 160-bit currency code of the trust line(s)


## SignerList
[[Source]<br>](https://github.com/casinocoin/casinocoind/blob/4.0.1/src/casinocoin/protocol/impl/LedgerFormats.cpp#L127 "Source")

The `SignerList` object type represents a list of parties that, as a group, are authorized to sign a transaction in place of an individual account. You can create, replace, or remove a SignerList using the [SignerListSet transaction type](reference-transaction-format.html#signerlistset). This object type is introduced by the [MultiSign amendment](reference-amendments.html#multisign).

Example SignerList object:

```json
{
    "Flags": 0,
    "LedgerEntryType": "SignerList",
    "OwnerNode": "0000000000000000",
    "PreviousTxnID": "5904C0DC72C58A83AEFED2FFC5386356AA83FCA6A88C89D00646E51E687CDBE4",
    "PreviousTxnLgrSeq": 16061435,
    "SignerEntries": [
        {
            "SignerEntry": {
                "Account": "csA2LpzuawewSBQXkiju3YQTMzW13pAAdW",
                "SignerWeight": 2
            }
        },
        {
            "SignerEntry": {
                "Account": "caKEEVSGnKSD9Zyvxu4z6Pqpm4ABH8FS6n",
                "SignerWeight": 1
            }
        },
        {
            "SignerEntry": {
                "Account": "cUpy3eEg8rqjqfUoLeBnZkscbKbFsKXC3v",
                "SignerWeight": 1
            }
        }
    ],
    "SignerListID": 0,
    "SignerQuorum": 3,
    "index": "A9C28A28B85CD533217F5C0A0C7767666B093FA58A0F2D80026FCC4CD932DDC7"
}
```

A SignerList object has the following fields:

| Name            | JSON Type | Internal Type | Description |
|-----------------|-----------|---------------|-------------|
| `LedgerEntryType`   | String    | UInt16    | The value `0x0053`, mapped to the string `SignerList`, indicates that this object is a SignerList object. |
| `OwnerNode`       | String    | UInt64        | A hint indicating which page of the owner directory links to this object, in case the directory consists of multiple pages. |
| `SignerQuorum`    | Number    | UInt32        | A target number for signer weights. To produce a valid signature for the owner of this SignerList, the signers must provide valid signatures whose weights sum to this value or more. |
| `SignerEntries`   | Array     | Array         | An array of SignerEntry objects representing the parties who are part of this signer list. |
| `SignerListID`    | Number    | UInt32        | An ID for this signer list. Currently always set to `0`. If a future [amendment](concept-amendments.html) allows multiple signer lists for an account, this may change. |
| `PreviousTxnID`   | String    | Hash256       | The identifying hash of the transaction that most recently modified this object. |
| `PreviousTxnLgrSeq` | Number  | UInt32        | The [index of the ledger](#ledger-index) that contains the transaction that most recently modified this object. |

The `SignerEntries` may be any combination of funded and unfunded addresses that use either secp256k1 or ed25519 keys.

### SignerEntry Object

Each member of the `SignerEntries` field is an object that describes that signer in the list. A SignerEntry has the following fields:

| Name            | JSON Type | Internal Type | Description |
|-----------------|-----------|---------------|-------------|
| `Account`         | String    | AccountID     | An CSC Ledger address whose signature contributes to the multi-signature. It does not need to be a funded address in the ledger. |
| `SignerWeight`    | Number    | UInt16        | The weight of a signature from this signer. A multi-signature is only valid if the sum weight of the signatures provided meets or exceeds the SignerList's `SignerQuorum` value. |

When processing a multi-signed transaction, the server dereferences the `Account` values with respect to the ledger at the time of transaction execution. If the address _does not_ correspond to a funded [AccountRoot object](#accountroot), then only the master secret associated with that address can be used to produce a valid signature. If the account _does_ exist in the ledger, then it depends on the state of that account. If the account has a Regular Key configured, the Regular Key can be used. The account's master key can only be used if it is not disabled. A multi-signature cannot be used as part of another multi-signature.

### SignerLists and Reserves

A SignerList contributes to its owner's [reserve requirement](concept-reserves.html). The SignerList itself counts as two objects, and each member of the list counts as one. As a result, the total owner reserve associated with a SignerList is anywhere from 3 times to 10 times the reserve required by a single trust line ([CasinocoinState](#casinocoinstate)) in the ledger.

### SignerList ID Format

The ID of a SignerList object is the SHA-512Half of the following values put together:

* The CasinocoinState space key (`0x0053`)
* The AccountID of the owner of the SignerList
* The SignerListID (currently always `0`)


{% include 'snippets/casinocoind_versions.md' %}
{% include 'snippets/tx-type-links.md' %}
