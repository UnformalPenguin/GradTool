

var layers = [];
var currentLayerIndex = -1;
let selectedStopIndex = -1;
let isDraggingStop = false;
let hue = 120;
let saturation = 1;
let brightness = 1;
let alpha = 1;
let defaultDuration = 10;
let projectName = "Gradient";

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
                        "stop": "0%",
                        "pinned": false
                    },
                    {
                        "color": "#92fe9d",
                        "stop": "20.1%",
                        "pinned": false
                    },
                    {
                        "color": "rgba(242, 218, 132, 1)",
                        "stop": "50%",
                        "pinned": false
                    },
                    {
                        "color": "rgba(165, 113, 223, 1)",
                        "stop": "100%",
                        "pinned": false
                    }
                ],
                "angle": 90,
                "animate": true,
                "animations": [
                    {
                        "type": "hue",
                        "duration": 10,
                        "reverse": false,
                        "fromHue": "180"
                    }
                ],
                "blur": 2,
                "opacity": 1,
                "repeating": false,
                "visible": true,
                "colors": "undefined",
                "direction": ""
            },
            {
                "type": "linear",
                "shape": "square",
                "colorStops": [
                    {
                        "color": "#00c9ff",
                        "stop": "0%",
                        "pinned": false
                    },
                    {
                        "color": "rgba(37, 78, 197, 1)",
                        "stop": "21.0%",
                        "pinned": false
                    },
                    {
                        "color": "rgba(242, 218, 132, 1)",
                        "stop": "50%",
                        "pinned": false
                    },
                    {
                        "color": "rgba(165, 113, 223, 1)",
                        "stop": "100%",
                        "pinned": false
                    }
                ],
                "angle": 0,
                "animate": true,
                "animations": [
                    {
                        "type": "hue",
                        "duration": 11,
                        "reverse": false,
                        "fromHue": "0"
                    }
                ],
                "blur": 2,
                "opacity": 0.5,
                "repeating": false,
                "visible": true,
                "colors": "undefined",
                "direction": ""
            },
            {
                "type": "conic",
                "shape": "square",
                "animate": false,
                "colorStops": [
                    {
                        "color": "rgba(126,190,255,0.43)",
                        "stop": "0%"
                    },
                    {
                        "color": "rgba(253,255,143,0.49)",
                        "stop": "5.6%"
                    },
                    {
                        "color": "rgba(255,135,245,0.52)",
                        "stop": "9.7%"
                    }
                ],
                "duration": 10,
                "clockwise": true,
                "animations": [],
                "blur": 10,
                "opacity": 0.25,
                "visible": true,
                "angle": 90,
                "startAngle": 180,
                "centerX": 50,
                "centerY": 100,
                "size": "farthest-corner",
                "direction": "",
                "repeating": true,
                "posType": "percent"
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
                        "stop": "15%",
                        "pinned": false
                    },
                    {
                        "color": "rgba(255, 255, 255, 0.91)",
                        "stop": "50%",
                        "pinned": false
                    },
                    {
                        "color": "rgba(109, 184, 245, 1)",
                        "stop": "100%",
                        "pinned": false
                    }
                ],
                "animate": false,
                "animations": [],
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
                "animations": [
                    {
                        type: 'rotate',
                        duration: 10,
                        reverse: false
                    }],
                "visible": true,
                "shape": "",
                "animType": "rotate",
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
                "animations": [
                    {
                        type: 'rotate',
                        duration: 10,
                        reverse: true
                    }],
                "visible": true,
                "animType": "rotate",
                "shape": "",
                "angle": 0
            }
        ]
    },
    {
        name: "Bubble Burst",
        preview: "repeating-linear-gradient(90deg, rgba(28, 128, 227, 1) 0%, rgba(218, 118, 210, 1) 4.6%, rgba(76,117,214,1.00) 9.2%)",
        config: [
            {
                "type": "linear",
                "shape": "square",
                "animate": true,
                "colorStops": [
                    {
                        "color": "rgba(28, 128, 227, 1)",
                        "stop": "0%"
                    },
                    {
                        "color": "rgba(218, 118, 210, 1)",
                        "stop": "4.6%"
                    },
                    {
                        "color": "rgba(76,117,214,1.00)",
                        "stop": "9.2%"
                    }
                ],
                "duration": 10,
                "clockwise": true,
                "animations": [
                    {
                        "type": "slide",
                        "duration": 10,
                        "reverse": false
                    }
                ],
                "blur": 2,
                "opacity": 1,
                "visible": true,
                "angle": 90,
                "startAngle": 0,
                "posType": "percent",
                "centerX": 50,
                "centerY": 50,
                "size": "farthest-corner",
                "direction": "",
                "repeating": true
            },
            {
                "type": "radial",
                "shape": "circle",
                "animate": false,
                "colorStops": [
                    {
                        "color": "rgba(82,161,125,1.00)",
                        "stop": "0%"
                    },
                    {
                        "color": "rgba(218,175,118,1.00)",
                        "stop": "100%"
                    }
                ],
                "duration": 10,
                "clockwise": true,
                "animations": [],
                "blur": 2,
                "opacity": 0.65,
                "visible": true,
                "angle": 90,
                "startAngle": 0,
                "centerX": 50,
                "centerY": 50,
                "size": "",
                "direction": "",
                "repeating": false,
                "posType": "percent"
            },
            {
                "type": "radial",
                "shape": "circle",
                "animate": true,
                "colorStops": [
                    {
                        "color": "rgba(28, 128, 227, 1)",
                        "stop": "0%"
                    },
                    {
                        "color": "rgba(218, 118, 210, 1)",
                        "stop": "100%"
                    }
                ],
                "duration": 10,
                "clockwise": true,
                "animations": [
                    {
                        "type": "hue",
                        "duration": 10,
                        "reverse": false,
                        "toHue": "120"
                    }
                ],
                "blur": 2,
                "opacity": 0.55,
                "visible": true,
                "angle": 90,
                "startAngle": 0,
                "centerX": 50,
                "centerY": 50,
                "size": "",
                "direction": "",
                "repeating": false,
                "posType": "percent"
            }
        ]
    },
    {
        name: "Deep Space Swirl",
        preview: "linear-gradient(90deg, rgba(221,152,24,1.00) 0.0%, rgba(132,24,221,1.00) 49.3%, rgba(218, 118, 210, 1) 100%),radial-gradient(circle at 50% 50%, rgba(194,54,185,1.00) 43.8%, rgba(97,24,129,1.00) 74.2%),radial-gradient(circle at 50% 50%, rgba(220,46,209,1.00) 43.8%, rgba(136,27,183,1.00) 74.2%)",
        config: [
            {
                "type": "linear",
                "shape": "square",
                "animate": false,
                "colorStops": [
                    {
                        "color": "rgba(221,152,24,1.00)",
                        "stop": "0.0%"
                    },
                    {
                        "color": "rgba(132,24,221,1.00)",
                        "stop": "49.3%"
                    },
                    {
                        "color": "rgba(218, 118, 210, 1)",
                        "stop": "100%"
                    }
                ],
                "duration": 10,
                "clockwise": true,
                "animations": [],
                "blur": 0,
                "opacity": 1,
                "visible": true,
                "angle": 90,
                "startAngle": 0,
                "centerX": 50,
                "centerY": 50,
                "size": "farthest-corner",
                "direction": "",
                "repeating": false
            },
            {
                "type": "radial",
                "shape": "circle",
                "colorStops": [
                    {
                        "color": "rgba(194,54,185,1.00)",
                        "stop": "43.8%"
                    },
                    {
                        "color": "rgba(97,24,129,1.00)",
                        "stop": "74.2%"
                    }
                ],
                "startAngle": 0,
                "centerX": 50,
                "centerY": 50,
                "animate": true,
                "animations": [
                    {
                        "type": "hue",
                        "duration": 10,
                        "reverse": false,
                        "toHue": "20"
                    }
                ],
                "blur": 0,
                "opacity": 0.8,
                "repeating": false,
                "visible": true,
                "colors": "undefined",
                "size": "",
                "posType": "percent"
            },
            {
                "type": "radial",
                "shape": "circle",
                "colorStops": [
                    {
                        "color": "rgba(220,46,209,1.00)",
                        "stop": "43.8%"
                    },
                    {
                        "color": "rgba(136,27,183,1.00)",
                        "stop": "57.9%"
                    }
                ],
                "startAngle": 0,
                "centerX": 50,
                "centerY": 50,
                "animate": true,
                "animations": [
                    {
                        "type": "slide",
                        "duration": 10,
                        "reverse": false,
                        "fromHue": "300",
                        "intensity": "0.1"
                    }
                ],
                "blur": 0,
                "opacity": 0.4,
                "repeating": false,
                "visible": true,
                "colors": "undefined",
                "size": "",
                "posType": "percent"
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
                "animations": [],
                "blur": 2,
                "opacity": 1,
                "posType": "percent",
                "repeating": true,
                "visible": true,
                "size": "farthest-corner",
                "colors": "undefined",
                "centerX": 50,
                "centerY": 50
            }
        ]
    },
    {
        name: "Phase Shift",
        preview: "linear-gradient(345deg, rgba(61,90,225,0.74) 0%, rgba(156,142,141,0.67) 100%)",
        config: [
            {
                "type": "linear",
                "shape": "circle",
                "opacity": 0.66,
                "blur": 5.9,
                "animate": true,
                "duration": 8,
                "clockwise": true,
                "colorStops": [
                    {
                        "color": "rgba(61,90,225,0.74)",
                        "stop": "0%"
                    },
                    {
                        "color": "rgba(156,142,141,0.67)",
                        "stop": "100%"
                    }
                ],
                "animations": [
                    {
                        "type": "saturation",
                        "duration": 8,
                        "satfrom": 0.5,
                        "satto": 2
                    }
                ],
                "visible": true,
                "angle": 345
            },
            {
                "type": "linear",
                "shape": "square",
                "opacity": 0.81,
                "blur": 4.2,
                "animate": true,
                "duration": 6,
                "clockwise": false,
                "colorStops": [
                    {
                        "color": "rgba(40,97,132,0.53)",
                        "stop": "0%"
                    },
                    {
                        "color": "rgba(5,109,106,0.88)",
                        "stop": "25%"
                    },
                    {
                        "color": "rgba(152,17,152,0.97)",
                        "stop": "50%"
                    },
                    {
                        "color": "rgba(122,176,35,0.95)",
                        "stop": "75%"
                    },
                    {
                        "color": "rgba(62,164,171,0.73)",
                        "stop": "100%"
                    }
                ],
                "animations": [
                    {
                        "type": "hue",
                        "duration": 6,
                        "fromHue": 0,
                        "toHue": "60"
                    }
                ],
                "visible": true,
                "angle": 58
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
                animations: [],
                blur: 0,
                opacity: 1.0,
                visible: true,
                angle: 90,         // for linear
                startAngle: 0,     // for conic
                centerX: 50,       // for radial/conic
                centerY: 50,
                "posType": "percent",
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

                const alphaSection = document.createElement('div');
                alphaSection.className = 'layer-actions';
                alphaSection.style.marginRight = "25px";


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
                const slideeeee = document.createElement('div');
                slideeeee.innerHTML = `
                        <label>
                            Opacity:
                            <span class="tooltip-icon" tabindex="0">
                                ❓
                                <span class="tooltip-text">
                                    Controls how transparent the layer is. 1 is fully visible, 0 is fully transparent.<br />
                                    If the lowest layer has no transparency, no other layers will be visible
                                </span>
                            </span>
                            <input type="range" id="layerOpacity-${i}" min="0" max="1" step="0.05" value="${layer.opacity}" onchange="updateLayerOpacity(${i})">
                        </label>`;

    
                const moveBtns = document.createElement('div');
                moveBtns.className = 'layer-actions';
                moveBtns.style.marginRight = "25px";

                const moveUpBtn = document.createElement('button');
                moveUpBtn.innerHTML = '&#11205';
                moveUpBtn.className = "move-layer-btn";
                moveUpBtn.title = 'Move Layer Up';
                moveUpBtn.onclick = (e) => {
                    e.stopPropagation();
                    moveThisLayerUp(i);
                    //createLayers();
                };
                const moveDownBtn = document.createElement('button');
                moveDownBtn.innerHTML = '&#11206';
                moveDownBtn.className = "move-layer-btn";
                moveDownBtn.title = 'Move Layer Down';
                moveDownBtn.onclick = (e) => {
                    e.stopPropagation();
                    moveThisLayerDown(i);
                    //createLayers();
                };

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


                alphaSection.appendChild(visBtn);
                alphaSection.appendChild(slideeeee);

                moveBtns.appendChild(moveDownBtn);
                moveBtns.appendChild(moveUpBtn);

                actions.appendChild(copyBtn);
                actions.appendChild(delBtn);

                div.appendChild(label);
                div.appendChild(alphaSection);
                div.appendChild(moveBtns);
                div.appendChild(actions);
                layerList.appendChild(div);
            });
        }


        function selectLayer(index) {
            currentLayerIndex = index;

            renderColorStops();
            renderDynamicInputs();
            renderAnimationControls();

            const layer = layers[index];
            document.getElementById('layerType').value = layer.type;
            document.getElementById('layerShape').value = layer.shape;
            //document.getElementById('layerColors').value = layer.colors;
            //document.getElementById('layerAnimType').value = layer.animType || 'none';
            document.getElementById('layerOpacity-' + index).value = layer.opacity;
            document.getElementById('layerBlur').value = layer.blur;
            document.getElementById('layerAnimate').checked = layer.animate;
            //document.getElementById('layerClockwise').checked = layer.clockwise;
            //document.getElementById('layerDuration').value = layer.duration;

            renderLayerList();
            
        }

