const express = require('express');
const path = require('path');
const helmet = require('helmet');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 8080;

app.disable('x-powered-by');

// Load CSP hashes dynamically
function loadCSPHashes() {
  const hashFile = path.join(__dirname, 'csp-hashes.json');

  if (fs.existsSync(hashFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(hashFile, 'utf-8'));
      console.log(`✓ Loaded CSP hashes (generated: ${data.generatedAt})`);
      console.log(`  - Script hashes: ${data.scriptHashes.length}`);
      console.log(`  - Style hashes: ${data.styleHashes.length}`);
      return data;
    } catch (error) {
      console.warn('⚠ Failed to load CSP hashes, using fallback unsafe-inline/unsafe-eval');
      return null;
    }
  } else {
    console.warn('⚠ CSP hashes file not found, using fallback unsafe-inline/unsafe-eval');
    return null;
  }
}

const cspHashes = loadCSPHashes();

// Force HTTPS redirect in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Build CSP directives with dynamic hashes or fallback
const scriptSrcDirectives = ["'self'"];
const styleSrcDirectives = ["'self'"];

if (cspHashes && cspHashes.scriptHashes.length > 0) {
  scriptSrcDirectives.push("'unsafe-hashes'", "'unsafe-eval'", ...cspHashes.scriptHashes);
} else {
  scriptSrcDirectives.push("'unsafe-inline'", "'unsafe-eval'");
}

if (cspHashes && cspHashes.styleHashes.length > 0) {
  styleSrcDirectives.push("'unsafe-hashes'", ...cspHashes.styleHashes);
} else {
  styleSrcDirectives.push("'unsafe-inline'");
}

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: scriptSrcDirectives,
      styleSrc: styleSrcDirectives,
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: [
        "'self'",
        "https://*.azurewebsites.net",
        "https://login.microsoftonline.com",
        "https://*.msauth.net",
        "https://*.msftauth.net"
      ],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: false
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  noSniff: true,
  frameguard: {
    action: 'deny'
  },
  xssFilter: false,
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none'
  }
}));

// Additional Permissions-Policy header
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()'
  );
  next();
});

app.use(express.static(path.join(__dirname, 'dist/ccapp/browser')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/ccapp/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
