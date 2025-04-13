

function initKeyframeBuckets() {
    return {
        transform: { '0%': [], '50%': [], '100%': [] },
        filter: { '0%': [], '50%': [], '100%': [] },
        other: [],
        maxDuration: 0,
        usedTransform: false,
        usedFilter: false
    };
}


function applyAnimationToBuckets(layer, anim, buckets, animName) {
    const duration = anim.duration || defaultDuration;
    buckets.maxDuration = Math.max(buckets.maxDuration, duration);

    switch (anim.type) {
        case 'rotate':
            buckets.usedTransform = true;
            const rot = anim.reverse ? '-' : '';
            buckets.transform['0%'].push(`rotate(0deg)`);
            buckets.transform['50%'].push(`rotate(${rot}180deg)`);
            buckets.transform['100%'].push(`rotate(${rot}360deg)`);
            break;

        case 'steprotate':
            buckets.usedTransform = true;
            buckets.transform['0%'].push(`rotate(0deg)`);
            buckets.transform['100%'].push(`rotate($360deg)`);
            break;

        case 'scale':
            buckets.usedTransform = true;
            const sf = anim.scalefrom ?? 1;
            const st = anim.scaleto ?? 1.1;
            buckets.transform['0%'].push(`scale(${sf})`);
            buckets.transform['50%'].push(`scale(${st})`);
            buckets.transform['100%'].push(`scale(${sf})`);
            break;

        case 'translate':
            buckets.usedTransform = true;
            const txf = anim.transXfrom ?? 0;
            const tyf = anim.transYfrom ?? 0;
            const txt = anim.transXto ?? 10;
            const tyt = anim.transYto ?? 10;
            buckets.transform['0%'].push(`translate(${txf}px, ${tyf}px)`);
            buckets.transform['50%'].push(`translate(${txt}px, ${tyt}px)`);
            buckets.transform['100%'].push(`translate(${txf}px, ${tyf}px)`);
            break;

        case 'skew':
            buckets.usedTransform = true;
            const axis = anim.direction === 'vertical' ? 'Y' : 'X';
            const val = anim.intensity ?? 15;
            buckets.transform['0%'].push(`skew${axis}(0deg)`);
            buckets.transform['50%'].push(`skew${axis}(${val}deg)`);
            buckets.transform['100%'].push(`skew${axis}(0deg)`);
            break;

        case 'blur':
            buckets.usedFilter = true;
            const bf = anim.blurfrom ?? 0;
            const bt = anim.blurto ?? 5;
            buckets.filter['0%'].push(`blur(${bf}px)`);
            buckets.filter['50%'].push(`blur(${(bf + bt) / 2}px)`);
            buckets.filter['100%'].push(`blur(${bt}px)`);
            break;

        case 'hue':
            buckets.usedFilter = true;
            const hf = anim.fromHue ?? 0;
            const ht = anim.toHue ?? 360;
            buckets.filter['0%'].push(`hue-rotate(${hf}deg)`);
            buckets.filter['50%'].push(`hue-rotate(${(hf + ht) / 2}deg)`);
            buckets.filter['100%'].push(`hue-rotate(${ht}deg)`);
            break;

        case 'saturation':
            buckets.usedFilter = true;
            const sf1 = anim.satfrom ?? 1;
            const sf2 = anim.satto ?? 2;
            buckets.filter['0%'].push(`saturate(${sf1})`);
            buckets.filter['50%'].push(`saturate(${(sf1 + sf2) / 2})`);
            buckets.filter['100%'].push(`saturate(${sf2})`);
            break;

        case 'contrast':
            buckets.usedFilter = true;
            buckets.filter['0%'].push(`contrast(100%)`);
            buckets.filter['50%'].push(`contrast(140%)`);
            buckets.filter['100%'].push(`contrast(100%)`);
            break;

        case 'dropglow':
            buckets.usedFilter = true;
            const glowFrom = anim.dropglowFrom ?? 5;
            const glowTo = anim.dropglowTo ?? 10;
            const colorFrom = anim.dropglowcolorfrom ?? '#1c80e3';
            const colorTo = anim.dropglowcolorto ?? '#da76d2';
            buckets.filter['0%'].push(`drop-shadow(0 0 ${glowFrom}px ${colorFrom})`);
            buckets.filter['50%'].push(`drop-shadow(0 0 ${glowTo}px ${colorTo})`);
            buckets.filter['100%'].push(`drop-shadow(0 0 ${glowFrom}px ${colorFrom})`);
            break;

        default:
            buckets.other.push({ anim, animName, duration });
    }
}


function generateMergedKeyframes(name, type, frames) {
    let keyframes = `@keyframes ${name} {
  0% { ${type}: ${frames['0%'].join(' ')}; }`;
    if (frames['50%'].length > 0 && !type.includes("hue")) {
        keyframes += `50 % { ${type}: ${frames['50%'].join(' ')};`;
    }

    keyframes += `100 % { ${ type }: ${ frames['100%'].join(' ') };
}
}\n\n`;
}

function appendAnimation(existing, name, duration, direction = 'normal', delay = 0) {
    const def = `${name} ${duration}s ${delay}s linear infinite ${direction}`;
    return existing ? `${existing}, ${def}` : def;
}
