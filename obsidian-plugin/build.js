import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getOrBuildIndex } from '../src/indexer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLUGIN_DIR = __dirname;
const OUT_FILE = path.join(PLUGIN_DIR, 'main.js');

const index = getOrBuildIndex();
const serializedIndex = JSON.stringify(index);

const template = `/* Features Explorer Obsidian Plugin - Bundled Artifact */
const { Plugin, ItemView, WorkspaceLeaf, Modal, Notice } = require('obsidian');

const VIEW_TYPE_FEATURES = 'features-catalog-view';
const EMBEDDED_CATALOG_INDEX = ${serializedIndex};

class FeaturesDetailModal extends Modal {
  constructor(app, feature) {
    super(app);
    this.feature = feature;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('features-modal-content');

    contentEl.createEl('h2', { text: this.feature.name });
    const metaRow = contentEl.createEl('div', { cls: 'feature-modal-meta' });
    metaRow.createEl('span', { text: \`ID: \${this.feature.id} | v\${this.feature.version} | Category: \${this.feature.category}\` });

    contentEl.createEl('p', { text: this.feature.summary, cls: 'feature-modal-summary' });

    if (this.feature.description) {
      contentEl.createEl('h3', { text: 'Description' });
      const pre = contentEl.createEl('pre');
      pre.createEl('code', { text: this.feature.description });
    }

    contentEl.createEl('h3', { text: 'Technologies & Tags' });
    const tagList = contentEl.createEl('p', {
      text: \`Tech: \${(this.feature.technologies || []).join(', ')} | Tags: \${(this.feature.tags || []).join(', ')}\`
    });

    contentEl.createEl('h3', { text: 'Files in Package' });
    const ul = contentEl.createEl('ul');
    for (const f of this.feature.files || []) {
      ul.createEl('li', { text: f });
    }

    const actionRow = contentEl.createEl('div', { cls: 'feature-card-actions', attr: { style: 'margin-top: 16px;' } });
    const copyBtn = actionRow.createEl('button', { cls: 'feature-btn', text: 'Copy CLI Download Command' });
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(\`npx features download \${this.feature.id} --out ./\${this.feature.id}\`);
      new Notice(\`Copied download command for \${this.feature.id}\`);
    };
  }

  onClose() {
    this.contentEl.empty();
  }
}

class FeaturesExplorerView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.catalogIndex = EMBEDDED_CATALOG_INDEX;
    this.selectedCategory = 'all';
    this.searchQuery = '';
  }

  getViewType() {
    return VIEW_TYPE_FEATURES;
  }

  getDisplayText() {
    return 'Features Explorer';
  }

  getIcon() {
    return 'layers';
  }

  async onOpen() {
    await this.refreshCatalog();
    this.render();
  }

  async refreshCatalog() {
    // Optionally query local daemon if running
    try {
      const res = await fetch('http://127.0.0.1:8766/api/index', { signal: AbortSignal.timeout(600) });
      if (res.ok) {
        this.catalogIndex = await res.json();
      }
    } catch {
      // Fallback to embedded index seamlessly
      this.catalogIndex = EMBEDDED_CATALOG_INDEX;
    }
  }

  render() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('features-panel-container');

    // Header
    const header = container.createEl('div', { cls: 'features-header' });
    const titleRow = header.createEl('div', { cls: 'features-title-row' });
    titleRow.createEl('div', { cls: 'features-title', text: 'Features Catalog' });
    const countBadge = titleRow.createEl('span', {
      cls: 'features-count-badge',
      text: \`\${this.catalogIndex.total_features} items\`
    });

    // Search input
    const searchInput = header.createEl('input', {
      cls: 'features-search-box',
      attr: { type: 'text', placeholder: 'Search by keyword, tag, tech...', value: this.searchQuery }
    });
    searchInput.oninput = (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderList(listContainer);
    };

    // Filter Chips
    const chipsContainer = header.createEl('div', { cls: 'features-filter-chips' });
    const categories = ['all', ...Object.keys(this.catalogIndex.stats?.categories || {})];
    for (const cat of categories) {
      const chip = chipsContainer.createEl('div', {
        cls: \`features-chip \${this.selectedCategory === cat ? 'active' : ''}\`,
        text: cat.toUpperCase()
      });
      chip.onclick = () => {
        this.selectedCategory = cat;
        this.render();
      };
    }

    // List Container
    const listContainer = container.createEl('div', { cls: 'features-list' });
    this.renderList(listContainer);
  }

  renderList(listContainer) {
    listContainer.empty();

    let items = this.catalogIndex.features || [];
    if (this.selectedCategory !== 'all') {
      items = items.filter(f => f.category === this.selectedCategory);
    }
    if (this.searchQuery) {
      items = items.filter(f => {
        const text = \`\${f.id} \${f.name} \${f.summary} \${(f.tags || []).join(' ')} \${(f.technologies || []).join(' ')}\`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    if (items.length === 0) {
      listContainer.createEl('div', { cls: 'features-empty', text: 'No matching features found.' });
      return;
    }

    for (const feature of items) {
      const card = listContainer.createEl('div', { cls: 'feature-card' });

      // Title & badge
      const cardHeader = card.createEl('div', { cls: 'feature-card-header' });
      cardHeader.createEl('div', { cls: 'feature-card-title', text: feature.name });
      cardHeader.createEl('span', {
        cls: \`feature-card-badge \${feature.maturity || 'stable'}\`,
        text: feature.maturity || 'stable'
      });

      // Summary
      card.createEl('div', { cls: 'feature-card-summary', text: feature.summary });

      // Tags
      const tagsContainer = card.createEl('div', { cls: 'feature-card-tags' });
      for (const t of (feature.tags || []).slice(0, 4)) {
        tagsContainer.createEl('span', { cls: 'feature-tag', text: \`#\${t}\` });
      }

      // Actions
      const actions = card.createEl('div', { cls: 'feature-card-actions' });

      // Inspect detail modal
      const viewBtn = actions.createEl('button', { cls: 'feature-btn', text: 'Inspect' });
      viewBtn.onclick = () => {
        new FeaturesDetailModal(this.app, feature).open();
      };

      // Insert note snippet
      const insertBtn = actions.createEl('button', { cls: 'feature-btn', text: 'Insert Note' });
      insertBtn.onclick = () => {
        const activeView = this.app.workspace.getActiveViewOfType(require('obsidian').MarkdownView);
        if (activeView && activeView.editor) {
          const snippet = '\\n> [!NOTE] Feature: ' + feature.name + ' (' + feature.id + ' v' + feature.version + ')\\n> **Category:** ' + feature.category + ' | **Maturity:** ' + feature.maturity + '\\n> ' + feature.summary + '\\n> \\x60npx features download ' + feature.id + ' --out ./' + feature.id + '\\x60\\n\\n';
          activeView.editor.replaceSelection(snippet);
          new Notice('Inserted ' + feature.name + ' into note');
        } else {
          new Notice('Please focus an open Markdown note first');
        }
      };

      // Copy CLI install
      const copyBtn = actions.createEl('button', { cls: 'feature-btn', text: 'Copy CLI' });
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(\`npx features download \${feature.id} --out ./\${feature.id}\`);
        new Notice(\`Copied download command for \${feature.id}\`);
      };
    }
  }
}

class FeaturesPlugin extends Plugin {
  async onload() {
    this.registerView(VIEW_TYPE_FEATURES, (leaf) => new FeaturesExplorerView(leaf, this));

    this.addRibbonIcon('layers', 'Features Explorer', () => {
      this.activateView();
    });

    this.addCommand({
      id: 'open-features-explorer',
      name: 'Open Features Catalog Explorer',
      callback: () => {
        this.activateView();
      }
    });
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_FEATURES);
  }

  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_FEATURES)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({ type: VIEW_TYPE_FEATURES, active: true });
    }
    workspace.revealLeaf(leaf);
  }
}

module.exports = FeaturesPlugin;
`;

fs.writeFileSync(OUT_FILE, template, 'utf8');
console.log(`[build:obsidian] Successfully built ${OUT_FILE} (${(fs.statSync(OUT_FILE).size / 1024).toFixed(1)} KB)`);
