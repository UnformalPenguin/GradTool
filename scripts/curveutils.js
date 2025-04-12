// curveUtils.js

/**
 * Build a CSS easing function string from presets or custom
 */
//export function getEasingFunction(type = 'linear', options = {}) {
//    switch (type) {
//        case 'ease-in':
//        case 'ease-out':
//        case 'ease-in-out':
//        case 'linear':
//            return type;
//        case 'custom':
//            return `cubic-bezier(${options.cx1 ?? 0.25}, ${options.cy1 ?? 0.1}, ${options.cx2 ?? 0.25}, ${options.cy2 ?? 1})`;
//        default:
//            return 'linear';
//    }
//}

///**
// * Generate a variable-speed rotation keyframe
// * e.g., slow → fast → slow loop
// */
//export function generateVariableRotateKeyframes(name, from = 0, to = 360, steps = 5) {
//    const keyframeSteps = [];
//    for (let i = 0; i <= steps; i++) {
//        const pct = (i / steps) * 100;
//        const angle = from + (to - from) * (i / steps);
//        const easeOutIn = Math.sin((i / steps) * Math.PI); // smooth curve
//        keyframeSteps.push(`${pct.toFixed(1)}% { transform: rotate(${angle.toFixed(2)}deg); }`);
//    }

//    return `@keyframes ${name} {\n  ${keyframeSteps.join('\n  ')}\n}`;
//}

///**
// * Placeholder for future noise-driven animations (e.g., jitter, flow, organic motion)
// */
//export function generateNoiseKeyframes(name, type = 'jitter', options = {}) {
//    // Example: jitter motion using scale/skew/blur
//    let frames = '';
//    for (let i = 0; i <= 100; i += 10) {
//        const scale = 1 + (Math.random() - 0.5) * (options.amplitude ?? 0.02);
//        frames += `${i}% { transform: scale(${scale.toFixed(3)}); }\n  `;
//    }
//    return `@keyframes ${name} {\n  ${frames.trim()}\n}`;
//}





//configs

function encodeConfig(configObject) {
    const json = JSON.stringify(compressKeys(configObject));
    const utf8Bytes = new TextEncoder().encode(json);
    const base64 = btoa(String.fromCharCode(...utf8Bytes));
    const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return urlSafe;
}

function decodeConfig(encoded) {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const obj = JSON.parse(json);
    return decompressKeys(obj);
}

function compressKeys(obj) {
    const map = { angle: 'a', repeating: 'r', colorStops: 'cs', opacity: 'o', animations: 'an' };
    return deepReplaceKeys(obj, map);
}

function decompressKeys(obj) {
    const map = { a: 'angle', r: 'repeating', cs: 'colorStops', o: 'opacity', an: 'animations' };
    return deepReplaceKeys(obj, map);
}

function deepReplaceKeys(obj, map) {
    if (Array.isArray(obj)) {
        return obj.map(v => deepReplaceKeys(v, map));
    } else if (obj && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [
                map[k] || k,
                deepReplaceKeys(v, map)
            ])
        );
    }
    return obj;
}
function validateConfig(config) {
    if (!Array.isArray(config)) throw new Error("Missing layers");
    config.layers.forEach((layer, i) => {
        if (!layer.type) throw new Error(`Layer ${i} missing type`);
        if (!Array.isArray(layer.colorStops)) throw new Error(`Layer ${i} missing colorStops`);
    });
}


function getEmbedding(config) {
    const encoded = encodeConfig(config);
    const shareURL = `${window.location.origin}/view?config=${encoded}`;
    //console.log(shareURL + " " + config); // ready to share
    return shareURL;
}






//CLIPPING

function fullClipPathString(clip) {
    if (!clip.doclip || clip.shape === 'none') return 'none';
        
    if (clip.shape === 'custom') {
        if (clip.customValue && isValidClipPath(clip.customValue)) {
            return clip.customValue;
        }
        return 'none';
    }
    else {
        return getPresetClipPath(clip.shape, clip.options || {});

    }

    return 'none';
}




