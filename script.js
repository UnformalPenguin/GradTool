        var layers = [];
var currentLayerIndex = -1;

const templates = [    
        {
        name: "Aurora Pulse",
            preview: "linear-gradient(45deg, #00c9ff 0%, #92fe9d 20%, rgba(242, 218, 132, 1) 50%, rgba(165, 113, 223, 1) 100%)",
        config: [
            {
                "type": "linear",
                "shape": "square",
                "colorStops": [
                    {
                        "color": "#00c9ff",
                        "stop": "0%"
                    },
                    {
                        "color": "#92fe9d",
                        "stop": "20%"
                    },
                    {
                        "color": "rgba(242, 218, 132, 1)",
                        "stop": "50%"
                    },
                    {
                        "color": "rgba(165, 113, 223, 1)",
                        "stop": "100%"
                    }
                ],
                "angle": 90,
                "animate": false,
                "duration": 20,
                "clockwise": false,
                "blur": 2,
                "opacity": 1,
                "repeating": false,
                "visible": true,
                "colors": "undefined"
            }
        ]
    },
    {
        name: "Hopeful Banner",
        preview: "linear-gradient(rgba(223, 141, 237, 1) 15%, rgba(255, 255, 255, 0.91) 50%, rgba(109, 184, 245, 1) 100%)",
        config: [
            {
                "type": "linear",
                "shape": "square",
                "colorStops": [
                    {
                        "color": "rgba(223, 141, 237, 1)",
                        "stop": "15%"
                    },
                    {
                        "color": "rgba(255, 255, 255, 0.91)",
                        "stop": "50%"
                    },
                    {
                        "color": "rgba(109, 184, 245, 1)",
                        "stop": "100%"
                    }
                ],
                "animate": false,
                "duration": 20,
                "clockwise": false,
                "blur": 2,
                "opacity": 1,
                "repeating": false,
                "visible": true,
                "colors": "undefined"
            }
        ]
    },
    
    {
        name: "Cyber Stripes",
        preview: "repeating-linear-gradient(45deg, #ff0066, #ff0066 10%, #000 10%, #000 20%)",
        config: [
            {
                "type": "linear",
                "direction": "45deg",
                "blur": 0,
                "opacity": 0.65,
                "repeating": true,
                "colorStops": [
                    {
                        "color": "#ff0066",
                        "stop": "0%"
                    },
                    {
                        "color": "#ff0066",
                        "stop": "10%"
                    },
                    {
                        "color": "#000000",
                        "stop": "10%"
                    },
                    {
                        "color": "#000000",
                        "stop": "20%"
                    }
                ],
                "animate": true,
                "duration": 12,
                "clockwise": true,
                "visible": true,
                "shape": "",
                "angle": 0
            },
            {
                "type": "linear",
                "direction": "45deg",
                "blur": 0,
                "opacity": 0.6,
                "repeating": true,
                "colorStops": [
                    {
                        "color": "#ff0066",
                        "stop": "0%"
                    },
                    {
                        "color": "#ff0066",
                        "stop": "10%"
                    },
                    {
                        "color": "#000000",
                        "stop": "10%"
                    },
                    {
                        "color": "#000000",
                        "stop": "20%"
                    }
                ],
                "animate": true,
                "duration": 12,
                "clockwise": false,
                "visible": true,
                "shape": "",
                "angle": 0
            }
        ]
    },
    {
        name: "Neon Spin",
        preview: "conic-gradient(from 0deg at 50% 50%, #39ff14 0%, transparent 30%)",
        config: [
            {
                "type": "conic",
                "startAngle": 0,
                "centerX": 50,
                "centerY": 50,
                "blur": 3,
                "opacity": 0.9,
                "repeating": false,
                "colorStops": [
                    {
                        "color": "#39ff14",
                        "stop": "0deg"
                    },
                    {
                        "color": "transparent",
                        "stop": "30deg"
                    }
                ],
                "animate": true,
                "duration": 6,
                "clockwise": false,
                "visible": true,
                "shape": ""
            },
            {
                "type": "conic",
                "startAngle": 0,
                "centerX": 50,
                "centerY": 50,
                "blur": 3,
                "opacity": 0.9,
                "repeating": false,
                "colorStops": [
                    {
                        "color": "#39ff14",
                        "stop": "0deg"
                    },
                    {
                        "color": "transparent",
                        "stop": "30deg"
                    }
                ],
                "animate": true,
                "duration": 6,
                "clockwise": true,
                "visible": true,
                "shape": ""
            },
            {
                "type": "conic",
                "startAngle": 0,
                "centerX": 50,
                "centerY": 50,
                "blur": 3,
                "opacity": 0.9,
                "repeating": false,
                "colorStops": [
                    {
                        "color": "#39ff14",
                        "stop": "0deg"
                    },
                    {
                        "color": "transparent",
                        "stop": "30deg"
                    }
                ],
                "animate": true,
                "duration": 7,
                "clockwise": true,
                "visible": true,
                "shape": ""
            },
            {
                "type": "conic",
                "startAngle": 180,
                "centerX": 50,
                "centerY": 50,
                "blur": 3,
                "opacity": 0.35,
                "repeating": false,
                "colorStops": [
                    {
                        "color": "#00ffff",
                        "stop": "0deg"
                    },
                    {
                        "color": "transparent",
                        "stop": "30deg"
                    }
                ],
                "animate": true,
                "duration": 8,
                "clockwise": false,
                "visible": true,
                "shape": ""
            },
            {
                "type": "conic",
                "startAngle": 180,
                "centerX": 50,
                "centerY": 50,
                "blur": 3,
                "opacity": 0.35,
                "repeating": false,
                "colorStops": [
                    {
                        "color": "#00ffff",
                        "stop": "0deg"
                    },
                    {
                        "color": "transparent",
                        "stop": "30deg"
                    }
                ],
                "animate": true,
                "duration": 8,
                "clockwise": true,
                "visible": true,
                "shape": ""
            },
            {
                "type": "conic",
                "startAngle": 180,
                "centerX": 50,
                "centerY": 50,
                "blur": 3,
                "opacity": 0.4,
                "repeating": false,
                "colorStops": [
                    {
                        "color": "#00ffff",
                        "stop": "0deg"
                    },
                    {
                        "color": "transparent",
                        "stop": "30deg"
                    }
                ],
                "animate": true,
                "duration": 9,
                "clockwise": true,
                "visible": true,
                "shape": ""
            }
        ]
    },
    {
        name: "Deep Space Swirl",
        preview: "conic-gradient(from 0deg at 50% 50%, rgba(147, 166, 232, 1) 95%, rgba(196, 100, 236, 1) 100%)",
        config: [
            {
                "type": "conic",
                "shape": "circle",
                "colorStops": [
                    {
                        "color": "rgba(147, 166, 232, 1)",
                        "stop": "95%"
                    },
                    {
                        "color": "rgba(196, 100, 236, 1)",
                        "stop": "100%"
                    }
                ],
                "startAngle": 0,
                "centerX": 50,
                "centerY": 50,
                "animate": true,
                "duration": 8,
                "clockwise": true,
                "blur": 6,
                "opacity": 0.8,
                "repeating": false,
                "visible": true,
                "colors": "undefined"
            }
        ]

    },
    {
        name: "Targeted Glow",
        preview: "repeating-radial-gradient(circle farthest-corner at 50% 50%, rgba(247, 0, 0, 1) 0%, #bfe9ff 15%, rgba(123, 68, 225, 1) 20%)",
        config: [
            {
                "type": "radial",
                "shape": "circle",
                "colorStops": [
                    {
                        "color": "rgba(247, 0, 0, 1)",
                        "stop": "0%"
                    },
                    {
                        "color": "#bfe9ff",
                        "stop": "15%"
                    },
                    {
                        "color": "rgba(123, 68, 225, 1)",
                        "stop": "20%"
                    }
                ],
                "animate": false,
                "duration": 20,
                "clockwise": false,
                "blur": 2,
                "opacity": 1,
                "repeating": true,
                "visible": true,
                "size": "farthest-corner",
                "colors": "undefined",
                "centerX": 50,
                "centerY": 50
            }
        ]
    }
    
    // Add more templates...
];


        function defaultLayer() {
            return {
                type: "linear",
                shape: "square",
                animate: false,
                colorStops: [
                    {
                        "color": "rgba(28, 128, 227, 1)",
                        "stop": "0%"
                    },
                    {
                        "color": "rgba(218, 118, 210, 1)",
                        "stop": "100%"
                    }
                ],
                duration: 10,
                clockwise: true,
                blur: 2,
                opacity: 1.0,
                visible: true,
                angle: 90,         // for linear
                startAngle: 0,     // for conic
                centerX: 50,       // for radial/conic
                centerY: 50,
                size: "farthest-corner", // for radial,
                "direction": "",
                "repeating": false
            };
            
        }

        function renderLayerList() {
            const layerList = document.getElementById('layerList');
            layerList.innerHTML = '';
            layers.forEach((layer, i) => {
                const div = document.createElement('div');
                div.className = 'layer-item' + (currentLayerIndex === i ? ' selected' : '');

                const label = document.createElement('div');
                label.className = 'layer-info';
                label.textContent = `Layer ${i + 1} (${layer.type})`;
                label.onclick = () => selectLayer(i);

                const actions = document.createElement('div');
                actions.className = 'layer-actions';
                

                // Visibility toggle button (👁 or 🚫)
                const copyBtn = document.createElement('button');
                copyBtn.innerHTML = '&#10697';
                copyBtn.className = "toggle-layer-btn";
                copyBtn.title = 'Copy Layer';
                copyBtn.onclick = (e) => {
                    e.stopPropagation();
                    copyThisLayer(i);
                    //createLayers();
                };

                // Visibility toggle button (👁 or 🚫)
                const visBtn = document.createElement('button');
                visBtn.innerHTML = layer.visible ? '&#9788;' : '&#8709';
                visBtn.className = "toggle-layer-btn";
                visBtn.title = 'Toggle visibility';
                visBtn.onclick = (e) => {
                    e.stopPropagation();
                    layer.visible = !layer.visible;
                    createLayers();
                };

                // Delete button (✕)
                const delBtn = document.createElement('button');
                delBtn.className = "delete-layer-btn";
                delBtn.innerHTML = '&#10060';
                delBtn.title = 'Delete layer';
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (currentLayerIndex === i) currentLayerIndex = -1;
                    layers.splice(i, 1);
                    createLayers();
                };

                actions.appendChild(copyBtn);
                actions.appendChild(visBtn);
                actions.appendChild(delBtn);

                div.appendChild(label);
                div.appendChild(actions);
                layerList.appendChild(div);
            });
        }


        function selectLayer(index) {
            currentLayerIndex = index;

            renderColorStops();
            renderDynamicInputs();

            const layer = layers[index];
            document.getElementById('layerType').value = layer.type;
            document.getElementById('layerShape').value = layer.shape;
            //document.getElementById('layerColors').value = layer.colors;
            document.getElementById('layerOpacity').value = layer.opacity;
            document.getElementById('layerBlur').value = layer.blur;
            document.getElementById('layerAnimate').checked = layer.animate;
            document.getElementById('layerClockwise').checked = layer.clockwise;
            document.getElementById('layerDuration').value = layer.duration;

            renderLayerList();
            
        }