function updateCurrentLayer() {
    if (currentLayerIndex < 0 || currentLayerIndex >= layers.length) return;
    const layer = layers[currentLayerIndex];

    layer.type = document.getElementById('layerType').value;
    layer.shape = document.getElementById('layerShape').value;

    layer.opacity = parseFloat(document.getElementById('layerOpacity-' + currentLayerIndex).value);
    layer.blur = parseFloat(document.getElementById('layerBlur').value);
    layer.animate = document.getElementById('layerAnimate').checked;
    //layer.duration = parseFloat(document.getElementById('layerDuration').value);
    //layer.clockwise = document.getElementById('layerClockwise').checked;
    //layer.animType = document.getElementById('layerAnimType')?.value || 'none';

    if (layer.type === 'linear') {
        layer.direction = document.getElementById('linearDirection')?.value.trim() || '';
        layer.angle = parseFloat(document.getElementById('linearAngle')?.value || 0);
        layer.repeating = document.getElementById('repeating')?.checked || false;
    }

    if (layer.type === 'conic') {
        layer.startAngle = parseFloat(document.getElementById('conicStartAngle')?.value || 0);
        layer.posType = document.getElementById('posType')?.value || 'percent';
        layer.centerX = parseFloat(document.getElementById('centerX')?.value || 50);
        layer.centerY = parseFloat(document.getElementById('centerY')?.value || 50);
        layer.repeating = document.getElementById('repeating')?.checked || false;
    }

    if (layer.type === 'radial') {
        layer.size = document.getElementById('radialSize')?.value || '';
        layer.posType = document.getElementById('posType')?.value || 'percent';
        layer.centerX = parseFloat(document.getElementById('centerX')?.value || 50);
        layer.centerY = parseFloat(document.getElementById('centerY')?.value || 50);
        layer.repeating = document.getElementById('repeating')?.checked || false;
    }

    createLayers();
}

function updateLayerOpacity(index) {
    if (index < 0 || index >= layers.length) return;
    const layer = layers[index];    
    layer.opacity = parseFloat(document.getElementById('layerOpacity-'+index).value);
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
                    <label>
                        Shape:
                        <select id="layerShape" onchange="updateCurrentLayer()">
                            <option value="circle">Circle</option>
                            <option value="square">Square</option>
                        </select>
                    </label>
            <label>Direction (e.g. to right, 90deg):
            <select id="linearDirection" value="${layer.direction || ''}" onchange="updateCurrentLayer()">
                            <option value="">none (use angle below)</option>
                            <option value="to top">to top (0dedg)</option>
                            <option value="to right">to right (90dedg)</option>
                            <option value="to bottom">to bottom (180dedg)</option>
                            <option value="to left">to left (270dedg)</option>
                        </select>
            </label>
            <label>Angle (deg):<span class="tooltip-icon" tabindex="0">❓
    <span class="tooltip-text">
      The angle determines the direction of the gradient, measured in degrees.<br>
      For example, <code>90deg</code> means left-to-right.
    </span>
  </span>
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
                    <label>
                        Shape:
                        <select id="layerShape" onchange="updateCurrentLayer()">
                            <option value="circle">Circle</option>
                            <option value="square">Square</option>
                        </select>
                    </label>
            <label>Start Angle (deg):
                <input type="number" id="conicStartAngle" value="${layer.startAngle || 0}" onchange="updateCurrentLayer()">
            </label>
            <label>Position Type:
                <select id="posType" onchange="updateCurrentLayer()">
                    <option value="percent">%</option>
                    <option value="px">px</option>
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

    if (layer.type === 'radial') {
        html += `
                    <label>
                        Shape:
                        <select id="layerShape" onchange="updateCurrentLayer()">
                            <option value="circle">Circle</option>
                            <option value="ellipse">Ellipse</option>
                        </select>
                    </label>
            <label>Size:
                <select id="radialSize" onchange="updateCurrentLayer()">
                    <option value="">none</option>
                    <option value="closest-side">closest-side</option>
                    <option value="farthest-side">farthest-side</option>
                    <option value="closest-corner">closest-corner</option>
                    <option value="farthest-corner">farthest-corner</option>

                </select>
            </label>
            <label>Position Type:
                <select id="posType" onchange="updateCurrentLayer()">
                    <option value="percent">%</option>
                    <option value="px">px</option>
                </select>
            </label>
            <label>Center X (${layer.posType == "percent" ? "%" : "px"}):
                <input type="number" id="centerX" value="${layer.centerX || 50}" onchange="updateCurrentLayer()">
            </label>
            <label>Center Y (${layer.posType == "percent" ? "%" : "px"}):
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

function interpolateColorStops(stops, percent) {
    const pos = parseFloat(percent);
    stops.sort((a, b) => parseFloat(a.stop) - parseFloat(b.stop));
    for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i];
        const b = stops[i + 1];
        const pa = parseFloat(a.stop), pb = parseFloat(b.stop);
        if (pos >= pa && pos <= pb) {
            const t = (pos - pa) / (pb - pa);
            return 'rgba(255,255,255,1)';
        }
    }
    return stops[0]?.color || 'rgba(255,255,255,1)';
}


function renderColorStops() {
    const track = document.getElementById('colorTrack');
    const labels = document.getElementById('colorValueInputs');
    track.innerHTML = '';
    labels.innerHTML = '';

    const layer = layers[currentLayerIndex];
    if (!layer) return;

    const gradientStr = buildGradientString(layer);
    track.style.background = gradientStr;

    layer.colorStops.forEach((stop, i) => {
        const pos = parseFloat(stop.stop) / 100;

        const handle = document.createElement('div');
        handle.className = 'handle' + (i === selectedStopIndex ? ' selected' : '');
        handle.style.left = `calc(${pos * 100}% - 8px)`;
        handle.style.background = stop.color;
        handle.draggable = true;
        handle.dataset.index = i;

        handle.onpointerdown = (e) => {
            e.preventDefault();
            selectedStopIndex = i;
            const layer = layers[currentLayerIndex];
            loadColorStopToPicker(layer.colorStops[selectedStopIndex]?.color);
            startDragStop(e, i);
        };

        handle.onclick = (e) => {
            e.stopPropagation();
            console.log("Handle clikc " + i);
            selectColorStop(i);
        };

        //Color Stop Tools
        //const tools = document.createElement('div');
        //tools.className = 'handle-tools';
        //tools.style.display = i === selectedStopIndex ? 'flex' : 'none';

        //tools.innerHTML = "";
//  <button class="pin-toggle" title="Toggle Pin">${stop.pinned ? '📌' : '📍'}</button>
//  <button class="delete-stop" title="Delete Stop">✕</button>
//`;
        
        //const pinBtn = document.createElement('button');
        //pinBtn.textContent = `${ stop.pinned ? '📌' : '📍' }`;
        //pinBtn.classList.add("pin-toggle");
        //pinBtn.onclick = (e) => {
        //    e.stopPropagation();
        //    layers[currentLayerIndex].colorStops[i].pinned = !layers[currentLayerIndex].colorStops[i].pinned;
        //    renderColorStops();
        //};

        //const delBtn = document.createElement('button');
        //delBtn.textContent = "X";
        //delBtn.classList.add("delete-stop");
        //delBtn.onclick = (e) => {
        //    e.stopPropagation();
        //    removeColorStop();
        //};

        //tools.appendChild(pinBtn);
        //tools.appendChild(delBtn);
        //handle.appendChild(tools);

        track.appendChild(handle);


        const label = document.createElement('div');
        label.className = 'value-label';
        label.style.left = `calc(${pos * 100}% - 16px)`;
        label.style.position = 'absolute';
        label.style.top = '40px';
        label.style.fontSize = '0.75rem';
        label.textContent = parseFloat(stop.stop).toFixed(0) + '%';
        track.appendChild(label);

        //labels.appendChild(label);
    });

    track.onclick = (e) => {
        if (isDraggingStop) return; // Prevent accidental add from drag-release
        const rect = track.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.min(100, Math.max(0, (x / rect.width) * 100)).toFixed(1) + '%';

        const layer = layers[currentLayerIndex];
        const color = layer.colorStops[selectedStopIndex]?.color || interpolateColorStops(layer.colorStops, percent);

        layer.colorStops.push({ color, stop: percent });
        selectedStopIndex = layer.colorStops.length - 1;

        renderColorStops();
        createLayers();
    };
    updateColorEditor();
}

