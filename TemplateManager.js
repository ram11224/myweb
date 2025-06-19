import homePages from '/js/templates/home-pages.js';
import headers from '/js/templates/headers.js';
import footers from '/js/templates/footers.js';
import contentPages from '/js/templates/content-pages.js';
import ctaSections from '/js/templates/cta-sections.js';


class TemplateManager {
    constructor(webBuilder) {
        this.webBuilder = webBuilder;
        this.dom = {
            templatesModal: document.getElementById('templatesModal'),
            templatesModalBody: document.getElementById('templatesModalBody'),
            closeTemplatesModal: document.getElementById('closeTemplatesModal'),
            templatesBtn: document.getElementById('templatesBtn'),
        };
    }

    init() {
        this.initTemplatesModal();
        this.bindEvents();
    }

    bindEvents() {
        this.dom.templatesBtn.addEventListener('click', () => this.dom.templatesModal.classList.add('show'));
        this.dom.closeTemplatesModal.addEventListener('click', () => this.dom.templatesModal.classList.remove('show'));
        this.dom.templatesModal.addEventListener('click', (e) => {
            if (e.target === this.dom.templatesModal) {
                this.dom.templatesModal.classList.remove('show');
            }
        });
    }

    getTemplates() {
        return {
            homePages,
            headers,
            footers,
            contentPages,
            ctaSections, 
        };
    }

    initTemplatesModal() {
        const templatesByCategory = this.getTemplates();
        const categoryMapping = { 
            homePages: "Home Pages", 
            headers: "Headers", 
            footers: "Footers", 
            contentPages: "Content Pages",
            ctaSections: "CTA Sections" 
        };
        this.dom.templatesModalBody.innerHTML = `
            <div class="modal-categories" id="modalCategories"></div>
            <div class="templates-container">
                <div class="templates-grid" id="templatesGrid"></div>
            </div>
        `;
        const categoriesContainer = this.dom.templatesModalBody.querySelector('#modalCategories');
        Object.keys(categoryMapping).forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'modal-category-btn';
            btn.textContent = categoryMapping[key];
            btn.dataset.categoryKey = key;
            btn.addEventListener('click', () => {
                this.dom.templatesModalBody.querySelectorAll('.modal-category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderTemplates(templatesByCategory[key]);
            });
            categoriesContainer.appendChild(btn);
        });
        const firstButton = categoriesContainer.querySelector('.modal-category-btn');
        if (firstButton) {
            firstButton.click();
        }
    }

    renderTemplates(templates) {
        const grid = this.dom.templatesModalBody.querySelector('#templatesGrid');
        grid.innerHTML = ''; // Clear previous templates
        
        templates.forEach(template => {
            const item = document.createElement('div');
            item.className = 'template-item';
            
            // Use iframe for live preview instead of static image
            item.innerHTML = `
                <div class="template-preview">
                    <iframe class="template-preview-iframe" loading="lazy" sandbox="allow-scripts" title="${template.name}"></iframe>
                    <div class="template-preview-overlay"></div>
                </div>
                <div class="template-info">
                    <h4>${template.name}</h4>
                    <button class="btn btn-primary btn-sm select-template-btn">Select</button>
                </div>
            `;
            
            item.querySelector('.select-template-btn').addEventListener('click', () => {
                this.applyTemplate(template);
            });
            
            // Load template content into the iframe
            const iframe = item.querySelector('.template-preview-iframe');
            
            // We use srcdoc for inline content injection which is cleaner than using the load event
            const basicStyles = `<style>body { margin: 0; font-family: sans-serif; color: #333; } * { box-sizing: border-box; } ::-webkit-scrollbar { display: none; }</style>`;
            const templateHtml = template.html.replace(/{{id}}/g, 'preview-id'); // Replace placeholder for preview
            iframe.srcdoc = `<html><head>${basicStyles}</head><body>${templateHtml}</body></html>`;

            // Append the fully constructed item to the grid
            grid.appendChild(item);
        });
    }

    applyTemplate(template) {
        const { stateManager, iframeController } = this.webBuilder;
        const activePage = stateManager.getActivePage();

        if (template.type === 'full') {
            if (!confirm(`Loading this template will replace the content of the current page ("${activePage.name}"). Are you sure?`)) {
                return;
            }
        }
        
        iframeController.deselectElement();

        // Process HTML and replace placeholders with actual unique IDs
        const processedHtml = template.html.replace(/{{id}}/g, () => stateManager.nextId++);

        if (template.type === 'full') {
            iframeController.iframeDoc.body.innerHTML = processedHtml;
        } else if (template.type === 'component') {
            const tempDiv = iframeController.iframeDoc.createElement('div');
            tempDiv.innerHTML = processedHtml;
            const elementToInsert = tempDiv.firstChild;
            if (template.name.toLowerCase().includes('header')) {
                iframeController.iframeDoc.body.prepend(elementToInsert);
            } else {
                iframeController.iframeDoc.body.appendChild(elementToInsert);
            }
        }
        
        iframeController.reinitIframeContent();
        this.dom.templatesModal.classList.remove('show');
        alert(`Template "${template.name}" loaded!`);
    }
}


export default TemplateManager;