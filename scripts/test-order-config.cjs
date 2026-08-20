const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '..', 'lib', 'order-config.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const moduleObject = { exports: {} };
const sandbox = { process: { env: {} }, exports: moduleObject.exports, module: moduleObject };
vm.runInNewContext(compiled, sandbox, { filename: sourcePath });
const { getMissingOrderConfig, getOrderConfigPresence } = sandbox.module.exports;
const complete = {
  googleSheetId: 'present', googleSheetTabName: 'present', googleServiceAccountJsonBase64: 'present', googleServiceAccountJsonPath: undefined,
  googleServiceAccountEmail: undefined, googlePrivateKey: undefined, smtpHost: 'present', smtpPort: '465', smtpUser: 'present', smtpPass: 'present', emailFrom: 'present', businessEmail: 'present',
};
assert.deepEqual(Array.from(getMissingOrderConfig(complete)), []);
assert.equal(getOrderConfigPresence(complete).SMTP_PASS, true);
const legacy = { ...complete, googleServiceAccountJsonBase64: undefined, googleServiceAccountEmail: 'present', googlePrivateKey: 'present' };
assert.deepEqual(Array.from(getMissingOrderConfig(legacy)), []);
const missing = { ...complete, googleServiceAccountJsonBase64: undefined, googleServiceAccountEmail: undefined, googlePrivateKey: undefined, smtpPass: undefined };
assert.ok(Array.from(getMissingOrderConfig(missing)).includes('SMTP_PASS'));
assert.ok(Array.from(getMissingOrderConfig(missing)).some(value => value.startsWith('GOOGLE_SERVICE_ACCOUNT')));
console.log('order-config tests passed');
