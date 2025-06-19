class UIManager {
    constructor(webBuilder) {
        this.webBuilder = webBuilder;
        this.currentElement = null; // The element currently selected in the iframe
        this.treeDropIndicator = document.createElement('div');
        this.treeDropIndicator.className = 'tree-drop-indicator';
        this.initDomReferences();
    }

initDomReferences() {
    // Main Body & Layout
    this.mainBody = document.body;
    this.previewWrapper = document.getElementById('previewWrapper');

    // Left Panel & Popup (Elements)
    this.leftStripButtons = document.querySelectorAll('.left-strip .strip-btn');
    this.elementsPopup = document.getElementById('elementsPopup');
    this.elementsPopupHeader = document.getElementById('elementsPopupHeader');
    this.elementsPopupTitle = document.getElementById('elementsPopupTitle');
    this.closeElementsPopupBtn = document.getElementById('closeElementsPopupBtn');
    this.elementsListContainer = document.getElementById('elementsListContainer');
    this.elementCategories = document.querySelectorAll('.element-category');
    this.treeViewContainer = document.getElementById('treeViewContainer');
    this.savedComponentsContainer = document.getElementById('savedComponentsContainer');

    // Right Panel & Popup (Settings)
    this.rightStripButtons = document.querySelectorAll('.right-strip .strip-btn');
    this.settingsPopup = document.getElementById('settingsPopup');
    this.settingsPopupHeader = document.getElementById('settingsPopupHeader');
    this.settingsPopupTitle = document.getElementById('settingsPopupTitle');
    this.closeSettingsPopupBtn = document.getElementById('closeSettingsPopupBtn');
    this.settingsContentSections = document.querySelectorAll('.settings-section[data-tab-content]');

    // Top Bar
    this.deviceBtns = document.querySelectorAll('.device-btn');
    this.resetBtn = document.getElementById('resetBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.undoBtn = document.getElementById('undoBtn');
    this.redoBtn = document.getElementById('redoBtn');
    this.previewActionsToggle = document.getElementById('previewActionsToggle');
    this.previewDropdown = document.querySelector('.preview-dropdown');
    this.testingModeBtn = document.getElementById('testingModeBtn');
    this.viewInNewTabBtn = document.getElementById('viewInNewTabBtn');
    this.goBackBtn = document.getElementById('goBackBtn');
    // NEW: Reference for the active page name display
    this.activePageNameEl = document.getElementById('activePageName');
    
    // Action Buttons from Settings Panel
    this.deleteElementBtn = document.getElementById('deleteElementBtn');
    this.addListItemBtn = document.getElementById('addListItemBtn');
    
    // Page Manager Modal
    this.pagesBtn = document.getElementById('pagesBtn');
    this.pagesModal = document.getElementById('pagesModal');
    this.closePagesModal = document.getElementById('closePagesModal');
    this.pageListContainer = document.getElementById('pageListContainer');
    this.addNewPageBtn = document.getElementById('addNewPageBtn');
    this.newPageNameInput = document.getElementById('newPageNameInput');
    
    // Saved Components Modal
    this.saveComponentBtn = document.getElementById('saveComponentBtn');
    this.nameComponentModal = document.getElementById('nameComponentModal');
    this.closeNameComponentModal = document.getElementById('closeNameComponentModal');
    this.componentNameInput = document.getElementById('componentNameInput');
    this.confirmSaveComponentBtn = document.getElementById('confirmSaveComponentBtn');
    this.cancelSaveComponentBtn = document.getElementById('cancelSaveComponentBtn');

    // Specific controls needed for UIManager
    this.visibilityCheckboxes = document.querySelectorAll('#visibility-controls input[type="checkbox"]');
    this.bgTypeRadios = document.querySelectorAll('input[name="bgType"]');
}

init() {
    this.bindEvents();
    this.updateSettingsVisibility();
    this.updateHistoryButtons();
    this.renderSavedComponents();
    this.updateActivePageDisplay(); // NEW: Initial call to set the page name
}

bindEvents() {
    // Left Panel (Elements)
    this.leftStripButtons.forEach(btn => btn.addEventListener('click', () => this.openElementsPopup(btn.dataset.category, btn)));
    this.closeElementsPopupBtn.addEventListener('click', () => this.closeElementsPopup());
    this.makePopupDraggable(this.elementsPopup, this.elementsPopupHeader);
    document.querySelectorAll('.element-item').forEach(item => {
        if (item.draggable) {
            item.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', item.dataset.type);
                 // NEW: Create custom drag ghost for new elements from the palette
                const ghost = document.createElement('div');
                ghost.className = 'drag-preview-ghost'; // Use main window styles
                const type = item.dataset.type;
                const iconClass = this.getElementIconClass(type);
                ghost.innerHTML = `<i class="${iconClass}"></i><span>${type.replace('-', ' ')}</span>`;
                document.body.appendChild(ghost);
                e.dataTransfer.setDragImage(ghost, 20, 20);
                setTimeout(() => ghost.remove(), 0);
            });
        } else if (item.dataset.type === 'body-selector') {
            item.addEventListener('click', () => this.webBuilder.iframeController.selectElement(this.webBuilder.iframeController.iframeDoc.body));
        }
    });
    
    // Right Panel (Settings)
    this.rightStripButtons.forEach(btn => btn.addEventListener('click', () => this.openSettingsPopup(btn.dataset.category, btn)));
    this.closeSettingsPopupBtn.addEventListener('click', () => this.closeSettingsPopup());
    this.makePopupDraggable(this.settingsPopup, this.settingsPopupHeader);

    // Top Bar
    this.saveBtn.addEventListener('click', () => { this.webBuilder.stateManager.saveState(); alert('Project Saved to Local Storage!'); });
    this.undoBtn.addEventListener('click', () => this.webBuilder.stateManager.undo());
    this.redoBtn.addEventListener('click', () => this.webBuilder.stateManager.redo());
    this.deviceBtns.forEach(btn => btn.addEventListener('click', () => { this.setPreviewDevice(btn.dataset.device); this.webBuilder.iframeController.updateIframeVisibility(); }));
    this.resetBtn.addEventListener('click', () => this.resetWorkspace());
    
    // Preview/Testing
    this.previewActionsToggle.addEventListener('click', e => { e.stopPropagation(); this.previewDropdown.classList.toggle('show'); });
    document.addEventListener('click', () => { if (this.previewDropdown.classList.contains('show')) this.previewDropdown.classList.remove('show'); });
    this.viewInNewTabBtn.addEventListener('click', e => { e.preventDefault(); this.showPreview(); });
    this.testingModeBtn.addEventListener('click', e => { e.preventDefault(); this.enterTestingMode(); });
    this.goBackBtn.addEventListener('click', () => this.exitTestingMode());

    // Global listeners
    document.addEventListener('keydown', e => this.handleKeyboardShortcuts(e));

    // Settings Panel Actions
    this.deleteElementBtn.addEventListener('click', () => this.deleteCurrentElement());
    this.addListItemBtn.addEventListener('click', () => this.addListItem());

    // Page Manager
    this.pagesBtn.addEventListener('click', () => this.openPagesModal());
    this.closePagesModal.addEventListener('click', () => this.pagesModal.classList.remove('show'));
    this.pagesModal.addEventListener('click', e => { if (e.target === this.pagesModal) this.pagesModal.classList.remove('show'); });
    this.addNewPageBtn.addEventListener('click', () => this.addNewPage());

    // Saved Components
    this.saveComponentBtn.addEventListener('click', () => this.openNameComponentModal());
    this.closeNameComponentModal.addEventListener('click', () => this.nameComponentModal.classList.remove('show'));
    this.cancelSaveComponentBtn.addEventListener('click', () => this.nameComponentModal.classList.remove('show'));
    this.nameComponentModal.addEventListener('click', e => { if (e.target === this.nameComponentModal) this.nameComponentModal.classList.remove('show'); });
    this.confirmSaveComponentBtn.addEventListener('click', () => this.saveCurrentComponent());
}

