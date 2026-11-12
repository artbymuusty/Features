#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog, getFeatureById } from '../src/catalog.js';
import { buildIndex, getOrBuildIndex } from '../src/indexer.js';
import { searchCatalog } from '../src/search.js';
import { downloadFeature } from '../src/downloader.js';
import { scaffoldFeature, createGitBranch, validateCatalog } from '../src/contributor.js';
import { startServer } from '../src/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const command = args[0] || 'help';

function parseFlags(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      flags[key] = true;
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
}

function printHelp() {
  console.log(`
\x1b[1m\x1b[36mFeatures\x1b[0m - Lightweight Open-Source Feature Catalog & Package Manager

\x1b[1mUSAGE:\x1b[0m
  features <command> [options]

\x1b[1mCOMMANDS:\x1b[0m
  \x1b[32msearch <query>\x1b[0m            Search catalog by keyword, tag, or tech
  \x1b[32mlist\x1b[0m                      List all catalog features with optional filters
  \x1b[32minfo <feature-id>\x1b[0m         Show full metadata and file tree for a feature
  \x1b[32mdownload <id> --out <dir>\x1b[0m Extract/download a feature package to target folder
  \x1b[32mindex\x1b[0m                     Compile catalog-index.json
  \x1b[32mvalidate\x1b[0m                  Validate all feature packages against schema
  \x1b[32mnew <id> --category <cat>\x1b[0m Scaffold a new catalog feature directory
  \x1b[32mbranch <id>\x1b[0m               Create a clean contributor git branch
  \x1b[32mserve [--port 8766]\x1b[0m       Launch local catalog web server & API
  \x1b[32mhelp\x1b[0m                      Display this help message

\x1b[1mFILTER OPTIONS:\x1b[0m
  --category <cat>          Filter by category (auth, storage, ui, data, ai, workflow...)
  --tech <tech>             Filter by technology (typescript, sqlite, python...)
  --tag <tag>               Filter by tag
  --maturity <level>        Filter by maturity (proposed, experimental, beta, stable)
  --json                    Output raw JSON format
  --overwrite               Overwrite existing target directory during download
`);
}

