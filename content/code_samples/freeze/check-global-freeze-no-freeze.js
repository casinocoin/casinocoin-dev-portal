const {CasinocoinAPI} = require('casinocoin-libjs');

const api = new CasinocoinAPI({
  server: 'wss://ws01.casinocoin.org', // Public casinocoind server
  port: 4443
});
api.on('error', (errorCode, errorMessage) => {
  console.log(errorCode + ': ' + errorMessage);
});

const my_address = 'cf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn';

api.connect().then(() => {
  // Look up settings object
  return api.getSettings(my_address);
}).then(settings => {
  console.log('Got settings for address', my_address);
  console.log('Global Freeze enabled?',
              (settings.globalFreeze === true));
  console.log('No Freeze enabled?', (settings.noFreeze === true));

}).then(() => {
  return api.disconnect();
}).catch(console.error);