function selectColorStop(index) {
    selectedStopIndex = index;
    //console.log("loading color" + layer.colorStops[selectedStopIndex]?.color)
    //loadColorStopToPicker(layer.colorStops[selectedStopIndex]?.color);
    renderColorStops();
}

function updateColorEditor() {
    const layer = layers[currentLayerIndex];
    const stop = layer.colorStops[selectedStopIndex];
    if (!stop) return;

    const rgba = rgbaFromCss(stop.color);
    document.getElementById('colorPicker').value = hexFromRgba(stop.color);
    document.getElementById('alphaSlider').value = rgba.a;
    //document.getElementById('hexInput').value = stop.color;
    document.getElementById('stopInput').value = parseFloat(stop.stop);
}

function changeColorStopColor() {
    const hex = document.getElementById('colorPicker').value;
    const layer = layers[currentLayerIndex];
    const stop = layer.colorStops[selectedStopIndex];
    const alpha = rgbaFromCss(stop.color).a;
    stop.color = rgbaStringFromHex(hex, alpha);
    renderColorStops();
    createLayers();
}

function changeColorStopAlpha() {
    const alpha = parseFloat(document.getElementById('alphaSlider').value);
    const hex = document.getElementById('colorPicker').value;
    const layer = layers[currentLayerIndex];
    layer.colorStops[selectedStopIndex].color = rgbaStringFromHex(hex, alpha);
    renderColorStops();
    createLayers();
}

function changeColorStopHex() {
    const hex = document.getElementById('hexInput').value;
    const layer = layers[currentLayerIndex];
    const a = rgbaFromCss(hex).a || 1;
    layer.colorStops[selectedStopIndex].color = rgbaStringFromHex(hex, a);
    renderColorStops();
    createLayers();
}

function changeColorStopPosition() {
    const newStop = document.getElementById('stopInput').value + '%';
    const layer = layers[currentLayerIndex];
    layer.colorStops[selectedStopIndex].stop = newStop;
    renderColorStops();
    createLayers();
}
       

        function addColorStop() {
            if (currentLayerIndex < 0) return;
            layers[currentLayerIndex].colorStops.push({ color: interpolateColorStops(layers[currentLayerIndex].colorStops, 100), stop: '100%' });
            renderColorStops();
            createLayers();
}

function removeColorStop() {
    layers[currentLayerIndex].colorStops.splice(selectedStopIndex, 1);
    selectedStopIndex = null;
    renderColorStops();
    createLayers();
}