async function main() {
  const { flags, positional } = parseFlags(args.slice(1));

  switch (command) {
    case 'help':
    case '--help':
    case '-h': {
      printHelp();
      break;
    }

    case 'index': {
      try {
        const index = buildIndex();
        console.log(`\x1b[32m✓\x1b[0m Catalog indexed successfully: ${index.total_features} features compiled.`);
      } catch (err) {
        console.error(`\x1b[31m✗ Indexing failed:\x1b[0m ${err.message}`);
        process.exit(1);
      }
      break;
    }

    case 'validate': {
      const result = validateCatalog();
      if (result.valid) {
        console.log(`\x1b[32m✓\x1b[0m Catalog is valid! ${result.featuresCount} features passed schema checks.`);
      } else {
        console.error(`\x1b[31m✗ Validation failed with ${result.errors.length} error(s):\x1b[0m`);
        for (const err of result.errors) {
          console.error(`  \x1b[33m${path.basename(err.file)}\x1b[0m:`);
          for (const msg of err.errors) {
            console.error(`    - ${msg}`);
          }
        }
        process.exit(1);
      }
      break;
    }

    case 'list': {
      const results = searchCatalog('', {
        category: flags.category,
        tech: flags.tech || flags.technology,
        tag: flags.tag,
        maturity: flags.maturity
      });

      if (flags.json) {
        console.log(JSON.stringify(results.map(r => r.feature), null, 2));
        break;
      }

      console.log(`\x1b[1mFeatures Catalog (${results.length} found):\x1b[0m\n`);
      for (const { feature } of results) {
        const matColor = feature.maturity === 'stable' ? '\x1b[32m' : '\x1b[33m';
        console.log(`  \x1b[1m\x1b[36m${feature.id.padEnd(26)}\x1b[0m ${matColor}[${feature.maturity}]\x1b[0m  v${feature.version}`);
        console.log(`    \x1b[90mCategory:\x1b[0m ${feature.category} | \x1b[90mTech:\x1b[0m ${(feature.technologies || []).join(', ')}`);
        console.log(`    ${feature.summary}`);
        console.log();
      }
      break;
    }

    case 'search': {
      const query = positional[0] || '';
      const results = searchCatalog(query, {
        category: flags.category,
        tech: flags.tech || flags.technology,
        tag: flags.tag,
        maturity: flags.maturity
      });

      if (flags.json) {
        console.log(JSON.stringify(results, null, 2));
        break;
      }

      console.log(`\x1b[1mSearch results for "${query}" (${results.length} match${results.length === 1 ? '' : 'es'}):\x1b[0m\n`);
      if (results.length === 0) {
        console.log(`  No features matched your query.`);
        break;
      }

      for (const { feature, score, matches } of results) {
        const matColor = feature.maturity === 'stable' ? '\x1b[32m' : '\x1b[33m';
        console.log(`  \x1b[1m\x1b[36m${feature.name}\x1b[0m (\x1b[33m${feature.id}\x1b[0m) ${matColor}[${feature.maturity}]\x1b[0m (score: ${score})`);
        console.log(`    ${feature.summary}`);
        console.log(`    \x1b[90mCategory:\x1b[0m ${feature.category} | \x1b[90mTags:\x1b[0m ${(feature.tags || []).join(', ')} | \x1b[90mMatches:\x1b[0m ${matches.join(', ')}`);
        console.log();
      }
      break;
    }

    case 'info': {
      const id = positional[0];
      if (!id) {
        console.error('Error: Feature ID required. Usage: features info <feature-id>');
        process.exit(1);
      }

      const feature = getFeatureById(id);
      if (!feature) {
        console.error(`Error: Feature '${id}' not found in catalog.`);
        process.exit(1);
      }

      if (flags.json) {
        console.log(JSON.stringify(feature, null, 2));
        break;
      }

      console.log(`\n\x1b[1m\x1b[36m${feature.name}\x1b[0m (\x1b[33m${feature.id}\x1b[0m) v${feature.version}`);
      console.log(`\x1b[90m${'='.repeat(60)}\x1b[0m`);
      console.log(`\x1b[1mSummary:\x1b[0m      ${feature.summary}`);
      console.log(`\x1b[1mCategory:\x1b[0m     ${feature.category}`);
      console.log(`\x1b[1mMaturity:\x1b[0m     ${feature.maturity}`);
      console.log(`\x1b[1mLicense:\x1b[0m      ${feature.license}`);
      console.log(`\x1b[1mAuthor:\x1b[0m       ${feature.author?.name || 'Unknown'} (${feature.author?.github || ''})`);
      console.log(`\x1b[1mTechnologies:\x1b[0m ${(feature.technologies || []).join(', ')}`);
      console.log(`\x1b[1mTags:\x1b[0m         ${(feature.tags || []).join(', ')}`);
      console.log(`\x1b[1mEntrypoint:\x1b[0m   ${feature.entrypoint || 'N/A'}`);
      console.log(`\x1b[1mFiles:\x1b[0m        ${(feature._meta?.files || []).join(', ')}`);
      if (feature.description) {
        console.log(`\n\x1b[1mDescription:\x1b[0m\n${feature.description}`);
      }
      console.log();
      break;
    }

    case 'download': {
      const id = positional[0];
      const targetDir = flags.out || flags.destination;
      if (!id || !targetDir) {
        console.error('Error: ID and target directory required. Usage: features download <id> --out <dest-dir>');
        process.exit(1);
      }

      try {
        const result = downloadFeature(id, targetDir, { overwrite: Boolean(flags.overwrite) });
        console.log(`\x1b[32m✓\x1b[0m Feature '${id}' successfully downloaded to: ${result.targetDir}`);
        console.log(`  Files copied (${result.filesCopied.length}):`);
        for (const f of result.filesCopied) {
          console.log(`    - ${f}`);
        }
      } catch (err) {
        console.error(`\x1b[31m✗ Download failed:\x1b[0m ${err.message}`);
        process.exit(1);
      }
      break;
    }

    case 'new': {
      const id = positional[0];
      if (!id) {
        console.error('Error: Feature ID required. Usage: features new <feature-id> --category <cat>');
        process.exit(1);
      }

      try {
        const dir = scaffoldFeature(id, {
          category: flags.category,
          name: flags.name,
          authorName: flags.author,
          authorGithub: flags.github
        });
        console.log(`\x1b[32m✓\x1b[0m Scaffolding created at: ${dir}`);
        console.log(`  Next steps:`);
        console.log(`    1. Implement logic in index.js`);
        console.log(`    2. Add unit tests in test.js`);
        console.log(`    3. Run \`features validate\` and \`npm test\``);
      } catch (err) {
        console.error(`\x1b[31m✗ Scaffolding failed:\x1b[0m ${err.message}`);
        process.exit(1);
      }
      break;
    }

    case 'branch': {
      const id = positional[0];
      if (!id) {
        console.error('Error: Feature ID required. Usage: features branch <feature-id>');
        process.exit(1);
      }

      try {
        const branch = createGitBranch(id);
        console.log(`\x1b[32m✓\x1b[0m Switched to new branch: ${branch}`);
      } catch (err) {
        console.error(`\x1b[31m✗ Branch creation failed:\x1b[0m ${err.message}`);
        process.exit(1);
      }
      break;
    }

    case 'serve': {
      const port = Number(flags.port || 8766);
      const { url } = await startServer(port);
      console.log(`\n\x1b[1m\x1b[32m✓ Features Local Catalog Server running!\x1b[0m`);
      console.log(`  Web Explorer: \x1b[36m${url}\x1b[0m`);
      console.log(`  REST API:     \x1b[36m${url}/api/features\x1b[0m`);
      console.log(`  Index JSON:   \x1b[36m${url}/api/index\x1b[0m`);
      console.log(`\nPress Ctrl+C to stop.`);
      break;
    }

    default: {
      console.error(`Unknown command: '${command}'. Run 'features help' for usage.`);
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
