import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0;
let failed = 0;

const SCREENSHOTS = [
  'discover.png',
  'matches.png',
  'my-bets.png',
  'leaderboard.png',
  'receipts.png',
];

const DOCS = ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'docs/brand.html'];

function ok(name) {
  console.log(`ok   ${name}`);
  passed += 1;
}

function fail(name, error) {
  console.error(`FAIL ${name}: ${error.message}`);
  failed += 1;
}

function check(name, fn) {
  try {
    fn();
    ok(name);
  } catch (error) {
    fail(name, error);
  }
}

function read(rel) {
  return readFileSync(path.join(root, rel), 'utf8');
}

function requireFile(rel) {
  if (!existsSync(path.join(root, rel))) {
    throw new Error(`${rel} is missing`);
  }
}

function pngSize(rel) {
  const buffer = readFileSync(path.join(root, rel));
  if (buffer.toString('ascii', 1, 4) !== 'PNG') throw new Error(`${rel} is not a PNG`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function requireRealImage(rel, minBytes) {
  const { size } = statSync(path.join(root, rel));
  if (size < minBytes) {
    throw new Error(`${rel} is only ${size} bytes, which is not a rendered image`);
  }
}

function slug(text) {
  return text
    .toLowerCase()
    .replace(/`[^`]*`/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function checkMarkdown(rel) {
  const text = read(rel);
  if (text.includes('\u2014')) throw new Error(`${rel} contains an em dash`);
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text)) {
    throw new Error(`${rel} contains an emoji`);
  }
  if (text.toLowerCase().includes('codebuff')) throw new Error(`${rel} contains a Codebuff reference`);
  if (text.includes('geekman58748')) throw new Error(`${rel} contains the old repository username`);
}

function checkLocalRefs(rel) {
  const text = read(rel);
  const refs = [];

  for (const match of text.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    refs.push(match[1]);
  }
  for (const match of text.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    refs.push(match[1]);
  }

  for (const target of refs) {
    if (/^(https?:|#|mailto:|javascript:)/.test(target)) continue;
    const local = target.split('#')[0].split('?')[0];
    if (!local) continue;
    if (!existsSync(path.join(root, path.dirname(rel), local))) {
      throw new Error(`${rel} links to missing ${local}`);
    }
  }
}

function checkAnchors() {
  const text = read('README.md');
  const headings = new Set(
    [...text.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => slug(match[1])),
  );
  for (const match of text.matchAll(/\]\(#([^)]+)\)/g)) {
    if (!headings.has(match[1])) throw new Error(`README.md has a missing heading #${match[1]}`);
  }
}

function tracked() {
  try {
    return execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
  } catch {
    return [];
  }
}

const required = [
  'README.md',
  'LICENSE',
  'CONTRIBUTING.md',
  'SECURITY.md',
  '.editorconfig',
  '.gitattributes',
  '.gitignore',
  '.env.example',
  '.github/dependabot.yml',
  '.github/pull_request_template.md',
  '.github/workflows/check.yml',
  'docs/brand.html',
  'docs/assets/banner.png',
  'docs/assets/social-preview.png',
  'docs/assets/stakely-mark.png',
  ...SCREENSHOTS.map((file) => `docs/screenshots/${file}`),
  'scripts/check-repo.mjs',
  'api/package.json',
  'api/.env.example',
  'web/package.json',
  'web/.env.example',
];

for (const file of required) {
  check(`${file} exists`, () => requireFile(file));
}

for (const file of DOCS) {
  check(`${file} has no em dashes or emojis`, () => checkMarkdown(file));
}

check('README internal anchors resolve', checkAnchors);

check('documentation links resolve', () => {
  for (const file of DOCS) checkLocalRefs(file);
});

check('README shows the banner and every screenshot', () => {
  const text = read('README.md');
  for (const image of [
    'docs/assets/banner.png',
    ...SCREENSHOTS.map((file) => `docs/screenshots/${file}`),
  ]) {
    if (!text.includes(image)) throw new Error(`README is missing ${image}`);
  }
});

check('banner is 2560 by 800', () => {
  const size = pngSize('docs/assets/banner.png');
  if (size.width !== 2560 || size.height !== 800) {
    throw new Error(`banner is ${size.width} by ${size.height}`);
  }
});

check('banner is a rendered image, not a flat placeholder', () => {
  requireRealImage('docs/assets/banner.png', 20000);
});

check('social preview is 1280 by 640', () => {
  const size = pngSize('docs/assets/social-preview.png');
  if (size.width !== 1280 || size.height !== 640) {
    throw new Error(`social preview is ${size.width} by ${size.height}`);
  }
});

check('social preview is a rendered image, not a flat placeholder', () => {
  requireRealImage('docs/assets/social-preview.png', 10000);
});

check('screenshots are 1920 by 1080', () => {
  for (const file of SCREENSHOTS) {
    const size = pngSize(`docs/screenshots/${file}`);
    if (size.width !== 1920 || size.height !== 1080) {
      throw new Error(`${file} is ${size.width} by ${size.height}`);
    }
    requireRealImage(`docs/screenshots/${file}`, 50000);
  }
});

check('brand artboards match the exported images', () => {
  const text = read('docs/brand.html');
  for (const rule of ['width: 2560px', 'height: 800px', 'width: 1280px', 'height: 640px']) {
    if (!text.includes(rule)) throw new Error(`docs/brand.html is missing ${rule}`);
  }
  if (!text.includes('id="banner"') || !text.includes('id="social"')) {
    throw new Error('docs/brand.html is missing an artboard');
  }
});

check('license is MIT', () => {
  if (!read('LICENSE').includes('MIT License')) throw new Error('LICENSE is not MIT');
});

check('CI runs the repository checks', () => {
  if (!read('.github/workflows/check.yml').includes('node scripts/check-repo.mjs')) {
    throw new Error('check workflow does not run the repository checks');
  }
});

check('.env is not tracked', () => {
  const files = tracked();
  if (files.includes('.env')) throw new Error('.env is tracked');
  if (files.some((file) => file.startsWith('node_modules/'))) {
    throw new Error('node_modules is tracked');
  }
});

check('no old username or Codebuff references in docs', () => {
  for (const file of DOCS) {
    const text = read(file).toLowerCase();
    if (text.includes('codebuff')) throw new Error(`${file} contains a Codebuff reference`);
    if (text.includes('geekman58748')) throw new Error(`${file} contains the old username`);
  }
});

console.log('');
console.log(`${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exitCode = 1;
}
