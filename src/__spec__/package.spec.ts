import { promises as fs } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);

/**
 * Package Integration Test
 *
 * This test suite validates that the package works correctly when:
 * 1. Built and packed as a tarball
 * 2. Installed as a dependency in a fresh project
 * 3. Has the correct structure for npm distribution
 *
 * This ensures the package structure is correct for publishing to npm.
 */
describe('package test', () => {
  const testDir = join(process.cwd(), 'test-output-package');
  const projectDir = join(testDir, 'test-project');
  let tarballPath: string;

  beforeAll(async () => {
    // Clean up any previous test artifacts
    await fs.rm(testDir, { recursive: true, force: true });
    await fs.mkdir(testDir, { recursive: true });

    // Build the project
    const { stderr: buildStderr } = await exec('npm run build', {
      cwd: process.cwd(),
    });
    // Assert that build succeeded without errors
    expect(buildStderr.toLowerCase()).not.toContain('error');

    // Pack the project into a tarball
    const { stdout: packStdout } = await exec('npm pack', {
      cwd: process.cwd(),
    });

    // The output from npm pack is the filename of the tarball (last line of output)
    const lines = packStdout.trim().split('\n');
    const tarballName = lines[lines.length - 1].trim();
    tarballPath = join(process.cwd(), tarballName);

    // Verify the tarball was created
    await fs.access(tarballPath);

    // Create a dummy package.json in the test project directory
    await fs.mkdir(projectDir, { recursive: true });
    const dummyPackageJson = {
      name: 'test-harproxyserver-integration',
      version: '1.0.0',
      type: 'module',
      description: 'Test project for harproxyserver integration',
      dependencies: {
        harproxyserver: `file:${tarballPath}`,
      },
    };
    await fs.writeFile(join(projectDir, 'package.json'), JSON.stringify(dummyPackageJson, null, 2));

    // Install dependencies in the test project
    const { stderr: installStderr } = await exec('npm install', {
      cwd: projectDir,
    });
    // Assert that installation succeeded without errors
    expect(installStderr.toLowerCase()).not.toContain('error');
  }, 120000); // 2 minute timeout for build and install

  afterAll(async () => {
    // Clean up test artifacts
    await fs.rm(testDir, { recursive: true, force: true });

    // Clean up the tarball from the root directory
    if (tarballPath) {
      await fs.rm(tarballPath, { force: true });
    }
  });

  describe('Package structure validation', () => {
    it('should have the harProxyServer executable in .bin', async () => {
      const binPath = join(projectDir, 'node_modules', '.bin', 'harProxyServer');

      // Check if the bin file exists
      await expect(fs.access(binPath)).resolves.not.toThrow();

      // Verify it's executable (on Unix systems)
      if (process.platform !== 'win32') {
        const stats = await fs.stat(binPath);
        // Check if file has execute permission (at least one execute bit set)
        expect(stats.mode & 0o111).toBeGreaterThan(0);
      }
    });

    it('should have package.json in the installed package', async () => {
      const pkgPath = join(projectDir, 'node_modules', 'harproxyserver', 'package.json');
      await expect(fs.access(pkgPath)).resolves.not.toThrow();

      const pkgContent = await fs.readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(pkgContent);

      expect(pkg.name).toBe('harproxyserver');
    });
  });

  // Now that .js extensions have been added to the source files, these tests should work!
  describe('CLI execution tests', () => {
    describe('npx harProxyServer --version', () => {
      it('should display version information when installed as a dependency', async () => {
        const { stdout, stderr } = await exec('npx harProxyServer --version', {
          cwd: projectDir,
        });

        // The version output should contain the app name, version, and description
        expect(stdout).toContain('harproxyserver');
        expect(stdout).toMatch(/\d+\.\d+\.\d+/); // Version number pattern
        expect(stdout).toContain('A simple proxy server');

        // Should not show errors
        expect(stderr.toLowerCase()).not.toContain('error');
      }, 30000);
    });

    describe('npx harProxyServer --help', () => {
      it('should display help information', async () => {
        const { stdout } = await exec('npx harProxyServer --help', {
          cwd: projectDir,
        });

        // Help should contain some key options
        expect(stdout).toContain('--port');
        expect(stdout).toContain('--target-url');
        expect(stdout).toContain('--mode');
      }, 30000);
    });
  });
});
