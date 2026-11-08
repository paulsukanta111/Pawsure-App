// Onboarding on a real phone height: every step's main button must be on screen without scrolling.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [file, out] = process.argv.slice(2);
  const body = fs.readFileSync(file, 'utf8');
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0">${body}</body></html>`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.route('**/*', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: html }));
  await p.goto('https://artifact.test/s');
  const btn = (n) => p.getByRole('button', { name: n, exact: true }).filter({ visible: true }).last();
  const see = (t) => p.getByText(t).filter({ visible: true }).first().waitFor({ timeout: 8000 });
  let fails = 0;
  const onScreen = async (step, name) => {
    await p.waitForTimeout(500);
    const r = await btn(name).boundingBox();
    const ok = r && r.y >= 0 && r.y + r.height <= 844;
    if (!ok) fails++;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${step}: "${name}" at y=${r ? Math.round(r.y) : '?'}`);
    await p.screenshot({ path: `${out}/s-${step.replace(/\W+/g, '-')}.png` });
  };
  await see("When help can't come, ask friends."); await onScreen('welcome', 'Next');
  await btn('Get started').click();
  await p.getByLabel('Mobile number').fill('9876543210'); await p.getByRole('checkbox').click(); await btn('Get code').click();
  await p.getByLabel('6-digit code').fill('123456'); await btn('Sign in').click();
  await see('About you'); await onScreen('1 about you', 'Continue'); await btn('Continue').click();
  await see('Your privacy'); await onScreen('2 privacy', 'Agree and continue');
  await p.getByRole('checkbox', { name: 'I have read the privacy notice' }).click(); await btn('Agree and continue').click();
  await see('Your pet'); await onScreen('3 pet', 'Continue'); await btn('Continue').click();
  await see("Bruno's care"); await onScreen('4 care', 'Continue'); await btn('Continue').click();
  await see('Daily routine'); await onScreen('5 routine', 'Continue'); await btn('Continue').click();
  await see('Who helps'); await onScreen('6 circle', 'Finish setup');
  console.log(fails ? `${fails} FAILED` : 'ONBOARDING BUTTONS ALWAYS IN VIEW', '· page errors:', errs.length);
  await b.close();
})();
