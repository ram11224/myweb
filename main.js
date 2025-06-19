import StateManager from './managers/StateManager.js';
import IframeController from './managers/IframeController.js';
import UIManager from './managers/UIManager.js';
import TemplateManager from './managers/TemplateManager.js';
import ElementFactory from './factory/ElementFactory.js';
import SettingsPanel from './components/SettingsPanel.js';

class WebBuilder {
  constructor() {
    this.loader = null;
    this.init();
  }
  
  async init() {
    await this.loadLoader();
    console.log("Initializing Web Builder...");
    
    // Instantiate components and managers
    this.stateManager = new StateManager(this);
    this.elementFactory = new ElementFactory(this);
    this.settingsPanel = new SettingsPanel(this);
    this.iframeController = new IframeController(this);
    this.uiManager = new UIManager(this);
    this.templateManager = new TemplateManager(this);
    
    // Initialize them in the correct order
    this.stateManager.init();
    this.settingsPanel.init();
    this.uiManager.init();
    this.templateManager.init();
    
    // iframe को लोड होने तक इंतज़ार करें
    console.log("Loading iframe content...");
    await this.iframeController.loadIframeContent();
    console.log("Iframe content loaded and ready.");
    
    console.log("Web Builder Initialized.");
    
    // iframe तैयार होने के बाद लोडर को छिपाएं
    setTimeout(() => {
      if (this.loader) {
        this.loader.classList.add('hidden');
      }
    }, 500);
  }
  
  async loadLoader() {
    try {
      const response = await fetch('/loading.html');
      if (!response.ok) throw new Error('Loader HTML not found');
      const loaderHtml = await response.text();
      document.body.insertAdjacentHTML('afterbegin', loaderHtml);
      this.loader = document.getElementById('appLoader');
    } catch (error) {
      console.error('Failed to load the loader:', error);
      // Create a fallback loader in case fetch fails
      document.body.insertAdjacentHTML('afterbegin', '<div id="appLoader" style="display:none;"></div>');
      this.loader = document.getElementById('appLoader');
    }
  }
}

// Start the application once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new WebBuilder();
});