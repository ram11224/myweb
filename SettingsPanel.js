class SettingsPanel {
    constructor(webBuilder) {
        this.webBuilder = webBuilder;
        this.currentElement = null;
    }

   init() {
    this.initFormControls();
}

/**
 * Updates the entire settings panel based on the currently selected element.
 */
updatePanel() {
    this.currentElement = this.webBuilder.uiManager.currentElement;
    if (!this.currentElement) return;

    const el = this.currentElement;
    const isBody = el.tagName === 'BODY';
    const type = el.dataset.type || '';
    const style = getComputedStyle(el);
    const elData = el.dataset;

    // Ensure the correct settings tab is active
    const currentActiveCategory = document.querySelector('.right-strip .strip-btn.active')?.dataset.category;
    if (currentActiveCategory) {
        this.webBuilder.uiManager.openSettingsPopup(currentActiveCategory, document.querySelector(`.right-strip .strip-btn[data-category="${currentActiveCategory}"]`));
    }
    
    document.getElementById('deleteElementBtn').style.display = isBody ? 'none' : 'flex';
    document.getElementById('saveComponentBtn').style.display = isBody ? 'none' : 'flex';
    
    // --- Field Visibility Logic ---
    const canBeLinked = !isBody;
    const isList = ['list-ul', 'list-ol'].includes(type);
    const isContainer = !isBody && ['section', 'h-container', 'v-container', 'card', 'header', 'footer', 'hero', 'form', 'grid', 'columns', 'html'].includes(type);
    const isLinkType = type === 'link' || type === 'button';
    const hasTextContent = ['heading', 'text', 'button', 'alert', 'badge', 'link'].includes(type);
    
    const fields = { 
        'group-contentText': hasTextContent,
        'group-contentLink': canBeLinked,
        'group-contentImageUrl': type === 'image',
        'group-contentVideoUrl': type === 'video',
        'group-contentAudioUrl': type === 'audio',
        'group-contentMapQuery': type === 'gmap',
        'group-contentIcon': type === 'icon',
        'group-contentProgress': type === 'progress-bar',
        'group-layout': isContainer || isBody,
        'group-contentListItems': isList,
        'group-contentCustomHtml': type === 'html',
        'group-link-decoration': isLinkType
    };
    Object.keys(fields).forEach(id => {
        const group = document.getElementById(id);
        if (group) group.classList.toggle('hidden', !fields[id] || isBody);
    });
    
    // --- Populate Content Tab ---
    if (canBeLinked) this.populateLinkControls(el);
    if (isList) { document.getElementById('group-contentText').classList.add('hidden'); this.populateListEditor(); }
    if (hasTextContent) document.getElementById('contentText').value = el.textContent || '';
    if (fields['group-contentImageUrl']) document.getElementById('contentImageUrl').value = el.src || '';
    if (fields['group-contentVideoUrl']) document.getElementById('contentVideoUrl').value = el.querySelector('iframe')?.src || '';
    if (fields['group-contentAudioUrl']) document.getElementById('contentAudioUrl').value = el.querySelector('audio > source')?.src || el.src || '';
    if (fields['group-contentMapQuery']) { const src = el.querySelector('iframe')?.src || ''; const qMatch = src.match(/q=([^&]+)/); document.getElementById('contentMapQuery').value = qMatch ? decodeURIComponent(qMatch[1].replace(/\+/g, ' ')) : ''; }
    if (fields['group-contentIcon']) document.getElementById('contentIcon').value = el.className.replace(/builder-element|selected-element|is-locked|fab|fas|far/g, '').trim();
    if (fields['group-contentProgress']) document.getElementById('contentProgress').value = elData.progress || 0;
    if (fields['group-contentCustomHtml']) document.getElementById('contentCustomHtml').value = el.innerHTML;
    
    // --- Populate Style Tab ---
    const px = val => parseInt(val, 10) || '';
    if (isContainer || isBody) { document.getElementById('styleDisplay').value = style.display; document.getElementById('flexbox-options').classList.toggle('hidden', style.display !== 'flex' && style.display !== 'inline-flex'); if(style.display === 'flex' || style.display === 'inline-flex') { document.getElementById('styleFlexDirection').value = style.flexDirection; document.getElementById('styleFlexWrap').value = style.flexWrap; document.getElementById('styleJustifyContent').value = style.justifyContent; document.getElementById('styleAlignItems').value = style.alignItems; } }
    this.webBuilder.uiManager.visibilityCheckboxes.forEach(cb => { cb.checked = !el.classList.contains(cb.dataset.deviceClass); });
    document.getElementById('styleWidth').value = el.style.width; document.getElementById('styleHeight').value = el.style.height; document.getElementById('styleMaxHeight').value = px(style.maxHeight); document.getElementById('styleOverflowY').value = style.overflowY; document.getElementById('styleOverflowX').value = style.overflowX;
    document.getElementById('styleMarginTop').closest('.form-group').style.display = isBody ? 'none' : 'block'; document.getElementById('stylePaddingAll').closest('.form-group').style.display = isBody ? 'none' : 'block'; document.getElementById('stylePaddingTop').closest('.form-group').style.display = isBody ? 'none' : 'block';
    if(!isBody) { document.getElementById('styleMarginTop').value = px(style.marginTop); document.getElementById('styleMarginRight').value = px(style.marginRight); document.getElementById('styleMarginBottom').value = px(style.marginBottom); document.getElementById('styleMarginLeft').value = px(style.marginLeft); this.updateAndCheckUnifiedPaddingInputs(style); }
    this.populateRgbaInputs(style.color, 'styleTextColor'); document.getElementById('styleFontSize').value = px(style.fontSize); document.getElementById('styleFontWeight').value = style.fontWeight; document.getElementById('styleLineHeight').value = el.style.lineHeight; document.getElementById('styleLetterSpacing').value = px(style.letterSpacing); document.getElementById('styleTextAlign').value = style.textAlign; document.getElementById('styleTextTransform').value = style.textTransform;
    if (isLinkType) { document.getElementById('styleTextDecorationLine').value = style.textDecorationLine; document.getElementById('styleTextDecorationStyle').value = style.textDecorationStyle; this.populateRgbaInputs(style.textDecorationColor, 'styleTextDecorationColor'); }
    if (elData.bgGradientType) {
        document.getElementById('bgTypeGradient').checked = true;
        document.getElementById('solidBgOptions').classList.add('hidden');
        document.getElementById('gradient-options').classList.remove('hidden');
        document.getElementById('styleBgGradientType').value = elData.bgGradientType;
        document.getElementById('styleBgGradientAngle').value = elData.bgGradientAngle || '90';
        this.populateRgbaInputs(elData.bgGradientColor1, 'styleBgGradientColor1');
        this.populateRgbaInputs(elData.bgGradientColor2, 'styleBgGradientColor2');
    } else {
        document.getElementById('bgTypeSolid').checked = true;
        document.getElementById('solidBgOptions').classList.remove('hidden');
        document.getElementById('gradient-options').classList.add('hidden');
        this.populateRgbaInputs(style.backgroundColor, 'styleBgColor');
    }
    const bgImageMatch = style.backgroundImage.match(/url\("?(.*?)"?\)/); document.getElementById('styleBgImageUrl').value = bgImageMatch ? bgImageMatch[1] : ''; document.getElementById('styleBgSize').value = style.backgroundSize; document.getElementById('styleBgPosition').value = style.backgroundPosition;
    this.updateAndCheckUnifiedBorderInputs(style); this.updateAndCheckUnifiedRadiusInputs(style);
    this.populateBoxShadowInputs('styleBoxShadow', elData.shadowH, elData.shadowV, elData.shadowBlur, elData.shadowSpread, elData.shadowColor, elData.shadowInset);
    document.getElementById('styleOpacity').value = style.opacity; const filterBlurMatch = style.filter.match(/blur\((\d+)px\)/); document.getElementById('styleFilterBlur').value = filterBlurMatch ? filterBlurMatch[1] : ''; const backdropBlurMatch = (el.style.backdropFilter || el.style.webkitBackdropFilter).match(/blur\((\d+)px\)/); document.getElementById('styleBackdropFilterBlur').value = backdropBlurMatch ? backdropBlurMatch[1] : '';

    // --- Populate Hover Tab ---
    document.getElementById('enableHoverEffect').checked = elData.hoverEnabled === 'true'; this.populateRgbaInputs(elData.hoverBgColor, 'styleHoverBgColor'); this.populateRgbaInputs(elData.hoverTextColor, 'styleHoverTextColor'); this.populateRgbaInputs(elData.hoverBorderColor, 'styleHoverBorderColor'); document.getElementById('styleHoverAnimation').value = elData.hoverAnimation || '';
    this.populateBoxShadowInputs('styleHoverBoxShadow', elData.hoverShadowH, elData.hoverShadowV, elData.hoverShadowBlur, elData.hoverShadowSpread, elData.hoverShadowColor, elData.hoverShadowInset);
    
    // --- Populate Animation Tab ---
    document.getElementById('animationName').value = elData.animationName || ''; document.getElementById('animationDuration').value = elData.animationDuration || ''; document.getElementById('animationDelay').value = elData.animationDelay || ''; document.getElementById('animationIterationCount').value = elData.animationIterationCount || '';
    
    // --- Populate Advanced Tab ---
    document.getElementById('advancedId').value = el.id || ''; document.getElementById('advancedClass').value = Array.from(el.classList).filter(c => !['builder-element', 'selected-element', 'is-locked'].includes(c) && !c.startsWith('d-') && !c.startsWith('animate__') && !['fab','fas','far'].includes(c) ).join(' ');
    document.getElementById('advancedPosition').value = style.position === 'static' ? '' : style.position; document.getElementById('advancedTop').value = style.top; document.getElementById('advancedLeft').value = style.left; document.getElementById('advancedRight').value = style.right; document.getElementById('advancedBottom').value = style.bottom; document.getElementById('advancedZIndex').value = style.zIndex === 'auto' ? '' : style.zIndex;
}

/**
 * Initializes all form controls in the settings panel with their respective event listeners.
 */
initFormControls() {
    const controls = {
        'contentText': { event: 'blur', action: val => { if(this.currentElement) this.currentElement.textContent = val }},
        'contentLink': { event: 'input', action: val => { if(this.currentElement) this.currentElement.setAttribute('href', val) }},
        'contentImageUrl': { event: 'blur', action: val => { if(this.currentElement) this.currentElement.src = val }},
        'contentVideoUrl': { event: 'blur', action: val => { const iframe = this.currentElement?.querySelector('iframe'); if (!iframe) return; if (val.includes('youtube.com') || val.includes('youtu.be')) { const videoId = val.match(/(?:v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/); if (videoId) iframe.src = `https://www.youtube.com/embed/${videoId[1]}`; } else if (val.includes('vimeo.com')) { const videoId = val.match(/vimeo\.com\/(\d+)/); if (videoId) iframe.src = `https://player.vimeo.com/video/${videoId[1]}`; } else { iframe.src = val; } }},
        'contentAudioUrl': { event: 'blur', action: val => { if (this.currentElement) this.currentElement.src = val; }},
        'contentMapQuery': { event: 'blur', action: val => { const iframe = this.currentElement?.querySelector('iframe'); if (iframe) iframe.src = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(val)}`; }},
        'contentIcon': { event: 'blur', action: val => { if(this.currentElement) this.currentElement.className = `${this.currentElement.className.match(/fab|fas|far/)?.[0] || 'fas'} ${val} builder-element selected-element is-locked` }},
        'contentProgress': { event: 'input', action: val => { if(this.currentElement) { const inner = this.currentElement.querySelector('.progress-bar-inner'); if(inner) { this.currentElement.dataset.progress = val; inner.style.width = `${val}%`; inner.textContent = `${val}%`; } } }},
        'contentCustomHtml': { event: 'blur', action: val => { if (this.currentElement) { this.currentElement.innerHTML = val; this.webBuilder.iframeController.reinitIframeContent() } }},
        // Style controls
        'styleDisplay': { event: 'change', action: val => this.applyStyle('display', val, true) },
        'styleFlexDirection': { event: 'change', action: val => this.applyStyle('flexDirection', val) },
        'styleFlexWrap': { event: 'change', action: val => this.applyStyle('flexWrap', val) },
        'styleJustifyContent': { event: 'change', action: val => this.applyStyle('justifyContent', val) },
        'styleAlignItems': { event: 'change', action: val => this.applyStyle('alignItems', val) },
        'styleWidth': { event: 'blur', action: val => this.applyStyle('width', val) },
        'styleHeight': { event: 'blur', action: val => this.applyStyle('height', val) },
        'styleMaxHeight': { event: 'input', action: val => this.applyStyle('maxHeight', val ? `${val}px` : '') },
        'styleOverflowY': { event: 'change', action: val => this.applyStyle('overflowY', val) },
        'styleOverflowX': { event: 'change', action: val => this.applyStyle('overflowX', val) },
        'styleMarginTop': { event: 'input', action: val => this.applyStyle('marginTop', val ? `${val}px` : '') },
        'styleMarginRight': { event: 'input', action: val => this.applyStyle('marginRight', val ? `${val}px` : '') },
        'styleMarginBottom': { event: 'input', action: val => this.applyStyle('marginBottom', val ? `${val}px` : '') },
        'styleMarginLeft': { event: 'input', action: val => this.applyStyle('marginLeft', val ? `${val}px` : '') },
        'stylePaddingTop': { event: 'input', action: val => { this.applyStyle('paddingTop', val ? `${val}px` : ''); this.updateAndCheckUnifiedPaddingInputs(getComputedStyle(this.currentElement)); } },
        'stylePaddingRight': { event: 'input', action: val => { this.applyStyle('paddingRight', val ? `${val}px` : ''); this.updateAndCheckUnifiedPaddingInputs(getComputedStyle(this.currentElement)); } },
        'stylePaddingBottom': { event: 'input', action: val => { this.applyStyle('paddingBottom', val ? `${val}px` : ''); this.updateAndCheckUnifiedPaddingInputs(getComputedStyle(this.currentElement)); } },
        'stylePaddingLeft': { event: 'input', action: val => { this.applyStyle('paddingLeft', val ? `${val}px` : ''); this.updateAndCheckUnifiedPaddingInputs(getComputedStyle(this.currentElement)); } },
        'styleFontSize': { event: 'input', action: val => this.applyStyle('fontSize', val ? `${val}px`: '') },
        'styleFontWeight': { event: 'change', action: val => this.applyStyle('fontWeight', val) },
        'styleLineHeight': { event: 'blur', action: val => this.applyStyle('lineHeight', val) },
        'styleLetterSpacing': { event: 'input', action: val => this.applyStyle('letterSpacing', val ? `${val}px` : '') },
        'styleTextAlign': { event: 'change', action: val => this.applyStyle('textAlign', val) },
        'styleTextTransform': { event: 'change', action: val => this.applyStyle('textTransform', val) },
        'styleTextDecorationLine': { event: 'change', action: val => this.applyStyle('textDecorationLine', val) },
        'styleTextDecorationStyle': { event: 'change', action: val => this.applyStyle('textDecorationStyle', val) },
        'styleBgImageUrl': { event: 'blur', action: val => { if(!this.currentElement) return; const currentBg = this.currentElement.style.backgroundImage; const gradient = currentBg.match(/(linear|radial)-gradient\(.+\)/); if (gradient) { this.currentElement.style.backgroundImage = `${val ? `url(${val}), ` : ''}${gradient[0]}`; } else { this.currentElement.style.backgroundImage = val ? `url(${val})` : ''; } }},
        'styleBgSize': { event: 'change', action: val => this.applyStyle('backgroundSize', val) },
        'styleBgPosition': { event: 'blur', action: val => this.applyStyle('backgroundPosition', val) },
        'styleOpacity': { event: 'input', action: val => this.applyStyle('opacity', val) },
        'styleFilterBlur': { event: 'input', action: val => this.applyStyle('filter', val ? `blur(${val}px)` : '') },
        'styleBackdropFilterBlur': { event: 'input', action: val => { this.applyStyle('backdropFilter', val ? `blur(${val}px)` : ''); this.applyStyle('webkitBackdropFilter', val ? `blur(${val}px)` : ''); } },
        // Advanced controls
        'advancedId': { event: 'blur', action: val => { if(this.currentElement) this.currentElement.id = val }},
        'advancedClass': { event: 'blur', action: val => { if(this.currentElement) { const preservedClasses = Array.from(this.currentElement.classList).filter(c => c.startsWith('builder-') || c === 'selected-element' || c.startsWith('d-') || c.startsWith('animate__') || ['fab','fas','far', 'is-locked'].includes(c) ); this.currentElement.className = [...preservedClasses, ...val.trim().split(' ')].filter(c => c).join(' '); } }},
        'advancedPosition': { event: 'change', action: val => this.applyStyle('position', val) },
        'advancedTop': { event: 'blur', action: val => this.applyStyle('top', val) },
        'advancedLeft': { event: 'blur', action: val => this.applyStyle('left', val) },
        'advancedRight': { event: 'blur', action: val => this.applyStyle('right', val) },
        'advancedBottom': { event: 'blur', action: val => this.applyStyle('bottom', val) },
        'advancedZIndex': { event: 'blur', action: val => this.applyStyle('zIndex', val) },
        // Animation controls
        'animationName': { event: 'change', action: val => { this.applyDataAttr('animationName', val); this.webBuilder.iframeController.applyAnimationStyles(); }},
        'animationDuration': { event: 'blur', action: val => { this.applyDataAttr('animationDuration', val); this.webBuilder.iframeController.applyAnimationStyles(); }},
        'animationDelay': { event: 'blur', action: val => { this.applyDataAttr('animationDelay', val); this.webBuilder.iframeController.applyAnimationStyles(); }},
        'animationIterationCount': { event: 'blur', action: val => { this.applyDataAttr('animationIterationCount', val); this.webBuilder.iframeController.applyAnimationStyles(); }},
        'styleHoverAnimation': { event: 'change', action: val => { this.applyDataAttr('hoverAnimation', val); this.webBuilder.iframeController.updateDynamicStyles(); }},
    };

    const recordChange = () => this.webBuilder.stateManager.recordChange();
    
    // Generic controls
    Object.entries(controls).forEach(([id, config]) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener(config.event, e => {
                this.currentElement = this.webBuilder.uiManager.currentElement;
                if (this.currentElement) { config.action(e.target.value); recordChange(); }
            });
            if (config.event === 'input') input.addEventListener('change', recordChange);
        }
    });

    // Specific controls
    document.getElementById('contentPageLink').addEventListener('change', e => this.handlePageLinkChange(e));
    this.webBuilder.uiManager.visibilityCheckboxes.forEach(cb => cb.addEventListener('change', e => this.handleVisibilityChange(e)));
    this.webBuilder.uiManager.bgTypeRadios.forEach(radio => radio.addEventListener('change', () => this.handleBgTypeChange()));
    ['styleBgGradientType', 'styleBgGradientAngle'].forEach(id => document.getElementById(id).addEventListener('change', () => this.applyGradientStyles()));
    document.getElementById('enableHoverEffect').addEventListener('change', e => this.handleHoverEnable(e));

    // Unified controls
    document.getElementById('stylePaddingAll').addEventListener('input', e => this.applyUnifiedPadding(e.target.value));
    document.getElementById('styleBorderAllWidth').addEventListener('input', e => this.applyUnifiedBorderStyle('Width', e.target.value));
    document.getElementById('styleBorderAllStyle').addEventListener('change', e => this.applyUnifiedBorderStyle('Style', e.target.value));
    document.getElementById('styleBorderRadiusAll').addEventListener('input', e => this.applyUnifiedBorderRadius(e.target.value));
    
    // RGBA and complex controls
    this.setupRgbaControls('color', 'styleTextColor');
    this.setupRgbaControls('textDecorationColor', 'styleTextDecorationColor');
    this.setupRgbaControls('backgroundColor', 'styleBgColor');
    this.setupRgbaControls(null, 'styleBgGradientColor1', false, true);
    this.setupRgbaControls(null, 'styleBgGradientColor2', false, true);
    this.setupRgbaControls('borderColor', 'styleHoverBorderColor', true);
    this.setupRgbaControls('backgroundColor', 'styleHoverBgColor', true);
    this.setupRgbaControls('color', 'styleHoverTextColor', true);
    ['Top','Right','Bottom','Left'].forEach(side => {
        this.setupRgbaControls(`border${side}Color`, `styleBorder${side}Color`);
        ['Width', 'Style'].forEach(prop => {
            document.getElementById(`styleBorder${side}${prop}`).addEventListener('input', e => {
                if (this.currentElement) {
                    this.applyStyle(`border${side}${prop}`, prop === 'Width' ? (e.target.value ? `${e.target.value}px` : '') : e.target.value);
                    this.updateAndCheckUnifiedBorderInputs(getComputedStyle(this.currentElement));
                    recordChange();
                }
            });
        });
    });
    ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].forEach(c => {
        document.getElementById(`styleBorderRadius${c}`).addEventListener('input', e => {
            if (this.currentElement) {
                this.applyStyle(`border${c}Radius`, e.target.value ? `${e.target.value}px` : '');
                this.updateAndCheckUnifiedRadiusInputs(getComputedStyle(this.currentElement));
                recordChange();
            }
        });
    });
    
    // Box shadow controls
    this.setupBoxShadowControls('styleBoxShadow', false);
    this.setupBoxShadowControls('styleHoverBoxShadow', true);
}

// ===================================
//      EVENT HANDLER METHODS
// ===================================

handlePageLinkChange(e) {
    if (!this.currentElement) return;
    const urlInput = document.getElementById('contentLink');
    const selectedPageId = e.target.value; // This is now the page ID, e.g., "about-us"
    if (selectedPageId) {
        // FIX: Set href to a hash-based anchor for internal navigation
        const href = `#${selectedPageId}`;
        this.currentElement.setAttribute('href', href);
        urlInput.value = href;
        urlInput.style.display = 'none';
    } else {
        // Fallback to custom URL if "None" is selected
        this.currentElement.setAttribute('href', '#');
        urlInput.value = '#';
        urlInput.style.display = 'block';
    }
}

handleVisibilityChange(e) {
    if (this.currentElement) {
        this.currentElement.classList.toggle(e.target.dataset.deviceClass, !e.target.checked);
        this.webBuilder.iframeController.updateIframeVisibility();
    }
}

handleBgTypeChange(record = true) {
    if (!this.currentElement) return;
    const type = document.querySelector('input[name="bgType"]:checked').value;
    const solidOpts = document.getElementById('solidBgOptions');
    const gradOpts = document.getElementById('gradient-options');

    if (type === 'gradient') {
        solidOpts.classList.add('hidden');
        gradOpts.classList.remove('hidden');
        this.applyStyle('backgroundColor', '');
        this.applyGradientStyles();
    } else { // Switching to Solid
        gradOpts.classList.add('hidden');
        solidOpts.classList.remove('hidden');
        const wasGradient = this.currentElement.dataset.bgGradientType;
        if (wasGradient) {
            const color1R = document.getElementById('styleBgGradientColor1R').value;
            const color1G = document.getElementById('styleBgGradientColor1G').value;
            const color1B = document.getElementById('styleBgGradientColor1B').value;
            const color1A = document.getElementById('styleBgGradientColor1A').value;
            document.getElementById('styleBgColorR').value = color1R;
            document.getElementById('styleBgColorG').value = color1G;
            document.getElementById('styleBgColorB').value = color1B;
            document.getElementById('styleBgColorA').value = color1A;
        }
        this.applyStyle('backgroundImage', '');
        this.applyStyle('backgroundColor', this.getRgbaFromInputs('styleBgColor'));
        ['bgGradientType', 'bgGradientAngle', 'bgGradientColor1', 'bgGradientColor2'].forEach(attr => this.currentElement.removeAttribute(`data-${attr}`));
    }
    if (record) this.webBuilder.stateManager.recordChange();
}

handleHoverEnable(e) {
    if (this.currentElement) {
        this.applyDataAttr('hoverEnabled', e.target.checked);
        this.webBuilder.iframeController.updateDynamicStyles();
    }
}

// ===================================
//      HELPER & APPLY METHODS
// ===================================

applyStyle(property, value, updatePanel = false) {
    if (this.currentElement) {
        this.currentElement.style[property] = value;
        if (updatePanel) this.updatePanel();
    }
}

applyDataAttr(key, value) {
    if (this.currentElement) {
        if (value === 'false' || !value) {
            delete this.currentElement.dataset[key];
        } else {
            this.currentElement.dataset[key] = value;
        }
    }
}

applyGradientStyles() {
    if (!this.currentElement) return;
    const type = document.getElementById('styleBgGradientType').value;
    const angle = document.getElementById('styleBgGradientAngle').value;
    const color1 = this.getRgbaFromInputs('styleBgGradientColor1');
    const color2 = this.getRgbaFromInputs('styleBgGradientColor2');
    const gradientString = type === 'linear' ? `linear-gradient(${angle}deg, ${color1}, ${color2})` : `radial-gradient(circle, ${color1}, ${color2})`;
    
    this.applyStyle('backgroundImage', gradientString);
    this.applyDataAttr('bgGradientType', type);
    this.applyDataAttr('bgGradientAngle', angle);
    this.applyDataAttr('bgGradientColor1', color1);
    this.applyDataAttr('bgGradientColor2', color2);
}

setupRgbaControls(cssProperty, baseId, isDataset = false, isGradientPart = false) {
    ['R', 'G', 'B', 'A'].forEach(c => {
        const input = document.getElementById(`${baseId}${c}`);
        const action = () => {
            if (!this.currentElement) return;
            const newColor = this.getRgbaFromInputs(baseId);
            if (isGradientPart) { this.applyGradientStyles(); }
            else if (isDataset) {
                const dataKey = baseId.replace('style', '').charAt(0).toLowerCase() + baseId.replace('style', '').slice(1);
                this.applyDataAttr(dataKey, newColor);
                this.webBuilder.iframeController.updateDynamicStyles();
            } else {
                this.applyStyle(cssProperty, newColor);
            }
        };
        input.addEventListener('input', action);
        input.addEventListener('change', () => this.webBuilder.stateManager.recordChange());
    });
}

setupBoxShadowControls(baseId, isHover) {
    const controls = {
        h: document.getElementById(`${baseId}H`), v: document.getElementById(`${baseId}V`),
        blur: document.getElementById(`${baseId}Blur`), spread: document.getElementById(`${baseId}Spread`),
        inset: document.getElementById(`${baseId}Inset`)
    };
    const action = () => {
        if (!this.currentElement) return;
        const h = controls.h.value, v = controls.v.value, blur = controls.blur.value, spread = controls.spread.value;
        const color = this.getRgbaFromInputs(`${baseId}Color`);
        const inset = controls.inset.checked;
        const prefix = isHover ? 'hoverShadow' : 'shadow';
        
        if (!h && !v && !blur && !spread) {
            if(isHover) {
                ['H','V','Blur','Spread','Color','Inset'].forEach(p => delete this.currentElement.dataset[`${prefix}${p}`]);
            } else {
                this.applyStyle('boxShadow', '');
                ['H','V','Blur','Spread','Color','Inset'].forEach(p => delete this.currentElement.dataset[`${prefix}${p}`]);
            }
        } else {
            const shadowValue = `${h || 0}px ${v || 0}px ${blur || 0}px ${spread || 0}px ${color} ${inset ? 'inset' : ''}`.trim();
            if (isHover) {
                this.applyDataAttr('hoverShadowH', h); this.applyDataAttr('hoverShadowV', v);
                this.applyDataAttr('hoverShadowBlur', blur); this.applyDataAttr('hoverShadowSpread', spread);
                this.applyDataAttr('hoverShadowColor', color); this.applyDataAttr('hoverShadowInset', inset);
            } else {
                this.applyStyle('boxShadow', shadowValue);
                this.applyDataAttr('shadowH', h); this.applyDataAttr('shadowV', v);
                this.applyDataAttr('shadowBlur', blur); this.applyDataAttr('shadowSpread', spread);
                this.applyDataAttr('shadowColor', color); this.applyDataAttr('shadowInset', inset);
            }
        }
        if (isHover) this.webBuilder.iframeController.updateDynamicStyles();
    };
    Object.values(controls).forEach(input => {
        input.addEventListener('input', action);
        input.addEventListener('change', () => this.webBuilder.stateManager.recordChange());
    });
    ['R','G','B','A'].forEach(c => {
         document.getElementById(`${baseId}Color${c}`).addEventListener('input', action);
         document.getElementById(`${baseId}Color${c}`).addEventListener('change', () => this.webBuilder.stateManager.recordChange());
    });
}

// ===================================
//      UI POPULATION & SYNC METHODS
// ===================================

populateLinkControls(el) {
    const pageLinkSelect = document.getElementById('contentPageLink');
    const urlInput = document.getElementById('contentLink');
    const pages = this.webBuilder.stateManager.projectState.pages;
    
    pageLinkSelect.innerHTML = `<option value="">None (Custom URL)</option>`;
    // FIX: The value should be the page ID, not the filename.
    pages.forEach(p => pageLinkSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`);
    
    const currentHref = el.getAttribute('href') || '';
    // FIX: Check if the link is an internal hash link
    const isInternalLink = currentHref.startsWith('#') && pages.some(p => p.id === currentHref.substring(1));
    
    pageLinkSelect.value = isInternalLink ? currentHref.substring(1) : "";
    urlInput.style.display = isInternalLink ? 'none' : 'block';
    urlInput.value = currentHref;
}

populateListEditor() {
    if (!this.currentElement) return;
    const editor = document.getElementById('listItemsEditor');
    editor.innerHTML = '';
    const items = this.currentElement.querySelectorAll('.builder-list-item');
    items.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'list-item-row';
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control';
        input.value = item.innerHTML;
        input.addEventListener('input', (e) => { item.innerHTML = e.target.value; this.webBuilder.stateManager.recordChange(); });
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger btn-sm';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.onclick = () => { item.remove(); this.populateListEditor(); this.webBuilder.stateManager.recordChange(); };
        row.appendChild(input);
        row.appendChild(deleteBtn);
        editor.appendChild(row);
    });
}

populateRgbaInputs(colorString, baseId) {
    const rgba = this.parseRgba(colorString);
    document.getElementById(`${baseId}R`).value = rgba.r;
    document.getElementById(`${baseId}G`).value = rgba.g;
    document.getElementById(`${baseId}B`).value = rgba.b;
    document.getElementById(`${baseId}A`).value = rgba.a;
}

populateBoxShadowInputs(baseId, h, v, blur, spread, color, inset) {
    document.getElementById(`${baseId}H`).value = h || '';
    document.getElementById(`${baseId}V`).value = v || '';
    document.getElementById(`${baseId}Blur`).value = blur || '';
    document.getElementById(`${baseId}Spread`).value = spread || '';
    document.getElementById(`${baseId}Inset`).checked = inset === 'true';
    this.populateRgbaInputs(color || 'rgba(0,0,0,0)', `${baseId}Color`);
}

parseRgba(colorString) {
    if (!colorString || !colorString.includes('rgb')) return { r: '', g: '', b: '', a: '' };
    const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return { r: '', g: '', b: '', a: '' };
    return { r: parseInt(match[1], 10), g: parseInt(match[2], 10), b: parseInt(match[3], 10), a: match[4] !== undefined ? parseFloat(match[4]) : 1 };
}

getRgbaFromInputs(baseId) {
    const r = document.getElementById(`${baseId}R`).value || 0;
    const g = document.getElementById(`${baseId}G`).value || 0;
    const b = document.getElementById(`${baseId}B`).value || 0;
    const a = document.getElementById(`${baseId}A`).value;
    return `rgba(${r}, ${g}, ${b}, ${a === '' || a === null ? 1 : a})`;
}

syncContentText(value) {
    document.getElementById('contentText').value = value;
}

// --- UNIFIED INPUT HELPERS ---

applyUnifiedPadding(value) { if (!this.currentElement) return; const paddingValue = value ? `${value}px` : ''; ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach(side => this.applyStyle(side, paddingValue)); this.updateAndCheckUnifiedPaddingInputs(getComputedStyle(this.currentElement)); }
applyUnifiedBorderStyle(prop, value) { if (!this.currentElement) return; const sides = ['Top', 'Right', 'Bottom', 'Left']; sides.forEach(side => { const finalValue = prop === 'Width' ? (value ? `${value}px` : '') : value; this.applyStyle(`border${side}${prop}`, finalValue); if (prop !== 'Color') document.getElementById(`styleBorder${side}${prop}`).value = value; else this.populateRgbaInputs(value, `styleBorder${side}Color`); }); }
applyUnifiedBorderRadius(value) { if (!this.currentElement) return; const corners = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft']; corners.forEach(corner => { this.applyStyle(`border${corner}Radius`, value ? `${value}px` : ''); document.getElementById(`styleBorderRadius${corner}`).value = value; }); }

updateAndCheckUnifiedPaddingInputs(style) { const px = val => parseInt(val, 10) || ''; const sides = ['Top', 'Right', 'Bottom', 'Left']; const paddings = sides.map(s => style[`padding${s}`]); document.getElementById('stylePaddingAll').value = paddings.every(p => p === paddings[0]) ? px(paddings[0]) : ''; sides.forEach((s, i) => { document.getElementById(`stylePadding${s}`).value = px(paddings[i]); }); }
updateAndCheckUnifiedBorderInputs(style) { const px = val => parseInt(val, 10) || ''; const sides = ['Top', 'Right', 'Bottom', 'Left']; const widths = sides.map(s => style[`border${s}Width`]); document.getElementById('styleBorderAllWidth').value = widths.every(w => w === widths[0]) ? px(widths[0]) : ''; const styles = sides.map(s => style[`border${s}Style`]); document.getElementById('styleBorderAllStyle').value = styles.every(s => s === styles[0]) ? styles[0] : ''; const colors = sides.map(s => style[`border${s}Color`]); if (colors.every(c => c === colors[0])) this.populateRgbaInputs(colors[0], 'styleBorderAllColor'); else this.populateRgbaInputs('', 'styleBorderAllColor'); sides.forEach(s => { document.getElementById(`styleBorder${s}Width`).value = px(style[`border${s}Width`]); document.getElementById(`styleBorder${s}Style`).value = style[`border${s}Style`]; this.populateRgbaInputs(style[`border${s}Color`], `styleBorder${s}Color`); }); }
updateAndCheckUnifiedRadiusInputs(style) { const px = val => parseInt(val, 10) || ''; const corners = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft']; const radii = corners.map(c => style[`border${c}Radius`]); document.getElementById('styleBorderRadiusAll').value = radii.every(r => r === radii[0]) ? px(radii[0]) : ''; corners.forEach(c => { document.getElementById(`styleBorderRadius${c}`).value = px(style[`border${c}Radius`]); }); }
}

export default SettingsPanel;