makePopupDraggable(popupEl, headerEl) {
    let isDragging = false, offsetX = 0, offsetY = 0;
    const onMouseDown = (e) => {
        isDragging = true;
        const event = e.touches ? e.touches[0] : e;
        offsetX = event.clientX - popupEl.offsetLeft;
        offsetY = event.clientY - popupEl.offsetTop;
        headerEl.style.cursor = 'grabbing';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onMouseMove, { passive: false });
        document.addEventListener('touchend', onMouseUp);
    };
    const onMouseMove = (e) => {
        if (isDragging) {
            e.preventDefault();
            const event = e.touches ? e.touches[0] : e;
            let newLeft = event.clientX - offsetX;
            let newTop = event.clientY - offsetY;
            const maxLeft = window.innerWidth - popupEl.offsetWidth;
            const maxTop = window.innerHeight - popupEl.offsetHeight;
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));
            popupEl.style.left = `${newLeft}px`;
            popupEl.style.top = `${newTop}px`;
        }
    };
    const onMouseUp = () => {
        isDragging = false;
        headerEl.style.cursor = 'move';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('touchmove', onMouseMove);
        document.removeEventListener('touchend', onMouseUp);
    };
    headerEl.addEventListener('mousedown', onMouseDown);
    headerEl.addEventListener('touchstart', onMouseDown);
}