function onPickerChange() {
    const layer = layers[currentLayerIndex];
    if (layer && selectedStopIndex != null) {
        const rgb = hsbToRgb(hue, saturation, brightness);
        layer.colorStops[selectedStopIndex].color = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha.toFixed(2)})`;
        renderColorStops();
        createLayers();
    }
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
                div.className = `spiral-layer ${projectName}-layer-${i}`;

                const colorStr = layer.colorStops.map(cs => `${cs.color} ${cs.stop}`).join(', ');
                let gradient = buildGradientString(layer);

                //div.style.background = gradient;
                //div.style.filter = `blur(${layer.blur}px)`;
                //div.style.opacity = layer.opacity;
                if (!layer.animations.some(a => a.type === 'morph')) {
                    div.style.background = gradient;
                }
                if (!layer.animations.some(a => a.type === 'pulse' || a.type === 'hue')) {
                    div.style.filter = `blur(${layer.blur}px)`;
                }
                if (!layer.animations.some(a => a.type === 'pulse')) {
                    div.style.opacity = layer.opacity;
                }

                div.style.borderRadius = layer.shape === 'square' ? '0' : '50%';

            //    if (layer.animate) {
            //        animated = true;
            //            const animName = `${layer.animType}${i}`;
            //            div.style.animation = `${animName} ${layer.duration}s linear infinite`;

            //            switch (layer.animType) {
            //                case 'rotate':
            //                    animStyleElem.innerHTML += `@keyframes ${animName} {
            //    to { transform: rotate(${layer.clockwise ? '' : '-'}360deg); }
            //}`;
            //                    break;

            //                case 'pulse':
            //                    animStyleElem.innerHTML += `@keyframes ${animName} {
            //    0%, 100% { filter: blur(${layer.blur}px); opacity: ${layer.opacity}; }
            //    50% { filter: blur(${layer.blur + 2}px); opacity: ${Math.max(0, layer.opacity - 0.2)}; }
            //}`;
            //                    break;

            //                case 'hue':
            //                    animStyleElem.innerHTML += `@keyframes ${animName} {
            //    0% { filter: hue-rotate(0deg); }
            //    100% { filter: hue-rotate(360deg); }
            //}`;
            //                    break;

            //                case 'slide':
            //                    div.style.backgroundSize = '200% 200%';
            //                    animStyleElem.innerHTML += `@keyframes ${animName} {
            //    0% { background-position: 0% 50%; }
            //    100% { background-position: 100% 50%; }
            //}`;
            //                    break;

            //                case 'morph':
            //                    animStyleElem.innerHTML += `@keyframes ${animName} {
            //    0% { background: ${buildGradientString(layer)}; }
            //    50% { background: ${buildGradientString({ ...layer, angle: (layer.angle || 0) + 180 })}; }
            //    100% { background: ${buildGradientString(layer)}; }
            //}`;
            //                    break;
            //        }

                if (layer.animate && Array.isArray(layer.animations)) {
                    animated = true;
                        layer.animations.forEach((anim, aIndex) => {
                            const animName = `${projectName}_layer${i}_anim${aIndex}`;
                            const duration = anim.duration || defaultDuration;

                            div.style.animation = div.style.animation
                                ? `${div.style.animation}, ${animName} ${duration}s linear infinite`
                                : `${animName} ${duration}s linear infinite`;

                            switch (anim.type) {
                                case 'rotate':
                                    animStyleElem.innerHTML += `@keyframes ${animName} {
                    to { transform: rotate(${anim.reverse ? '-' : ''}360deg); }
                }`;
                                    break;
                                case 'pulse':
                                    const lowOpacity = Math.max(0, anim.pulsefrom);
                                    const highOpacity = layer.pulseto;
                                    const lowBlur = layer.blur;
                                    const highBlur = layer.blur + 2;

                                    animStyleElem.innerHTML += `@keyframes ${animName} {
        0%, 100% { filter: blur(${lowBlur}px); opacity: ${highOpacity}; }
        50% { filter: blur(${highBlur}px); opacity: ${lowOpacity}; }
    }`;
                                    break;
                                case 'pulse2':
                                    animStyleElem.innerHTML += `@keyframes ${animName} {
                    0%, 100% { filter: blur(${layer.blur}px); opacity: ${layer.opacity}; }
                    50% { filter: blur(${layer.blur + 2}px); opacity: ${Math.max(0.1, layer.opacity - 0.2)}; }
                }`;
                                    break;
                                case 'hue':
                                    const fromHue = anim.fromHue ?? 0;
                                    const toHue = anim.toHue ?? 360;
                                    div.style.animationDirection = "alternate";
                                    animStyleElem.innerHTML += `@keyframes ${animName} {
        0% { filter: hue-rotate(${fromHue}deg); }
        100% { filter: hue-rotate(${toHue}deg); }
    }`;
                                    break;
                                case 'hue2':
                                    animStyleElem.innerHTML += `@keyframes ${animName} {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }`;
                                    break;

                                case 'slide':
                                    div.style.backgroundSize = '200% 200%';
                                    if (anim.direction === 'vertical') {
                                        animStyleElem.innerHTML += `@keyframes ${animName} {
                        0% { background-position: 50% 0%; }
                        100% { background-position: 50% 100%; }
                    }`;
                                    } else {
                                        animStyleElem.innerHTML += `@keyframes ${animName} {
                        0% { background-position: 0% 50%; }
                        100% { background-position: 100% 50%; }
                    }`;
                                    }
                                    break;
                                case 'step-rotate':
                                    const stepDeg = anim.step || 90;
                                    const totalSteps = 360 / stepDeg;
                                    const finalDeg = stepDeg * totalSteps;

                                    animStyleElem.innerHTML += `@keyframes ${animName} {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }`;
                                    div.style.animationTimingFunction = 'steps(' + totalSteps + ')';
                                    break;
                                case 'blur':
                                    const blurFrom = anim.blurfrom ?? 0;
                                    const blurTo = anim.blurto ?? 10;

                                    animStyleElem.innerHTML += `@keyframes ${animName} {
        0% { filter: blur(${blurFrom}px); }
        100% { filter: blur(${blurTo}px); }
    }`;

                                    div.style.animationDirection = 'alternate';
                                    break;

                                case 'stretch':
                                    const flipAxis = anim.direction === 'vertical' ? 'scaleY' : 'scaleX';
                                    const direction = anim.direction === 'vertical' ? '-1' : '-1';
                                    const flipMode = anim.alternate ? 'alternate' : 'normal';
                                    div.style.animationTimingFunction = 'ease-in-out';
                                    div.style.animationDirection = flipMode;
                                    let stretchLimit = anim.intensity * 100;
                                    animStyleElem.innerHTML += `@keyframes ${animName} {
        0% { transform: ${flipAxis}(1); }
        ${stretchLimit}% { transform: ${flipAxis}(${direction}); }
        0% { transform: ${flipAxis}(1); }
    }`;
                                    break;
                                case 'morph2':
                                    const angleA = (layer.angle || 0);
                                    const angleB = angleA + 180;
                                    animStyleElem.innerHTML += `@keyframes ${animName} {
                    0% { background: ${buildGradientString(layer)}; }
                    50% { background: ${buildGradientString({ ...layer, angle: angleB })}; }
                    100% { background: ${buildGradientString(layer)}; }
                }`;
                                    break;

                                case 'skew':
                                    const skewAxis = anim.direction === 'vertical' ? 'Y' : 'X';
                                    const skewVal = anim.intensity || 15;
                                    animStyleElem.innerHTML += `@keyframes ${animName} {
        0%, 100% { transform: skew${skewAxis}(0deg); }
        50% { transform: skew${skewAxis}(${skewVal}deg); }
    }`;
                                    break;

                                case 'saturation':
                                    const satFrom = anim.satfrom ?? 1;
                                    const satTo = anim.satto ?? 2;

                                    animStyleElem.innerHTML += `@keyframes ${animName} {
        0% { filter: saturate(${satFrom}); }
        100% { filter: saturate(${satTo}); }
    }`;


                                case 'glowpulse':
                                    //const satFrom = anim.satfrom ?? 1;
                                    //const satTo = anim.satto ?? 2;

                                    animStyleElem.innerHTML += `@keyframes ${animName} {
        0%, 100% { filter: drop-shadow(0 0 5px rgba(255,255,255,0.2)); }
    50% { filter: drop-shadow(0 0 20px rgba(255,255,255,0.5)); }
    }`;


                                case 'wobble':
                                    //const satFrom = anim.satfrom ?? 1;
                                    //const satTo = anim.satto ?? 2;

                                    animStyleElem.innerHTML += `@keyframes ${animName} {
    0% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(1deg) scale(1.1); }
    50% { transform: rotate(0deg) scale(1); }
    75% { transform: rotate(-1deg) scale(0.9); }
    100% { transform: rotate(0deg) scale(1); }
    }`;


                                case 'contrast':
                                    //const satFrom = anim.satfrom ?? 1;
                                    //const satTo = anim.satto ?? 2;

                                    animStyleElem.innerHTML += `@keyframes ${animName} {
        0%, 200% { filter: contrast(100 %); }
    200%, 0% { filter: contrast(140%); }
    }`;

                                    div.style.animationDirection = 'alternate';
                                    break;
                                    


                                case 'scale':
                                    const zoomFrom = anim.scalefrom ?? 1;
                                    const zoomTo = anim.scaleto ?? 1.1;

                                    animStyleElem.innerHTML += `@keyframes ${animName} {
        0% { transform: scale(${zoomFrom}); }
        50% { transform: scale(${zoomTo}); }
        100% { transform: scale(${zoomFrom}); }
    }`;

                                    div.style.animationDirection = 'normal'; // loop cleanly
                                    break;

                            }
                        });
                    }




                //    const animName = `spin${i}`;
                //    div.style.animation = `${animName} ${layer.duration}s linear infinite`;
                //    animStyleElem.innerHTML += `
                //    @keyframes ${animName} {
                //        to { transform: rotate(${layer.clockwise ? '' : '-'}360deg); }
                //    }
                //`;
                

                if (animated) {
                    document.getElementById("animate-block").classList.remove("hidden");
                }
                else {
                    document.getElementById("animate-block").classList.add("hidden");
                }
                div.style.position = 'absolute';
                div.style.inset = 0;
                container.appendChild(div);
            });

            renderLayerList();
            generateCSS();
            exportConfig();
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
        if (!layer.shape || layer.shape != "circle" || layer.shape != "ellipse") {
            layer.shape = "circle";
        }
        var shapeSize = "";
        var atPos = `at ${layer.centerX}% ${layer.centerY}%`;
        if (layer.posType === "percent") {
            atPos = `at ${layer.centerX}% ${layer.centerY}%`
        }
        else if (layer.posType === "rem") {
            atPos = `at ${layer.centerX}rem ${layer.centerY}rem`
        }
        else {
            atPos = `at ${layer.centerX}px ${layer.centerY}px`
        }
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
            createLayers();
            selectLayer(layers.length - 1);
}
function addThisLayer(layer) {
    layers.push(layer);
    selectLayer(layers.length - 1);
    createLayers();
}


function generateCSS() {
    const containerStyles = `.spiral-container {
  position: relative;
  width: 300px;
  height: 300px;
  overflow: hidden;
}

.spiral-layer {
  position: absolute;
  inset: 0;
}
`;

    let layerStyles = '';
    let keyframes = '';

    layers.forEach((layer, i) => {
        const className = `${projectName}-layer-${i}`;
        const gradient = buildGradientString(layer);
        let animationNames = [];

        let layerCSS = `.${className} {\n`;
        layerCSS += `  background: ${gradient};\n`;
        layerCSS += `  filter: ${buildFilterString(layer)};\n`;
        layerCSS += `  opacity: ${layer.opacity};\n`;
        layerCSS += `  border-radius: ${layer.shape === 'square' ? '0%' : '50%'};\n`;

        if (layer.animate && layer.animations && layer.animations.length) {
            let animationParts = [];

            layer.animations.forEach((anim, aIndex) => {
                const animName = `${projectName}_layer${i}_anim${aIndex}`;
                animationNames.push(animName);
                const duration = anim.duration || 5;

                // Add CSS animation line
                animationParts.push(`${animName} ${duration}s linear infinite ${anim.type === 'hue' || anim.type === 'blur' || anim.type === 'saturation' ? 'alternate' : ''}`.trim());

                // Generate @keyframes for each animation type
                switch (anim.type) {
                    case 'rotate':
                        keyframes += `@keyframes ${animName} {
  to { transform: rotate(${anim.reverse ? '-' : ''}360deg); }
}\n\n`;
                        break;

                    case 'pulse':
                        keyframes += `@keyframes ${animName} {
  0%, 100% { filter: blur(${layer.blur}px); opacity: ${layer.opacity}; }
  50% { filter: blur(${layer.blur + 2}px); opacity: ${Math.max(0.1, layer.opacity - 0.2)}; }
}\n\n`;
                        break;

                    case 'hue':
                        keyframes += `@keyframes ${animName} {
  0% { filter: hue-rotate(${anim.fromHue ?? 0}deg); }
  100% { filter: hue-rotate(${anim.toHue ?? 360}deg); }
}\n\n`;
                        break;

                    case 'slide':
                        layerCSS += `  background-size: 200% 200%;\n`;
                        const isVertical = anim.direction === 'vertical';
                        keyframes += `@keyframes ${animName} {
  0% { background-position: ${isVertical ? '50% 0%' : '0% 50%'}; }
  100% { background-position: ${isVertical ? '50% 100%' : '100% 50%'}; }
}\n\n`;
                        break;

                    case 'morph':
                        const angleA = anim.angleA ?? layer.angle ?? 0;
                        const angleB = anim.angleB ?? angleA + 180;
                        const gradA = buildGradientString({ ...layer, angle: angleA });
                        const gradB = buildGradientString({ ...layer, angle: angleB });
                        keyframes += `@keyframes ${animName} {
  0% { background: ${gradA}; }
  50% { background: ${gradB}; }
  100% { background: ${gradA}; }
}\n\n`;
                        break;

                    case 'blur':
                        keyframes += `@keyframes ${animName} {
  0% { filter: blur(${anim.blurfrom ?? 0}px); }
  100% { filter: blur(${anim.blurto ?? 5}px); }
}\n\n`;
                        break;

                    case 'saturation':
                        keyframes += `@keyframes ${animName} {
  0% { filter: saturate(${anim.satfrom ?? 1}); }
  100% { filter: saturate(${anim.satto ?? 2}); }
}\n\n`;
                        break;

                    case 'scale':
                        keyframes += `@keyframes ${animName} {
  0% { transform: scale(${anim.scalefrom ?? 1}); }
  50% { transform: scale(${anim.scaleto ?? 1.1}); }
  100% { transform: scale(${anim.scalefrom ?? 1}); }
}\n\n`;
                        break;

                    case 'wobble':
                        keyframes += `@keyframes ${animName} {
    0% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(1deg) scale(1.1); }
    50% { transform: rotate(0deg) scale(1); }
    75% { transform: rotate(-1deg) scale(0.9); }
    100% { transform: rotate(0deg) scale(1); }
  }\n\n`;
                        break;

                    case 'glowpulse':
                        keyframes += `@keyframes ${animName} {
    0%, 100% { filter: drop-shadow(0 0 5px rgba(255,255,255,0.2)); }
    50% { filter: drop-shadow(0 0 20px rgba(255,255,255,0.5)); }
  }\n\n`;
                        break;
                    case 'contrast':
                        keyframes += `@keyframes ${animName} {
    0%, 100% { filter: contrast(100 %); }
    50% { filter: contrast(140%); }
  }\n\n`;
                        break;
                }
            });

            layerCSS += `  animation: ${animationParts.join(', ')};\n`;
        }

        layerCSS += '}\n\n';
        layerStyles += layerCSS;
    });

    // Generate the HTML for the container
    let html = `<div class="spiral-container">\n`;
    layers.forEach((_, i) => {
        html += `  <div class="spiral-layer ${projectName}-layer-${i}"></div>\n`;
    });
    html += `</div>`;

    const fullExport = `<!-- HTML -->\n${html}\n\n<!-- CSS -->\n<style>\n${containerStyles}\n${layerStyles}${keyframes}</style>`;
    document.getElementById('cssOutput').value = fullExport;
}

