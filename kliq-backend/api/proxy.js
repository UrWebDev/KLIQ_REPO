import httpProxy from 'http-proxy';
import dotenv from 'dotenv'; // Import dotenv

// Load environment variables from the .env file
dotenv.config();

const proxy = httpProxy.createProxyServer({});
const TARGET_SERVER = process.env.TARGET_SERVER; // Get the target server URL from the environment variable

export default function handler(req, res) {
  // Prevent infinite loop by checking if the request is already for the proxy endpoint
  if (req.url.startsWith('/api/proxy')) {
    return res.status(400).json({ error: "Infinite loop detected" });
  }

  if (!TARGET_SERVER) {
    return res.status(500).json({ error: 'Target server is not set' });
  }

  console.log(`Proxying request to: ${TARGET_SERVER}${req.url}`);

  proxy.web(req, res, { target: TARGET_SERVER, changeOrigin: true }, (err) => {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed" });
  });
}