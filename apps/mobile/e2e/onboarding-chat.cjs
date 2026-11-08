// v3 conversational onboarding, end to end on a 390x844 phone.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [file, out] = process.argv.slice(2);
  const body = fs.readFileSync(file, 'utf8');
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0">${body}</body></html>`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.route('**/*', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: html }));
  await p.goto('https://artifact.test/s');
  const btn = (n) => p.getByRole('button', { name: n, exact: true }).filter({ visible: true }).last();
  const see = (t) => p.getByText(t).filter({ visible: true }).last().waitFor({ timeout: 8000 });
  const type = async (t) => { await p.getByLabel('Your answer').fill(t); await btn('Send').click(); };
  let fails = 0, n = 0;
  const step = async (name, fn) => { try { await fn(); console.log('PASS', name); } catch (e) { fails++; console.log('FAIL', name, e.message.split('\n')[0]); } await p.screenshot({ path: `${out}/c${++n}.png` }); };

  await btn('Get started').click();
  await p.getByLabel('Mobile number').fill('9876543210'); await p.getByRole('checkbox').click(); await btn('Get code').click();
  await p.getByLabel('6-digit code').fill('123456'); await btn('Sign in').click();
  await step('opens the chat and asks for a name', async () => { await see('First, what should I call you?'); });
  await step('typed name, then language chip', async () => { await type('hi, my name is neha'); await see('Nice to meet you, Neha!'); await btn('English').click(); await see('What we collect and why'); });
  await step('privacy needs an explicit I agree', async () => { await btn('I agree').click(); await see('Now tell me about your pet'); });
  await step('one-word pet answer asks dog or cat, then confirm card', async () => {
    await type('bruno'); await see('Is Bruno a dog or a cat?'); await btn('Dog').click();
    await see("Here's what I got about Bruno."); await btn('Looks right').click(); await see('What does Bruno eat');
  });
  await step('care from a suggestion, edited before saving', async () => {
    await btn('1 cup kibble at 1 pm, fresh water. Joint supplement, 1 tablet with lunch.').click();
    await see("Here's the care I'll show"); await btn('Edit').click();
    await p.getByLabel('Allergies').filter({ visible: true }).last().fill('Chicken'); await btn('Save').click();
    await see('Chicken'); await btn('Looks right').click(); await see("Who's your vet?");
  });
  await step('vet typed with a number', async () => { await type('Dr Kulkarni, Powai Pet Clinic, 98200 00000'); await see('+91 98200 00000'); await btn('Looks right').click(); await see("I've drafted a daily routine"); });
  await step('routine kept', async () => { await btn('Looks good').click(); await see('Who looks after Bruno'); });
  await step('people parsed into roles', async () => {
    await type('My helper Lata 98200 33333 and backup Rohan 98200 11111'); await see('+91 98200 33333');
    const card = await p.getByText("Here's your care circle for Bruno:").filter({ visible: true }).last().locator('..').innerText();
    if (!/Helper\s+Lata/.test(card) || !/Backup\s+Rohan/.test(card)) throw new Error('roles wrong: ' + card.replace(/\s+/g, ' '));
    await btn('Looks right').click(); await see('Shall I invite Lata');
  });
  await step('invite sent, all set, lands on Today', async () => {
    await btn('Send invite').click(); await see("You're all set, Neha."); await btn('Go to my Today').click(); await see('Neha!'); await see('Lata (helper)');
  });
  console.log(fails ? `${fails} FAILED` : 'CHAT ONBOARDING OK', '· page errors:', errs.length ? errs.join(' | ') : 0);
  await b.close();
})();