// --- Popup and Modal Management ---

openElementsPopup(category, buttonEl) {
    if (buttonEl.classList.contains('active') && this.elementsPopup.classList.contains('show')) {
        this.closeElementsPopup();
        return;
    }
    this.closeElementsPopup();
    buttonEl.classList.add('active');
    this.elementsPopupTitle.textContent = category;
    this.elementsListContainer.classList.toggle('active', category !== 'structure');
    this.treeViewContainer.classList.toggle('active', category === 'structure');
    
    if (category === 'structure') this.renderTreeView();
    else if (category === 'saved') this.renderSavedComponents();
    
    this.elementCategories.forEach(cat => cat.classList.toggle('hidden', cat.dataset.category !== category));
    this.elementsPopup.classList.add('show');
}

closeElementsPopup() {
    this.elementsPopup.classList.remove('show');
    this.leftStripButtons.forEach(btn => btn.classList.remove('active'));
}

openSettingsPopup(category, buttonEl) {
    if (!this.currentElement) { 
        alert("Please select an element on the page to see its settings.");
        return; 
    }
    if (buttonEl.classList.contains('active') && this.settingsPopup.classList.contains('show')) {
        this.closeSettingsPopup(); 
        return; 
    }
    this.closeSettingsPopup();
    buttonEl.classList.add('active');
    this.settingsPopupTitle.textContent = `${category} Settings`;
    this.settingsContentSections.forEach(section => section.classList.toggle('active', section.dataset.tabContent === category));
    this.settingsPopup.classList.add('show');
}

closeSettingsPopup() {
    this.settingsPopup.classList.remove('show');
    this.rightStripButtons.forEach(btn => btn.classList.remove('active'));
}

openPagesModal() {
    this.renderPageList();
    this.pagesModal.classList.add('show');
}

// --- Page Management ---

renderPageList() {
    const { stateManager } = this.webBuilder;
    this.pageListContainer.innerHTML = '';
    stateManager.projectState.pages.forEach(page => {
        const li = document.createElement('li');
        li.dataset.pageId = page.id;
        if (page.id === stateManager.activePageId) li.classList.add('active');
        li.innerHTML = `
            <span class="page-name">${page.name}</span>
            <div class="page-actions">
                <button class="btn btn-icon btn-sm download-page-btn" data-tooltip="Download Page"><i class="fas fa-download"></i></button>
                ${stateManager.projectState.pages.length > 1 ? `<button class="btn btn-icon btn-sm delete-page-btn" data-tooltip="Delete Page"><i class="fas fa-trash-alt"></i></button>` : ''}
            </div>
        `;
        // MODIFIED: Make event async and update display after switching
        li.querySelector('.page-name').addEventListener('click', async () => {
            await stateManager.switchPage(page.id);
            this.updateActivePageDisplay();
            this.pagesModal.classList.remove('show');
        });
        li.querySelector('.download-page-btn').addEventListener('click', (e) => { e.stopPropagation(); this.downloadSpecificPage(page.id); });
        const deleteBtn = li.querySelector('.delete-page-btn');
        if (deleteBtn) {
            // MODIFIED: Make event async and update display after deleting
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (await stateManager.deletePage(page.id)) {
                    this.renderPageList();
                    this.updateActivePageDisplay();
                }
            });
        }
        this.pageListContainer.appendChild(li);
    });
}

