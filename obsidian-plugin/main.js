/* Features Explorer Obsidian Plugin - Bundled Artifact */
const { Plugin, ItemView, WorkspaceLeaf, Modal, Notice } = require('obsidian');

const VIEW_TYPE_FEATURES = 'features-catalog-view';
const EMBEDDED_CATALOG_INDEX = {"schema_version":"1.0.0","generated_at":"2026-11-12T14:21:29.163Z","total_features":5,"stats":{"categories":{"ai":1,"auth":1,"storage":1,"ui":1,"workflow":1},"technologies":{"javascript":5,"node":4,"stream":1,"crypto":1,"sqlite":1,"svg":1,"css":1,"async":1},"tags":{"ai":1,"mcp":1,"json-rpc":1,"stdio":1,"transport":1,"protocol":1,"agents":1,"auth":1,"security":1,"keychain":1,"biometric":1,"encryption":1,"credentials":1,"storage":1,"sqlite":1,"key-value":1,"database":1,"ttl":1,"persistence":1,"ui":1,"chart":1,"svg":1,"sparkline":1,"visualization":1,"dashboard":1,"workflow":1,"cron":1,"scheduler":1,"timer":1,"retry":1,"jitter":1,"background-tasks":1},"maturities":{"stable":5}},"features":[{"id":"mcp-stdio-bridge","name":"MCP Stdio Bridge","version":"1.0.0","summary":"Model Context Protocol JSON-RPC 2.0 message framer and stdio transport adapter","description":"## MCP Stdio Bridge\n\nImplements line-delimited and Content-Length framed JSON-RPC 2.0 transport for Model Context Protocol (MCP) servers and clients communicating over process standard I/O streams.\n\n### Highlights\n- Strict JSON-RPC 2.0 request/response/notification framing\n- Streaming parser with buffer chunk reassembly\n- Request ID matching with Promise callbacks and timeouts\n- Zero external runtime dependencies","category":"ai","tags":["ai","mcp","json-rpc","stdio","transport","protocol","agents"],"technologies":["javascript","node","stream"],"maturity":"stable","dependencies":{},"license":"MIT","author":{"name":"Mustafa Furkan ÖZCAN","github":"artbymuusty"},"entrypoint":"index.js","files":["README.md","feature.json","index.js","test.js"],"relativeCatalogDir":"ai/mcp-stdio-bridge"},{"id":"biometric-keychain","name":"Biometric Keychain Vault","version":"1.0.0","summary":"Platform-agnostic biometric authentication and encrypted credential storage interface","description":"## Biometric Keychain Vault\n\nProvides a secure, platform-agnostic abstraction for storing authentication tokens and credentials guarded by biometric authorization (Touch ID, Face ID, Windows Hello) with software fallbacks for headless/CI environments.\n\n### Capabilities\n- Biometric gating on read/write operations\n- Secure PBKDF2/AES-GCM encryption in software mode\n- Token rotation and automatic invalidation\n- Zero third-party dependencies","category":"auth","tags":["auth","security","keychain","biometric","encryption","credentials"],"technologies":["javascript","node","crypto"],"maturity":"stable","dependencies":{},"license":"MIT","author":{"name":"Mustafa Furkan ÖZCAN","github":"artbymuusty"},"entrypoint":"index.js","files":["README.md","feature.json","index.js","test.js"],"relativeCatalogDir":"auth/biometric-keychain"},{"id":"sqlite-kv-store","name":"SQLite Key-Value Store","version":"1.0.0","summary":"Resilient, high-throughput key-value store with TTL expiration and JSON document querying","description":"## SQLite KV Store\n\nA zero-dependency, transactional key-value storage engine backed by SQLite. Features automatic TTL eviction, namespaced partitioning, and JSON document queries.\n\n### Features\n- Native SQLite backend using `node:sqlite`\n- Auto-pruning TTL expiration\n- Namespaced keys\n- Bulk atomic batch operations\n- Zero external runtime dependencies","category":"storage","tags":["storage","sqlite","key-value","database","ttl","persistence"],"technologies":["javascript","node","sqlite"],"maturity":"stable","dependencies":{},"license":"MIT","author":{"name":"Mustafa Furkan ÖZCAN","github":"artbymuusty"},"entrypoint":"index.js","files":["README.md","feature.json","index.js","test.js"],"relativeCatalogDir":"storage/sqlite-kv-store"},{"id":"sparkline-svg","name":"Sparkline SVG Generator","version":"1.0.0","summary":"Zero-dependency responsive SVG sparkline chart component with spline curve interpolation","description":"## Sparkline SVG Generator\n\nGenerate beautiful, responsive, self-contained SVG sparklines with smooth Catmull-Rom or cubic bezier spline interpolation, gradient area fills, min/max markers, and interactive hover dots.\n\n### Highlights\n- Pure SVG string output (usable on server or client)\n- Configurable width, height, stroke width, and gradient colors\n- Automatic scale normalization\n- Zero runtime dependencies","category":"ui","tags":["ui","chart","svg","sparkline","visualization","dashboard"],"technologies":["javascript","svg","css"],"maturity":"stable","dependencies":{},"license":"MIT","author":{"name":"Mustafa Furkan ÖZCAN","github":"artbymuusty"},"entrypoint":"index.js","files":["README.md","feature.json","index.js","test.js"],"relativeCatalogDir":"ui/sparkline-svg"},{"id":"precision-cron","name":"Precision Cron Scheduler","version":"1.0.0","summary":"In-memory precision job scheduler with drift compensation, jitter, and retry backoff","description":"## Precision Cron Scheduler\n\nA resilient, memory-efficient background task runner featuring millisecond drift correction, configurable randomized jitter to prevent thundering herd spikes, and automated exponential backoff on failure.\n\n### Highlights\n- Interval and recurring timer execution with drift compensation\n- Randomized jitter window to spread API bursts\n- Execution history ring buffer and success/failure metrics\n- Graceful cancellation and cleanup\n- Zero external runtime dependencies","category":"workflow","tags":["workflow","cron","scheduler","timer","retry","jitter","background-tasks"],"technologies":["javascript","node","async"],"maturity":"stable","dependencies":{},"license":"MIT","author":{"name":"Mustafa Furkan ÖZCAN","github":"artbymuusty"},"entrypoint":"index.js","files":["README.md","feature.json","index.js","test.js"],"relativeCatalogDir":"workflow/precision-cron"}],"inverted_index":{"javascript":["mcp-stdio-bridge","biometric-keychain","sqlite-kv-store","sparkline-svg","precision-cron"],"node":["mcp-stdio-bridge","biometric-keychain","sqlite-kv-store","precision-cron"],"stream":["mcp-stdio-bridge"],"ai":["mcp-stdio-bridge"],"mcp":["mcp-stdio-bridge"],"json-rpc":["mcp-stdio-bridge"],"stdio":["mcp-stdio-bridge"],"transport":["mcp-stdio-bridge"],"protocol":["mcp-stdio-bridge"],"agents":["mcp-stdio-bridge"],"mcp-stdio-bridge":["mcp-stdio-bridge"],"bridge":["mcp-stdio-bridge"],"model":["mcp-stdio-bridge"],"context":["mcp-stdio-bridge"],"message":["mcp-stdio-bridge"],"framer":["mcp-stdio-bridge"],"and":["mcp-stdio-bridge","biometric-keychain","sqlite-kv-store","precision-cron"],"adapter":["mcp-stdio-bridge"],"crypto":["biometric-keychain"],"auth":["biometric-keychain"],"security":["biometric-keychain"],"keychain":["biometric-keychain"],"biometric":["biometric-keychain"],"encryption":["biometric-keychain"],"credentials":["biometric-keychain"],"biometric-keychain":["biometric-keychain"],"vault":["biometric-keychain"],"platform-agnostic":["biometric-keychain"],"authentication":["biometric-keychain"],"encrypted":["biometric-keychain"],"credential":["biometric-keychain"],"storage":["biometric-keychain","sqlite-kv-store"],"interface":["biometric-keychain"],"sqlite":["sqlite-kv-store"],"key-value":["sqlite-kv-store"],"database":["sqlite-kv-store"],"ttl":["sqlite-kv-store"],"persistence":["sqlite-kv-store"],"sqlite-kv-store":["sqlite-kv-store"],"store":["sqlite-kv-store"],"resilient":["sqlite-kv-store"],"high-throughput":["sqlite-kv-store"],"with":["sqlite-kv-store","sparkline-svg","precision-cron"],"expiration":["sqlite-kv-store"],"json":["sqlite-kv-store"],"document":["sqlite-kv-store"],"querying":["sqlite-kv-store"],"svg":["sparkline-svg"],"css":["sparkline-svg"],"ui":["sparkline-svg"],"chart":["sparkline-svg"],"sparkline":["sparkline-svg"],"visualization":["sparkline-svg"],"dashboard":["sparkline-svg"],"sparkline-svg":["sparkline-svg"],"generator":["sparkline-svg"],"zero-dependency":["sparkline-svg"],"responsive":["sparkline-svg"],"component":["sparkline-svg"],"spline":["sparkline-svg"],"curve":["sparkline-svg"],"interpolation":["sparkline-svg"],"async":["precision-cron"],"workflow":["precision-cron"],"cron":["precision-cron"],"scheduler":["precision-cron"],"timer":["precision-cron"],"retry":["precision-cron"],"jitter":["precision-cron"],"background-tasks":["precision-cron"],"precision-cron":["precision-cron"],"precision":["precision-cron"],"in-memory":["precision-cron"],"job":["precision-cron"],"drift":["precision-cron"],"compensation":["precision-cron"],"backoff":["precision-cron"]}};

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
    metaRow.createEl('span', { text: `ID: ${this.feature.id} | v${this.feature.version} | Category: ${this.feature.category}` });

    contentEl.createEl('p', { text: this.feature.summary, cls: 'feature-modal-summary' });

    if (this.feature.description) {
      contentEl.createEl('h3', { text: 'Description' });
      const pre = contentEl.createEl('pre');
      pre.createEl('code', { text: this.feature.description });
    }

    contentEl.createEl('h3', { text: 'Technologies & Tags' });
    const tagList = contentEl.createEl('p', {
      text: `Tech: ${(this.feature.technologies || []).join(', ')} | Tags: ${(this.feature.tags || []).join(', ')}`
    });

    contentEl.createEl('h3', { text: 'Files in Package' });
    const ul = contentEl.createEl('ul');
    for (const f of this.feature.files || []) {
      ul.createEl('li', { text: f });
    }

    const actionRow = contentEl.createEl('div', { cls: 'feature-card-actions', attr: { style: 'margin-top: 16px;' } });
    const copyBtn = actionRow.createEl('button', { cls: 'feature-btn', text: 'Copy CLI Download Command' });
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(`npx features download ${this.feature.id} --out ./${this.feature.id}`);
      new Notice(`Copied download command for ${this.feature.id}`);
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
      text: `${this.catalogIndex.total_features} items`
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
        cls: `features-chip ${this.selectedCategory === cat ? 'active' : ''}`,
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
        const text = `${f.id} ${f.name} ${f.summary} ${(f.tags || []).join(' ')} ${(f.technologies || []).join(' ')}`.toLowerCase();
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
        cls: `feature-card-badge ${feature.maturity || 'stable'}`,
        text: feature.maturity || 'stable'
      });

      // Summary
      card.createEl('div', { cls: 'feature-card-summary', text: feature.summary });

      // Tags
      const tagsContainer = card.createEl('div', { cls: 'feature-card-tags' });
      for (const t of (feature.tags || []).slice(0, 4)) {
        tagsContainer.createEl('span', { cls: 'feature-tag', text: `#${t}` });
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
          const snippet = `\n> [!NOTE] Feature: ${feature.name} (`${feature.id}` v${feature.version})\n> **Category:** ${feature.category} | **Maturity:** ${feature.maturity}\n> ${feature.summary}\n> `npx features download ${feature.id} --out ./${feature.id}`\n\n`;
          activeView.editor.replaceSelection(snippet);
          new Notice(`Inserted ${feature.name} into note`);
        } else {
          new Notice('Please focus an open Markdown note first');
        }
      };

      // Copy CLI install
      const copyBtn = actions.createEl('button', { cls: 'feature-btn', text: 'Copy CLI' });
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(`npx features download ${feature.id} --out ./${feature.id}`);
        new Notice(`Copied download command for ${feature.id}`);
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
