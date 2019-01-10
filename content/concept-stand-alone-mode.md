# Stand-Alone Mode

You can run `casinocoind` in stand-alone mode without a consensus of trusted servers. In stand-alone mode, `casinocoind` does not communicate with any other servers in the CSC Ledger peer-to-peer network, but you can do most of the same actions on your local server only. Stand-alone provides a method for testing `casinocoind` behavior without being tied to the live network. For example, you can [test the effects of Amendments](concept-amendments.html#testing-amendments) before those Amendments have gone into effect across the decentralized network.

When you run `casinocoind` in stand-alone mode, you have to tell it what ledger version to start from:

* Create a [new genesis ledger](#new-genesis-ledger) from scratch.
* [Load an existing ledger version](#load-saved-ledger) from disk.

**Caution:** In stand-alone mode, you must [manually advance the ledger](#advancing-ledgers-in-stand-alone-mode).


## New Genesis Ledger

In stand-alone mode, you can have `casinocoind` create a new genesis ledger. This provides a known state, with none of the ledger history from the production CSC Ledger. (This is very useful for unit tests, among other things.)

* To start `casinocoind` in stand-alone mode with a new genesis ledger, use the [`-a`]() and [`--start`]() options:

```
casinocoind -a --start --conf=/path/to/casinocoind.cfg
```

In a genesis ledger, the [genesis address](concept-accounts.html#special-addresses) holds all 100 billion CSC. The keys of the genesis address are [hardcoded](https://github.com/casinocoin/casinocoind/blob/4.0.1/src/casinocoin/app/ledger/Ledger.cpp#L184) as follows:

**Address:** `cHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh`

**Secret:** `snoPBrXtMeMyMHUVTgbuqAfg1SUTb` ("masterpassphrase")

**Caution:** If you create a new genesis ledger, the hard-coded default [Reserve](concept-reserves.html) is **200 CSC** minimum for funding a new address, with an increment of **50 CSC** per object in the ledger. These values are higher than the current reserve requirements of the production network. (See also: [Fee Voting](concept-fee-voting.html))

If you start a new genesis ledger with `--start`, all The genesis ledger contains an [EnableAmendment pseudo-transaction](reference-transaction-format.html#enableamendment) to turn on all [Amendments](concept-amendments.html) natively supported by the `casinocoind` server, except for amendments that you explicitly disable in the configuration file. The effects of those amendments are available starting from the very next ledger version.


## Load Saved Ledger

You can start with a ledger version that was saved to disk if your `casinocoind` server was previously synced with the CSC Ledger peer-to-peer network (either the production network or the [Test Net](tutorial-casinocoind-setup.html#parallel-networks)).

### 1. Start `casinocoind` normally.

To load an existing ledger, you must first retrieve that ledger from the network. Start `casinocoind` in online mode as normal:

```
casinocoind --conf=/path/to/casinocoind.cfg
```

### 2. Wait until `casinocoind` is synced.

Use the [`server_info` command](reference-casinocoind.html#server-info) to check the state of your server relative to the network. Your server is synced when the `server_state` value shows any of the following values:

* `full`
* `proposing`
* `validating`

For more information, see [Possible Server States](reference-casinocoind.html#possible-server-states).

### 3. (Optional) Retrieve specific ledger versions.

If you only want the most recent ledger, you can skip this step.

If you want to load a specific historical ledger version, use the [`ledger_request` command](reference-casinocoind.html#ledger-request) to make `casinocoind` fetch it. If `casinocoind` does not already have the ledger version, you may have to run the `ledger_request` command multiple times until it has finished retrieving the ledger.

If you want to replay a specific historical ledger version, you must fetch both the ledger version to replay and the ledger version before it. (The previous ledger version sets up the initial state upon which you apply the changes described by the ledger version you replay.)

### 4. Shut down `casinocoind`.

Use the [`stop` command](reference-casinocoind.html#stop):

```
casinocoind stop --conf=/path/to/casinocoind.cfg
```

### 5. Start `casinocoind` in stand-alone mode.

To load the most recent ledger version, you can use the [`-a`]() and [`--load`]() options when starting the server:

```
casinocoind -a --load --conf=/path/to/casinocoind.cfg
```

To instead load a specific historical ledger, use the [`--load`]() parameter along with the `--ledger` parameter, providing the ledger index or identifying hash of the ledger version to load:

```
casinocoind -a --load --ledger 19860944 --conf=/path/to/casinocoind.cfg
```

### 6. Manually advance the ledger.

When you load a ledger with `--ledger` in stand-alone mode, it goes to the current open ledger, so you must [manually advance the ledger](#advancing-ledgers-in-stand-alone-mode):

```
casinocoind ledger_accept --conf=/path/to/casinocoind.cfg
```


## Advancing Ledgers in Stand-Alone Mode

In stand-alone mode, `casinocoind` does not communicate to other members of the peer-to-peer network or participate in a consensus process. Instead, you must manually advance the ledger index using the [`ledger_accept` command](reference-casinocoind.html#ledger-accept):

```
casinocoind ledger_accept --conf=/path/to/casinocoind.cfg
```

In stand-alone mode, `casinocoind` makes no distinction between a "closed" ledger version and a "validated" ledger version. (For more information about the difference, see [The CSC Ledger Consensus Process](concept-consensus.html).)

Whenever `casinocoind` closes a ledger, it reorders the transactions according to a deterministic but hard-to-game algorithm. (This is an important part of consensus, since transactions may arrive at different parts of the network in different order.) When using `casinocoind` in stand-alone mode, you should manually advance the ledger before submitting a transaction that depends on the result of a transaction from a different address. Otherwise, the two transactions might be executed in reverse order when the ledger is closed. **Note:** You can safely submit multiple transactions from a single address to a single ledger, because `casinocoind` sorts transactions from the same address in ascending order by [`Sequence` number](reference-transaction-format.html#common-fields).

{% include 'snippets/casinocoind_versions.md' %}
