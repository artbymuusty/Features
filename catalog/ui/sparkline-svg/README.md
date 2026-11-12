# Sparkline SVG Generator

Zero-dependency responsive SVG sparkline chart component with spline curve interpolation.

## Usage

```javascript
import { renderSparkline } from './index.js';

const htmlSvg = renderSparkline([12, 19, 3, 5, 2, 30], {
  width: 150,
  height: 40,
  strokeColor: '#3b82f6'
});

document.getElementById('metric-container').innerHTML = htmlSvg;
```

## Running Tests

```bash
node --test test.js
```