function updateCurrentLayer() {
    if (currentLayerIndex < 0) return;
    const layer = layers[currentLayerIndex];

    layer.type = document.getElementById('layerType').value;
    layer.shape = document.getElementById('layerShape').value;
    layer.opacity = parseFloat(document.getElementById('layerOpacity').value);
    layer.blur = parseFloat(document.getElementById('layerBlur').value);
    layer.animate = document.getElementById('layerAnimate').checked;
    layer.duration = parseFloat(document.getElementById('layerDuration').value);
    layer.clockwise = document.getElementById('layerClockwise').checked;

    if (layer.type === 'linear') {
        layer.direction = document.getElementById('linearDirection')?.value.trim() || '';
        layer.angle = parseFloat(document.getElementById('linearAngle')?.value || 0);
        layer.repeating = document.getElementById('repeating')?.checked || false;
    }

    if (layer.type === 'conic') {
        layer.startAngle = parseFloat(document.getElementById('conicStartAngle')?.value || 0);
        layer.centerX = parseFloat(document.getElementById('centerX')?.value || 50);
        layer.centerY = parseFloat(document.getElementById('centerY')?.value || 50);
        layer.repeating = document.getElementById('repeating')?.checked || false;
    }

    if (layer.type === 'radial') {
        layer.size = document.getElementById('radialSize')?.value || '';
        layer.centerX = parseFloat(document.getElementById('centerX')?.value || 50);
        layer.centerY = parseFloat(document.getElementById('centerY')?.value || 50);
        layer.repeating = document.getElementById('repeating')?.checked || false;
    }

    createLayers();
}


