const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const secret = 'local-inquiry-authority-fixture-key-01234567890123456789';

async function fixture() {
  const jose = await import('jose');
  const jar = new Map();
  const rows = {
    admin: { id: 'fixture-admin', email: 'fixture@example.invalid', passwordHash: 'fixture-password-hash-a', updatedAt: new Date(Date.now() - 600000) },
    user: { id: 'fixture-user', username: 'fixture-user', passwordHash: 'fixture-password-hash-b', updatedAt: new Date(Date.now() - 600000) },
  };
  let failDatabase = false;
  const database = Object.fromEntries(['admin', 'user'].map(role => [role, {
    findUnique: async () => { if (failDatabase) throw Error('INJECTED_DATABASE_UNAVAILABLE'); return rows[role]; },
  }]));
  const replacements = {
    'next/headers': { cookies: async () => ({ get: name => jar.has(name) ? { value: jar.get(name) } : undefined,
      set: (name, value) => jar.set(name, value), delete: name => jar.delete(name) }) },
    'next/navigation': { redirect: target => { throw Error('REDIRECT:' + target); } },
    '@/lib/prisma': { prisma: database },
    './prisma': { prisma: database },
    jose,
  };
  const exported = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/auth.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { exports: exported, require: name => replacements[name] || require(name), Buffer, TextEncoder,
    process: { env: { NODE_ENV: 'production', SESSION_SECRET: secret } } });
  const legacy = async role => {
    const payload = role === 'admin' ? { adminId: rows.admin.id, email: rows.admin.email }
      : { userId: rows.user.id, username: rows.user.username };
    return new jose.SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt(Math.floor(Date.now() / 1000) - 60)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60 + 7 * 86400).sign(new TextEncoder().encode(secret));
  };
  return { auth: exported, jar, rows, legacy, jose, failDatabase: () => { failDatabase = true; } };
}

test('a valid legacy Inquiry token cannot keep a deleted or changed account authorized', async () => {
  for (const role of ['admin', 'user']) {
    const api = await fixture();
    const cookie = role === 'admin' ? api.auth.sessionCookieName : api.auth.userSessionCookieName;
    const get = role === 'admin' ? api.auth.getSession : api.auth.getUserSession;
    api.jar.set(cookie, await api.legacy(role));
    assert.ok(await get(), 'an unchanged legacy account remains usable');
    const account = api.rows[role];
    api.rows[role] = null;
    assert.equal(await get(), null, 'deleted account loses access');
    api.rows[role] = { ...account, updatedAt: new Date(Date.now() - 30000) };
    assert.equal(await get(), null, 'a changed legacy credential requires a fresh login');
    const verified = await api.jose.jwtVerify(api.jar.get(cookie), new TextEncoder().encode(secret));
    api.rows[role].updatedAt = new Date(verified.payload.iat * 1000);
    assert.equal(await get(), null, 'equal legacy timestamps are ambiguous and require a fresh login');
  }
});

test('new Inquiry logins bind the verified credential, including same-timestamp password changes', async () => {
  for (const role of ['admin', 'user']) {
    const api = await fixture();
    const account = api.rows[role];
    const create = role === 'admin' ? api.auth.createSession : api.auth.createUserSession;
    const get = role === 'admin' ? api.auth.getSession : api.auth.getUserSession;
    const payload = role === 'admin' ? { adminId: account.id, email: account.email }
      : { userId: account.id, username: account.username };
    await create(payload, account.passwordHash);
    assert.ok(await get());
    const verifiedPassword = account.passwordHash;
    account.passwordHash = 'fixture-new-password-hash';
    assert.equal(await get(), null, 'even equal database timestamps cannot retain an old credential');
    await assert.rejects(() => create(payload, verifiedPassword), /INQUIRY_CREDENTIAL_CHANGED/);
    account.updatedAt = new Date(Date.now() + 1000);
    await create(payload, account.passwordHash);
    assert.ok(await get(), 'a freshly verified credential does not depend on JWT second precision');
    api.failDatabase();
    await assert.rejects(() => get(), /INJECTED_DATABASE_UNAVAILABLE/);
  }
});

test('Inquiry session authority rejects malformed, mixed-role and invalid-lifetime signed tokens', async () => {
  const api = await fixture();
  const now = Math.floor(Date.now() / 1000);
  const base = { adminId: api.rows.admin.id, email: api.rows.admin.email, iat: now - 60, exp: now + 3600 };
  for (const claims of [
    { ...base, iat: now + 60 },
    { ...base, exp: now + 8 * 86400 },
    { ...base, userId: api.rows.user.id, username: api.rows.user.username },
    { ...base, adminId: true },
    { ...base, credentialVersion: {} },
    { ...base, iat: undefined },
    { ...base, exp: undefined },
    { ...base, exp: now - 1 },
  ]) {
    const token = await new api.jose.SignJWT(claims).setProtectedHeader({ alg: 'HS256' })
      .sign(new TextEncoder().encode(secret));
    api.jar.set(api.auth.sessionCookieName, token);
    assert.equal(await api.auth.getSession(), null);
  }
});

test('the Inquiry proxy token reader applies fresh account authority before rendering admin pages', async () => {
  const api = await fixture();
  const token = await api.legacy('admin');
  assert.ok(await api.auth.readSessionFromToken(token));
  api.rows.admin = null;
  assert.equal(await api.auth.readSessionFromToken(token), null);
});
