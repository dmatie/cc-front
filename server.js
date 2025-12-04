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

// Build CSP directives with dynamic hashes
const scriptSrcDirectives = ["'self'", "https://cdn.jsdelivr.net", "'unsafe-hashes'"];
const styleSrcDirectives = ["'self'", "https://cdn.jsdelivr.net"];

// Add script hashes if any exist (Angular typically has none - all scripts are external)
if (cspHashes && cspHashes.scriptHashes.length > 0) {
  scriptSrcDirectives.push(...cspHashes.scriptHashes);
}

// Add style hashes if any exist
if (cspHashes && cspHashes.styleHashes.length > 0) {
  styleSrcDirectives.push(...cspHashes.styleHashes);
}

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: scriptSrcDirectives,
      styleSrc: styleSrcDirectives,
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
      connectSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://clientconnection-backend.victoriousmeadow-cdaaa30d.eastus.azurecontainerapps.io",
        "https://login.microsoftonline.com"
      ],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"]
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
    action: 'sameorigin'
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