function renderDynamicInputs() {
    const container = document.getElementById('dynamicInputs');
    container.innerHTML = '';
    const layer = layers[currentLayerIndex];
    if (!layer) return;

    let html = '';

    if (layer.type === 'linear') {
        html += `
            <label>Direction (e.g. to right, 90deg):
                <input type="text" id="linearDirection" value="${layer.direction || ''}" onchange="updateCurrentLayer()">
            </label>
            <label>Angle (deg):
                <input type="number" id="linearAngle" value="${layer.angle || 0}" onchange="updateCurrentLayer()">
            </label>
            <label>
                <input type="checkbox" id="repeating" ${layer.repeating ? 'checked' : ''} onchange="updateCurrentLayer()">
                Repeating Gradient
            </label>
        `;
    }

    if (layer.type === 'conic') {
        html += `
            <label>Start Angle (deg):
                <input type="number" id="conicStartAngle" value="${layer.startAngle || 0}" onchange="updateCurrentLayer()">
            </label>
            <label>Center X (%):
                <input type="number" id="centerX" value="${layer.centerX || 50}" onchange="updateCurrentLayer()">
            </label>
            <label>Center Y (%):
                <input type="number" id="centerY" value="${layer.centerY || 50}" onchange="updateCurrentLayer()">
            </label>
            <label>
                <input type="checkbox" id="repeating" ${layer.repeating ? 'checked' : ''} onchange="updateCurrentLayer()">
                Repeating Gradient
            </label>
        `;
    }

    if (layer.type === 'radial') {
        html += `
            <label>Size:
                <select id="radialSize" onchange="updateCurrentLayer()">
                    <option value="">none</option>
                    <option value="closest-side">closest-side</option>
                    <option value="farthest-side">farthest-side</option>
                    <option value="closest-corner">closest-corner</option>
                    <option value="farthest-corner">farthest-corner</option>
                </select>
            </label>
            <label>Center X (%):
                <input type="number" id="centerX" value="${layer.centerX || 50}" onchange="updateCurrentLayer()">
            </label>
            <label>Center Y (%):
                <input type="number" id="centerY" value="${layer.centerY || 50}" onchange="updateCurrentLayer()">
            </label>
            <label>
                <input type="checkbox" id="repeating" ${layer.repeating ? 'checked' : ''} onchange="updateCurrentLayer()">
                Repeating Gradient
            </label>
        `;
    }

    container.innerHTML = html;

    if (layer.type === 'radial') {
        document.getElementById('radialSize').value = layer.size || '';
    }
}

       

        function renderColorStops() {
            const container = document.getElementById('colorStopsContainer');
            container.innerHTML = '';
            const layer = layers[currentLayerIndex];
            if (!layer) return;

            layer.colorStops.forEach((stop, i) => {
                const group = document.createElement('div');
                group.className = 'color-stop-group';

                const colorLabel = document.createElement('div');
                colorLabel.className = 'label';
                colorLabel.textContent = 'Color:';

                const colorInput = document.createElement('input');
                colorInput.type = 'color';
                colorInput.value = hexFromRgba(stop.color);
                colorInput.oninput = () => {
                    const currentAlpha = rgbaFromCss(stop.color).a;
                    stop.color = rgbaStringFromHex(colorInput.value, currentAlpha);
                    createLayers();
                };

                const stopLabel = document.createElement('div');
                stopLabel.className = 'label';
                stopLabel.textContent = 'Stop:';

                const stopInput = document.createElement('input');
                stopInput.type = 'text';
                stopInput.value = stop.stop;
                stopInput.placeholder = 'e.g. 50%';
                stopInput.oninput = () => {
                    stop.stop = stopInput.value;
                    createLayers();
                };

                const alphaLabel = document.createElement('div');
                alphaLabel.className = 'label';
                alphaLabel.textContent = 'Alpha:';

                // Alpha control
                const alphaGroup = document.createElement('div');
                alphaGroup.className = 'alpha-group';

                const alphaSlider = document.createElement('input');
                alphaSlider.type = 'range';
                alphaSlider.min = 0;
                alphaSlider.max = 1;
                alphaSlider.step = 0.01;
                alphaSlider.value = rgbaFromCss(stop.color).a;
                alphaSlider.title = 'Alpha';

                alphaSlider.oninput = () => {
                    const baseColor = hexFromRgba(stop.color);
                    stop.color = rgbaStringFromHex(baseColor, parseFloat(alphaSlider.value));
                    createLayers();
                };

                alphaGroup.appendChild(alphaLabel);
                alphaGroup.appendChild(alphaSlider);

                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '&#10060';
                removeBtn.title = 'Remove color stop';
                removeBtn.onclick = () => {
                    layer.colorStops.splice(i, 1);
                    renderColorStops();
                    createLayers();
                };

                group.appendChild(colorLabel);
                group.appendChild(colorInput);
                group.appendChild(stopLabel);
                group.appendChild(stopInput);
                group.appendChild(alphaGroup);
                group.appendChild(removeBtn);

                container.appendChild(group);
            });
        }


        function addColorStop() {
            if (currentLayerIndex < 0) return;
            layers[currentLayerIndex].colorStops.push({ color: '#ffffff', stop: '100%' });
            renderColorStops();
            createLayers();
        }

        function createLayers() {
            const container = document.getElementById('spiral');
            container.innerHTML = '';

            let animStyleElem = document.getElementById('layerAnimations');
            if (!animStyleElem) {
                animStyleElem = document.createElement('style');
                animStyleElem.id = 'layerAnimations';
                document.head.appendChild(animStyleElem);
            }
            animStyleElem.innerHTML = '';

            let animated = false;
            layers.forEach((layer, i) => {
                if (!layer.visible) return;

                const div = document.createElement('div');
                div.className = `spiral-layer layer-${i}`;

                const colorStr = layer.colorStops.map(cs => `${cs.color} ${cs.stop}`).join(', ');
                let gradient = buildGradientString(layer);

                div.style.background = gradient;
                div.style.filter = `blur(${layer.blur}px)`;
                div.style.opacity = layer.opacity;
                div.style.borderRadius = layer.shape === 'square' ? '0' : '50%';

                if (layer.animate) {
                    animated = true;
                    const animName = `spin${i}`;
                    div.style.animation = `${animName} ${layer.duration}s linear infinite`;
                    animStyleElem.innerHTML += `
                    @keyframes ${animName} {
                        to { transform: rotate(${layer.clockwise ? '' : '-'}360deg); }
                    }
                `;
                }

                if (animated) {
                    document.getElementById("layerClockBlock").classList.remove("hidden");
                    document.getElementById("layerDurationBlock").classList.remove("hidden");
                }
                else {
                    document.getElementById("layerClockBlock").classList.add("hidden");
                    document.getElementById("layerDurationBlock").classList.add("hidden");
                }
                div.style.position = 'absolute';
                div.style.inset = 0;
                container.appendChild(div);
            });

            renderLayerList();
        }

