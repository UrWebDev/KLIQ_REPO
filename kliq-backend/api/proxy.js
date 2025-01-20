// /backend/api/proxy.js

const httpProxy = require('http-proxy');

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

module.exports = (req, res) => {
  const target = 'https://kliq-repo-backend.vercel.app'; // Replace with your target server for proxying

  // Forward the request to the target HTTPS server
  proxy.web(req, res, { target });
};
