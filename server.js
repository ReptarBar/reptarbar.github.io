const express = require('express');
const path = require('path');
const submitReportRouter = require('./community/submit-report');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.use(express.static(path.join(__dirname)));
app.use('/community', express.static(path.join(__dirname, 'community')));
app.use('/community', submitReportRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
