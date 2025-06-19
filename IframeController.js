class IframeController {
    constructor(webBuilder) {
        this.webBuilder = webBuilder;
        this.iframe = document.getElementById('previewIframe');
        this.iframeWin = null;
        this.iframeDoc = null;
        this.dropPlaceholder = document.createElement('div');
        this.dropPlaceholder.className = 'drop-placeholder';

        // Propiedades para un arrastre suave y estable
        this.draggedElementId = null;
        this.activeDropContainer = null;
        this.currentPlaceholderParent = null;
        this.currentPlaceholderSibling = null;
    }

    // --- NUEVO MÉTODO DE AYUDA para limpiar todos los efectos visuales del arrastre ---
    clearDropVisuals() {
        this.removePlaceholder();
        if (this.activeDropContainer) {
            this.activeDropContainer.classList.remove('drop-container-hover');
            this.activeDropContainer = null;
        }
        this.webBuilder.uiManager.highlightTreeItemDuringDrag(null, false);
    }

    async loadIframeContent() {
        return new Promise((resolve, reject) => {
            const { stateManager } = this.webBuilder;
            const currentPage = stateManager.getActivePage();

            if (!currentPage) {
                const errorMsg = "Active page not found! Cannot initialize iframe.";
                console.error(errorMsg);
                return reject(new Error(errorMsg));
            }

            const initialContent = currentPage.content || '<!-- Start building your page here -->';
            stateManager.nextId = currentPage.nextId || 1;

            this.iframe.onerror = (err) => {
                console.error("Iframe loading error:", err);
                reject(err);
            };

            this.iframe.onload = () => {
                try {
                    this.reinitIframeContent();
                    resolve();
                } catch (error) {
                    console.error("Error during iframe re-initialization:", error);
                    reject(error);
                }
            };
            
            this.iframe.srcdoc = `<!DOCTYPE html>
                <html>
                    <head>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                        <style>${this.getBaseStyles()}</style>
                    </head>
                    <body>${initialContent}</body>
                </html>`;
        });
    }

    reinitIframeContent(recordHistory = true) {
        this.iframeWin = this.iframe.contentWindow;
        this.iframeDoc = this.iframeWin.document;

        if (this.iframeDoc.body) {
            this.iframeDoc.body.dataset.type = 'body';
            this.iframeDoc.body.classList.add('builder-element');
            if (document.body.classList.contains('testing-mode')) {
                this.iframeDoc.body.classList.add('iframe-testing-mode');
            }
        }
        
        this.setupIframeGlobalEvents();
        this.updateIframeVisibility();
        this.updateDynamicStyles();
        this.applyAllAnimationStyles();
        this.webBuilder.uiManager.renderTreeView();
        
        if (recordHistory) {
            this.webBuilder.stateManager.recordChange(true);
        }
    }

    setupIframeGlobalEvents() {
        if (!this.iframeDoc || !this.iframeDoc.body) return;

        this.iframeDoc.body.addEventListener('dragover', e => { e.preventDefault(); this.handleDragOver(e); });
        this.iframeDoc.body.addEventListener('drop', e => { this.handleDrop(e); });
        // MODIFICADO: Usar el método de ayuda para limpiar todo al salir
        this.iframeDoc.body.addEventListener('dragleave', () => this.clearDropVisuals());

        this.iframeDoc.body.addEventListener('click', e => {
            if (e.target.closest('.resize-handle, .lock-handle')) return;

            const isTestingMode = this.iframeDoc.body.classList.contains('iframe-testing-mode');
            const targetElement = e.target.closest('.builder-element');

            if (isTestingMode) {
                this.handleLinkNavigation(e);
            } else {
                e.preventDefault();
                e.stopPropagation();
                const elementToSelect = targetElement || this.iframeDoc.body;
                if (elementToSelect === this.webBuilder.uiManager.currentElement) return;
                this.selectElement(elementToSelect);
            }
        }, true);
    }

    handleLinkNavigation(event) {
        const link = event.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href === '#' || href === '') {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            if (href && href.startsWith('#') && href.length > 1) {
                event.preventDefault();
                event.stopPropagation();
                const pageId = href.substring(1);
                const targetPage = this.webBuilder.stateManager.projectState.pages.find(p => p.id === pageId);
                if (targetPage) {
                    this.webBuilder.stateManager.switchPage(targetPage.id).then(() => {
                        this.webBuilder.uiManager.updateActivePageDisplay();
                    });
                } else {
                    alert(`Builder Warning: The internal link target "#${pageId}" does not exist in this project's pages.`);
                }
                return;
            }
            if (href && !href.startsWith('http') && !href.toLowerCase().startsWith('javascript:') && !href.startsWith('mailto:')) {
                event.preventDefault();
                event.stopPropagation();
                alert(`Builder Warning: Navigation to "${href}" is disabled in testing mode. For internal pages, use the page selector in the settings panel.`);
                return;
            }
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.webBuilder.uiManager.highlightTreeItemDuringDrag(this.draggedElementId, true);

        let targetElement = e.target.closest('.builder-element');
        if (!targetElement || targetElement.classList.contains('drop-placeholder')) return;

        if (this.draggedElementId && targetElement.closest(`[data-id='${this.draggedElementId}']`)) {
            this.clearDropVisuals();
            return;
        }

        if (targetElement.classList.contains('is-locked')) {
            targetElement = targetElement.parentElement.closest('.builder-element') || this.iframeDoc.body;
        }
        
        const containerTypes = ['section', 'h-container', 'v-container', 'card', 'header', 'footer', 'hero', 'form', 'grid', 'columns', 'body'];
        const targetIsContainer = containerTypes.includes(targetElement.dataset.type);
        const rect = targetElement.getBoundingClientRect();
        const yRelative = e.clientY - rect.top;
        const edgeThreshold = Math.min(30, rect.height * 0.25);

        let dropContainer, afterElement;

        if (targetIsContainer && yRelative > edgeThreshold && yRelative < rect.height - edgeThreshold) {
            dropContainer = targetElement;
            afterElement = this.getDragAfterElementInContainer(dropContainer, e.clientY);
        } else {
            dropContainer = targetElement.parentElement;
            const isAfter = yRelative > rect.height / 2;
            afterElement = isAfter ? targetElement.nextElementSibling : targetElement;
        }
        
        // --- LÓGICA DE ESTILO DEL CONTENEDOR (ESTABLE Y SUAVE) ---
        if (this.activeDropContainer !== dropContainer) {
            if (this.activeDropContainer) {
                this.activeDropContainer.classList.remove('drop-container-hover');
            }
            dropContainer.classList.add('drop-container-hover');
            this.activeDropContainer = dropContainer;
        }

        // --- LÓGICA DEL PLACEHOLDER (SIN CAMBIOS) ---
        if (dropContainer !== this.currentPlaceholderParent || afterElement !== this.currentPlaceholderSibling) {
            if (afterElement) {
                dropContainer.insertBefore(this.dropPlaceholder, afterElement);
            } else {
                dropContainer.appendChild(this.dropPlaceholder);
            }
            setTimeout(() => this.dropPlaceholder.classList.add('drop-placeholder-active'), 0);
            this.currentPlaceholderParent = dropContainer;
            this.currentPlaceholderSibling = afterElement;
        }
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.currentPlaceholderParent) {
            this.clearDropVisuals();
            return;
        }

        const { stateManager, elementFactory } = this.webBuilder;
        const elementId = e.dataTransfer.getData('text/element-id');
        const data = e.dataTransfer.getData('text/plain');
        let droppedElement;

        if (elementId) {
            droppedElement = this.iframeDoc.querySelector(`[data-id='${elementId}']`);
        } else if (data.startsWith('component:')) {
            const componentName = data.split(':')[1];
            const component = stateManager.projectState.savedComponents.find(c => c.name === componentName);
            if (component) {
                const tempDiv = this.iframeDoc.createElement('div');
                tempDiv.innerHTML = component.html;
                const newElement = tempDiv.firstChild;
                this.assignNewIds(newElement); 
                droppedElement = newElement;
            }
        } else if (data) {
            droppedElement = elementFactory.createElement(data);
        }
        
        if (droppedElement) {
            this.currentPlaceholderParent.insertBefore(droppedElement, this.currentPlaceholderSibling);
            this.selectElement(droppedElement);
            stateManager.recordChange();
        }

        this.clearDropVisuals();
    }

    getDragAfterElementInContainer(container, y) {
        const draggableElements = [...container.querySelectorAll(':scope > .builder-element:not(.dragging-in-iframe):not(.drop-placeholder)')];
        const iframeRect = this.iframe.getBoundingClientRect();
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const childCenterY = box.top + iframeRect.top + box.height / 2;
            const offset = y - childCenterY;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    removePlaceholder() {
        if (this.dropPlaceholder.parentNode) {
            this.dropPlaceholder.classList.remove('drop-placeholder-active');
            setTimeout(() => {
                if (this.dropPlaceholder.parentNode) {
                    this.dropPlaceholder.parentNode.removeChild(this.dropPlaceholder);
                }
            }, 500); 
        }
        this.currentPlaceholderParent = null;
        this.currentPlaceholderSibling = null;
    }

    initDraggable(element) {
        if (element.classList.contains('is-locked') || element.dataset.type === 'body') {
            element.draggable = false;
            return;
        }
        element.draggable = true;
        element.addEventListener('dragstart', e => {
            if (element.classList.contains('is-locked')) {
                e.preventDefault();
                return;
            }
            e.stopPropagation();
            e.dataTransfer.setData('text/element-id', element.dataset.id);
            e.dataTransfer.setData('text/plain', '');
            
            this.draggedElementId = element.dataset.id;
            
            const ghost = this.iframeDoc.createElement('div');
            ghost.className = 'drag-preview-ghost';
            const type = element.dataset.type || 'element';
            const iconClass = this.webBuilder.uiManager.getElementIconClass(type);
            ghost.innerHTML = `<i class="${iconClass}"></i><span>${type.replace('-', ' ')}</span>`;
            this.iframeDoc.body.appendChild(ghost);
            e.dataTransfer.setDragImage(ghost, 20, 20);
            setTimeout(() => ghost.remove(), 0);
            setTimeout(() => element.classList.add('dragging-in-iframe'), 0);
        });

        element.addEventListener('dragend', () => {
            element.classList.remove('dragging-in-iframe');
            this.draggedElementId = null;
            // MODIFICADO: Usar el método de ayuda para limpiar todo al final del arrastre
            this.clearDropVisuals();
        });
    }

    // --- El resto de las funciones (selectElement, deselectElement, etc.) no cambian ---
    // ... (pega aquí el resto de las funciones desde el código anterior) ...
    selectElement(element) {
        if (!element || document.body.classList.contains('testing-mode')) return;
        this.deselectElement();
        this.webBuilder.uiManager.currentElement = element;
        element.classList.add('selected-element');
        if (element.tagName !== 'BODY') {
            this.addSelectionHandles(element);
            this.initDraggable(element);
        }
        this.initContentEditable(element);
        this.webBuilder.settingsPanel.updatePanel();
        this.webBuilder.uiManager.updateSettingsVisibility(true);
        this.webBuilder.uiManager.syncTreeSelection();
    }

    deselectElement() {
        const { uiManager } = this.webBuilder;
        if (uiManager.currentElement) {
            uiManager.currentElement.classList.remove('selected-element');
            this.removeSelectionHandles(uiManager.currentElement);
            uiManager.currentElement.removeAttribute('contenteditable');
            uiManager.currentElement.removeAttribute('draggable');
        }
        uiManager.currentElement = null;
        uiManager.updateSettingsVisibility(false);
        uiManager.closeSettingsPopup();
        uiManager.syncTreeSelection();
    }

    addSelectionHandles(element) {
        if (element.querySelector('.resize-handle')) return;
        const resizeHandle = this.iframeDoc.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.innerHTML = '<i class="fas fa-up-right-and-down-left-from-center" style="font-size: 10px;"></i>';
        const lockHandle = this.iframeDoc.createElement('div');
        lockHandle.className = 'lock-handle';
        lockHandle.innerHTML = element.classList.contains('is-locked')
            ? '<i class="fas fa-lock" style="font-size: 10px;"></i>'
            : '<i class="fas fa-unlock-alt" style="font-size: 10px;"></i>';
        element.append(resizeHandle, lockHandle);
        this.initResizing(resizeHandle, element);
        this.initLocking(lockHandle, element);
    }

    removeSelectionHandles(element) {
        element.querySelector('.resize-handle')?.remove();
        element.querySelector('.lock-handle')?.remove();
    }

    initContentEditable(element) {
        const isEditable = ['heading', 'text', 'button', 'alert', 'badge', 'link'].includes(element.dataset.type);
        if (isEditable && !element.classList.contains('is-locked')) {
            element.setAttribute('contenteditable', 'true');
            element.addEventListener('focus', () => { if (!element.classList.contains('is-locked')) element.draggable = false; });
            element.addEventListener('blur', () => {
                if (!element.classList.contains('is-locked')) element.draggable = true;
                this.webBuilder.stateManager.recordChange();
            });
            element.addEventListener('input', () => {
                this.webBuilder.settingsPanel.syncContentText(element.textContent);
            });
        } else {
            element.removeAttribute('contenteditable');
        }
    }

    initResizing(handle, element) {
        handle.addEventListener('mousedown', (e) => {
            if (element.classList.contains('is-locked')) return;
            e.preventDefault();
            e.stopPropagation();
            const styles = getComputedStyle(element);
            let originalW = parseFloat(styles.width), originalH = parseFloat(styles.height),
                originalFS = parseFloat(styles.fontSize), originalX = e.pageX, originalY = e.pageY;
            const resize = (e_move) => {
                const dx = e_move.pageX - originalX, dy = e_move.pageY - originalY;
                const type = element.dataset.type;
                if (['heading', 'text', 'p', 'button', 'link'].includes(type)) {
                    element.style.fontSize = Math.max(8, originalFS + (dx / 5)) + 'px';
                } else if (['image', 'section', 'h-container', 'v-container', 'card', 'hero', 'grid', 'columns'].includes(type)) {
                    element.style.width = Math.max(20, originalW + dx) + 'px';
                    element.style.height = (type === 'image') ? 'auto' : Math.max(20, originalH + dy) + 'px';
                }
                this.webBuilder.settingsPanel.updatePanel();
            };
            const stopResize = () => {
                this.iframeDoc.removeEventListener('mousemove', resize);
                this.iframeDoc.removeEventListener('mouseup', stopResize);
                this.webBuilder.stateManager.recordChange();
            };
            this.iframeDoc.addEventListener('mousemove', resize);
            this.iframeDoc.addEventListener('mouseup', stopResize);
        });
    }

    initLocking(handle, element) {
        handle.addEventListener('click', (e) => {
            e.stopPropagation(); e.preventDefault();
            const isCurrentlyLocked = element.classList.toggle('is-locked');
            handle.innerHTML = isCurrentlyLocked ? '<i class="fas fa-lock" style="font-size: 10px;"></i>' : '<i class="fas fa-unlock-alt" style="font-size: 10px;"></i>';
            this.initDraggable(element);
            this.initContentEditable(element);
            this.webBuilder.stateManager.recordChange();
        });
    }

    updateIframeVisibility() {
        if (!this.iframeDoc) return;
        const activeDevice = document.querySelector('.device-btn.active').dataset.device;
        let styleSheet = this.iframeDoc.getElementById('builder-visibility-styles');
        if (!styleSheet) {
            styleSheet = this.iframeDoc.createElement('style');
            styleSheet.id = 'builder-visibility-styles';
            this.iframeDoc.head.appendChild(styleSheet);
        }
        let css = '';
        if (activeDevice === 'desktop') css = '.d-desktop-none { display: none !important; }';
        if (activeDevice === 'tablet') css = '.d-tablet-none { display: none !important; }';
        if (activeDevice === 'mobile') css = '.d-mobile-none { display: none !important; }';
        styleSheet.innerHTML = css;
    }

    updateDynamicStyles() {
        if (!this.iframeDoc) return;
        let styleSheet = this.iframeDoc.getElementById('builder-dynamic-styles');
        if (!styleSheet) {
            styleSheet = this.iframeDoc.createElement('style');
            styleSheet.id = 'builder-dynamic-styles';
            this.iframeDoc.head.appendChild(styleSheet);
        }
        let css = '';
        this.iframeDoc.querySelectorAll('[data-id][data-hover-enabled="true"]').forEach(el => {
            const id = el.dataset.id;
            const hoverStyles = [];
            if (el.dataset.hoverBgColor) hoverStyles.push(`background-color: ${el.dataset.hoverBgColor} !important;`);
            if (el.dataset.hoverTextColor) hoverStyles.push(`color: ${el.dataset.hoverTextColor} !important;`);
            if (el.dataset.hoverBorderColor) hoverStyles.push(`border-color: ${el.dataset.hoverBorderColor} !important;`);
            if (el.dataset.hoverShadowColor) {
                const h = el.dataset.hoverShadowH || '0', v = el.dataset.hoverShadowV || '0',
                      blur = el.dataset.hoverShadowBlur || '0', spread = el.dataset.hoverShadowSpread || '0',
                      inset = el.dataset.hoverShadowInset === 'true' ? 'inset' : '';
                hoverStyles.push(`box-shadow: ${h}px ${v}px ${blur}px ${spread}px ${el.dataset.hoverShadowColor} ${inset} !important;`);
            }
            if (el.dataset.hoverAnimation === 'grow') hoverStyles.push('transform: scale(1.05);');
            if (el.dataset.hoverAnimation === 'shrink') hoverStyles.push('transform: scale(0.95);');
            if (el.dataset.hoverAnimation === 'float') hoverStyles.push('transform: translateY(-5px);');
            if (el.dataset.hoverAnimation === 'pulse-hover') hoverStyles.push('animation: pulse 1.5s infinite;');
            if (hoverStyles.length > 0) {
                css += `[data-id="${id}"] { transition: all 0.3s ease; } [data-id="${id}"]:hover { ${hoverStyles.join(' ')} }\n`;
            }
        });
        styleSheet.innerHTML = css;
    }

    applyAllAnimationStyles() {
        this.iframeDoc.querySelectorAll('[data-animation-name]').forEach(el => this.applyAnimationStyles(el));
    }

    applyAnimationStyles(element) {
        const el = element || this.webBuilder.uiManager.currentElement;
        if (!el) return;
        el.className = el.className.replace(/animate__\w+/g, '').replace('animate__animated', '').trim();
        const animName = el.dataset.animationName;
        if (animName) {
            el.classList.add('animate__animated', `animate__${animName}`);
            el.style.animationDuration = el.dataset.animationDuration || '';
            el.style.animationDelay = el.dataset.animationDelay || '';
            el.style.animationIterationCount = el.dataset.animationIterationCount || '';
        } else {
            el.style.animationDuration = '';
            el.style.animationDelay = '';
            el.style.animationIterationCount = '';
        }
    }

    assignNewIds(element) {
        const { stateManager } = this.webBuilder;
        element.dataset.id = stateManager.nextId++;
        element.querySelectorAll('.builder-element').forEach(child => {
            child.dataset.id = stateManager.nextId++;
        });
    }

    getBaseStyles() {
        return `
            /* --- BASE ELEMENT STYLES --- */
            * { box-sizing: border-box; } 
            body { font-family: 'Segoe UI', sans-serif; margin: 0; }
            * { -ms-overflow-style: none; scrollbar-width: none; }
            *::-webkit-scrollbar { display: none; }
            img { max-width: 100%; height: auto; display: block; }
            ul, ol { padding-left: 40px; margin: 1em 0; }
            .builder-element { outline: 1px dashed transparent; transition: all 0.2s, box-shadow 0.3s ease-out; min-height: 20px; position: relative; }
            .builder-element:hover:not(.selected-element) { outline: 1px dashed #6d42f5; }
            body.builder-element:hover { outline-offset: -1px; }
            .builder-list-item { position: relative; margin-bottom: 0.5em;}
            .card { border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
            .alert { padding: 15px; border-radius: 4px; border: 1px solid transparent; }
            .alert-info { color: #0c5460; background-color: #d1ecf1; border-color: #bee5eb; }
            .badge { display: inline-block; padding: .25em .4em; font-size: 75%; font-weight: 700; line-height: 1; text-align: center; white-space: nowrap; vertical-align: baseline; border-radius: .25rem; background-color: #6c757d; color: white; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            blockquote { border-left: 5px solid #eee; margin: 1.5em 0; padding: 10px 20px; font-style: italic; background-color: #f9f9f9; }
            form { border: 1px dashed #ccc; padding: 20px; }
            .progress-bar { width: 100%; background-color: #e9ecef; border-radius: .25rem; }
            .progress-bar-inner { height: 20px; background-color: #6d42f5; border-radius: .25rem; text-align: center; color: white; line-height: 20px; font-size: 12px; transition: width 0.6s ease; }
            .countdown-timer { display: flex; justify-content: space-around; text-align: center; } .countdown-block { background: #f1f3f5; padding: 10px; border-radius: 5px; } .countdown-number { font-size: 2em; font-weight: bold; } .countdown-label { font-size: 0.8em; text-transform: uppercase; }
            .testimonial { text-align: center; } .testimonial-image { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px; } .testimonial-text { font-style: italic; margin-bottom: 10px; } .testimonial-author { font-weight: bold; }
            .team-member { text-align: center; } .team-member-image { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; margin: 0 auto 15px; } .team-member-name { font-size: 1.2em; font-weight: bold; } .team-member-role { color: #6c757d; }
            .pricing-table { border: 1px solid #ddd; border-radius: 8px; text-align: center; padding: 20px; } .pricing-table .price { font-size: 2.5em; font-weight: bold; color: #6d42f5; margin: 10px 0; } .pricing-table .period { color: #6c757d; } .pricing-table ul { list-style: none; padding: 0; margin: 20px 0; } .pricing-table li { padding: 5px 0; }
            .social-share a { margin: 0 5px; font-size: 1.5em; color: #343a40; text-decoration: none; }
            .accordion-item > summary { padding: 10px; cursor: pointer; background-color: #f1f3f5; border: 1px solid #e0e0e0; margin-top: -1px; } .accordion-item > summary:hover { background-color: #e9e5f8; } .accordion-item > p { padding: 15px; border: 1px solid #e0e0e0; border-top: none; }
            .tabs-container { display: flex; flex-wrap: wrap; } .tab-input { display: none; } .tab-label { padding: 10px 15px; cursor: pointer; border-bottom: 2px solid transparent; } .tab-content { display: none; order: 99; width: 100%; padding: 15px; border: 1px solid #e0e0e0; border-top: none; } .tab-input:checked + .tab-label { border-bottom-color: #6d42f5; color: #6d42f5; font-weight: bold; } .tab-input:checked + .tab-label + .tab-content { display: block; }
            .slider-container { position: relative; max-width: 600px; margin: auto; overflow: hidden; } .slider-wrapper { display: flex; transition: transform 0.5s ease-in-out; } .slide { min-width: 100%; } .slider-nav { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); } .slider-nav label { display: inline-block; width: 12px; height: 12px; background-color: #fff; border-radius: 50%; margin: 0 5px; cursor: pointer; border: 1px solid #ccc; } #slide1:checked ~ .slider-wrapper { transform: translateX(0%); } #slide2:checked ~ .slider-wrapper { transform: translateX(-100%); } #slide3:checked ~ .slider-wrapper { transform: translateX(-200%); } #slide1:checked ~ .slider-nav label[for="slide1"], #slide2:checked ~ .slider-nav label[for="slide2"], #slide3:checked ~ .slider-nav label[for="slide3"] { background-color: #6d42f5; }

            /* --- BUILDER UI STYLES --- */
            .selected-element { outline-color: transparent !important; box-shadow: 0 0 0 2px #6d42f5; position: relative; z-index: 100; cursor: move; }
            .selected-element::before { content: attr(data-type); position: absolute; top: -22px; left: -2px; background: #e9e5f8; color: #6d42f5; font-weight: 600; font-size: 10px; padding: 3px 6px; border-radius: 4px; font-family: 'Segoe UI', sans-serif; text-transform: capitalize; z-index: 110; }
            .drop-container-hover { box-shadow: inset 0 0 0 2px #6d42f5 !important; }
            .drop-placeholder { height: 0; background-color: rgba(109, 66, 245, 0.1); border: 1px dashed #6d42f5; border-radius: 5px; margin: 10px 0; box-sizing: border-box; transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); transform-origin: top; transform: scaleY(0); opacity: 0; }
            .drop-placeholder.drop-placeholder-active { height: 50px; transform: scaleY(1); opacity: 1; }
            .dragging-in-iframe { opacity: 0.4; }
            .drag-preview-ghost { position: absolute; top: -1000px; left: -1000px; background-color: #6d42f5; color: white; padding: 8px 15px; border-radius: 6px; font-family: 'Segoe UI', sans-serif; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; z-index: 9999; pointer-events: none; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); }
            .drag-preview-ghost i { font-size: 16px; }
            .resize-handle, .lock-handle { position: absolute; width: 20px; height: 20px; background: #6d42f5; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; z-index: 120; }
            .resize-handle { bottom: -2px; right: -2px; cursor: nwse-resize; border-top-left-radius: 5px; }
            .lock-handle { top: -2px; right: -2px; cursor: pointer; border-bottom-left-radius: 5px; }
            .is-locked { cursor: not-allowed !important; }
            .is-locked::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(200, 200, 220, 0.4) 5px, rgba(200, 200, 220, 0.4) 10px); pointer-events: none; z-index: 105; }
            .is-locked .resize-handle { display: none; }
            .is-locked .lock-handle { background-color: #dc3545; }
            .is-locked > *:not(.lock-handle) { pointer-events: none; }
            .is-locked .lock-handle { pointer-events: auto !important; }
            .is-locked[contenteditable="true"] { pointer-events: none; }
            
            /* --- VISIBILITY & ANIMATION --- */
            @media (min-width: 992px) { .d-desktop-none { display: none !important; } } 
            @media (min-width: 768px) and (max-width: 991px) { .d-tablet-none { display: none !important; } } 
            @media (max-width: 767px) { .d-mobile-none { display: none !important; } }
            .animate__animated { animation-fill-mode: both; }

            /* --- FULL KEYFRAMES LIBRARY --- */
            @keyframes bounce { from, 20%, 53%, 80%, to { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); transform: translate3d(0, 0, 0); } 40%, 43% { animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06); transform: translate3d(0, -30px, 0) scaleY(1.1); } 70% { animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06); transform: translate3d(0, -15px, 0) scaleY(1.05); } 90% { transform: translate3d(0, -4px, 0) scaleY(1.02); } } .animate__bounce { animation-name: bounce; transform-origin: center bottom; }
            @keyframes flash { from, 50%, to { opacity: 1; } 25%, 75% { opacity: 0; } } .animate__flash { animation-name: flash; }
            @keyframes pulse { from { transform: scale3d(1, 1, 1); } 50% { transform: scale3d(1.05, 1.05, 1.05); } to { transform: scale3d(1, 1, 1); } } .animate__pulse { animation-name: pulse; animation-timing-function: ease-in-out; }
            @keyframes rubberBand { from { transform: scale3d(1, 1, 1); } 30% { transform: scale3d(1.25, 0.75, 1); } 40% { transform: scale3d(0.75, 1.25, 1); } 50% { transform: scale3d(1.15, 0.85, 1); } 65% { transform: scale3d(0.95, 1.05, 1); } 75% { transform: scale3d(1.05, 0.95, 1); } to { transform: scale3d(1, 1, 1); } } .animate__rubberBand { animation-name: rubberBand; }
            @keyframes shakeX { from, to { transform: translate3d(0, 0, 0); } 10%, 30%, 50%, 70%, 90% { transform: translate3d(-10px, 0, 0); } 20%, 40%, 60%, 80% { transform: translate3d(10px, 0, 0); } } .animate__shakeX { animation-name: shakeX; }
            @keyframes shakeY { from, to { transform: translate3d(0, 0, 0); } 10%, 30%, 50%, 70%, 90% { transform: translate3d(0, -10px, 0); } 20%, 40%, 60%, 80% { transform: translate3d(0, 10px, 0); } } .animate__shakeY { animation-name: shakeY; }
            @keyframes headShake { 0% { transform: translateX(0); } 6.5% { transform: translateX(-6px) rotateY(-9deg); } 18.5% { transform: translateX(5px) rotateY(7deg); } 31.5% { transform: translateX(-3px) rotateY(-5deg); } 43.5% { transform: translateX(2px) rotateY(3deg); } 50% { transform: translateX(0); } } .animate__headShake { animation-timing-function: ease-in-out; animation-name: headShake; }
            @keyframes swing { 20% { transform: rotate3d(0, 0, 1, 15deg); } 40% { transform: rotate3d(0, 0, 1, -10deg); } 60% { transform: rotate3d(0, 0, 1, 5deg); } 80% { transform: rotate3d(0, 0, 1, -5deg); } to { transform: rotate3d(0, 0, 1, 0deg); } } .animate__swing { transform-origin: top center; animation-name: swing; }
            @keyframes tada { from { transform: scale3d(1, 1, 1); } 10%, 20% { transform: scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg); } 30%, 50%, 70%, 90% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg); } 40%, 60%, 80% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg); } to { transform: scale3d(1, 1, 1); } } .animate__tada { animation-name: tada; }
            @keyframes wobble { from { transform: translate3d(0, 0, 0); } 15% { transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg); } 30% { transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg); } 45% { transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg); } 60% { transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg); } 75% { transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg); } to { transform: translate3d(0, 0, 0); } } .animate__wobble { animation-name: wobble; }
            @keyframes jello { from, 11.1%, to { transform: translate3d(0, 0, 0); } 22.2% { transform: skewX(-12.5deg) skewY(-12.5deg); } 33.3% { transform: skewX(6.25deg) skewY(6.25deg); } 44.4% { transform: skewX(-3.125deg) skewY(-3.125deg); } 55.5% { transform: skewX(1.5625deg) skewY(1.5625deg); } 66.6% { transform: skewX(-0.78125deg) skewY(-0.78125deg); } 77.7% { transform: skewX(0.390625deg) skewY(0.390625deg); } 88.8% { transform: skewX(-0.1953125deg) skewY(-0.1953125deg); } } .animate__jello { animation-name: jello; transform-origin: center; }
            @keyframes heartBeat { 0% { transform: scale(1); } 14% { transform: scale(1.3); } 28% { transform: scale(1); } 42% { transform: scale(1.3); } 70% { transform: scale(1); } } .animate__heartBeat { animation-name: heartBeat; animation-duration: 1.3s; animation-timing-function: ease-in-out; }
            @keyframes bounceIn { from, 20%, 40%, 60%, 80%, to { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); } 0% { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); } 20% { transform: scale3d(1.1, 1.1, 1.1); } 40% { transform: scale3d(0.9, 0.9, 0.9); } 60% { opacity: 1; transform: scale3d(1.03, 1.03, 1.03); } 80% { transform: scale3d(0.97, 0.97, 0.97); } to { opacity: 1; transform: scale3d(1, 1, 1); } } .animate__bounceIn { animation-name: bounceIn; }
            @keyframes bounceInDown { from, 60%, 75%, 90%, to { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); } 0% { opacity: 0; transform: translate3d(0, -3000px, 0) scaleY(3); } 60% { opacity: 1; transform: translate3d(0, 25px, 0) scaleY(0.9); } 75% { transform: translate3d(0, -10px, 0) scaleY(0.95); } 90% { transform: translate3d(0, 5px, 0) scaleY(0.985); } to { transform: translate3d(0, 0, 0); } } .animate__bounceInDown { animation-name: bounceInDown; }
            @keyframes bounceInLeft { from, 60%, 75%, 90%, to { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); } 0% { opacity: 0; transform: translate3d(-3000px, 0, 0) scaleX(3); } 60% { opacity: 1; transform: translate3d(25px, 0, 0) scaleX(1); } 75% { transform: translate3d(-10px, 0, 0) scaleX(0.98); } 90% { transform: translate3d(5px, 0, 0) scaleX(0.995); } to { transform: translate3d(0, 0, 0); } } .animate__bounceInLeft { animation-name: bounceInLeft; }
            @keyframes bounceInRight { from, 60%, 75%, 90%, to { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); } 0% { opacity: 0; transform: translate3d(3000px, 0, 0) scaleX(3); } 60% { opacity: 1; transform: translate3d(-25px, 0, 0) scaleX(1); } 75% { transform: translate3d(10px, 0, 0) scaleX(0.98); } 90% { transform: translate3d(-5px, 0, 0) scaleX(0.995); } to { transform: translate3d(0, 0, 0); } } .animate__bounceInRight { animation-name: bounceInRight; }
            @keyframes bounceInUp { from, 60%, 75%, 90%, to { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); } 0% { opacity: 0; transform: translate3d(0, 3000px, 0) scaleY(3); } 60% { opacity: 1; transform: translate3d(0, -20px, 0) scaleY(0.9); } 75% { transform: translate3d(0, 10px, 0) scaleY(0.95); } 90% { transform: translate3d(0, -5px, 0) scaleY(0.985); } to { transform: translate3d(0, 0, 0); } } .animate__bounceInUp { animation-name: bounceInUp; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .animate__fadeIn { animation-name: fadeIn; }
            @keyframes fadeInDown { from { opacity: 0; transform: translate3d(0, -100%, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } .animate__fadeInDown { animation-name: fadeInDown; }
            @keyframes fadeInDownBig { from { opacity: 0; transform: translate3d(0, -2000px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } .animate__fadeInDownBig { animation-name: fadeInDownBig; }
            @keyframes fadeInLeft { from { opacity: 0; transform: translate3d(-100%, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } .animate__fadeInLeft { animation-name: fadeInLeft; }
            @keyframes fadeInLeftBig { from { opacity: 0; transform: translate3d(-2000px, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } .animate__fadeInLeftBig { animation-name: fadeInLeftBig; }
            @keyframes fadeInRight { from { opacity: 0; transform: translate3d(100%, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } .animate__fadeInRight { animation-name: fadeInRight; }
            @keyframes fadeInRightBig { from { opacity: 0; transform: translate3d(2000px, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } .animate__fadeInRightBig { animation-name: fadeInRightBig; }
            @keyframes fadeInUp { from { opacity: 0; transform: translate3d(0, 100%, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } .animate__fadeInUp { animation-name: fadeInUp; }
            @keyframes fadeInUpBig { from { opacity: 0; transform: translate3d(0, 2000px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } .animate__fadeInUpBig { animation-name: fadeInUpBig; }
            @keyframes fadeInTopLeft { from { opacity: 0; transform: translate3d(-100%, -100%, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } .animate__fadeInTopLeft { animation-name: fadeInTopLeft; }
            @keyframes fadeInTopRight { from { opacity: 0; transform: translate3d(100%, -100%, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } .animate__fadeInTopRight { animation-name: fadeInTopRight; }
            @keyframes fadeInBottomLeft { from { opacity: 0; transform: translate3d(-100%, 100%, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } .animate__fadeInBottomLeft { animation-name: fadeInBottomLeft; }
            @keyframes fadeInBottomRight { from { opacity: 0; transform: translate3d(100%, 100%, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } .animate__fadeInBottomRight { animation-name: fadeInBottomRight; }
            @keyframes slideInUp { from { transform: translate3d(0, 100%, 0); visibility: visible; } to { transform: translate3d(0, 0, 0); } } .animate__slideInUp { animation-name: slideInUp; }
            @keyframes slideInDown { from { transform: translate3d(0, -100%, 0); visibility: visible; } to { transform: translate3d(0, 0, 0); } } .animate__slideInDown { animation-name: slideInDown; }
            @keyframes slideInLeft { from { transform: translate3d(-100%, 0, 0); visibility: visible; } to { transform: translate3d(0, 0, 0); } } .animate__slideInLeft { animation-name: slideInLeft; }
            @keyframes slideInRight { from { transform: translate3d(100%, 0, 0); visibility: visible; } to { transform: translate3d(0, 0, 0); } } .animate__slideInRight { animation-name: slideInRight; }
            @keyframes zoomIn { from { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); } 50% { opacity: 1; } } .animate__zoomIn { animation-name: zoomIn; }
            @keyframes zoomInDown { from { opacity: 0; transform: scale3d(0.1, 0.1, 0.1) translate3d(0, -1000px, 0); animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19); } 60% { opacity: 1; transform: scale3d(0.475, 0.475, 0.475) translate3d(0, 60px, 0); animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1); } } .animate__zoomInDown { animation-name: zoomInDown; }
            @keyframes zoomInLeft { from { opacity: 0; transform: scale3d(0.1, 0.1, 0.1) translate3d(-1000px, 0, 0); animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19); } 60% { opacity: 1; transform: scale3d(0.475, 0.475, 0.475) translate3d(10px, 0, 0); animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1); } } .animate__zoomInLeft { animation-name: zoomInLeft; }
            @keyframes zoomInRight { from { opacity: 0; transform: scale3d(0.1, 0.1, 0.1) translate3d(1000px, 0, 0); animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19); } 60% { opacity: 1; transform: scale3d(0.475, 0.475, 0.475) translate3d(-10px, 0, 0); animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1); } } .animate__zoomInRight { animation-name: zoomInRight; }
            @keyframes zoomInUp { from { opacity: 0; transform: scale3d(0.1, 0.1, 0.1) translate3d(0, 1000px, 0); animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19); } 60% { opacity: 1; transform: scale3d(0.475, 0.475, 0.475) translate3d(0, -60px, 0); animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1); } } .animate__zoomInUp { animation-name: zoomInUp; }
        `;
    }
}
export default IframeController;