// /backend/api/proxy.js

import httpProxy from 'http-proxy';

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

export default function handler(req, res) {
  const target = 'https://kliq-repo-backend.vercel.app'; // Replace with your target server for proxying

  // Forward the request to the target HTTPS server
  proxy.web(req, res, { target });
  console.log("PROXY WORKING");
}
