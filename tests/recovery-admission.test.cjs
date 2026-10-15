const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
function guardCode() {
  if (process.env.INQUIRY_GUARD_QA_COMPILED) return fs.readFileSync(process.env.INQUIRY_GUARD_QA_COMPILED, 'utf8');
  const ts = require('typescript');
  return ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/recovery.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
}

test('Inquiry mutations refuse missing or malformed recovery authority and deployment maintenance', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sabalan-inquiry-admission-'));
  const environment = { NODE_ENV: 'production', RECOVERY_COORDINATION_DIR: root };
  const exported = {};
  const code = guardCode();
  vm.runInNewContext(code, { exports: exported, require, process: { env: environment, platform: process.platform } });
  try {
    assert.throws(() => exported.assertInquiryWritable(), /RECOVERY_COORDINATION_UNAVAILABLE/);
    fs.writeFileSync(path.join(root, 'state.json'), '{');
    assert.throws(() => exported.assertInquiryWritable(), /RECOVERY_COORDINATION_UNAVAILABLE/);
    fs.writeFileSync(path.join(root, 'state.json'), JSON.stringify({ mode: 'NORMAL' }));
    assert.throws(() => exported.assertInquiryWritable(), /RECOVERY_COORDINATION_UNAVAILABLE/);
    fs.writeFileSync(path.join(root, 'state.json'), JSON.stringify({ mode: 'NORMAL', updatedAt: new Date().toISOString() }));
    assert.doesNotThrow(() => exported.assertInquiryWritable());
    fs.writeFileSync(path.join(root, 'deployment-maintenance.json'), '');
    assert.throws(() => exported.assertInquiryWritable(), /DEPLOYMENT_MAINTENANCE/);
    fs.unlinkSync(path.join(root, 'deployment-maintenance.json'));
    for (const mode of ['READ_ONLY', 'MAINTENANCE']) {
      fs.writeFileSync(path.join(root, 'state.json'), JSON.stringify({ mode, updatedAt: new Date().toISOString() }));
      assert.throws(() => exported.assertInquiryWritable(), /SYSTEM_RECOVERY_READ_ONLY/);
    }
    delete environment.RECOVERY_COORDINATION_DIR;
    assert.throws(() => exported.assertInquiryWritable(), /RECOVERY_COORDINATION_UNAVAILABLE/);
  } finally {
    assert.equal(path.dirname(root), os.tmpdir());
    assert.ok(path.basename(root).startsWith('sabalan-inquiry-admission-'));
    fs.rmSync(root, { recursive: true });
  }
});

test('Linux Inquiry admission refuses linked or oversized authority without changing live files',
  { skip: process.platform !== 'linux' }, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sabalan-inquiry-admission-'));
    const state = path.join(root, 'state.json');
    const normal = JSON.stringify({ mode: 'NORMAL', updatedAt: new Date().toISOString() });
    const environment = { NODE_ENV: 'production', RECOVERY_COORDINATION_DIR: root };
    const exported = {};
    const code = guardCode();
    vm.runInNewContext(code, { exports: exported, require, process: { env: environment, platform: process.platform } });
    try {
      fs.writeFileSync(state, normal);
      fs.linkSync(state, path.join(root, 'second-link'));
      assert.throws(() => exported.assertInquiryWritable(), /RECOVERY_COORDINATION_UNAVAILABLE/);
      fs.unlinkSync(path.join(root, 'second-link'));
      fs.renameSync(state, path.join(root, 'saved-state'));
      fs.symlinkSync(path.join(root, 'saved-state'), state);
      assert.throws(() => exported.assertInquiryWritable(), /RECOVERY_COORDINATION_UNAVAILABLE/);
      fs.unlinkSync(state);
      fs.renameSync(path.join(root, 'saved-state'), state);
      fs.symlinkSync(path.join(root, 'absent'), path.join(root, 'deployment-maintenance.json'));
      assert.throws(() => exported.assertInquiryWritable(), /DEPLOYMENT_MAINTENANCE/);
      fs.unlinkSync(path.join(root, 'deployment-maintenance.json'));
      fs.writeFileSync(state, ' '.repeat(8193) + normal);
      assert.throws(() => exported.assertInquiryWritable(), /RECOVERY_COORDINATION_UNAVAILABLE/);
      fs.writeFileSync(state, normal);
      fs.symlinkSync(root, path.join(root, 'alias'));
      environment.RECOVERY_COORDINATION_DIR = path.join(root, 'alias');
      assert.throws(() => exported.assertInquiryWritable(), /RECOVERY_COORDINATION_UNAVAILABLE/);
      assert.equal(fs.readFileSync(state, 'utf8'), normal);
    } finally {
      assert.equal(path.dirname(root), os.tmpdir());
      assert.ok(path.basename(root).startsWith('sabalan-inquiry-admission-'));
      fs.rmSync(root, { recursive: true });
    }
  });
