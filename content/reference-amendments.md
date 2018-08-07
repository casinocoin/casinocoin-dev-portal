# Known Amendments
[[Source]<br>](https://github.com/casinocoin/casinocoind/blob/master/src/casinocoin/app/main/Amendments.cpp "Source")

The following is a comprehensive list of all known amendments and their status on the production CSC Ledger:

| Name                      | Introduced | Status                              |
|:--------------------------|:-----------|:------------------------------------|
| [FlowCross][]             | v0.70.0    | [Planned: TBD]( "BADGE_LIGHTGREY") |
| [SHAMapV2][]              | v0.33.0    | [Planned: TBD]( "BADGE_LIGHTGREY") |
| [Checks][]                | TBD        | [Planned: TBD]( "BADGE_LIGHTGREY") |
| [CryptoConditionsSuite][] | TBD        | [Planned: TBD]( "BADGE_LIGHTGREY") |
| [DepositAuth][]           | TBD        | [Planned: TBD]( "BADGE_LIGHTGREY") |
| [OwnerPaysFee][]          | TBD        | [Planned: TBD]( "BADGE_LIGHTGREY") |
| [Tickets][]               | TBD        | [Planned: TBD]( "BADGE_LIGHTGREY") |
| [fix1201][]               | v0.80.0    | [Enabled: 2017-11-14]( "BADGE_GREEN") |
| [fix1512][]               | v0.80.0    | [Enabled: 2017-11-14]("BADGE_GREEN") |
| [fix1523][]               | v0.80.0    | [Enabled: 2017-11-14]( "BADGE_GREEN") |
| [fix1528][]               | v0.80.0    | [Enabled: 2017-11-14]( "BADGE_GREEN") |
| [SortedDirectories][]     | v0.80.0    | [Enabled: 2017-11-14]( "BADGE_GREEN") |
| [EnforceInvariants][]     | v0.70.0    | [Enabled: 2017-07-07]( "BADGE_GREEN") |
| [fix1373][]               | v0.70.0    | [Enabled: 2017-07-07]( "BADGE_GREEN") |
| [Escrow][]                | v0.60.0    | [Enabled: 2017-03-31]( "BADGE_GREEN") |
| [fix1368][]               | v0.60.0    | [Enabled: 2017-03-31]("BADGE_GREEN") |
| [PayChan][]               | v0.33.0    | [Enabled: 2017-03-31]( "BADGE_GREEN") |
| [TickSize][]              | v0.50.0    | [Enabled: 2017-02-21]( "BADGE_GREEN") |
| [CryptoConditions][]      | v0.50.0    | [Enabled: 2017-01-03]("BADGE_GREEN") |
| [Flow][]                  | v0.33.0    | [Enabled: 2016-10-21]( "BADGE_GREEN") |
| [TrustSetAuth][]          | v0.30.0    | [Enabled: 2016-07-19]( "BADGE_GREEN") |
| [MultiSign][]             | v0.31.0    | [Enabled: 2016-06-27]( "BADGE_GREEN") |
| [FeeEscalation][]         | v0.31.0    | [Enabled: 2016-05-19]( "BADGE_GREEN") |
| [FlowV2][]                | v0.32.1    | [Vetoed: Removed in v0.33.0]("BADGE_RED") |
| [SusPay][]                | v0.31.0    | [Vetoed: Removed in v0.60.0]("BADGE_RED") |

**Note:** In many cases, an incomplete version of the code for an amendment is present in previous versions of the software. The "Introduced" version in the table above is the first stable version. The value "TBD" indicates that the amendment is not yet considered stable.

## Checks
[Checks]: #checks

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| 157D2D480E006395B76F948E3E07A45A05FE10230D88A7993C71F97AE4B1F2D1 | In Development |

Introduces "Checks" to the CSC Ledger. Checks work similarly to personal paper checks. The sender signs a transaction to create a Check for a specific maximum amount and destination. Later, the destination can cash the Check to receive up to the specified amount. The actual movement of money only occurs when the Check is cashed, so cashing the Check may fail depending on the sender's current balance and the available liquidity. If cashing the Check fails, the Check object remains in the ledger so it may be successfully cashed later.

The sender or the receiver can cancel a Check at any time before it is cashed. A Check can also have an expiration time, after which it cannot be cashed, and anyone can cancel it.

Introduces three new transaction types: CheckCreate, CheckCancel, and CheckCash, and a new ledger object type, Check. Adds a new transaction result code, `tecEXPIRED`, which occurs when trying to create a Check whose expiration time is in the past.

This amendment also changes the OfferCreate transaction to return `tecEXPIRED` when trying to create an Offer whose expiration time is in the past. Without this amendment, an OfferCreate whose expiration time is in the past returns `tesSUCCESS` but does not create or execute an Offer.


## CryptoConditions
[CryptoConditions]: #cryptoconditions

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| 1562511F573A19AE9BD103B5D6B9E01B3B46805AEC5D3C4805C902B514399146 | Enabled   |

Although this amendment is enabled, it has no effect unless the [SusPay](#suspay) amendment is also enabled. CasinoCoin does not expect SusPay to become enabled. Instead, CasinoCoin plans to incorporate crypto-conditions in the [Escrow](#escrow) amendment.



## CryptoConditionsSuite
[CryptoConditionsSuite]: #cryptoconditionssuite

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| 86E83A7D2ECE3AD5FA87AB2195AE015C950469ABF0B72EAACED318F74886AE90 | In Development |

Implements several types of crypto-conditions from the official [crypto-conditions specification](https://tools.ietf.org/html/draft-thomas-crypto-conditions-03) for use in [EscrowCreate][] and [EscrowFinish][] transactions. Without this amendment, only the PREIMAGE-SHA-256 type is supported.

**Caution:** This amendment is still [in development](https://github.com/casinocoin/casinocoind/pull/2170). The version from `casinocoind` v0.60.0 to present does not implement the full functionality.



## DepositAuth
[DepositAuth]: #depositauth

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| F64E1EABBE79D55B3BB82020516CEC2C582A98A6BFE20FBE9BB6A0D233418064 | In Development |

Adds a new account flag, `DepositAuth`, which lets an account strictly reject any incoming money from transactions sent by other accounts. Businesses can use this flag to comply with strict regulations that require due diligence before receiving money from any source.

When an account enables this flag, Payment transactions fail if the account is the destination, regardless of whether the Payment would have delivered CSC or an issued currency. EscrowFinish and PaymentChannelClaim transactions fail if the account is the destination unless the destination account itself sends those transactions. If the [Checks][] amendment is enabled, the account can receive CSC or issued currencies by sending CheckCash transactions.

As an exception, accounts with `DepositAuth` enabled can receive Payment transactions for small amounts of CSC (equal or less than the minimum [account reserve](concept-reserves.html)) if their current CSC balance is below the account reserve.


## EnforceInvariants
[EnforceInvariants]: #enforceinvariants

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| DC9CA96AEA1DCF83E527D1AFC916EFAF5D27388ECA4060A88817C1238CAEE0BF | Enabled   |

Adds sanity checks to transaction processing to ensure that certain conditions are always met. This provides an extra, independent layer of protection against bugs in transaction processing that could otherwise cause exploits and vulnerabilities in the CSC Ledger. CasinoCoin expects to add more invariant checks in future versions of `casinocoind` without additional amendments.

Introduces two new transaction error codes, `tecINVARIANT_FAILED` and `tefINVARIANT_FAILED`. Changes transaction processing to add the new checks.

Examples of invariant checks:

- The total amount of CSC destroyed by a transaction must match the [transaction cost](concept-transaction-cost.html) exactly.
- CSC cannot be created.
- [`AccountRoot` objects in the ledger](reference-ledger-format.html#accountroot) cannot be deleted. (See also: [Permanence of Accounts](concept-accounts.html#permanence-of-accounts).)
- [An object in the ledger](reference-ledger-format.html#ledger-object-types) cannot change its type. (The `LedgerEntryType` field is immutable.)
- There cannot be a trust line for CSC.



## Escrow
[Escrow]: #escrow

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| 07D43DCE529B15A10827E5E04943B496762F9A88E3268269D69C44BE49E21104 | Enabled   |

Replaces the [SusPay](#suspay) and [CryptoConditions](#cryptoconditions) amendments.

Provides "suspended payments" for CSC for escrow within the CSC Ledger, including support for [Interledger Protocol Crypto-Conditions](https://tools.ietf.org/html/draft-thomas-crypto-conditions-02). Creates a new ledger object type for suspended payments and new transaction types to create, execute, and cancel suspended payments.




## FeeEscalation
[FeeEscalation]: #feeescalation

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| 42426C4D4F1009EE67080A9B7965B44656D7714D104A72F9B4369F97ABF044EE | Enabled   |

Changes the way the [transaction cost](concept-transaction-cost.html) applies to proposed transactions. Modifies the consensus process to prioritize transactions that pay a higher transaction cost. <!-- STYLE_OVERRIDE: prioritize -->

This amendment introduces a fixed-size transaction queue for transactions that were not able to be included in the previous consensus round. If the `casinocoind` servers in the consensus network are under heavy load, they queue the transactions with the lowest transaction cost for later ledgers. Each consensus round prioritizes transactions from the queue with the largest transaction cost (`Fee` value), and includes as many transactions as the consensus network can process. If the transaction queue is full, transactions drop from the queue entirely, starting with the ones that have the lowest transaction cost.

While the consensus network is under heavy load, legitimate users can pay a higher transaction cost to make sure their transactions get processed. The situation persists until the entire backlog of cheap transactions is processed or discarded.

A transaction remains in the queue until one of the following happens:

* It gets applied to a validated ledger (regardless of success or failure)
* It becomes invalid (for example, the [`LastLedgerSequence`](reference-transaction-format.html#lastledgersequence) causes it to expire)
* It gets dropped because there are too many transactions in the queue with a higher transaction cost.


## fix1201
[fix1201]: #fix1201

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| B4D44CC3111ADD964E846FC57760C8B50FFCD5A82C86A72756F6B058DDDF96AD | Enabled   |

Correctly implements a limit on [transfer fees](concept-transfer-fees.html) to a 100% fee, represented by a maximum `TransferRate` value of `2000000000`. (A 100% fee in this case means you must send 2 units of the issued currency for every 1 unit you want to deliver.) Without the amendment, the effective limit is a `TransferRate` value of 2<sup>32</sup>-1, for approximately a 329% fee.

With this amendment enabled, an [AccountSet][] transaction that attempts to set `TransferRate` higher than `2000000000` fails with the result code `temBAD_TRANSFER_RATE`. Any existing `TransferRate` which was set to a higher value under the previous rules continues to apply at the higher rate.



## fix1368
[fix1368]: #fix1368

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| E2E6F2866106419B88C50045ACE96368558C345566AC8F2BDF5A5B5587F0E6FA | Enabled   |

Fixes a minor bug in transaction processing that causes some payments to fail when they should be valid. Specifically, during payment processing, some payment steps that are expected to produce a certain amount of currency may produce a microscopically different amount, due to a loss of precision related to floating-point number representation. When this occurs, those payments fail because they cannot deliver the exact amount intended. The fix1368 amendment corrects transaction processing so payments can no longer fail in this manner.


## fix1373
[fix1373]: #fix1373

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| 42EEA5E28A97824821D4EF97081FE36A54E9593C6E4F20CBAE098C69D2E072DC | Enabled   |

Fixes a minor bug in transaction processing that causes failures when trying to prepare certain [payment paths](concept-paths.html) for processing. As a result, payments could not use certain paths that should have been valid but were invalidly prepared. Without this amendment, those payments are forced to use less-preferable paths or may even fail.

The fix1373 amendment corrects the issue so that the paths are properly prepared and payments can use them. It also disables some inappropriate paths that are currently allowed, including paths whose [steps](concept-paths.html#path-specifications) include conflicting fields and paths that loop through the same object more than once.


## fix1512
[fix1512]: #fix1512

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| 6C92211186613F9647A89DFFBAB8F94C99D4C7E956D495270789128569177DA1 | Enabled   |

Fixes a bug in transaction processing that causes some invalid [PaymentChannelClaim][] transactions to fail with the wrong error code. Without this amendment, the transactions have a `tec`-class result code despite not being included in a ledger and therefore not paying the [transaction cost](concept-transaction-cost.html).

With this amendment, the transactions fail with a more appropriate result code, `temBAD_AMOUNT`, instead.


## fix1523
[fix1523]: #fix1523

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| B9E739B8296B4A1BB29BE990B17D66E21B62A300A909F25AC55C22D6C72E1F9D | Enabled   |

Adds tracking by destination account to [escrows](concept-escrow.html). Without this amendment, pending escrows are only tracked by sender. This amendment makes it possible to look up pending escrows by the destination address using the [`account_objects` command](reference-casinocoind.html#account-objects), excluding any pending escrows that were created before this amendment became enabled. This amendment also makes [EscrowCreate transactions][] appear in the destination's transaction history, as viewed with the [`account_tx` command](reference-casinocoind.html#account-tx).

With this amendment, new escrows are added to the [owner directories](reference-ledger-format.html#directorynode) of both the sender and receiver. This amendment also adds a new `DestinationNode` field to [Escrow ledger objects](reference-ledger-format.html#escrow), indicating which page of the destination's owner directory contains the escrow.



## fix1528
[fix1528]: #fix1528

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| 1D3463A5891F9E589C5AE839FFAC4A917CE96197098A1EF22304E1BC5B98A454 | Enabled   |

Fixes a bug where validators could build consensus ledgers with different timestamps, potentially delaying the process of declaring validated ledgers. The circumstances for this to occur require precise timing, so validators are unlikely to encounter this bug outside of controlled test conditions.

This amendment changes how validators negotiate the close time of the consensus ledger so that they cannot reach a consensus on ledger contents but build ledger versions with different timestamps.



## Flow
[Flow]: #flow

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| 740352F2412A9909880C23A559FCECEDA3BE2126FED62FC7660D628A06927F11 | Enabled   |

Replaces the payment processing engine with a more robust and efficient rewrite called the Flow engine. The new version of the payment processing engine is intended to follow the same rules as the old one, but occasionally produces different results due to floating point rounding. This Amendment supersedes the [FlowV2]() amendment.

The Flow Engine also makes it easier to improve and expand the payment engine with further Amendments.



## FlowCross
[FlowCross]: #flowcross

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| 3012E8230864E95A58C60FD61430D7E1B4D3353195F2981DC12B0C7C0950FFAC | Released but not enabled |

Streamlines the offer crossing logic in the CSC Ledger's decentralized exchange. Uses the updated code from the [Flow](#flow) amendment to power offer crossing, so [OfferCreate transactions][] and [Payment transactions][] share more code. This has subtle differences in how offers are processed:

- Rounding is slightly different in some cases.
- Due to differences in rounding, some combinations of offers may be ranked higher or lower than by the old logic, and taken preferentially.
- The new logic may delete more or fewer offers than the old logic. (This includes cases caused by differences in rounding and offers that were incorrectly removed as unfunded by the old logic.)


## MultiSign
[MultiSign]: #multisign

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| 4C97EBA926031A7CF7D7B36FDE3ED66DDA5421192D63DE53FFB46E43B9DC8373 | Enabled   |

Introduces [multi-signing](reference-transaction-format.html#multi-signing) as a way to authorize transactions. Creates the [`SignerList` ledger object type](reference-ledger-format.html#signerlist) and the [`SignerListSet` transaction type](reference-transaction-format.html#signerlistset). Adds the optional `Signers` field to all transaction types. Modifies some transaction result codes.

This amendment allows addresses to have a list of signers who can authorize transactions from that address in a multi-signature. The list has a quorum and 1 to 8 weighted signers. This allows various configurations, such as "any 3-of-5" or "signature from A plus any other two signatures."

Signers can be funded or unfunded addresses. Funded addresses in a signer list can sign using a regular key (if defined) or master key (unless disabled). Unfunded addresses can sign with a master key. Multi-signed transactions have the same permissions as transactions signed with a regular key.

An address with a SignerList can disable the master key even if a regular key is not defined. An address with a SignerList can also remove a regular key even if the master key is disabled. The `tecMASTER_DISABLED` transaction result code is renamed `tecNO_ALTERNATIVE_KEY`. The `tecNO_REGULAR_KEY` transaction result is retired and replaced with `tecNO_ALTERNATIVE_KEY`. Additionally, this amendment adds the following new [transaction result codes](reference-transaction-format.html#result-categories):

* `temBAD_SIGNER`
* `temBAD_QUORUM`
* `temBAD_WEIGHT`
* `tefBAD_SIGNATURE`
* `tefBAD_QUORUM`
* `tefNOT_MULTI_SIGNING`
* `tefBAD_AUTH_MASTER`



## OwnerPaysFee
[OwnerPaysFee]: #ownerpaysfee

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| 9178256A980A86CF3D70D0260A7DA6402AAFE43632FDBCB88037978404188871 | In development |

Fixes an inconsistency in the way [transfer fees](concept-transfer-fees.html) are calculated between [OfferCreate](reference-transaction-format.html#offercreate) and [Payment](reference-transaction-format.html#payment) transaction types. Without this amendment, the holder of the issuances pays the transfer fee if an offer is executed in offer placement, but the initial sender of a transaction pays the transfer fees for offers that are executed as part of payment processing. With this amendment, the holder of the issuances always pays the transfer fee, regardless of whether the offer is executed as part of a Payment or an OfferCreate transaction. Offer processing outside of payments is unaffected.

This Amendment requires the [Flow Amendment](#flow) to be enabled.

**Note:** An incomplete version of this amendment was introduced in v0.33.0 and removed in v0.80.0. (It was never enabled.) CasinoCoin plans to re-add the amendment when the code is stable enough.



## PayChan
[PayChan]: #paychan

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| 08DE7D96082187F6E6578530258C77FAABABE4C20474BDB82F04B021F1A68647 | Enabled   |

Creates "Payment Channels" for CSC. Payment channels are a tool for facilitating repeated, unidirectional payments or temporary credit between two parties. CasinoCoin expects this feature to be useful for the [Interledger Protocol](https://interledger.org/). One party creates a Payment Channel and sets aside some CSC in that channel for a predetermined expiration. Then, through off-ledger secure communications, the sender can send "Claim" messages to the receiver. The receiver can redeem the Claim messages before the expiration, or choose not to in case the payment is not needed. The receiver can verify Claims individually without actually distributing them to the network and waiting for the consensus process to redeem them, then redeem the batched content of many small Claims later, as long as it is within the expiration.

Creates three new transaction types:[PaymentChannelCreate][], [PaymentChannelClaim][], and [PaymentChannelFund][]. Creates a new ledger object type, [PayChannel](reference-ledger-format.html#paychannel). Defines an off-ledger data structure called a `Claim`, used in the ChannelClaim transaction. Creates new `casinocoind` API methods: [`channel_authorize`](reference-casinocoind.html#channel-authorize) (creates a signed Claim), [`channel_verify`](reference-casinocoind.html#channel-verify) (verifies a signed Claim), and [`account_channels`](reference-casinocoind.html#account-channels) (lists Channels associated with an account).

For more information, see the [Payment Channels Tutorial](tutorial-paychan.html).



## SHAMapV2
[SHAMapV2]: #shamapv2

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| C6970A8B603D8778783B61C0D445C23D1633CCFAEF0D43E7DBCD1521D34BD7C3 | Released but not enabled |

Changes the hash tree structure that `casinocoind` uses to represent a ledger. The new structure is more compact and efficient than the previous version. This affects how ledger hashes are calculated, but has no other user-facing consequences.

When this amendment is activated, the CSC Ledger will undergo a brief scheduled unavailability while the network calculates the changes to the hash tree structure. <!-- STYLE_OVERRIDE: will -->



## SortedDirectories
[SortedDirectories]: #sorteddirectories

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| CC5ABAE4F3EC92E94A59B1908C2BE82D2228B6485C00AFF8F22DF930D89C194E | Enabled   |

Sorts the entries in [DirectoryNode ledger objects](reference-ledger-format.html#directorynode) and fixes a bug that occasionally caused pages of owner directories not to be deleted when they should have been.

**Warning:** Older versions of `casinocoind` that do not know about this amendment may crash when they encounter a DirectoryNode sorted by the new rules. To avoid this problem, [upgrade](tutorial-casinocoind-setup.html#updating-casinocoind) to `casinocoind` version 0.80.0 or later.




## SusPay
[SusPay]: #suspay

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| DA1BD556B42D85EA9C84066D028D355B52416734D3283F85E216EA5DA6DB7E13 | Enabled on TestNet; not intended for production. |

This amendment is currently enabled on the [CasinoCoin Test Net](https://casinocoin.org/build/casinocoin-test-net/). In production, CasinoCoin expects to enable similar functionality with the [Escrow](#escrow) amendment instead.



## Tickets
[Tickets]: #tickets

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| C1B8D934087225F509BEB5A8EC24447854713EE447D277F69545ABFA0E0FD490 | In development |

Introduces Tickets as a way to reserve a transaction sequence number for later execution. Creates the `Ticket` ledger object type and the transaction types `TicketCreate` and `TicketCancel`.

**Caution:** This amendment is still in development.



## TickSize
[TickSize]: #ticksize

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| 532651B4FD58DF8922A49BA101AB3E996E5BFBF95A913B3E392504863E63B164 | Enabled   |

Changes the way [Offers](reference-transaction-format.html#lifecycle-of-an-offer) are ranked in order books, so that currency issuers can configure how many significant digits are taken into account when ranking Offers by exchange rate. With this amendment, the exchange rates of Offers are rounded to the configured number of significant digits, so that more Offers have the same exact exchange rate. The intent of this change is to require a meaningful improvement in price to outrank a previous Offer. If used by major issuers, this should reduce the incentive to spam the ledger with Offers that are only a tiny fraction of a percentage point better than existing offers. It may also increase the efficiency of order book storage in the ledger, because Offers can be grouped into fewer exchange rates.

Introduces a `TickSize` field to accounts, which can be set with the [AccountSet transaction type](reference-transaction-format.html#accountset). If a currency issuer sets the `TickSize` field, the CSC Ledger truncates the exchange rate (ratio of funds in to funds out) of Offers to trade the issuer's currency, and adjusts the amounts of the Offer to match the truncated exchange rate. If only one currency in the trade has a `TickSize` set, that number of significant digits applies. When trading two currencies that have different `TickSize` values, whichever `TickSize` indicates the fewest significant digits applies. CSC does not have a `TickSize`.



## TrustSetAuth
[TrustSetAuth]: #trustsetauth

| Amendment ID                                                     | Status    |
|:-----------------------------------------------------------------|:----------|
| 6781F8368C4771B83E8B821D88F580202BCB4228075297B19E4FDC5233F1EFDC | Enabled   |

Allows pre-authorization of accounting relationships (zero-balance trust lines) when using [Authorized Accounts](tutorial-gateway-guide.html#authorized-accounts).

With this amendment enabled, a `TrustSet` transaction with [`tfSetfAuth` enabled](reference-transaction-format.html#trustset-flags) can create a new [`CasinocoinState` ledger object](reference-ledger-format.html#casinocoinstate) even if it keeps all the other values of the `CasinocoinState` node in their default state. The new `CasinocoinState` node has the [`lsfLowAuth` or `lsfHighAuth` flag](reference-ledger-format.html#casinocoinstate-flags) enabled, depending on whether the sender of the transaction is considered the low node or the high node. The sender of the transaction must have already enabled [`lsfRequireAuth`](reference-ledger-format.html#accountroot-flags) by sending an [AccountSet transaction](reference-transaction-format.html#accountset) with the [asfRequireAuth flag enabled](reference-transaction-format.html#accountset-flags).


{% include 'snippets/casinocoind_versions.md' %}
{% include 'snippets/tx-type-links.md' %}