async addNewPage() {
    const { stateManager } = this.webBuilder;
    const newName = this.newPageNameInput.value.trim();
    if (!newName) { alert('Please enter a page name.'); return; }
    const newId = newName.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
    if (!newId) { alert('Please enter a valid page name.'); return; }
    if (stateManager.projectState.pages.some(p => p.id === newId)) { alert('A page with this name already exists.'); return; }
    
    // MODIFIED: Await the action and then update the UI
    await stateManager.addNewPage(newName, newId);
    
    this.newPageNameInput.value = '';
    this.renderPageList();
    this.updateActivePageDisplay();
    this.pagesModal.classList.remove('show');
}

// --- Saved Components Management ---

openNameComponentModal() {
    if (!this.currentElement || this.currentElement.tagName === 'BODY') {
        alert('Please select a valid element to save.');
        return;
    }
    this.componentNameInput.value = '';
    this.nameComponentModal.classList.add('show');
    this.componentNameInput.focus();
}

saveCurrentComponent() {
    const { stateManager } = this.webBuilder;
    const name = this.componentNameInput.value.trim();
    if (!name) { alert('Please enter a name for the component.'); return; }
    if (stateManager.projectState.savedComponents.some(c => c.name === name)) { alert('A component with this name already exists.'); return; }
    const clone = this.currentElement.cloneNode(true);
    clone.classList.remove('selected-element', 'is-locked', 'dragging-in-iframe');
    clone.removeAttribute('contenteditable');
    clone.removeAttribute('draggable');
    clone.querySelectorAll('.resize-handle, .lock-handle').forEach(h => h.remove());
    stateManager.projectState.savedComponents.push({ name: name, html: clone.outerHTML });
    stateManager.saveState();
    this.renderSavedComponents();
    this.nameComponentModal.classList.remove('show');
    alert(`Component "${name}" saved successfully!`);
}

deleteSavedComponent(name) {
    const { stateManager } = this.webBuilder;
    if (confirm(`Are you sure you want to delete the component "${name}"?`)) {
        stateManager.projectState.savedComponents = stateManager.projectState.savedComponents.filter(c => c.name !== name);
        stateManager.saveState();
        this.renderSavedComponents();
    }
}

renderSavedComponents() {
    const { stateManager } = this.webBuilder;
    this.savedComponentsContainer.innerHTML = '';
    if (stateManager.projectState.savedComponents.length === 0) {
        this.savedComponentsContainer.innerHTML = `<p style="color: var(--text-light); text-align: center; padding: 20px 10px;">You haven't saved any components yet.</p>`;
        return;
    }
    stateManager.projectState.savedComponents.forEach(component => {
        const item = document.createElement('div');
        item.className = 'saved-component-item';
        item.draggable = true;
        item.innerHTML = `<span class="saved-component-name">${component.name}</span><button class="delete-component-btn"><i class="fas fa-trash-alt"></i></button>`;
        item.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', `component:${component.name}`));
        item.querySelector('.delete-component-btn').addEventListener('click', (e) => { e.stopPropagation(); this.deleteSavedComponent(component.name); });
        this.savedComponentsContainer.appendChild(item);
    });
}

// --- Tree View Management ---

renderTreeView() {
    const { iframeController } = this.webBuilder;
    if (!iframeController.iframeDoc?.body) return;
    this.treeViewContainer.innerHTML = '';
    const rootUl = document.createElement('ul');
    rootUl.className = 'tree-view-root';
    this.buildTreeNode(iframeController.iframeDoc.body, rootUl);
    this.treeViewContainer.appendChild(rootUl);
    this.syncTreeSelection();
}

buildTreeNode(element, parentNode) {
    const li = document.createElement('li');
    li.className = 'tree-item';
    li.dataset.id = element.dataset.id;
    const content = document.createElement('div');
    content.className = 'tree-item-content';
    content.draggable = (element.tagName !== 'BODY');
    const type = element.dataset.type || element.tagName.toLowerCase();
    content.innerHTML = `<i class="tree-item-icon ${this.getElementIconClass(type)}"></i><span class="tree-item-name">${type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>`;
    li.appendChild(content);
    content.addEventListener('click', (e) => { e.stopPropagation(); this.webBuilder.iframeController.selectElement(element); });
    this.addTreeDragHandlers(li, content, element);
    const childElements = [...element.children].filter(child => child.classList.contains('builder-element'));
    if (childElements.length > 0) {
        const childrenUl = document.createElement('ul');
        childrenUl.className = 'tree-item-children';
        childElements.forEach(child => this.buildTreeNode(child, childrenUl));
        li.appendChild(childrenUl);
    }
    parentNode.appendChild(li);
}

