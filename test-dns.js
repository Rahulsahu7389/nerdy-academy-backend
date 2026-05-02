const dns = require('dns');

const host = '_mongodb._tcp.cluster0.mongodb.net';

dns.resolveSrv(host, (err, addresses) => {
  if (err) {
    console.error('DNS SRV Resolution Error:', err);
  } else {
    console.log('DNS SRV Resolution Success:', addresses);
  }
});

dns.lookup('cluster0.mongodb.net', (err, address, family) => {
  if (err) {
    console.error('DNS Lookup Error:', err);
  } else {
    console.log('DNS Lookup Success:', address);
  }
});
