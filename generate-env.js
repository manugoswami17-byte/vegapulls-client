const fs = require('fs');
const os = require('os');
const path = require('path');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIp();
const envPath = path.join(__dirname, '.env');  // <-- fixed path
const envContent = `REACT_APP_API_URL=http://${ip}:3001/api\n`;

fs.writeFileSync(envPath, envContent);
console.log(`✅ React .env file written to ${envPath}`);
console.log(`🌐 REACT_APP_API_URL=http://${ip}:3001/api`);
