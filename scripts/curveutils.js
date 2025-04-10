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