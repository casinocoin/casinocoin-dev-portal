//---------- List of requests ------------------------//
// Must be loaded after apitool-rest.js //
//var DOC_BASE = "reference-rippled.html";
//var URL_BASE = "https://ws01.casinocoin.org:51234";

var DEFAULT_ADDRESS_1 = "cDarPNJEpCnpBZSfmcquydockkePkjPGA2";
var KRW_TRADER_ADDRESS = "csyDrDi9Emy6vPU78qdxovmNpmj5Qh4NKw";
var JPY_TRADER_ADDRESS = "cK5j9n8baXfL4gzUoZsfxBvvsv97P5swaV";
var DEFAULT_HASH = "9D591B18EDDD34F0B6CF4223A2940AEA2C3CC778925BABF289E0011CD8FA056E";
var DEFAULT_LEDGER = "3170DA37CE2B7F045F889594CBC323D88686D2E90E8FFD2BBCD9BAD12E416DB5";

// general methods -----------------------------------//

Request("ACCOUNT INFORMATION");

Request('account_currencies', {
    method: POST,
    path: "/",
    description: "Retrieves a simple list of currencies that an account can send or receive, based on its trust lines.",
    link: "#account-currencies",
    params: {},
    body: {
        "method": "account_currencies",
        "params": [
            {
                "account": "cDarPNJEpCnpBZSfmcquydockkePkjPGA2",
                "account_index": 0,
                "ledger_index": "validated",
                "strict": true
            }
        ]
    }
});

