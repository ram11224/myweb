class StateManager {
    constructor(webBuilder) {
        this.webBuilder = webBuilder;
        this.storageKey = 'webBuilderProject_v2';
        this.projectState = null;
        this.activePageId = null;
        this.nextId = 1;
        
        // History Management
        this.undoStack = [];
        this.redoStack = [];
        this.historyLock = false;
        this.historyDebounceTimeout = null;
        this.MAX_HISTORY_STATES = 50;
    }
    
    init() {
        this.loadState();
    }
    
    // --- State & Page Management ---
    
    loadState() {
        const savedData = JSON.parse(localStorage.getItem(this.storageKey) || 'null');
        if (savedData && savedData.pages && savedData.pages.length > 0) {
            this.projectState = savedData;
            if (!this.projectState.savedComponents) {
                this.projectState.savedComponents = [];
            }
        } else {
            // Default project structure
            this.projectState = {
                activePageId: 'index',
                pages: [{
                    id: 'index',
                    name: 'index',
                    content: '<!-- Start building your page here -->',
                    nextId: 1
                }],
                savedComponents: []
            };
        }
        this.activePageId = this.projectState.activePageId || this.projectState.pages[0].id;
    }
    
    saveState() {
        const { iframeController } = this.webBuilder;
        if (!iframeController.iframeDoc?.body || !this.projectState) return;
        
        const activePageIndex = this.projectState.pages.findIndex(p => p.id === this.activePageId);
        if (activePageIndex === -1) {
            console.error("Could not find active page to save:", this.activePageId);
            return;
        }
        
        const tempClone = iframeController.iframeDoc.body.cloneNode(true);
        
        // Clean up builder-specific volatile elements before saving
        tempClone.querySelectorAll('.resize-handle, .lock-handle, .drop-placeholder').forEach(h => h.remove());
        
        // Find the selected element in the clone and just remove the class.
        const selectedElInClone = tempClone.querySelector('.selected-element');
        if (selectedElInClone) {
            selectedElInClone.classList.remove('selected-element');
        }
        
        this.projectState.pages[activePageIndex].content = tempClone.innerHTML;
        this.projectState.pages[activePageIndex].nextId = this.nextId;
        this.projectState.activePageId = this.activePageId;
        
        localStorage.setItem(this.storageKey, JSON.stringify(this.projectState));
    }
    
    getActivePage() {
        return this.projectState.pages.find(p => p.id === this.activePageId);
    }
    
    // ========================================================
    //      FIXED: This function is now async and waits correctly
    // ========================================================
    async switchPage(pageId) {
        const { iframeController, uiManager } = this.webBuilder;
        
        // 1. Save the state of the current page before leaving.
        this.saveState();
        
        // 2. Switch the active page ID.
        this.activePageId = pageId;
        this.projectState.activePageId = pageId;
        
        // 3. Deselect any element in the UI.
        iframeController.deselectElement();
        
        // 4. Load the new page's content and AWAIT its completion.
        //    This uses the correct function `loadIframeContent`.
        await iframeController.loadIframeContent();
        
        // 5. Reset history for the new page, now that it's loaded.
        this.undoStack = [];
        this.redoStack = [];
        uiManager.updateHistoryButtons();
        
        // 6. Save state again to ensure the activePageId change is persisted.
        //    This is now safe because the iframe is fully loaded.
        this.saveState();
    }
    
    // --- Undo/Redo ---
    
    getPageState() {
        const { iframeController } = this.webBuilder;
        if (!iframeController.iframeDoc?.body) return null;
        return {
            content: iframeController.iframeDoc.body.innerHTML,
            nextId: this.nextId
        };
    }
    
    recordChange(force = false) {
        clearTimeout(this.historyDebounceTimeout);
        
        const task = () => {
            if (this.historyLock) return;
            const currentState = this.getPageState();
            if (!currentState) return;
            
            const lastStateContent = this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1].content : null;
            
            if (currentState.content !== lastStateContent) {
                this.undoStack.push(currentState);
                if (this.undoStack.length > this.MAX_HISTORY_STATES) {
                    this.undoStack.shift();
                }
                this.redoStack = [];
                this.webBuilder.uiManager.updateHistoryButtons();
            }
            this.saveState();
        };
        
        if (force) {
            task();
        } else {
            this.historyDebounceTimeout = setTimeout(task, 300);
        }
    }
    
    restorePageState(state) {
        const { iframeController } = this.webBuilder;
        if (!state || !iframeController.iframeDoc?.body) return;
        this.historyLock = true;
        
        iframeController.deselectElement();
        
        iframeController.iframeDoc.body.innerHTML = state.content;
        this.nextId = state.nextId;
        
        // Re-init content without recording history
        iframeController.reinitIframeContent(false);
        this.historyLock = false;
    }
    
    undo() {
        // We need more than one state to undo (the initial state + the one we are undoing)
        if (this.undoStack.length > 1) {
            const currentState = this.undoStack.pop();
            this.redoStack.push(currentState);
            
            const prevState = this.undoStack[this.undoStack.length - 1];
            this.restorePageState(prevState);
            this.webBuilder.uiManager.updateHistoryButtons();
        }
    }
    
    redo() {
        if (this.redoStack.length > 0) {
            const nextState = this.redoStack.pop();
            this.undoStack.push(nextState);
            
            this.restorePageState(nextState);
            this.webBuilder.uiManager.updateHistoryButtons();
        }
    }
    
    // --- Page Management (from Modal) ---
    async addNewPage(pageName, pageId) {
        const newPage = {
            id: pageId,
            name: pageName,
            content: '<!-- Start with a fresh new page! -->',
            nextId: 1
        };
        this.projectState.pages.push(newPage);
        // Use the new, corrected switchPage function
        await this.switchPage(pageId);
    }
    
    deletePage(pageId) {
        if (this.projectState.pages.length <= 1) {
            alert("You cannot delete the last page.");
            return false;
        }
        const pageToDelete = this.projectState.pages.find(p => p.id === pageId);
        if (confirm(`Are you sure you want to delete the page "${pageToDelete.name}"? This action cannot be undone.`)) {
            this.projectState.pages = this.projectState.pages.filter(p => p.id !== pageId);
            if (this.activePageId === pageId) {
                // switchPage is async now, but we don't need to wait for it here
                this.switchPage(this.projectState.pages[0].id);
            }
            this.saveState();
            return true;
        }
        return false;
    }
}

export default StateManager;