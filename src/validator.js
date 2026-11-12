import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_PATH = path.resolve(__dirname, '../schemas/feature.schema.json');

let cachedSchema = null;

export function loadSchema() {
  if (!cachedSchema) {
    const raw = fs.readFileSync(SCHEMA_PATH, 'utf8');
    cachedSchema = JSON.parse(raw);
  }
  return cachedSchema;
}

/**
 * Validates a feature object against feature.schema.json
 * @param {object} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateFeature(data) {
  const schema = loadSchema();
  const errors = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, errors: ['Feature metadata must be a JSON object'] };
  }

  // 1. Check required fields
  for (const field of schema.required) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`Missing required field: '${field}'`);
    }
  }

  // 2. Additional properties check (if additionalProperties: false)
  if (schema.additionalProperties === false) {
    const allowed = new Set(Object.keys(schema.properties));
    for (const key of Object.keys(data)) {
      if (!allowed.has(key)) {
        errors.push(`Disallowed property found: '${key}'`);
      }
    }
  }

  // 3. ID format
  if (data.id !== undefined) {
    if (typeof data.id !== 'string') {
      errors.push("'id' must be a string");
    } else {
      const idPattern = new RegExp(schema.properties.id.pattern);
      if (!idPattern.test(data.id)) {
        errors.push(`'id' must be kebab-case matching ${schema.properties.id.pattern} (got '${data.id}')`);
      }
    }
  }

  // 4. Name length
  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.push("'name' must be a string");
    } else {
      if (data.name.length < schema.properties.name.minLength) {
        errors.push(`'name' must be at least ${schema.properties.name.minLength} characters`);
      }
      if (data.name.length > schema.properties.name.maxLength) {
        errors.push(`'name' must not exceed ${schema.properties.name.maxLength} characters`);
      }
    }
  }

  // 5. Version semver
  if (data.version !== undefined) {
    if (typeof data.version !== 'string') {
      errors.push("'version' must be a string");
    } else {
      const vPattern = new RegExp(schema.properties.version.pattern);
      if (!vPattern.test(data.version)) {
        errors.push(`'version' must be valid semver (e.g. '1.0.0'), got '${data.version}'`);
      }
    }
  }

  // 6. Summary length
  if (data.summary !== undefined) {
    if (typeof data.summary !== 'string') {
      errors.push("'summary' must be a string");
    } else {
      if (data.summary.length < schema.properties.summary.minLength) {
        errors.push(`'summary' must be at least ${schema.properties.summary.minLength} characters`);
      }
      if (data.summary.length > schema.properties.summary.maxLength) {
        errors.push(`'summary' must not exceed ${schema.properties.summary.maxLength} characters`);
      }
    }
  }

  // 7. Category enum
  if (data.category !== undefined) {
    const validCats = schema.properties.category.enum;
    if (!validCats.includes(data.category)) {
      errors.push(`'category' must be one of: [${validCats.join(', ')}] (got '${data.category}')`);
    }
  }

  // 8. Tags array & format
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.push("'tags' must be an array of strings");
    } else {
      const tagPattern = new RegExp(schema.properties.tags.items.pattern);
      const seen = new Set();
      for (const tag of data.tags) {
        if (typeof tag !== 'string' || !tagPattern.test(tag)) {
          errors.push(`Tag '${tag}' must be kebab-case string`);
        }
        if (seen.has(tag)) {
          errors.push(`Duplicate tag '${tag}'`);
        }
        seen.add(tag);
      }
    }
  }

  // 9. Technologies array
  if (data.technologies !== undefined) {
    if (!Array.isArray(data.technologies)) {
      errors.push("'technologies' must be an array of strings");
    } else {
      const seen = new Set();
      for (const tech of data.technologies) {
        if (typeof tech !== 'string' || !tech.trim()) {
          errors.push(`Technology item must be a non-empty string`);
        }
        if (seen.has(tech)) {
          errors.push(`Duplicate technology '${tech}'`);
        }
        seen.add(tech);
      }
    }
  }

  // 10. Maturity enum
  if (data.maturity !== undefined) {
    const validMaturity = schema.properties.maturity.enum;
    if (!validMaturity.includes(data.maturity)) {
      errors.push(`'maturity' must be one of: [${validMaturity.join(', ')}] (got '${data.maturity}')`);
    }
  }

  // 11. Author object
  if (data.author !== undefined) {
    if (typeof data.author !== 'object' || Array.isArray(data.author) || !data.author) {
      errors.push("'author' must be an object with at least a 'name' field");
    } else if (!data.author.name || typeof data.author.name !== 'string') {
      errors.push("'author.name' is required and must be a string");
    }
  }

  // 12. Dependencies object
  if (data.dependencies !== undefined) {
    if (typeof data.dependencies !== 'object' || Array.isArray(data.dependencies) || !data.dependencies) {
      errors.push("'dependencies' must be a key-value object");
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a feature file from disk
 * @param {string} filePath
 * @returns {{ valid: boolean, errors: string[], data?: object }}
 */
export function validateFeatureFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { valid: false, errors: [`File does not exist: ${filePath}`] };
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const result = validateFeature(data);
    return { ...result, data };
  } catch (err) {
    return { valid: false, errors: [`JSON parse failure in ${filePath}: ${err.message}`] };
  }
}