function generateSVG() {
    const svgWidth = 300;
    const svgHeight = 300;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const defs = [];
    const filters = [];
    const layersSvg = [];

    let msg = document.getElementById("svgMessage");
    msg.innerText = "";

    layers.forEach((layer, i) => {
        const gradientId = `${projectName}-grad-${i}`;
        const filterId = `${projectName}-filter-${i}`;
        const isCircle = layer.shape !== 'square';

        if (!layer.colorStops || layer.colorStops.length === 0) return;
        if (layer.type === 'conic') {
            msg.innerHTML = "Conical Layers not supported in SVG";
            return;
        }
        // Build gradient stops
        const stops = layer.colorStops.map(cs =>
            `<stop offset="${cs.stop}" stop-color="${cs.color}" />`
        ).join('\n');

        // Build gradient definition
        let gradientDef = '';
        const gradientType = layer.repeating ? 'repeating' : '';
        let gradientTransform = '';

        if (layer.type === 'linear') {
            const angle = layer.angle ?? 0;
            const rad = angle * Math.PI / 180;
            const x1 = 50 - Math.cos(rad) * 50;
            const y1 = 50 - Math.sin(rad) * 50;
            const x2 = 50 + Math.cos(rad) * 50;
            const y2 = 50 + Math.sin(rad) * 50;

            gradientDef = `<linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse"
  x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%" spreadMethod="${layer.repeating ? 'repeat' : 'pad'}">
  ${stops}
</linearGradient>`;
        }

        else if (layer.type === 'radial') {
            const posX = layer.centerX ?? 50;
            const posY = layer.centerY ?? 50;
            gradientDef = `<radialGradient id="${gradientId}" cx="${posX}%" cy="${posY}%" r="50%" fx="${posX}%" fy="${posY}%" spreadMethod="${layer.repeating ? 'repeat' : 'pad'}">
  ${stops}
</radialGradient>`;
        }

        else if (layer.type === 'conic') {
            // SVG doesn't support native conic gradients
            gradientDef = `<!-- Conic gradients are not natively supported in SVG -->`;
        }

        defs.push(gradientDef);

        // Handle filters (blur, hue, saturation)
        let filterContent = '';
        const filterParts = [];

        if (layer.animate && Array.isArray(layer.animations)) {
            layer.animations.forEach((anim) => {
                const dur = `${anim.duration || 5}s`;

                if (anim.type === 'blur') {
                    filterParts.push(`<feGaussianBlur in="SourceGraphic" stdDeviation="${anim.blurfrom ?? 0}">
  <animate attributeName="stdDeviation"
    values="${anim.blurfrom ?? 0};${anim.blurto ?? 5};${anim.blurfrom ?? 0}"
    dur="${dur}" repeatCount="indefinite" />
</feGaussianBlur>`);
                }

                if (anim.type === 'saturation') {
                    filterParts.push(`<feColorMatrix type="saturate" values="${anim.satfrom ?? 1}">
  <animate attributeName="values"
    values="${anim.satfrom ?? 1};${anim.satto ?? 2};${anim.satfrom ?? 1}"
    dur="${dur}" repeatCount="indefinite" />
</feColorMatrix>`);
                }

                if (anim.type === 'hue') {
                    filterParts.push(`<feColorMatrix type="hueRotate" values="${anim.fromHue ?? 0}">
  <animate attributeName="values"
    values="${anim.fromHue ?? 0};${anim.toHue ?? 360};${anim.fromHue ?? 0}"
    dur="${dur}" repeatCount="indefinite" />
</feColorMatrix>`);
                }
            });
        }

        if (filterParts.length > 0) {
            filters.push(`<filter id="${filterId}">\n${filterParts.join('\n')}\n</filter>`);
        }

        // Build shape animations
        let shapeAnimations = '';
        if (layer.animate && layer.animations) {
            layer.animations.forEach((anim) => {
                const dur = `${anim.duration || 5}s`;

                if (anim.type === 'rotate') {
                    shapeAnimations += `
<animateTransform attributeName="transform" type="rotate"
  from="0 ${centerX} ${centerY}" to="${anim.reverse ? -360 : 360} ${centerX} ${centerY}"
  dur="${dur}" repeatCount="indefinite" />`;
                }

                if (anim.type === 'scale') {
                    shapeAnimations += `
<animateTransform attributeName="transform" type="scale"
  values="${anim.scalefrom ?? 1};${anim.scaleto ?? 1.1};${anim.scalefrom ?? 1}"
  dur="${dur}" repeatCount="indefinite" />`;
                }

                if (anim.type === 'pulse') {
                    shapeAnimations += `
<animate attributeName="opacity"
  values="${layer.opacity};${Math.max(0.1, layer.opacity - 0.2)};${layer.opacity}"
  dur="${dur}" repeatCount="indefinite" />`;
                }
            });
        }

        const filterAttr = filterParts.length > 0 ? `filter="url(#${filterId})"` : '';
        const commonAttrs = `fill="url(#${gradientId})" opacity="${layer.opacity}" ${filterAttr}`;

        const shape = isCircle
            ? `<circle cx="${centerX}" cy="${centerY}" r="${centerX}" ${commonAttrs}>
  ${shapeAnimations}
</circle>`
            : `<rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" ${commonAttrs}>
  ${shapeAnimations}
</rect>`;

        layersSvg.push(shape);
    });

    const svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${defs.join('\n')}
    ${filters.join('\n')}
  </defs>
  ${layersSvg.join('\n')}
</svg>`;

    document.getElementById('svgOutput').value = svg;
    document.getElementById('svgPreview').innerHTML = svg;
}

function buildFilterString(layer) {
    if (!layer.animate || !Array.isArray(layer.animations)) {
        return `blur(${layer.blur}px)`; // fallback static
    }

    const filters = [];

    if (!layer.animations.some(a => a.type === 'blur')) {
        filters.push(`blur(${layer.blur}px)`);
    }
    if (!layer.animations.some(a => a.type === 'hue')) {
        filters.push('hue-rotate(0deg)');
    }
    if (!layer.animations.some(a => a.type === 'saturation')) {
        filters.push('saturate(1)');
    }

    return filters.join(' ');
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

// --- New Feature: Move Layer Up ---
function moveThisLayerUp(index) {
    if (index < 1 || index > layers.length - 1) return;
    [layers[index - 1], layers[index]] = [layers[index], layers[index - 1]];
    currentLayerIndex--;
    createLayers();
}

// --- New Feature: Move Layer Down ---
function moveThisLayerDown(index) {
    if (index < 0 || index >= layers.length - 1) return;
    [layers[index + 1], layers[index]] = [layers[index], layers[index + 1]];
    currentLayerIndex++;
    createLayers();
}

function loadColorStopToPicker(color) {
    const rgba =  parseColor(color); // parses 'rgba(...)' or hex
    hue = rgbToHue(rgba.r, rgba.g, rgba.b);
    saturation = rgbToSaturation(rgba.r, rgba.g, rgba.b);
    brightness = rgbToBrightness(rgba.r, rgba.g, rgba.b);
    alpha = rgba.a;

    // Update sliders
    document.getElementById('hueSlider').value = hue;
    document.getElementById('alphaSlider').value = alpha;

    // Update inputs
    updateColorFromUI();
}


function updateColorFromUI() {
    const rgb = hsbToRgb(hue, saturation, brightness);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`;

    // Update UI
    document.getElementById('hexInput').value = hex;
    document.getElementById('rInput').value = rgb.r;
    document.getElementById('gInput').value = rgb.g;
    document.getElementById('bInput').value = rgb.b;
    document.getElementById('aInput').value = Math.round(alpha * 100);
    updateAlphaSliderBackground();
    updateHueSliderBackground();
    updateColorFieldBackground();
    updateCursorPosition();
}

function updateColorFieldBackground() {
    const hueColor = `hsl(${hue}, 100%, 50%)`;

    document.getElementById('colorField').style.background = `
    linear-gradient(to top, black, transparent),
    linear-gradient(to right, white, ${hueColor})
  `;
}

function updateHueSliderBackground() {
    document.getElementById('hueSlider').style.background = `
    linear-gradient(to right,
      hsl(0, 100%, 50%),
      hsl(60, 100%, 50%),
      hsl(120, 100%, 50%),
      hsl(180, 100%, 50%),
      hsl(240, 100%, 50%),
      hsl(300, 100%, 50%),
      hsl(360, 100%, 50%)
    )`;
}

