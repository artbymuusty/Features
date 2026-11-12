import fs from 'node:fs';
import path from 'node:path';
import { getFeatureById } from './catalog.js';

/**
 * Copies directory contents recursively
 * @param {string} src
 * @param {string} dest
 */
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === '.DS_Store' || entry.name === 'node_modules') continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Downloads / exports a feature package to a target directory with atomic staging and rollback
 * @param {string} featureId
 * @param {string} targetDir
 * @param {object} options
 * @returns {{ success: boolean, targetDir: string, filesCopied: string[], feature: object }}
 */
export function downloadFeature(featureId, targetDir, options = {}) {
  const feature = getFeatureById(featureId);
  if (!feature) {
    throw new Error(`Feature with ID '${featureId}' not found in catalog.`);
  }

  const srcDir = feature._meta?.dirPath;
  if (!srcDir || !fs.existsSync(srcDir)) {
    throw new Error(`Source package directory for '${featureId}' is missing or inaccessible.`);
  }

  const destination = path.resolve(targetDir);

  if (fs.existsSync(destination)) {
    const stat = fs.statSync(destination);
    if (!stat.isDirectory()) {
      throw new Error(`Destination path '${destination}' exists and is not a directory.`);
    }

    if (!options.overwrite) {
      const existing = fs.readdirSync(destination).filter(f => f !== '.DS_Store');
      if (existing.length > 0) {
        throw new Error(`Destination directory '${destination}' already exists and is not empty. Use --overwrite to proceed.`);
      }
    }
  }

  // Atomic Staging: Copy into an isolated staging directory first
  const parentDir = path.dirname(destination);
  fs.mkdirSync(parentDir, { recursive: true });

  const stagingDir = path.join(
    parentDir,
    `.staging-${path.basename(destination)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );

  try {
    copyDirSync(srcDir, stagingDir);

    // If destination exists and overwrite is allowed, remove destination before promoting staging
    if (fs.existsSync(destination)) {
      fs.rmSync(destination, { recursive: true, force: true });
    }

    // Atomically promote staging directory to destination
    try {
      fs.renameSync(stagingDir, destination);
    } catch {
      // Cross-device fallback
      copyDirSync(stagingDir, destination);
      fs.rmSync(stagingDir, { recursive: true, force: true });
    }
  } catch (err) {
    // Rollback: Clean up staging on any failure
    if (fs.existsSync(stagingDir)) {
      fs.rmSync(stagingDir, { recursive: true, force: true });
    }
    throw new Error(`Download failed during extraction of '${featureId}': ${err.message}`);
  }

  // Scan finalized copied files
  const copiedFiles = [];
  function scanCopied(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanCopied(full);
      } else {
        copiedFiles.push(path.relative(destination, full));
      }
    }
  }
  scanCopied(destination);

  return {
    success: true,
    targetDir: destination,
    filesCopied: copiedFiles,
    feature
  };
}
