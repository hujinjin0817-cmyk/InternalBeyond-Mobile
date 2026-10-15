const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

let scriptsChecked = 0;
for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (/type=["'](?:application\/json|importmap|text\/plain)/i.test(match[1])) continue;
  if (!match[2].trim()) continue;
  scriptsChecked += 1;
  new Function(match[2]);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.IB_BROWSER_EXE || undefined,
  });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(process.env.IB_TEST_URL || pathToFileURL(path.join(root, 'index.html')).href, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(2500);

  const requiredIds = [
    'cgpt-sub-card', 'cgpt-copy', 'cgpt-open', 'cgpt-reply', 'cgpt-import',
    'cloud-sync-card', 'cloud-repo', 'cloud-branch', 'cloud-path', 'cloud-pass',
    'cloud-push', 'cloud-pull', 'cloud-status',
  ];
  for (const id of requiredIds) {
    if (await page.locator(`#${id}`).count() !== 1) throw new Error(`missing #${id}`);
  }

  const cryptoResult = await page.evaluate(async () => {
    const source = { ok: true, unicode: '云同步', records: [{ id: 'one' }] };
    const envelope = await _cloudEncryptM(source, 'test-passphrase');
    const restored = await _cloudDecryptM(envelope, 'test-passphrase');
    let wrongPasswordRejected = false;
    try {
      await _cloudDecryptM(envelope, 'wrong-passphrase');
    } catch (_) {
      wrongPasswordRejected = true;
    }
    document.getElementById('cloud-repo').value = 'owner/private-data';
    document.getElementById('cloud-branch').value = 'main';
    document.getElementById('cloud-path').value = 'mian/cloud-backup.enc.json';
    document.getElementById('cloud-pass').value = 'never-store-me';
    _cloudCfgSaveM();
    const persisted = localStorage.getItem('ib_cloudSync') || '';
    return {
      roundTrip: restored.ok && restored.unicode === source.unicode,
      wrongPasswordRejected,
      passphraseNotPersisted: !persisted.includes('never-store-me'),
      iterations: envelope.kdf.iterations,
      cipher: envelope.cipher.name,
    };
  });

  if (!cryptoResult.roundTrip) throw new Error('AES-GCM round trip failed');
  if (!cryptoResult.wrongPasswordRejected) throw new Error('wrong password was accepted');
  if (!cryptoResult.passphraseNotPersisted) throw new Error('passphrase leaked to localStorage');
  if (cryptoResult.iterations !== 210000 || cryptoResult.cipher !== 'AES-GCM') {
    throw new Error('unexpected cloud encryption parameters');
  }

  const relevantPageErrors = pageErrors.filter(message =>
    /cgpt|cloud|_cloud/i.test(message)
  );
  if (relevantPageErrors.length) throw new Error(relevantPageErrors.join('\n'));

  console.log(JSON.stringify({ scriptsChecked, requiredIds: requiredIds.length, cryptoResult }));
  await browser.close();
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