function getPresetClipPath(preset, options = {}) {
    switch (preset) {
        case 'triangle':
            return `polygon(50% 0%, 0% 100%, 100% 100%)`;

        case 'hexagon':
            return `polygon(
                25% 5%,
                75% 5%,
                100% 50%,
                75% 95%,
                25% 95%,
                0% 50%
            )`;

        case 'star':
            return buildStarClipPath(options.points || 5, options.innerRadius || 40, options.outerRadius || 100, options.rotation || 0);

        case 'polygon':
            return buildRegularPolygonPath(options.sides || 6, options.radius || 50, options.rotation || 0);

        case 'blob':
            return `path("${options.path || generateRandomBlobPath(options.seed || 1)}")`;

        case 'circle':
            return `circle(${options.radius || '50%'} at ${options.cx || '50%'} ${options.cy || '50%'})`;

        case 'ellipse':
            return `ellipse(${options.rx || '50%'} ${options.ry || '50%'} at ${options.cx || '50%'} ${options.cy || '50%'})`;

        case 'inset':
            return `inset(${options.top || '10%'} ${options.right || '10%'} ${options.bottom || '10%'} ${options.left || '10%'})`;

        default:
            return 'none';
    }
}

function buildStarClipPath(points, innerRadius, outerRadius, rotationDeg = 0) {
    const angleStep = Math.PI / points;
    let path = [];

    for (let i = 0; i < 2 * points; i++) {
        const angle = i * angleStep - Math.PI / 2 + (rotationDeg * Math.PI / 180);
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = 50 + radius * Math.cos(angle) / 100 * 50;
        const y = 50 + radius * Math.sin(angle) / 100 * 50;
        path.push(`${x}% ${y}%`);
    }

    return `polygon(${path.join(', ')})`;
}

function buildRegularPolygonPath(sides, radius, rotationDeg = 0) {
    const angleStep = (2 * Math.PI) / sides;
    let path = [];

    for (let i = 0; i < sides; i++) {
        const angle = i * angleStep - Math.PI / 2 + (rotationDeg * Math.PI / 180);
        const x = 50 + radius * Math.cos(angle) / 100 * 50;
        const y = 50 + radius * Math.sin(angle) / 100 * 50;
        path.push(`${x}% ${y}%`);
    }

    return `polygon(${path.join(', ')})`;
}

function generateRandomBlobPath(seed) {
    // Placeholder – use something like https://blobs.dev or a Perlin-based generator later
    // Could also store pre-seeded blobs
    return "M62.3,-63.5C76.5,-47.5,80.3,-23.8,75.4,-4.2C70.5,15.3,56.8,30.6,42.6,44.8C28.4,59,14.2,72.1,-2.6,74.8C-19.4,77.5,-38.8,69.8,-51.3,56.4C-63.7,43,-69.2,24,-68.2,6.1C-67.2,-11.8,-59.8,-28.6,-48.2,-44.3C-36.6,-60,-20.8,-74.6,0.4,-75.2C21.5,-75.8,43,-62.5,62.3,-63.5Z";
}

function isValidClipPath(value) {
    return /^(polygon|circle|ellipse|inset|path)\(.*\)$/.test(value.trim());
}


function getPresetDetails(preset) {
    switch (preset) {
        case 'triangle':
            return `{
                sides: 3,
  rotation: 0,
  direction: 'up' | 'right' | 'down' | 'left'
}`;
        case 'hexagon':
            return `{
                sides: 3–12,
  rotation: degrees,
  radius: % (size relative to layer bounds)
}`;
        case 'star':
            return `
                {
  points: 5–12,
  innerRadius: %,  // depth of the indent
  outerRadius: %,
  rotation: degrees
}
`;
                case 'blob':
            return `{
  seed: number,
  complexity: 3–12,
  variation: 0.1–1,
  symmetry: true/false,
  path: string (optional override),
}`;

        case 'circle':
        case 'ellipse':
            return `{
  shape: 'circle' | 'ellipse',
  radiusX: % | px,
  radiusY: % | px,
  centerX: %,
  centerY: %
}}`;
                default:
            return 'none';
    }
}

function generateClipPathForSVG(layer, clipId, svgWidth, svgHeight, cx, cy) {
    if (!layer.clip || layer.clip.shape === 'none') return null;

    const path = fullClipPathString(layer);
    if (!path || path === 'none') return null;

    // Polygon or basic types
    if (path.startsWith('triangle') || path.startsWith('star') || path.startsWith('blob') || path.startsWith('hexagon') 
    || path.startsWith('polygon') || path.startsWith('circle') || path.startsWith('ellipse') || path.startsWith('inset')) {
        return `<clipPath id="${clipId}">
  <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" style="clip-path:${path};" />
</clipPath>`;
    }

    // SVG path directly
    if (path.startsWith('path')) {
        const d = path.match(/"([^"]+)"/)?.[1];
        return `<clipPath id="${clipId}"><path d="${d}" transform="translate(${cx}, ${cy}) scale(0.5)" /></clipPath>`;
    }

    return null;
}