function updateAlphaSliderBackground() {
    const rgb = hsbToRgb(hue, saturation, brightness);
    const colorStart = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`;
    const colorEnd = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;

    const alphaSlider = document.getElementById('alphaSlider');

    alphaSlider.style.background = `
    linear-gradient(
      to right,
      ${colorStart},
      ${colorEnd}
    ),
    repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 / 10px 10px
  `;
}




function parseColor(colorStr) {
    if (colorStr.startsWith('#')) {
        const hex = colorStr.slice(1);
        const bigint = parseInt(hex.length === 3
            ? hex.split('').map(c => c + c).join('')
            : hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b, a: 1 };
    }

    const rgbaMatch = colorStr.match(/rgba?\(([^)]+)\)/);
    if (rgbaMatch) {
        const parts = rgbaMatch[1].split(',').map(x => parseFloat(x.trim()));
        const [r, g, b, a = 1] = parts;
        return { r, g, b, a };
    }

    // Default to white if unrecognized
    return { r: 255, g: 255, b: 255, a: 1 };
}

function rgbToHue(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h;

    if (max === min) return 0;

    switch (max) {
        case r:
            h = (g - b) / (max - min) + (g < b ? 6 : 0);
            break;
        case g:
            h = (b - r) / (max - min) + 2;
            break;
        case b:
            h = (r - g) / (max - min) + 4;
            break;
    }

    return Math.round(h * 60);
}
function rgbToSaturation(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max === 0) return 0;
    return (max - min) / max;
}
function rgbToBrightness(r, g, b) {
    return Math.max(r, g, b) / 255;
}

function hsbToRgb(h, s, b) {
    const f = (n, k = (n + h / 60) % 6) =>
        b - b * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return {
        r: Math.round(f(5) * 255),
        g: Math.round(f(3) * 255),
        b: Math.round(f(1) * 255),
    };
}

function rgbToHex(r, g, b) {
    return (
        '#' +
        [r, g, b]
            .map((x) => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            })
            .join('')
    );
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
    layers = [defaultLayer()];
    currentLayerIndex = 0;
    projectName = "new";
    document.getElementById('projectName').value = "new";
    createLayers();
    renderColorStops();
    renderDynamicInputs();
}


//Animations
function renderAnimationControls() {
    const container = document.getElementById('animationList');
    container.innerHTML = '';
    const layer = layers[currentLayerIndex];
    if (!layer) return;

    layer.animations.forEach((anim, index) => {
        const item = document.createElement('div');
        item.className = 'animation-item';

        const typeLabel = document.createElement('label');
        typeLabel.innerHTML = `
            Type:
            <select onchange="updateAnimation(${index}, 'type', this.value)">
                <option value="rotate" ${anim.type === 'rotate' ? 'selected' : ''}>Rotate -  Rotates the layer. Ideal for circular shapees. </option>                
                <option value="step-rotate" ${anim.type === 'step-rotate' ? 'selected' : ''}>Step Rotate - Rotates the layer in discrete jumps. Useful for glitchy or mechanical motion.</option>
                <option value="pulse" ${anim.type === 'pulse' ? 'selected' : ''}>Pulse - Animates the layer's opacity to create a pulsing effect. Great for ambient visuals.</option>
                <option value="hue" ${anim.type === 'hue' ? 'selected' : ''}>Hue - Shifts across the color wheel, cycling through hues. Gives a psychedelic feel.</option>
                <option value="slide" ${anim.type === 'slide' ? 'selected' : ''}>Slide - Animates the gradient’s position to simulate motion, like running fabric.</option>
                <option value="blur" ${anim.type === 'blur' ? 'selected' : ''}>Blur - Softens and sharpens the layer repeatedly. Gives diffuse, dreamy effects.</option>
                <option value="saturation" ${anim.type === 'saturation' ? 'selected' : ''}>Saturation - Increases and decreases color intensity. Dramatic washes or faded looks.</option>
                <option value="scale" ${anim.type === 'scale' ? 'selected' : ''}>Scale - Grows and shrinks the layer. Used for breathing effects or floating visuals.</option>
            </select>
        `;


        
                //<option value="wobble" ${anim.type === 'wobble' ? 'selected' : ''}>Wobble - Gives a continuous wiggle.</option>
                //<option value="contrast" ${anim.type === 'contrast' ? 'selected' : ''}>Contrast Shift - Changes the filter: contrast() for a flashing or depth illusion.</option>        
                //<option value="glowpulse" ${anim.type === 'glowpulse' ? 'selected' : ''}>Glow Pulse - Animates the layer's shadow to create a pulsing effect. Great for ambient visuals.</option>

        item.appendChild(typeLabel);

        // Duration
        const durationLabel = document.createElement('label');
        durationLabel.innerHTML = `Duration (s):
                    <span class="tooltip-icon" tabindex="0">
                    ❓
                 <span class="tooltip-text">
                        How long it will take to complete a full animation loop
                   </span>
                  </span>
            <input type="number" value="${anim.duration || defaultDuration}" 
            onchange="updateAnimation(${index}, 'duration', this.value)">
        `;
        item.appendChild(durationLabel);

        // Type-specific options
        if (anim.type === 'rotate') {
            const reverseLabel = document.createElement('label');
            reverseLabel.innerHTML = `
                <input type="checkbox" ${anim.reverse ? '' : 'checked'} 
                onchange="updateAnimation(${index}, 'reverse', !this.checked)">
                Rotate Clockwise
            `;
            item.appendChild(reverseLabel);
        }

        if (anim.type === 'slide') {
            const dirLabel = document.createElement('label');
            dirLabel.innerHTML = `
                Direction:
                <select onchange="updateAnimation(${index}, 'direction', this.value)">
                    <option value="horizontal" ${anim.direction === 'horizontal' ? 'selected' : ''}>Horizontal</option>
                    <option value="vertical" ${anim.direction === 'vertical' ? 'selected' : ''}>Vertical</option>
                </select>
                <input type="checkbox" ${anim.reverse ? 'checked' : ''} 
                onchange="updateAnimation(${index}, 'reverse', this.checked)">
                Reverse Direction
            `;
            item.appendChild(dirLabel);
        }

        if (anim.type === 'pulse') {
            const intLabel = document.createElement('label');
            intLabel.innerHTML = `
             <label>From:
                    <span class="tooltip-icon" tabindex="0">
                    ❓
                 <span class="tooltip-text">
                        Starting Opacity for animation loop
                   </span>
                  </span>
            <input type="number" min="0" max="1" step="0.05" value="${anim.pulsefrom ?? 0}" 
                onchange="updateAnimation(${index}, 'pulsefrom', this.value)">
        </label>
        <label>To:
                    <span class="tooltip-icon" tabindex="0">
                    ❓
                 <span class="tooltip-text">
                        Final Opacity for animation loop
                   </span>
                  </span>
            <input type="number" min="0" max="1" step="0.05" value="${anim.pulseto ?? 0.5}" 
                onchange="updateAnimation(${index}, 'pulseto', this.value)">
        </label>

            `;
            item.appendChild(intLabel);
        }

        if (anim.type === 'hue') {
            const fromHueLabel = document.createElement('label');
            fromHueLabel.innerHTML = `From Hue (deg):
                    <span class="tooltip-icon" tabindex="0">
                    ❓
                 <span class="tooltip-text">
                          Hue animation cycles the color values by spinning around the color wheel.
                          <div class="hue-wheel-tooltip">
  <div class="hue-wheel">
    <div class="hue-zero-marker">0°</div>
    <div class="hue-range-indicator" style="--start: 30deg; --end: 150deg;"></div>
  </div>
</div>
                   </span>
                  </span>
        <input type="number" value="${anim.fromHue ?? 0}" onchange="updateAnimation(${index}, 'fromHue', this.value)">
    `;
            item.appendChild(fromHueLabel);

            const toHueLabel = document.createElement('label');
            toHueLabel.innerHTML = `To Hue (deg):
        <input type="number" value="${anim.toHue ?? 360}" onchange="updateAnimation(${index}, 'toHue', this.value)">
    `;
            item.appendChild(toHueLabel);
        }

        if (anim.type === 'stretch') {
            const dirLabel = document.createElement('label');
            dirLabel.innerHTML = `
                Direction:
                <select onchange="updateAnimation(${index}, 'direction', this.value)">
                    <option value="horizontal" ${anim.direction === 'horizontal' ? 'selected' : ''}>Horizontal</option>
                    <option value="vertical" ${anim.direction === 'vertical' ? 'selected' : ''}>Vertical</option>
                </select>
            `;
            item.appendChild(dirLabel);

            const intLabel = document.createElement('label');
            intLabel.innerHTML = `
                Intensity:
                 <input type="range" min="0" max="1" step="0.05" value="${anim.intensity ?? 0}" onchange="updateAnimation(${index}, 'intensity', this.value)">

            `;
            item.appendChild(intLabel);
        }
        if (anim.type === 'step-rotate') {
            item.innerHTML += `
        <label>Step Degrees:
        <select onchange="updateAnimation(${index}, 'step', this.value)">
                    <option value="180" ${anim.step === '180' ? 'selected' : ''}>180</option>
                    <option value="90" ${anim.step === '90' ? 'selected' : ''}>90</option>
                    <option value="60" ${anim.step === '60' ? 'selected' : ''}>60</option>
                    <option value="45" ${anim.step === '45' ? 'selected' : ''}>45</option>
                    <option value="30" ${anim.step === '30' ? 'selected' : ''}>30</option>
                    <option value="15" ${anim.step === '15' ? 'selected' : ''}>15</option>
                </select>
        </label>
    `;
        }
        if (anim.type === 'skew') {
            item.innerHTML += `
        <label>Axis:
            <select onchange="updateAnimation(${index}, 'axis', this.value)">
                <option value="horizontal" ${anim.direction === 'horizontal' ? 'selected' : ''}>Horizontal</option>
                <option value="vertical" ${anim.direction === 'vertical' ? 'selected' : ''}>Vertical</option>
            </select>
        </label>
        <label>Intensity (deg):
            <input type="number" value="${anim.intensity || 15}" 
                onchange="updateAnimation(${index}, 'intensity', this.value)">
        </label>
    `;
        }


        if (anim.type === 'morph') {
            item.innerHTML += `
        <label>From Angle:
            <input type="number" value="${anim.angleA ?? 0}" 
                onchange="updateAnimation(${index}, 'angleA', this.value)">
        </label>
        <label>To Angle:
            <input type="number" value="${anim.angleB ?? 180}" 
                onchange="updateAnimation(${index}, 'angleB', this.value)">
        </label>
    `;
        }

        if (anim.type === 'blur') {
            item.innerHTML += `
        <label>From (px):
            <input type="number" value="${anim.blurfrom ?? 2}" 
                onchange="updateAnimation(${index}, 'blurfrom', this.value)">
        </label>
        <label>To (px):
            <input type="number" value="${anim.blurto ?? 6}" 
                onchange="updateAnimation(${index}, 'blurto', this.value)">
        </label>
    `;
        }

        if (anim.type === 'saturation') {
            item.innerHTML += `
        <label>From Saturation:
            <input type="number" step="0.1" value="${anim.satfrom ?? 1}" 
                onchange="updateAnimation(${index}, 'satfrom', this.value)">
        </label>
        <label>To Saturation:
            <input type="number" step="0.1" value="${anim.satto ?? 2}" 
                onchange="updateAnimation(${index}, 'satto', this.value)">
        </label>
    `;
        }
        if (anim.type === 'scale') {
            item.innerHTML += `
        <label>From Scale:
            <input type="number" step="0.01" value="${anim.scalefrom ?? 1}" 
                onchange="updateAnimation(${index}, 'scalefrom', this.value)">
        </label>
        <label>To Scale:
            <input type="number" step="0.01" value="${anim.scaleto ?? 1.1}" 
                onchange="updateAnimation(${index}, 'scaleto', this.value)">
        </label>
    `;
        }


        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.innerText = '✕ Remove';
        removeBtn.style.marginTop = '0.5rem';
        removeBtn.onclick = () => {
            layer.animations.splice(index, 1);
            renderAnimationControls();
            createLayers();
        };

        item.appendChild(removeBtn);
        container.appendChild(item);
    });
}

function addAnimation() {
    if (currentLayerIndex < 0) return;
    layers[currentLayerIndex].animations.push({
        type: 'rotate',
        duration: 10,
        reverse: false
    });
    renderAnimationControls();
    document.getElementById('animationList').classList.remove('hidden');
    createLayers();
}

function updateAnimation(index, key, value) {
    if (currentLayerIndex < 0) return;
    const layer = layers[currentLayerIndex];
    if (!layer.animations[index]) return;

    if (key === 'duration') value = parseFloat(value);
    if (key === 'reverse') value = Boolean(value);

    layer.animations[index][key] = value;
    renderAnimationControls();
    createLayers();
}

function syncDuration(animIndex) {
    if (!layers || currentLayerIndex < 0) return;
    const layer = layers[currentLayerIndex];
    if (!layer.animations[animIndex]) return;

    let dur = layer.animations[animIndex];
    layer.animations.forEach((anim, index) => {
        anim.duration = dur;
    });

    renderAnimationControls();
    createLayers();
}

function updateProjectName() {
    var nameIn = document.getElementById('projectName');
    if (nameIn) {
        projectName = nameIn.value;
        console.log("Name: " + projectName);
        updateCurrentLayer();
    }
}

function copyToClipboard(elementId) {
    const el = document.getElementById(elementId);
    el.select();
    el.setSelectionRange(0, 99999); // For mobile
    //document.execCommand("copy");
    // Copy the text inside the text field
    navigator.clipboard.writeText(el.value);

    // Optional: UI feedback
    const btn = document.querySelector(`[onclick="copyToClipboard('${elementId}')"]`);
    if (btn) {
        btn.innerHTML = '✔'; // ✅ visual feedback
        btn.style.color = "green";
        setTimeout(() => btn.innerHTML = '&#12222;', 1500);
        setTimeout(() => btn.style.color = '#888', 1500);
    }
}


function startDragStop(e, index) {
    const layer = layers[currentLayerIndex];
    const stop = layer.colorStops[index];
    if (stop.pinned) return; // 🔒 Do not drag pinned stops

    isDraggingStop = true;
    const track = document.getElementById('colorTrack');
    const rect = track.getBoundingClientRect();
    const originalStop = stop;
    if (stop.pinned) return;
    isDraggingStop = true;

    const onMove = (event) => {
        if (!isDraggingStop) return;

        let x = event.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        const percent = (x / rect.width) * 100;

        originalStop.stop = percent.toFixed(1) + '%';

        renderColorStops();
        createLayers();
    };

    const onUp = () => {
        isDraggingStop = false;

        // After drag completes, sort and update selectedStopIndex
        const layer = layers[currentLayerIndex];
        const sorted = [...layer.colorStops].sort((a, b) => parseFloat(a.stop) - parseFloat(b.stop));

        const newIndex = sorted.findIndex(s => s === originalStop);
        layer.colorStops = sorted;
        selectedStopIndex = newIndex;

        renderColorStops();
        createLayers();

        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
}




// Toggle template visibility
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('templateHeader').onclick = () => {
        const list = document.getElementById('templateList');
        list.classList.toggle('hidden');
    }; document.getElementById('animationHeader').onclick = () => {
        const list = document.getElementById('animationList');
        list.classList.toggle('hidden');
    };
});


document.addEventListener('keydown', (e) => {
    const layer = layers[currentLayerIndex];
    if (!layer || selectedStopIndex === null) return;

    const stop = layer.colorStops[selectedStopIndex];
    if (!stop || stop.pinned) return;

    const step = e.shiftKey ? 0.1 : 1;
    let pos = parseFloat(stop.stop);

    if (e.key === 'ArrowRight') {
        pos = Math.min(100, pos + step);
    } else if (e.key === 'ArrowLeft') {
        pos = Math.max(0, pos - step);
    } else {
        return; // Not a relevant key
    }

    stop.stop = pos.toFixed(1) + '%';
    renderColorStops();
    createLayers();
});

document.getElementById('hueSlider').addEventListener('input', (e) => {
    hue = parseFloat(e.target.value);
    updateColorFromUI();
    onPickerChange();
});

document.getElementById('alphaSlider').addEventListener('input', (e) => {
    alpha = parseFloat(e.target.value);
    updateColorFromUI();
    onPickerChange();
});


        // Initialize with one default layer
        //addLayer();
renderTemplateMenu();
//console.log("aaa" + templates[0].config);
loadTemplate(templates[0].config);



const colorField = document.getElementById('colorField');
const cursor = document.getElementById('colorCursor');

function setSBFromPosition(x, y) {
    const rect = colorField.getBoundingClientRect();
    let s = (x - rect.left) / rect.width;
    let b = 1 - (y - rect.top) / rect.height;

    s = Math.max(0, Math.min(1, s));
    b = Math.max(0, Math.min(1, b));

    saturation = s;
    brightness = b;

    updateColorFromUI();
    onPickerChange(); // sync color stop
    updateCursorPosition();
}

function updateCursorPosition() {
    const rect = colorField.getBoundingClientRect();
    const x = saturation * rect.width;
    const y = (1 - brightness) * rect.height;
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
}

// Pointer events for drag/click
colorField.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    setSBFromPosition(e.clientX, e.clientY);

    const onMove = (ev) => {
        setSBFromPosition(ev.clientX, ev.clientY);
    };

    const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
});

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("config");

    if (encoded) {
        try {
            const config = decodeConfig(encoded);
            //console.log("dddDD" + config);
            //validateConfig(config);
            //loadTemplate(config);
            layers = JSON.parse(config);
;
            createLayers();
        } catch (e) {
            console.error("Invalid config:", e);
            // fallback UI / error message
        }
    } else {
        // load default or editor mode
    }
});



function shareConfig() {
    const url = getEmbedding(JSON.stringify(layers, null, 2));
    navigator.clipboard.writeText(url).then(() => alert("Link copied to clipboard!"));
}

function createimage() {
    //var canvas = document.createElement("canvas");
        const canvas = document.getElementById('gradientCanvas');
        const ctx = canvas.getContext('2d');
    renderGradientLayersToCanvas(ctx);
    //let gradients = [];
    //layers.forEach((layer, i) => {
    //    if (!layer.visible) return;
    //    //layerCSS += `  background: ${gradient};\n`;
    //    gradients.push(buildGradientString(layer));
    //});
    //canvas.style.background = gradients.join(", ");
        // Create a linear gradient — you can change this
        //const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        //gradient.addColorStop(0, '#FF5F6D');
        //gradient.addColorStop(1, '#FFC371');

    // Fill the canvas with the gradient
    //ctx.fillStyle = buildGradientString(layer);
        //ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Automatically trigger download
        const link = document.createElement('a');
        link.download = 'gradient-4k-wallpaper.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
}

function renderGradientLayersToCanvas(ctx) {
    let width = 3840;
    let height = 2160;
    layers.forEach((layer) => {
        if (!layer.visible) return;

        // Skip animations (static image export only)
        const skipMorph = layer.animations?.some(a => a.type === 'morph');
        if (skipMorph) return;

        ctx.save();

        // Build gradient
        let gradient;
        if (layer.type === 'linear') {
            const angle = (layer.angle ?? 0) * (Math.PI / 180);
            const x1 = width / 2 + Math.cos(angle) * width;
            const y1 = height / 2 + Math.sin(angle) * height;
            gradient = ctx.createLinearGradient(0, 0, 3840, 2160);
        } else {
            const cx = width / 2;
            const cy = height / 2;
            const radius = Math.sqrt(width * width + height * height) / 2;
            gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        }

        // Add color stops
        layer.colorStops.forEach(cs => {
            const offset = parseFloat(percentToDecimal(cs.stop));
            gradient.addColorStop(offset, cs.color);
        });

        // Set opacity
        const skipPulse = layer.animations?.some(a => a.type === 'pulse');
        ctx.globalAlpha = !skipPulse ? (layer.opacity ?? 1) : 1;

        // Set blur (modern browser support only)
        const skipHue = layer.animations?.some(a => a.type === 'hue');
        if (!skipPulse && !skipHue && layer.blur) {
            ctx.filter = `blur(${layer.blur}px)`;
        } else {
            ctx.filter = 'none';
        }

        // No shape clipping for now — draw full canvas
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.restore(); // Reset state for next layer
    });
}

function percentToDecimal(stop) {
    if (typeof stop === 'string' && stop.trim().endsWith('%')) {
        return parseFloat(stop) / 100;
    }
    return parseFloat(stop); // fallback for already-decimal values
}

document.addEventListener('DOMContentLoaded', () => {
    const checkbox = document.getElementById('enableTooltips');
    checkbox.checked = "checked";
    document.body.classList.toggle('tooltips-disabled', false);
    
});
document.getElementById('enableTooltips').addEventListener('change', function () {
    const isChecked = this.checked;
    document.body.classList.toggle('tooltips-disabled', !isChecked);
//    localStorage.setItem('showTooltips', !isChecked);
});


let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

const preview = document.getElementById('previewWindow');

preview.addEventListener('mousedown', (e) => {
    if (!preview.classList.contains('unpinned')) return;

    isDragging = true;
    const rect = preview.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    preview.classList.add('dragging');
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging || !preview.classList.contains('unpinned')) return;

    preview.style.left = `${e.clientX - dragOffsetX}px`;
    preview.style.top = `${e.clientY - dragOffsetY}px`;
    preview.style.right = 'auto';
    preview.style.bottom = 'auto';
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        preview.classList.remove('dragging');
    }
});
function togglePin() {
    const dragHandle = document.getElementById('previewHeader');
    const isPinned = preview.classList.contains('pinned');
    console.log("toggling");
    if (isPinned) {
        // Unpin: enable dragging/resizing
        preview.classList.remove('pinned');
        preview.classList.add('unpinned');
        preview.classList.add('floating-preview');
        dragHandle.classList.add('preview-drag-handle');
        preview.style.right = 'auto';
        preview.style.left = `${preview.getBoundingClientRect().left}px`;
        preview.style.top = `${preview.getBoundingClientRect().top}px`;
        //localStorage.setItem('previewPinned', 'false');
    } else {
        // Pin: reset to top-right, disable movement
        preview.classList.remove('unpinned');
        dragHandle.classList.remove('preview-drag-handle');
        preview.classList.remove('floating-preview');
        preview.classList.add('pinned');
        preview.style.top = '20px';
        preview.style.right = '20px';
        preview.style.left = 'auto';
        preview.style.bottom = 'auto';
        //reset back to original size
        preview.style.width = "500px";
        preview.style.height = "500px";
        //localStorage.setItem('previewPinned', 'true');
    }
}

function toggleRandomMenu() {
    let menu = document.getElementById('randomizerSettingsPanel');
    if (menu)
        menu.classList.toggle('hidden');
}


function generateRandomGradient() {
    //let menu = document.getElementById('randomizerSettingsPanel');
    //if (menu && !menu.classList.includes('hidden')) {
    //    generateRandomGradientFromSettings();
    //    return;
    //}
    const newLayers = [];
    let layerCount = Math.floor(Math.random() * 3) + 1; // 1–3 layers
    if (Math.random() > .95) {
        layerCount += Math.floor(Math.random() * 5) + 2;
    }

    for (let i = 0; i < layerCount; i++) {
        const type = randomFrom(['linear', 'radial', 'conic'])
        let shape = 'circle';
        if (type === 'radial') {
            shape = randomFrom(['circle', 'ellipse']);
        }
        else {
            shape = randomFrom(['circle', 'square']);
        }
        const opacity = layerCount == 1 ? 1.0 : randFloat(0.2, 1 - (0.1 * i)).toFixed(2);
        const blur = randFloat(0, 6).toFixed(1);
        const animate = Math.random() > 0.4;
        const duration = Math.floor(randFloat(4, 15));

        let colorStopCount = Math.floor(Math.random() * 4) + 2;
        if (Math.random() > .95) {
            colorStopCount += Math.floor(Math.random() * 5) + 2;
        }
        const colorStops = Array.from({ length: colorStopCount }, (_, i) => {
            const color = randomColor();
            const stop = `${Math.floor((i / (colorStopCount - 1)) * 100)}%`;
            return { color, stop };
        });

        const layer = {
            type,
            shape,
            opacity: parseFloat(opacity),
            blur: parseFloat(blur),
            animate,
            duration,
            clockwise: Math.random() > 0.5,
            colorStops,
            animations: [],
            visible:true
        };

        // Set type-specific settings
        if (type === 'linear') {
            layer.angle = Math.floor(Math.random() * 360);
        }

        if (type === 'conic') {
            layer.startAngle = Math.floor(Math.random() * 360);
            layer.centerX = Math.floor(randFloat(25, 75));
            layer.centerY = Math.floor(randFloat(25, 75));
        }

        if (type === 'radial') {
            layer.centerX = Math.floor(randFloat(0, 100));
            layer.centerY = Math.floor(randFloat(0, 100));
        }

        // Add a random animation (optional)
        if (animate) {
            const animTypes = ['rotate', 'pulse', 'blur', 'hue', 'saturation', 'scale'];
            const anim = {
                type: randomFrom(animTypes),
                duration,
            };

            // Add some default ranges for animations
            if (anim.type === 'blur') {
                anim.blurfrom = 0;
                anim.blurto = parseFloat(blur) + randFloat(1, 3);
            }
            if (anim.type === 'hue') {
                anim.fromHue = 0;
                anim.toHue = Math.floor(randFloat(90, 270));
            }
            if (anim.type === 'saturation') {
                anim.satfrom = 0.5;
                anim.satto = 2;
            }
            if (anim.type === 'scale') {
                anim.scalefrom = 1;
                anim.scaleto = randFloat(1.1, 1.4);
            }

            layer.animations.push(anim);
        }

        newLayers.push(layer);
    }

    // Replace current project
    layers = newLayers;
    currentLayerIndex = -1;
    createLayers();
    renderLayerList();
    renderDynamicInputs();
}

function generateRandomGradientFromSettings() {
    const minLayers = +document.getElementById('randLayerMin').value;
    const maxLayers = +document.getElementById('randLayerMax').value;
    const minStops = +document.getElementById('randStopMin').value;
    const maxStops = +document.getElementById('randStopMax').value;
    const blurMin = +document.getElementById('randBlurMin').value;
    const blurMax = +document.getElementById('randBlurMax').value;
    const opacityMin = +document.getElementById('randOpacityMin').value;
    const opacityMax = +document.getElementById('randOpacityMax').value;
    const animChance = +document.getElementById('randAnimChance').value;

    const allowedTypes = Array.from(document.querySelectorAll('.randType:checked')).map(i => i.value);
    const allowedAnimations = Array.from(document.querySelectorAll('.randAnim:checked')).map(i => i.value);

    const newLayers = [];
    const layerCount = Math.floor(randFloat(minLayers, maxLayers + 1));

    for (let i = 0; i < layerCount; i++) {
        const type = randomFrom(allowedTypes);
        const shape = randomFrom(['circle', 'square']);
        const opacity = layerCount == 1 ? 1.0 : randFloat(opacityMin, opacityMax).toFixed(2);
        const blur = randFloat(blurMin, blurMax).toFixed(1);
        const animate = Math.random() * 100 < animChance;
        const duration = Math.floor(randFloat(4, 15));

        const stopCount = Math.floor(randFloat(minStops, maxStops + 1));
        const colorStops = Array.from({ length: stopCount }, (_, i) => {
            const color = randomColor();
            const stop = `${Math.floor((i / (stopCount - 1)) * 100)}%`;
            return { color, stop };
        });

        const layer = {
            type,
            shape,
            opacity: parseFloat(opacity),
            blur: parseFloat(blur),
            animate,
            duration,
            clockwise: Math.random() > 0.5,
            colorStops,
            animations: [],
            visible: true
        };

        if (type === 'linear') {
            layer.angle = Math.floor(randFloat(0, 360));
        } else if (type === 'conic') {
            layer.startAngle = Math.floor(randFloat(0, 360));
            layer.centerX = Math.floor(randFloat(25, 75));
            layer.centerY = Math.floor(randFloat(25, 75));
        } else if (type === 'radial') {
            layer.centerX = Math.floor(randFloat(0, 100));
            layer.centerY = Math.floor(randFloat(0, 100));
        }

        if (animate && allowedAnimations.length) {
            const anim = {
                type: randomFrom(allowedAnimations),
                duration
            };

            if (anim.type === 'blur') {
                anim.blurfrom = 0;
                anim.blurto = parseFloat(blur) + randFloat(1, 3);
            }

            if (anim.type === 'hue') {
                anim.fromHue = 0;
                anim.toHue = Math.floor(randFloat(90, 270));
            }

            if (anim.type === 'saturation') {
                anim.satfrom = 0.5;
                anim.satto = 2;
            }

            if (anim.type === 'scale') {
                anim.scalefrom = 1;
                anim.scaleto = randFloat(1.1, 1.4);
            }

            layer.animations.push(anim);
        }

        newLayers.push(layer);
    }

    layers = newLayers;
    currentLayerIndex = -1;
    createLayers();
    renderLayerList();
    renderDynamicInputs();
}




function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function randomColor() {
    const r = Math.floor(randFloat(0, 255));
    const g = Math.floor(randFloat(0, 255));
    const b = Math.floor(randFloat(0, 255));
    const a = randFloat(0.5, 1).toFixed(2);
    return `rgba(${r},${g},${b},${a})`;
}

