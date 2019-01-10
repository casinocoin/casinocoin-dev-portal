# Money in the CSC Ledger

The CSC Ledger is an advanced blockchain-like system that was designed to let people transact in multiple currencies. Users of the CSC Ledger can seamlessly track, trade, and settle multiple currencies in an exchange that's as decentralized as the network itself. Users can issue their own currency-like digital assets, which may or may not represent obligations owed outside the CSC Ledger. Tying it all together is CSC, the CSC Ledger's native cryptocurrency, which acts as a medium of exchange and serves anti-spam purposes.

## CSC

**CSC** is the native cryptocurrency of the CSC Ledger. All [accounts](concept-accounts.html) in the CSC Ledger can send CSC among one another and must hold a minimum amount of CSC as a [reserve](concept-reserves.html). CSC can be sent directly from any CSC Ledger address to any other, without needing a gateway or liquidity provider. This helps make CSC a convenient bridge currency.

Some advanced features of the CSC Ledger, such as [Escrow](concept-escrow.html) and [Payment Channels](tutorial-paychan.html), only work with CSC. Order book [autobridging]() uses CSC to deepen liquidity in the decentralized exchange by merging order books of two issued currencies with CSC order books to create synthetic combined order books. (For example, autobridging matches USD:CSC and CSC:EUR orders to augment USD:EUR order books.)

CSC also serves as a protective measure against spamming the network. All CSC Ledger addresses need a small amount of CSC to pay the costs of maintaining the CSC Ledger. The [transaction cost](concept-transaction-cost.html) and [reserve](concept-reserves.html) are neutral fees denominated in CSC and not paid to any party. In the ledger's data format, CSC is stored in [AccountRoot objects](reference-ledger-format.html#accountroot).

For more information on CSC's use cases, benefits, and news, see the [CSC Portal]().

### CSC Properties

The very first ledger contained 100 billion CSC, and no new CSC can be created. CSC can be destroyed by [transaction costs](concept-transaction-cost.html) or lost by sending it to addresses for which no one holds a key, so CSC is slightly [deflationary](https://en.wikipedia.org/wiki/Deflation) by nature. No need to worry about running out, though: at the current rate of destruction, it would take at least 70,000 years to destroy all CSC, and CSC [prices and fees can be adjusted](concept-fee-voting.html) as the total supply of CSC changes.

In technical contexts, CSC is measured precisely to the nearest 0.00000001 CSC, called a "drop" of CSC. The [`casinocoind` APIs](reference-casinocoind.html) require all CSC amounts to be specified in drops of CSC. For example, 1 CSC is represented as `100000000` drops. For more detailed information, see the [currency format reference](reference-currency.html).

## Issued Currencies

All currencies other than CSC are represented as **issued currencies**. These digital assets (sometimes called "issuances" or "IOUs") are tracked in accounting relationships, called "trust lines," between addresses. Issued currencies are typically considered as liabilities from one perspective and assets from the other, so the balance of a trust line is negative or positive depending on which side you view it from. Any address may freely issue (non-CSC) currencies, limited only by how much other addresses are willing to hold.

Issued currencies can "casinocoin" through multiple issuers and holders if they use the same currency code. This is useful in some cases, but can cause unexpected and undesirable behavior in others. You can use the [NoCasinocoin flag](concept-nocasinocoin.html) on trust lines to prevent those trust lines from rippling.

Issued currencies can be traded with CSC or each other in the CSC Ledger's decentralized exchange.

In the typical model, an issued currency is tied to holdings of currency or other assets outside the CSC Ledger. The issuer of the currency, called a _gateway_, handles deposits and withdrawals to exchange currency outside the CSC Ledger for equivalent balances of issued currency in the CSC Ledger. For more information on how to run a gateway, see the [Gateway Guide](tutorial-gateway-guide.html).

There are other use cases for issued currencies in the CSC Ledger. For example, you can create an "Initial Coin Offering" (ICO) by issuing a fixed amount of currency to a secondary address, then "throwing away the key" to the issuer.

**Warning:** ICOs may be [regulated as securities](https://www.sec.gov/oiea/investor-alerts-and-bulletins/ib_coinofferings) in the USA.

CasinoCoin strongly recommends researching the relevant regulations before engaging in any financial service business.

### Issued Currency Properties

All issued currencies in the CSC Ledger exist in trust lines, represented in the ledger's data as [CasinocoinState objects](reference-ledger-format.html#casinocoinstate). To create an issued currency, the issuing address sends a [Payment transaction][] to an address which has a trust line to the issuer with a nonzero limit for that currency. (You can also create issued currency by rippling "through" such a trust line.) You can erase issued currency by sending it back to the issuer.

The issuer of a currency can define a percentage [transfer fee](concept-transfer-fees.html) to deduct when two parties transact in its issued currencies.

Addresses can also [freeze](concept-freeze.html) issued currencies, which may be useful for businesses to comply with financial regulations in their jurisdiction. If you do not need this feature and do not want to freeze currencies, you can give up your address's ability to freeze individual trust lines and to undo a global freeze. CSC cannot be frozen.

Issued currencies are designed to be able to represent any kind of currency or asset, including those with very small or very large nominal values. For detailed technical information on the types of currency codes and the numeric limits of issued currency representation, see the [currency format reference](reference-currency.html).

{% include 'snippets/tx-type-links.md' %}
