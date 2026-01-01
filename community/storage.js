const fs = require('fs');
const path = require('path');

const REPORTS_PATH = path.join(__dirname, 'reports.json');

const ensureFile = () => {
  if (!fs.existsSync(REPORTS_PATH)) {
    fs.writeFileSync(REPORTS_PATH, '[]', 'utf8');
  }
};

const readReports = () => {
  ensureFile();
  const content = fs.readFileSync(REPORTS_PATH, 'utf8');
  try {
    return JSON.parse(content);
  } catch (err) {
    return [];
  }
};

const storeReport = async (report) => {
  ensureFile();
  const existing = readReports();
  existing.push(report);
  fs.writeFileSync(REPORTS_PATH, JSON.stringify(existing, null, 2), 'utf8');
};

module.exports = {
  storeReport,
  readReports,
};