function buildGradientString(layer) {
    const stops = layer.colorStops.map(cs => `${cs.color} ${cs.stop}`.trim()).join(', ');

    if (layer.type === 'linear') {
        const linearType = layer.repeating ? 'repeating-linear-gradient' : 'linear-gradient';
        let direction = layer.direction || `${layer.angle || 0}deg`;
        return direction
            ? `${linearType}(${direction}, ${stops})`
            : `${linearType}(${stops})`;
    }

    if (layer.type === 'conic') {
        const conicType = layer.repeating ? 'repeating-conic-gradient' : 'conic-gradient';
        const center = `${layer.centerX}% ${layer.centerY}%`;
        const from = `from ${layer.startAngle || 0}deg at ${center}`;
        return `${conicType}(${from}, ${stops})`;
    }

    if (layer.type === 'radial') {
        const radialType = layer.repeating ? 'repeating-radial-gradient' : 'radial-gradient';
        const shapeSize = `${layer.shape || 'circle'} ${layer.size || ''}`.trim();
        const atPos = `at ${layer.centerX}% ${layer.centerY}%`;
        return `${radialType}(${shapeSize} ${atPos}, ${stops})`;
    }

    return '';
}


        function toggleVisibility() {
            if (currentLayerIndex < 0) return;
            layers[currentLayerIndex].visible = !layers[currentLayerIndex].visible;
            createLayers();
        }

        function addLayer() {
            layers.push(defaultLayer());
            selectLayer(layers.length - 1);
            createLayers();
}
function addThisLayer(layer) {
    layers.push(layer);
    selectLayer(layers.length - 1);
    createLayers();
}
//        function generateCSS() {
//            let css = `.spiral-container {\n  position: relative;\n  width: 300px;\n  height: 300px;\n}\n`;
//            css += `.spiral-layer {\n  position: absolute;\n  inset: 0;\n}\n\n`;

