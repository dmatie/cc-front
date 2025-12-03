const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;

// Force HTTPS redirect in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Remove Server header
app.disable('x-powered-by');

// Custom middleware to remove/change Server header
app.use((req, res, next) => {
    res.removeHeader('Server');
    // Or set custom value
    // res.setHeader('Server', 'MyCustomServer');
    next();
});

app.use(express.static(path.join(__dirname, 'dist/ccapp/browser')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/ccapp/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