addTreeDragHandlers(treeNode, handle, element) {
    const { iframeController, stateManager } = this.webBuilder;
    handle.addEventListener('dragstart', e => { e.stopPropagation(); e.dataTransfer.setData('text/element-id', element.dataset.id); setTimeout(() => handle.classList.add('is-dragging'), 0); });
    handle.addEventListener('dragend', () => { handle.classList.remove('is-dragging'); this.treeDropIndicator.remove(); document.querySelectorAll('.drop-target-inside').forEach(el => el.classList.remove('drop-target-inside')); });
    handle.addEventListener('dragover', e => {
        e.preventDefault(); e.stopPropagation();
        const rect = handle.getBoundingClientRect();
        document.querySelectorAll('.drop-target-inside').forEach(el => el.classList.remove('drop-target-inside'));
        if (['section', 'container', 'card', 'header', 'footer', 'grid', 'body'].some(t => element.dataset.type.includes(t)) && e.clientX > rect.left + 20) {
            handle.classList.add('drop-target-inside');
            this.treeDropIndicator.remove();
        } else {
            const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
            const indicatorTop = (position === 'before' ? handle.offsetTop : handle.offsetTop + rect.height) - this.treeViewContainer.scrollTop;
            this.treeDropIndicator.style.top = `${indicatorTop}px`;
            this.treeDropIndicator.style.left = `${handle.offsetLeft}px`;
            this.treeDropIndicator.style.width = `${rect.width}px`;
            this.treeViewContainer.appendChild(this.treeDropIndicator);
        }
    });
    handle.addEventListener('dragleave', () => { handle.classList.remove('drop-target-inside'); this.treeDropIndicator.remove(); });
    handle.addEventListener('drop', e => {
        e.preventDefault(); e.stopPropagation();
        this.treeDropIndicator.remove();
        const draggedId = e.dataTransfer.getData('text/element-id');
        if (draggedId === element.dataset.id) { handle.classList.remove('drop-target-inside'); return; }
        const draggedEl = iframeController.iframeDoc.querySelector(`[data-id="${draggedId}"]`);
        if (handle.classList.contains('drop-target-inside')) {
            element.appendChild(draggedEl);
        } else {
            const rect = handle.getBoundingClientRect();
            const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
            element.parentNode.insertBefore(draggedEl, position === 'before' ? element : element.nextSibling);
        }
        handle.classList.remove('drop-target-inside');
        stateManager.recordChange(true);
        this.renderTreeView();
        iframeController.selectElement(draggedEl);
    });
}

// ... otras funciones del UIManager