//            layers.forEach((layer, i) => {
//                const stops = layer.colorStops.map(cs => `${cs.color} ${cs.stop}`).join(', ');
//                let gradient = buildGradientString(layer);

//                css += `.layer-${i} {\n  background: ${gradient};\n  filter: blur(${layer.blur}px);\n  opacity: ${layer.opacity};\n  border-radius: ${layer.shape === 'square' ? '0%' : '50%'};\n`;

//                if (layer.animate) {
//                    const animName = `spin${i}`;
//                    css += `  animation: ${animName} ${layer.duration}s linear infinite;\n}\n`;
//                    css += `@keyframes ${animName} { to { transform: rotate(${layer.clockwise ? '' : '-'}360deg); } }\n\n`;
//                } else {
//                    css += '}\n\n';
//                }
//            });

//            document.getElementById('cssOutput').value = css;
//}

function generateCSS() {
    let css = `/* === Spiral Gradient Layers ===
                The spiral-container class styling is optional, and creates the box surrounding the image
    */\n`;
    css += `.spiral-container {\n  position: relative;\n  width: 300px;\n  height: 300px;\n  overflow: hidden;\n}\n`;
    css += `.spiral-layer {\n  position: absolute;\n  inset: 0;\n}\n\n`;

    let html = `<div class="spiral-container">\n`;

    layers.forEach((layer, i) => {
        const gradient = buildGradientString(layer);
        const className = `layer-${i}`;

        css += `.${className} {\n`;
        css += `  background: ${gradient};\n`;
        css += `  filter: blur(${layer.blur}px);\n`;
        css += `  opacity: ${layer.opacity};\n`;
        css += `  border-radius: ${layer.shape === 'square' ? '0%' : '50%'};\n`;

        if (layer.animate) {
            const animName = `spin${i}`;
            css += `  animation: ${animName} ${layer.duration}s linear infinite;\n`;
            css += `}\n\n@keyframes ${animName} {\n  to {\n    transform: rotate(${layer.clockwise ? '' : '-'}360deg);\n  }\n}\n\n`;
        } else {
            css += `}\n\n`;
        }

        html += `  <div class="spiral-layer ${className}"></div>\n`;
    });

    html += `</div>`;

    const combinedExport = `<!-- HTML -->\n${html}\n\n<!-- CSS -->\n<style>\n${css}</style>`;

    document.getElementById('cssOutput').value = combinedExport;
}


        function exportConfig() {
            const config = JSON.stringify(layers, null, 2);
            document.getElementById('configOutput').value = config;
        }

        function importConfig() {
            try {
                const input = document.getElementById('configInput').value;
                layers = JSON.parse(input);
                currentLayerIndex = -1;
                createLayers();
                selectLayer(0);
            } catch (err) {
                alert('Invalid JSON');
            }
        }

        // --- Modified updateCurrentLayer ---
        //function updateCurrentLayer() {
        //    if (currentLayerIndex < 0) return;
        //    const layer = layers[currentLayerIndex];
        //    layer.type = document.getElementById('layerType').value;
        //    layer.shape = document.getElementById('layerShape').value;
        //    //layer.colors = document.getElementById('layerColors').value;
        //    layer.opacity = parseFloat(document.getElementById('layerOpacity').value) || 1.0;
        //    layer.blur = parseInt(document.getElementById('layerBlur').value) || 0;
        //    layer.animate = document.getElementById('layerAnimate').checked;
        //    if (document.getElementById('layerDuration')) {
        //        layer.duration = parseFloat(document.getElementById('layerDuration').value) || 10;
        //    }
        //    if (document.getElementById('layerClockwise')) {
        //        layer.clockwise = document.getElementById('layerClockwise').checked;
        //    }
        //    createLayers();
        //}

        // --- Modified deleteLayer ---
        function deleteLayer() {
            if (currentLayerIndex < 0) return;
            layers.splice(currentLayerIndex, 1);
            currentLayerIndex = -1;
            createLayers();
        }


        // --- New Feature: Copy Layer ---
        function copyLayer() {
            if (currentLayerIndex < 0 || currentLayerIndex >= layers.length) return;
            const original = layers[currentLayerIndex];
            const copy = JSON.parse(JSON.stringify(original)); // Deep clone

            layers.splice(currentLayerIndex + 1, 0, copy);
            currentLayerIndex += 1;

            createLayers();
            selectLayer(currentLayerIndex);
        }

