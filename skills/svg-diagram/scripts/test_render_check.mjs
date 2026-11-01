#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, test } from 'node:test';
import { inspectDocument, loadChromium } from './render_check.mjs';

let browser;
before(async () => {
  const channelAt = process.argv.indexOf('--channel');
  browser = await (
    await loadChromium()
  ).launch(channelAt >= 0 ? { channel: process.argv[channelAt + 1] } : {});
});
after(async () => {
  await browser?.close();
});

const shell = (content) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300">${content}</svg>`;
const nodes = `<g id="a" data-node="true" data-bounds=" 0 0 120 80 " transform="translate(20 80)"><rect width="120" height="80" fill="#eee"/><text x="12" y="35">Client</text></g>
<g transform="translate(380 80)"><g id="b" data-node="true" data-bounds="0 0 120 80"><rect width="120" height="80" fill="#eee"/><text x="12" y="35">API</text></g></g>`;
const route = (d) =>
  `<path id="request" data-edge="true" data-from="a" data-to="b" d="${d}" fill="none" stroke="#222"/>`;
async function inspect(content) {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`data:image/svg+xml;base64,${Buffer.from(shell(content)).toString('base64')}`);
    return await page.evaluate(inspectDocument);
  } finally {
    await context.close();
  }
}

test('clear routes and nested translated node/text coordinates pass', async () => {
  const result = await inspect(nodes + route('M144 120H376'));
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
  assert.equal(result.textEditXmlRoundtrip, true);
});

test('a route through a transformed unrelated node is detected', async () => {
  const obstacle =
    '<g id="obstacle" data-node="true" data-bounds="0 0 60 80" transform="translate(240 80)"><rect width="60" height="80"/></g>';
  const result = await inspect(nodes + obstacle + route('M144 120H376'));
  assert.ok(result.errors.some((e) => e.includes('edge through node: request / obstacle')));
});

test('a curved route through standalone text is detected', async () => {
  const result = await inspect(
    nodes + '<text x="240" y="125">Blocked</text>' + route('M144 120Q260 120 376 120'),
  );
  assert.ok(result.errors.some((e) => e.includes('edge through text: request / Blocked')));
});

test('text outside its translated allocation and canvas is detected', async () => {
  const outside = nodes.replace('x="12" y="35">Client', 'x="-80" y="35">Client');
  const result = await inspect(outside + route('M144 120H376'));
  assert.ok(result.errors.some((e) => e.includes('outside allocated node a')));
  assert.ok(result.errors.some((e) => e.includes('outside canvas')));
});

test('overlapping node allocations and overlapping text are detected', async () => {
  const duplicate =
    '<g id="c" data-node="true" data-bounds="20 80 120 80"><text x="32" y="115">Duplicate</text></g>';
  const result = await inspect(nodes + duplicate + route('M144 120H376'));
  assert.ok(result.errors.some((e) => e.includes('node overlap: a / c')));
  assert.ok(result.errors.some((e) => e.includes('text overlap:')));
});

test('ambiguous edge geometry yields an explicit coverage warning', async () => {
  const result = await inspect(
    nodes +
      '<g id="ambiguous" data-edge="true" data-from="a" data-to="b"><path d="M144 120H376"/><path d="M144 130H376"/></g>',
  );
  assert.ok(result.warnings.some((e) => e.includes('exactly one route geometry')));
});

test('hidden semantic nodes and edges cannot pass visible coverage', async () => {
  const result = await inspect(
    nodes.replace('id="a"', 'id="a" display="none"') +
      route('M144 120H376').replace('id="request"', 'id="request" visibility="hidden"'),
  );
  assert.ok(result.errors.some((e) => e.includes('semantic node is hidden')));
  assert.ok(result.errors.some((e) => e.includes('semantic edge is hidden')));
});

test('CLI geometry failure exits 1, writes evidence, and preserves source bytes', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'svg-diagram-test-'));
  try {
    const svg = join(temp, 'collision.svg');
    const obstacle =
      '<g id="obstacle" data-node="true" data-bounds="240 80 60 80"><rect x="240" y="80" width="60" height="80"/></g>';
    const source = shell(
      '<title>Collision fixture</title><desc>Intentional route failure</desc>' +
        nodes +
        obstacle +
        route('M144 120H376'),
    );
    await writeFile(svg, source);
    const args = [
      fileURLToPath(new URL('./render_check.mjs', import.meta.url)),
      svg,
      '--out',
      join(temp, 'qa'),
    ];
    const channelAt = process.argv.indexOf('--channel');
    if (channelAt >= 0) args.push('--channel', process.argv[channelAt + 1]);
    const run = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 30000 });
    assert.equal(run.status, 1, run.stderr);
    const report = JSON.parse(await readFile(join(temp, 'qa', 'report.json'), 'utf8'));
    assert.equal(report.status, 'fail');
    assert.ok(report.geometry.errors.some((e) => e.includes('edge through node')));
    assert.ok((await readFile(join(temp, 'qa', 'native.png'))).length > 100);
    assert.equal(await readFile(svg, 'utf8'), source);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('CLI runs when invoked through a symlinked install path', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'svg-diagram-link-'));
  try {
    const entry = join(temp, 'render-link.mjs');
    await symlink(fileURLToPath(new URL('./render_check.mjs', import.meta.url)), entry);
    const run = spawnSync(process.execPath, [entry, '--help'], {
      encoding: 'utf8',
      timeout: 10000,
    });
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /--out qa-directory/);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