syncTreeSelection() {
    if (!this.treeViewContainer) return;
    this.treeViewContainer.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    if (this.currentElement) {
        const treeItemContent = this.treeViewContainer.querySelector(`.tree-item[data-id="${this.currentElement.dataset.id}"] > .tree-item-content`);
        if (treeItemContent) {
            treeItemContent.classList.add('selected');
            treeItemContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

// NUEVA FUNCIÓN: Añádela aquí
highlightTreeItemDuringDrag(elementId, isDragging) {
    if (!this.treeViewContainer) return;
    
    // Primero, limpiar cualquier resaltado anterior
    this.treeViewContainer.querySelectorAll('.is-dragging-on-canvas').forEach(el => {
        el.classList.remove('is-dragging-on-canvas');
    });
    
    // Si estamos arrastrando y tenemos un ID, aplicar el nuevo resaltado
    if (isDragging && elementId) {
        const treeItemContent = this.treeViewContainer.querySelector(`.tree-item[data-id="${elementId}"] > .tree-item-content`);
        if (treeItemContent) {
            treeItemContent.classList.add('is-dragging-on-canvas');
        }
    }
}

// --- UI State & Action Helpers ---
// ... resto del archivo

// --- UI State & Action Helpers ---

updateHistoryButtons() { const { stateManager } = this.webBuilder; this.undoBtn.disabled = stateManager.undoStack.length <= 1; this.redoBtn.disabled = stateManager.redoStack.length === 0; }
setPreviewDevice(device) { this.previewWrapper.className = 'preview-wrapper'; this.previewWrapper.classList.add(`${device}-frame`); this.deviceBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.device === device)); }
enterTestingMode() { this.webBuilder.iframeController.deselectElement(); this.mainBody.classList.add('testing-mode'); if (this.webBuilder.iframeController.iframeDoc?.body) this.webBuilder.iframeController.iframeDoc.body.classList.add('iframe-testing-mode'); this.previewDropdown.classList.remove('show'); }
exitTestingMode() { this.mainBody.classList.remove('testing-mode'); if (this.webBuilder.iframeController.iframeDoc?.body) this.webBuilder.iframeController.iframeDoc.body.classList.remove('iframe-testing-mode'); }
async resetWorkspace() {
    const { stateManager } = this.webBuilder;
    const activePage = stateManager.getActivePage();
    if (confirm(`Reset content of "${activePage.name}"?`)) {
        stateManager.projectState.pages.find(p => p.id === stateManager.activePageId).content = '<!-- Start building your page here -->';
        await stateManager.switchPage(stateManager.activePageId);
        this.updateActivePageDisplay(); // Update display after reset
    }
}
deleteCurrentElement() { if (!this.currentElement || this.currentElement.tagName === 'BODY' || this.currentElement.classList.contains('is-locked')) return; if (confirm('Delete this element?')) { this.currentElement.remove(); this.webBuilder.iframeController.deselectElement(); this.webBuilder.stateManager.recordChange(); } }
addListItem() { if (!this.currentElement || !['list-ul', 'list-ol'].includes(this.currentElement.dataset.type)) return; const newItem = this.webBuilder.iframeController.iframeDoc.createElement('li'); newItem.className = 'builder-list-item'; newItem.innerHTML = 'New Item'; this.currentElement.appendChild(newItem); this.webBuilder.settingsPanel.populateListEditor(); this.webBuilder.stateManager.recordChange(); }
updateSettingsVisibility(isElementSelected = false) { document.getElementById('noElementSelected').style.display = isElementSelected ? 'none' : 'block'; document.getElementById('elementSettings').classList.toggle('hidden', !isElementSelected); }

// --- HTML Export & Download ---

showPreview() { this.webBuilder.stateManager.saveState(); setTimeout(() => { const pageContent = this.webBuilder.stateManager.getActivePage().content; const html = this.getCleanHtml(pageContent); const w = window.open('', '_blank'); w.document.write(html); w.document.close(); }, 100); }
downloadSpecificPage(pageId) { this.webBuilder.stateManager.saveState(); setTimeout(() => { const pageToDownload = this.webBuilder.stateManager.projectState.pages.find(p => p.id === pageId); if (!pageToDownload) { alert("Could not find the page to download."); return; } const cleanHtml = this.getCleanHtml(pageToDownload.content); const filename = `${pageToDownload.id}.html`; this.downloadHtmlFile(cleanHtml, filename); }, 100); }
downloadHtmlFile(htmlContent, filename) { const blob = new Blob([htmlContent], { type: 'text/html' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }
getCleanHtml(pageContent) {
    const tempDoc = new DOMParser().parseFromString(`<!DOCTYPE html><html><head></head><body>${pageContent}</body></html>`, 'text/html');
    const cloneBody = tempDoc.body;
    cloneBody.querySelectorAll('.drop-placeholder, .resize-handle, .lock-handle').forEach(e => e.remove());
    cloneBody.querySelectorAll('*').forEach(el => {
        el.classList.remove('builder-element', 'selected-element', 'is-locked', 'dragging-in-iframe', 'builder-list-item');
        if (el.hasAttribute('contenteditable')) el.removeAttribute('contenteditable');
    });
    const head = tempDoc.head;
    head.innerHTML = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">`;
    const baseStylesContent = this.webBuilder.iframeController.getBaseStyles();
    const styleTag = tempDoc.createElement('style');
    styleTag.innerHTML = baseStylesContent;
    head.appendChild(styleTag);
    let dynamicStyles = '';
    cloneBody.querySelectorAll('[data-id][data-hover-enabled="true"]').forEach(el => {
        const id = el.dataset.id; const hoverStyles = [];
        if (el.dataset.hoverBgColor) hoverStyles.push(`background-color: ${el.dataset.hoverBgColor} !important;`);
        if (el.dataset.hoverTextColor) hoverStyles.push(`color: ${el.dataset.hoverTextColor} !important;`);
        if (el.dataset.hoverBorderColor) hoverStyles.push(`border-color: ${el.dataset.hoverBorderColor} !important;`);
        if (el.dataset.hoverShadowColor) { const h = el.dataset.hoverShadowH || '0'; const v = el.dataset.hoverShadowV || '0'; const blur = el.dataset.hoverShadowBlur || '0'; const spread = el.dataset.hoverShadowSpread || '0'; const inset = el.dataset.hoverShadowInset === 'true' ? 'inset' : ''; hoverStyles.push(`box-shadow: ${h}px ${v}px ${blur}px ${spread}px ${el.dataset.hoverShadowColor} ${inset} !important;`); }
        if (el.dataset.hoverAnimation === 'grow') hoverStyles.push('transform: scale(1.05);');
        if (el.dataset.hoverAnimation === 'shrink') hoverStyles.push('transform: scale(0.95);');
        if (el.dataset.hoverAnimation === 'float') hoverStyles.push('transform: translateY(-5px);');
        if (el.dataset.hoverAnimation === 'pulse-hover') hoverStyles.push('animation: pulse 1.5s infinite;');
        if (hoverStyles.length > 0) dynamicStyles += `[data-id="${id}"] { transition: all 0.3s ease; } [data-id="${id}"]:hover { ${hoverStyles.join(' ')} }\n`;
    });
    if (dynamicStyles) { const dynamicStyleTag = tempDoc.createElement('style'); dynamicStyleTag.innerHTML = dynamicStyles; head.appendChild(dynamicStyleTag); }
    return '<!DOCTYPE html>\n' + tempDoc.documentElement.outerHTML;
}

// --- Misc Helpers ---

// NEW: Function to update the active page name in the top bar
updateActivePageDisplay() {
    if (!this.activePageNameEl) return;
    const activePage = this.webBuilder.stateManager.getActivePage();
    this.activePageNameEl.textContent = activePage ? activePage.name : 'N/A';
}

handleKeyboardShortcuts(e) { const { stateManager } = this.webBuilder; if ((e.key === 'Delete' || e.key === 'Backspace') && this.currentElement && this.currentElement.tagName !== 'BODY' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); if (!this.currentElement.classList.contains('is-locked')) this.deleteCurrentElement(); } if (e.ctrlKey || e.metaKey) { if (e.key === 'z') { e.preventDefault(); stateManager.undo(); } if (e.key === 'y') { e.preventDefault(); stateManager.redo(); } } if (e.key === 'Escape') { this.closeElementsPopup(); this.closeSettingsPopup(); } }
getElementIconClass(type) {
    const iconMap = {
        'body': 'fas fa-cube', 'header': 'fas fa-window-maximize', 'footer': 'fas fa-shoe-prints', 'section': 'fas fa-square-full',
        'h-container': 'fas fa-ellipsis-h', 'v-container': 'fas fa-ellipsis-v', 'grid': 'fas fa-th', 'columns': 'fas fa-columns', 'divider': 'fas fa-minus', 'spacer': 'fas fa-arrows-alt-v',
        'heading': 'fas fa-heading', 'text': 'fas fa-paragraph', 'button': 'fas fa-square', 'icon': 'fas fa-star', 'link': 'fas fa-link', 'list-ul': 'fas fa-list-ul', 'list-ol': 'fas fa-list-ol',
        'alert': 'fas fa-exclamation-triangle', 'badge': 'fas fa-tag', 'quote': 'fas fa-quote-left', 'table': 'fas fa-table', 'image': 'fas fa-image', 'video': 'fas fa-video', 'audio': 'fas fa-volume-up',
        'gmap': 'fas fa-map-marked-alt', 'card': 'fas fa-id-card', 'hero': 'fas fa-mountain-sun', 'testimonial': 'fas fa-comment-dots', 'pricing-table': 'fas fa-dollar-sign', 'team-member': 'fas fa-user-friends',
        'html': 'fas fa-code', 'accordion': 'fas fa-align-justify', 'tabs': 'fas fa-folder-open', 'slider': 'fas fa-images', 'progress-bar': 'fas fa-spinner', 'countdown': 'fas fa-stopwatch',
        'social-share': 'fas fa-share-alt', 'form': 'fas fa-file-alt', 'input': 'fas fa-keyboard', 'textarea': 'fas fa-file-signature', 'select': 'fas fa-caret-square-down',
        'checkbox': 'fas fa-check-square', 'radio': 'fas fa-dot-circle'
    };
    return iconMap[type] || 'fas fa-question-circle';
}

}

export default UIManager;