// --- New Feature: Copy Layer ---
function copyThisLayer(index) {
    currentLayerIndex = index;
    copyLayer();
}

        // --- New Feature: Move Layer Up ---
        function moveLayerUp() {
            if (currentLayerIndex <= 0) return; // Already at the top
            [layers[currentLayerIndex - 1], layers[currentLayerIndex]] = [layers[currentLayerIndex], layers[currentLayerIndex - 1]];
            currentLayerIndex--;
            createLayers();
        }

        // --- New Feature: Move Layer Down ---
        function moveLayerDown() {
            if (currentLayerIndex < 0 || currentLayerIndex >= layers.length - 1) return;
            [layers[currentLayerIndex + 1], layers[currentLayerIndex]] = [layers[currentLayerIndex], layers[currentLayerIndex + 1]];
            currentLayerIndex++;
            createLayers();
        }


        function rgbaFromCss(str) {
            const match = str.match(/rgba?\(([^)]+)\)/);
            if (match) {
                const parts = match[1].split(',').map(v => v.trim());
                return {
                    r: parseInt(parts[0]),
                    g: parseInt(parts[1]),
                    b: parseInt(parts[2]),
                    a: parts[3] !== undefined ? parseFloat(parts[3]) : 1
                };
            } else if (/^#/.test(str)) {
                const c = str.substring(1);
                const bigint = parseInt(c.length === 3 ? c.repeat(2) : c, 16);
                return {
                    r: (bigint >> 16) & 255,
                    g: (bigint >> 8) & 255,
                    b: bigint & 255,
                    a: 1
                };
            }
            return { r: 0, g: 0, b: 0, a: 1 };
        }

        function hexFromRgba(rgbaStr) {
            const rgba = rgbaFromCss(rgbaStr);
            return (
                '#' +
                [rgba.r, rgba.g, rgba.b]
                    .map(x => x.toString(16).padStart(2, '0'))
                    .join('')
            );
        }

        function rgbaStringFromHex(hex, alpha) {
            const bigint = parseInt(hex.substring(1), 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }


function renderTemplateMenu() {
    const container = document.getElementById('templateList');
    container.innerHTML = '';

    templates.forEach((tpl, i) => {
        const item = document.createElement('div');
        item.className = 'template-item';
        item.onclick = () => loadTemplate(tpl.config);

        const preview = document.createElement('div');
        preview.className = 'template-preview';
        preview.style.background = tpl.preview;

        const label = document.createElement('div');
        label.className = 'template-label';
        label.textContent = tpl.name;

        item.appendChild(preview);
        item.appendChild(label);
        container.appendChild(item);
    });
}


function loadTemplate(config) {
    layers = JSON.parse(JSON.stringify(config));
    currentLayerIndex = -1;
    createLayers();
    if (layers.length > 0) {
        selectLayer(0);
    }
}

function newProject() {
    layers = [];
    currentLayerIndex = -1;
    createLayers();
    renderColorStops();
    renderDynamicInputs();
}

// Toggle visibility
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toggleTemplateMenu').onclick = () => {
        const list = document.getElementById('templateList');
        list.classList.toggle('hidden');
    };
});

        // Initialize with one default layer
        //addLayer();
renderTemplateMenu();
loadTemplate(templates[0].config);



