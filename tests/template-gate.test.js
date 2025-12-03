const fs = require('fs');
const path = require('path');

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

const html = read('sample-report.html');
const css = read('styles.css');

const hasHiddenRule = /\[hidden\]\s*{[^}]*display:\s*none\s*!important;?/m.test(css);
if (!hasHiddenRule) {
  throw new Error('Expected a global `[hidden]` rule that forces display: none; the template gate may render prematurely.');
}

const resultHidden = /data-template-result[^>]*\bhidden\b/.test(html);
if (!resultHidden) {
  throw new Error('Expected the template download block to be hidden by default.');
}

const errorHidden = /data-template-error[^>]*\bhidden\b/.test(html);
if (!errorHidden) {
  throw new Error('Expected the template error message to be hidden by default.');
}

const unlockButtonExists = /data-template-action="unlock"/.test(html);
if (!unlockButtonExists) {
  throw new Error('Expected an unlock control to trigger the template gate script.');
}

console.log('Template gate defaults: PASS');
