# Implementation Cheat Sheet

## Overview
CasinoCoin commands can be executed via the commandline daemon, json-rpc or a websocket connection.

**Note:** This document uses examples via the commandline.


## Important Information
* The public address (account_id) will always starts with a lowercase '`c`' instead of the uppercase '`C`' as used by classic casinocoin.
* The daemon is _NOT_ a wallet! So an exchange must safeguard its own private keys per account!


# Most used commands for exchanges
* [getbalance](#getbalance)
* [getnewaddress](#getnewaddress)
* [validateaddress](#validateaddress)
* [sendtoaddress](#sendtoaddress)
* [settxfee](#settxfee)
* [gettransaction](#gettransaction)


<br/>
<br/>

## getbalance

#### Command
<!-- MULTICODE_BLOCK_START -->
*Commandline*
```bash
#Syntax: account_info account [ledger_index|ledger_hash] [strict]
casinocoind --conf=/etc/casinocoind/casinocoind.cfg account_info c9Yc5KuDTbS5TrnrzLVR1eXTgy4KuqG23c validated
```
<!-- MULTICODE_BLOCK_END -->

[Try it! >](casinocoin-api-tool.html#account_info)

#### Output
```json
Loading: "/etc/casinocoind/casinocoind.cfg"
2017-Nov-10 15:40:04 HTTPClient:WRN setup_ServerHandlerparse_Portssetup_Clientsetup_Overlay
2017-Nov-10 15:40:04 HTTPClient:NFO Connecting to 127.0.0.1:5005

{
    "id" : 1,
    "result" : { 
        "account_data" : {
            "Account" : "c9Yc5KuDTbS5TrnrzLVR1eXTgy4KuqG23c", 
            "Balance" : "29500000000",
            "Flags" : 0,
            "LedgerEntryType" : "AccountRoot",
            "OwnerCount" : 0,
            "PreviousTxnID" : "55805B351F9DA423BC91433F65CB072594D26CD7C14C25FFEF729806BFB9E927", 
            "PreviousTxnLgrSeq" : 1940,
            "Sequence" : 1,
            "index" : "E210E2A7707A7BB7D6FD4781E1881F32CC1312EE9EE9C95A17C847364D05BA9D"
        },
        "ledger_hash" : "0A99A78A0E12E7BE6029D03AA07426B7119DB43EF6FD11A7A74BD424B3EF040B", 
        "ledger_index" : 3427,
        "status" : "success",
        "validated" : true
    } 
}
```

**Tip:** 
    - `Balance` is in satoshi<br/>
    - `PreviousTxnID` is the last TX from the account<br/>
    - `PreviousTxnLgrSeq` is the ledger in which the last TX was included<br/>
    - `Sequence` is the amount of transactions from the account (so only outgoing!)<br/>


## getnewaddress

#### Command
<!-- MULTICODE_BLOCK_START -->
*Commandline*
```bash
#Syntax: wallet_propose [passphrase]
casinocoind --conf=/etc/casinocoind/casinocoind.cfg wallet_propose
```
<!-- MULTICODE_BLOCK_END -->

#### Output
```json
Loading: "/etc/casinocoind/casinocoind.cfg"
2017-Nov-10 15:51:08 HTTPClient:WRN setup_ServerHandlerparse_Portssetup_Clientsetup_Overlay 2017-Nov-10 15:51:08 HTTPClient:NFO Connecting to 127.0.0.1:5005

{
    "id" : 1,
    "result" : {
        "account_id" : "c4jZZYa6JY2mzvPn7fpHDBmXNUYmgB6GV8",
        "key_type" : "secp256k1",
        "master_key" : "SLY SEEN ABUT NEWS MARC AWRY FUSS TAN HEWN ROCK WIND RIME", 
        "master_seed" : "shvPNL4dkk95bgaQSja6mrNqARdZB",
        "master_seed_hex" : "9FBF8F685EEAC787A074EBE11F19FB3C",
        "public_key" : "aB4MjSe4H1cwafsuXPDXs3oLqJKH6PBwiRBrcVgqW4xgAGFicPjP",
        "public_key_hex" : "0234C02110A6B2703C471F318DBC6108F43ABD9C2B40ED9FC9B3A6E780629C64DB", 
        "status" : "success"
    } 
}
```

**Tip:** 
    - `account_id` is the public address which always starts with a lowercase '`c`' instead of the uppercase '`C`' for the classic casinocoin<br/>
    - `master_seed is your secret necesarry to sign a transaction<br/>
    - running `wallet_propose` with the `master_seed` as input will result in the same output<br/>


## validateaddress

#### Command
<!-- MULTICODE_BLOCK_START -->
*Commandline*
```bash
#Syntax: account_info account [ledger_index|ledger_hash] [strict]
casinocoind --conf=/etc/casinocoind/casinocoind.cfg account_info c4jZZYa6JY2mzvPn7fpHDBmXNUYmgB6GV8 validated
```
<!-- MULTICODE_BLOCK_END -->

[Try it! >](casinocoin-api-tool.html#account_info)

#### Output
```json
Loading: "/etc/casinocoind/casinocoind.cfg"
2017-Nov-10 16:16:11 HTTPClient:WRN setup_ServerHandlerparse_Portssetup_Clientsetup_Overlay 2017-Nov-10 16:16:11 HTTPClient:NFO Connecting to 127.0.0.1:5005

{
    "id" : 1, 
    "result" : {
        "account" : "c4jZZYa6JY2mzvPn7fpHDBmXNUYmgB6GV8", 
        "error" : "actNotFound",
        "error_code" : 18,
        "error_message" : "Account not found.",
        "ledger_hash" : "36C0D7D7D6CBFAE98605D2D35E299B6F048874F7F9847AF23FAE26DDFF93E42F", 
        "ledger_index" : 3434,
        "request" : {
            "account" : "c4jZZYa6JY2mzvPn7fpHDBmXNUYmgB6GV8", 
            "command" : "account_info",
            "ledger_index" : "validated"
        },
        "status" : "error", 
        "validated" : true
    }
}
```

**Tip:** 
    - this command does not check the actual correctness of the address. it only shows if an account has been activated on the ledger by sending at least the minimal amount of coins to it. If not it shows `"error" : "actNotFound"`<br>
    - check the minimal account and fee requirements with the [`server_state`](reference-casinocoind.html#server-state) command -> `"reserve_base" : 1000000000` -> minimal amount of satoshi to activate an account<br>
    - if an exact check is needed it can be done by using a base58 check like for bitcoin but replacing it with the casinocoin alphabet<br>


## sendtoaddress

#### Command
<!-- MULTICODE_BLOCK_START -->
*Commandline*
```bash
#Syntax: sign secret tx_json [offline]
casinocoind --conf=/etc/casinocoind/casinocoind.cfg sign s████████████████████████ '{"TransactionType": "Payment", "Account": "cQsHT9fnGyAWzQKa7urb8FB6B6x9RaeTp2", "Destination": "c9Yc5KuDTbS5TrnrzLVR1eXTgy4KuqG23c", "Amount": "400000000", "Sequence": 1, "Fee": "100000"}' offline
```
<!-- MULTICODE_BLOCK_END -->

[Try it! >](casinocoin-api-tool.html#sign)

**Tip:**
    - `s████████████████████████` is the master_seed from the wallet_propose command<br/>
    - all amounts are in satoshis<br/>
    - the resulting tx_blob contains the binary representation of the fully-qualified, signed transaction, as hex - Next step is submitting the tx_blob:<br/>
    ```casinocoind --conf=/etc/casinocoind/casinocoind.cfg submit 1200002280000000240000000361D4838D7EA4C68000000000000000000555344****************```


## settxfee

**Tip:** This command does not exist at server level, if not added to a transaction it will use the blockchains default fee as returned with the [`server_state`](reference-casinocoind.html#server-state) command.


## gettransaction
The `tx` method retrieves information on a single transaction.

#### Command
<!-- MULTICODE_BLOCK_START -->
*Commandline*
```bash
#Syntax: tx transaction [binary]
casinocoind --conf=/etc/casinocoind/casinocoind.cfg tx 55805B351F9DA423BC91433F65CB072594D26CD7C14C25FFEF729806BFB9E927
```
<!-- MULTICODE_BLOCK_END -->

[Try it! >](casinocoin-api-tool.html#tx)


#### Output
```json
Loading: "/etc/casinocoind/casinocoind.cfg"
2017-Nov-10 16:27:43 HTTPClient:WRN setup_ServerHandlerparse_Portssetup_Clientsetup_Overlay 2017-Nov-10 16:27:43 HTTPClient:NFO Connecting to 127.0.0.1:5005

{
    "id": 1,
    "result": {
        "Account": "cQsHT9fnGyAWzQKa7urb8FB6B6x9RaeTp2",
        "Amount": "400000000",
        "Destination": "c9Yc5KuDTbS5TrnrzLVR1eXTgy4KuqG23c",
        "Fee": "100000",
        "Flags": 2147483648,
        "LastLedgerSequence": 1954,
        "Memos": [
            {
                "Memo": {
                    "MemoData": "746573742073656E64",
                    "MemoFormat": "706C61696E2F74657874"
                }
            }
        ],
        "Sequence": 1,
        "SigningPubKey": "02B358A1A875D7E983D561F25AD5D016B1C67A7F82701EE4D645A4AE79190C4606",
        "TransactionType": "Payment",
        "TxnSignature": "30440220345B82D6DB5C1D617C3D1E4965148270539CCDCBD4365F7EC928654F4784079202206FA5FB269EDA0F43CB E755305651F90FAC04530CEB74884DC428BFED764AAEF0",
        "date": 563197340,
        "hash": "55805B351F9DA423BC91433F65CB072594D26CD7C14C25FFEF729806BFB9E927",
        "inLedger": 1940,
        "ledger_index": 1940,
        "meta": {
            "AffectedNodes": [
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Account": "c9Yc5KuDTbS5TrnrzLVR1eXTgy4KuqG23c",
                            "Balance": "29500000000",
                            "Flags": 0,
                            "OwnerCount": 0,
                            "Sequence": 1
                        },
                        "LedgerEntryType": "AccountRoot",
                        "LedgerIndex": "E210E2A7707A7BB7D6FD4781E1881F32CC1312EE9EE9C95A17C847364D05BA9D",
                        "PreviousFields": {
                            "Balance": "29100000000"
                        },
                        "PreviousTxnID": "FF769D86885BD626AC2A9F1D64C93FBF95587848F0291189B662684C176F98CF",
                        "PreviousTxnLgrSeq": 1932
                    }
                },
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Account": "cQsHT9fnGyAWzQKa7urb8FB6B6x9RaeTp2",
                            "Balance": "1037899900000",
                            "Flags": 0,
                            "OwnerCount": 0,
                            "Sequence": 2
                        },
                        "LedgerEntryType": "AccountRoot",
                        "LedgerIndex": "E5A3C9E8B1A6594C55520A46AB904F4303ABE4D29F862C1781BE12043676E7EF",
                        "PreviousFields": {
                            "Balance": "1038300000000",
                            "Sequence": 1
                        },
                        "PreviousTxnID": "09A236E1622DB1FC1725CC8B6F41D4E24ABE8B42E1ECDD17C9C2FD38596F1E90",
                        "PreviousTxnLgrSeq": 1407
                    }
                }
            ],
            "TransactionIndex": 0,
            "TransactionResult": "tesSUCCESS",
            "delivered_amount": "400000000"
        },
        "status": "success",
        "validated": true
    }
}
```

**Tip:**
    - command returns full transaction details for the tx from `Account` to `Destination` for `Amount` and `Fee`<br/>
    - the `TransactionResult` only indicates if a transaction was successfully transmitted to the blockchain<br/>
    - when `"validated" : true` -> the transaction is final in the ledger -> so there is no need for waiting for extra confirmations as there are no changes possible anymore in the past (no Orphans exist on the new blockchain!)<br/>
    - please note that the date format differs from the default unix timestamp. It's an unsigned integer with the number of seconds since the CasinoCoin epoch: `January 1st, 2000 (00:00 UTC)`<br/>

#### Helpers
These are the JavaScript helper methods we use to do the conversions: 
```javascript
static casinocoinToUnixTimestamp(rpepoch: number): number {
    return (rpepoch + 0x386D4380) * 1000 
}
```
```javascript
static unixToCasinocoinTimestamp(timestamp: number): number { 
    return Math.round(timestamp / 1000) - 0x386D4380
}
```
```javascript
static casinocoinTimeToISO8601(casinocoinTime: number): string {
    return new Date(this.casinocoinToUnixTimestamp(casinocoinTime)).toISOString()
}
```
```javascript
static iso8601ToCasinocoinTime(iso8601: string): number {
    return this.unixToCasinocoinTimestamp(Date.parse(iso8601)) 
}
```
```javascript
static casinocoinTimeNow(): number {
    return this.unixToCasinocoinTimestamp(Date.now());
}
```