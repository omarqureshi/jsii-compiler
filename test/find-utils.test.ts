import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findPackageJsonUp } from '../src/common/find-utils';

describe('findPackageJsonUp', () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'jsii-find-utils-'));
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  test('finds a package.json with the exact requested name', () => {
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'jsii' }));
    const start = join(root, 'lib', 'common');
    mkdirSync(start, { recursive: true });

    expect(findPackageJsonUp('jsii', start)).toBe(root);
  });

  test('finds a scoped re-publish of the requested name', () => {
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@omarqureshi/jsii' }));
    const start = join(root, 'lib', 'common');
    mkdirSync(start, { recursive: true });

    expect(findPackageJsonUp('jsii', start)).toBe(root);
  });

  test('does not match unrelated package names', () => {
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@omarqureshi/not-jsii' }));
    const nested = join(root, 'nested');
    mkdirSync(nested);
    writeFileSync(join(nested, 'package.json'), JSON.stringify({ name: 'jsii-rosetta' }));

    expect(findPackageJsonUp('jsii', nested)).toBeUndefined();
  });

  test('skips a package.json without a name instead of throwing', () => {
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'jsii' }));
    const nested = join(root, 'nested');
    mkdirSync(nested);
    writeFileSync(join(nested, 'package.json'), JSON.stringify({ private: true }));

    expect(findPackageJsonUp('jsii', nested)).toBe(root);
  });
});
