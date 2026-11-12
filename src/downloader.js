import fs from 'node:fs';
import path from 'node:path';
import { getFeatureById } from './catalog.js';

/**
 * Copies a directory recursively
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
 * Downloads / exports a feature package to a target directory
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

  const srcDir = feature._meta.dirPath;
  const destination = path.resolve(targetDir);

  if (fs.existsSync(destination) && !options.overwrite) {
    const existing = fs.readdirSync(destination).filter(f => f !== '.DS_Store');
    if (existing.length > 0) {
      throw new Error(`Destination directory '${destination}' already exists and is not empty. Use --overwrite to proceed.`);
    }
  }

  copyDirSync(srcDir, destination);

  // Read copied files
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
