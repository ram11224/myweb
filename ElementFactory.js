class ElementFactory {
    constructor(webBuilder) {
        this.webBuilder = webBuilder;
    }

    /**
     * Creates a new HTML element based on the provided type.
     * @param {string} type - The type of the element to create (e.g., 'heading', 'section').
     * @returns {HTMLElement} The newly created HTML element.
     */
    createElement(type) {
        const { iframeController, stateManager } = this.webBuilder;
        const id = () => stateManager.nextId++;
        const iframeDoc = iframeController.iframeDoc;
        let el;

        const baseClasses = 'builder-element';
        const defaultInputStyle = `width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size:14px;`;

        switch (type) {
            case 'h-container': el = iframeDoc.createElement('div'); Object.assign(el.style, { display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'flex-start', padding: '10px' }); break;
            case 'v-container': el = iframeDoc.createElement('div'); Object.assign(el.style, { display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px' }); break;
            case 'section': el = iframeDoc.createElement('div'); Object.assign(el.style, { padding: '40px 20px', minHeight: '100px' }); break;
            case 'header': el = iframeDoc.createElement('header'); Object.assign(el.style, { padding: '20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }); el.innerHTML = `<div class="builder-element" data-id="${id()}" data-type="v-container"><h3 class="builder-element" data-id="${id()}" data-type="heading" style="margin:0;">MyLogo</h3></div><nav class="builder-element" data-id="${id()}" data-type="h-container" style="display:flex; gap:15px; align-items:center;"><a href="#" class="builder-element" data-id="${id()}" data-type="link" style="text-decoration: none; color: #333;">Home</a><a href="#" class="builder-element" data-id="${id()}" data-type="link" style="text-decoration: none; color: #333;">About</a></nav>`; break;
            case 'footer': el = iframeDoc.createElement('footer'); Object.assign(el.style, { padding: '40px 20px', backgroundColor: '#2b3542', color: 'white', textAlign: 'center' }); el.innerHTML = `<p class="builder-element" data-id="${id()}" data-type="text">© ${new Date().getFullYear()} My Website. All Rights Reserved.</p>`; break;
            case 'grid': el = iframeDoc.createElement('div'); Object.assign(el.style, { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '10px' }); el.innerHTML = `<div class="builder-element" data-id="${id()}" data-type="v-container" style="padding:20px; text-align:center; min-height: 50px; border: 1px dashed #ccc;">Grid Cell 1</div><div class="builder-element" data-id="${id()}" data-type="v-container" style="padding:20px; text-align:center; min-height: 50px; border: 1px dashed #ccc;">Grid Cell 2</div>`; break;
            case 'columns': el = iframeDoc.createElement('div'); Object.assign(el.style, { display: 'flex', gap: '20px', padding: '10px' }); el.innerHTML = `<div class="builder-element" data-id="${id()}" data-type="v-container" style="flex:1; padding:20px; min-height: 50px; border: 1px dashed #ccc;">Column 1</div><div class="builder-element" data-id="${id()}" data-type="v-container" style="flex:1; padding:20px; min-height: 50px; border: 1px dashed #ccc;">Column 2</div>`; break;
            case 'divider': el = iframeDoc.createElement('hr'); break;
            case 'spacer': el = iframeDoc.createElement('div'); el.style.height = '50px'; break;
            case 'heading': el = iframeDoc.createElement('h2'); el.textContent = 'New Heading'; break;
            case 'text': el = iframeDoc.createElement('p'); el.textContent = 'This is sample text. Edit this content in the settings panel.'; el.style.lineHeight = '1.5'; break;
            case 'button': el = iframeDoc.createElement('a'); el.textContent = 'Click Me'; el.href = '#'; Object.assign(el.style, { display: 'inline-block', padding: '10px 20px', backgroundColor: 'rgba(109, 66, 245, 1)', color: 'white', textDecoration: 'none', borderRadius: '4px' }); break;
            case 'icon': el = iframeDoc.createElement('i'); el.className = 'fas fa-star'; Object.assign(el.style, { fontSize: '48px', color: 'rgba(109, 66, 245, 1)' }); break;
            case 'link': el = iframeDoc.createElement('a'); el.href = '#'; el.textContent = 'This is a link'; el.style.textDecoration = 'none'; break;
            case 'list-ul': el = iframeDoc.createElement('ul'); el.innerHTML = `<li class="builder-list-item">Item 1</li><li class="builder-list-item">Item 2</li>`; break;
            case 'list-ol': el = iframeDoc.createElement('ol'); el.innerHTML = `<li class="builder-list-item">First Item</li><li class="builder-list-item">Second Item</li>`; break;
            case 'alert': el = iframeDoc.createElement('div'); el.className = 'alert alert-info'; el.textContent = 'This is an alert.'; break;
            case 'badge': el = iframeDoc.createElement('span'); el.className = 'badge'; el.textContent = 'New!'; break;
            case 'quote': el = iframeDoc.createElement('blockquote'); el.innerHTML = `<p class="builder-element" data-id="${id()}" data-type="text">An inspiring quote.</p><footer style="margin-top: 10px; font-style: normal; font-size: 0.9em;">- Someone famous</footer>`; break;
            case 'table': el = iframeDoc.createElement('table'); el.innerHTML = `<thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Data 1</td><td>Data 2</td></tr><tr><td>Data 3</td><td>Data 4</td></tr></tbody>`; break;
            case 'image': el = iframeDoc.createElement('img'); el.src = 'https://via.placeholder.com/400x200?text=New+Image'; break;
            case 'video': el = iframeDoc.createElement('div'); el.innerHTML = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`; break;
            case 'audio': el = iframeDoc.createElement('audio'); el.controls = true; el.src = ''; el.innerHTML = `Your browser does not support the audio element.`; break;
            case 'gmap': el = iframeDoc.createElement('div'); el.innerHTML = `<iframe width="100%" height="300" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=Eiffel+Tower,Paris+France" allowfullscreen></iframe>`; break;
            case 'card': el = iframeDoc.createElement('div'); el.className = 'card'; el.innerHTML = `<img class="builder-element" data-id="${id()}" data-type="image" src="https://via.placeholder.com/300x150"><div class="builder-element" data-type="v-container" data-id="${id()}" style="padding:15px; display:flex; flex-direction:column; gap:10px;"><h4 class="builder-element" data-id="${id()}" data-type="heading">Card Title</h4><p class="builder-element" data-id="${id()}" data-type="text">Some quick example text to build on the card title and make up the bulk of the card's content.</p></div>`; break;
            case 'hero': el = iframeDoc.createElement('div'); Object.assign(el.style, { padding: '80px 20px', textAlign: 'center', backgroundColor: '#f8f9fa' }); el.innerHTML = `<h1 class="builder-element" data-id="${id()}" data-type="heading" style="font-size: 48px; margin-bottom: 20px;">Hero Title</h1><p class="builder-element" data-id="${id()}" data-type="text" style="font-size: 18px; color: #6c757d; max-width: 600px; margin: 0 auto 30px auto;">Hero subtitle text goes here. Describe your value proposition.</p><a href="#" class="builder-element" data-id="${id()}" data-type="button" style="display: inline-block; padding: 12px 28px; background-color: #6d42f5; color: white; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">Call to Action</a>`; break;
            case 'testimonial': el = iframeDoc.createElement('div'); el.className = 'testimonial'; el.innerHTML = `<img class="builder-element testimonial-image" data-id="${id()}" data-type="image" src="https://via.placeholder.com/80"><p class="builder-element testimonial-text" data-id="${id()}" data-type="text">"This is an amazing product! It changed my life."</p><p class="builder-element testimonial-author" data-id="${id()}" data-type="text">- Jane Doe, CEO</p>`; break;
            case 'pricing-table': el = iframeDoc.createElement('div'); el.className = 'pricing-table'; el.innerHTML = `<h3 class="builder-element" data-id="${id()}" data-type="heading">Basic Plan</h3><div class="price builder-element" data-id="${id()}" data-type="text">$19<span class="period">/mo</span></div><ul class="builder-element" data-id="${id()}" data-type="list-ul"><li class="builder-list-item">Feature One</li><li class="builder-list-item">Feature Two</li><li class="builder-list-item">Feature Three</li></ul><a href="#" class="builder-element" data-id="${id()}" data-type="button" style="display: inline-block; padding: 10px 20px; background-color: #6d42f5; color: white; text-decoration: none; border-radius: 4px; text-align: center;">Choose Plan</a>`; break;
            case 'team-member': el = iframeDoc.createElement('div'); el.className = 'team-member'; el.innerHTML = `<img class="builder-element team-member-image" data-id="${id()}" data-type="image" src="https://via.placeholder.com/150"><h4 class="builder-element team-member-name" data-id="${id()}" data-type="heading">John Smith</h4><p class="builder-element team-member-role" data-id="${id()}" data-type="text">Lead Developer</p>`; break;
            case 'html': el = iframeDoc.createElement('div'); el.innerHTML = '<!-- Your Custom HTML Code Here -->'; break;
            case 'accordion': el = iframeDoc.createElement('div'); el.innerHTML = `<details class="accordion-item builder-element" data-id="${id()}"><summary class="builder-element" data-id="${id()}">Accordion 1</summary><p class="builder-element" data-id="${id()}">Accordion content goes here.</p></details><details class="accordion-item builder-element" data-id="${id()}"><summary class="builder-element" data-id="${id()}">Accordion 2</summary><p class="builder-element" data-id="${id()}">More content here.</p></details>`; break;
            case 'tabs': el = iframeDoc.createElement('div'); el.className = 'tabs-container'; el.innerHTML = `<input type="radio" name="tabs-${id()}" id="tab1-${id()}" class="tab-input" checked><label for="tab1-${id()}" class="tab-label">Tab 1</label><div class="tab-content builder-element" data-id="${id()}"><p>Content for Tab 1</p></div><input type="radio" name="tabs-${id()}" id="tab2-${id()}" class="tab-input"><label for="tab2-${id()}" class="tab-label">Tab 2</label><div class="tab-content builder-element" data-id="${id()}"><p>Content for Tab 2</p></div>`; break;
            case 'slider': el = iframeDoc.createElement('div'); el.className = 'slider-container'; el.innerHTML = `<input type="radio" name="slider-${id()}" id="slide1" checked><input type="radio" name="slider-${id()}" id="slide2"><input type="radio" name="slider-${id()}" id="slide3"><div class="slider-wrapper"><div class="slide"><img src="https://via.placeholder.com/600x300/6d42f5/fff?text=Slide+1" alt="Slide 1"></div><div class="slide"><img src="https://via.placeholder.com/600x300/28a745/fff?text=Slide+2" alt="Slide 2"></div><div class="slide"><img src="https://via.placeholder.com/600x300/dc3545/fff?text=Slide+3" alt="Slide 3"></div></div><div class="slider-nav"><label for="slide1"></label><label for="slide2"></label><label for="slide3"></label></div>`; break;
            case 'progress-bar': el = iframeDoc.createElement('div'); el.className = 'progress-bar'; el.innerHTML = `<div class="progress-bar-inner" style="width: 75%;">75%</div>`; el.dataset.progress = '75'; break;
            case 'countdown': el = iframeDoc.createElement('div'); el.className = 'countdown-timer'; el.innerHTML = `<div class="countdown-block"><div class="countdown-number">15</div><div class="countdown-label">Days</div></div><div class="countdown-block"><div class="countdown-number">10</div><div class="countdown-label">Hours</div></div><div class="countdown-block"><div class="countdown-number">30</div><div class="countdown-label">Mins</div></div><div class="countdown-block"><div class="countdown-number">55</div><div class="countdown-label">Secs</div></div>`; break;
            case 'social-share': el = iframeDoc.createElement('div'); el.className = 'social-share'; el.innerHTML = `<a href="#"><i class="fab fa-facebook-f"></i></a><a href="#"><i class="fab fa-twitter"></i></a><a href="#"><i class="fab fa-linkedin-in"></i></a><a href="#"><i class="fab fa-pinterest-p"></i></a>`; break;
            case 'form': el = iframeDoc.createElement('form'); el.innerHTML = `<div class="builder-element" data-id="${id()}" data-type="v-container" style="display:flex; flex-direction:column; gap:15px;"><div class="builder-element" data-id="${id()}" data-type="v-container" style="display:flex; flex-direction:column; gap:5px;"><label>Name</label><input type="text" class="builder-element" data-id="${id()}" data-type="input" style="${defaultInputStyle}"></div><div class="builder-element" data-id="${id()}" data-type="v-container" style="display:flex; flex-direction:column; gap:5px;"><label>Email</label><input type="email" class="builder-element" data-id="${id()}" data-type="input" style="${defaultInputStyle}"></div><a href="#" class="builder-element" data-id="${id()}" data-type="button" style="display: inline-block; padding: 10px 20px; background-color: #6d42f5; color: white; text-decoration: none; border-radius: 4px; text-align: center; width: auto; align-self: flex-start;">Submit</a></div>`; break;
            case 'input': el = iframeDoc.createElement('input'); el.type = 'text'; el.placeholder = 'Input Field'; el.style.cssText = defaultInputStyle; break;
            case 'textarea': el = iframeDoc.createElement('textarea'); el.rows = 4; el.placeholder = 'Text Area'; el.style.cssText = defaultInputStyle; break;
            case 'select': el = iframeDoc.createElement('select'); el.style.cssText = defaultInputStyle; el.innerHTML = `<option>Option 1</option><option>Option 2</option><option>Option 3</option>`; break;
            case 'checkbox': el = iframeDoc.createElement('div'); const checkId = `check${id()}`; el.innerHTML = `<input type="checkbox" id="${checkId}" style="margin-right: 5px;"><label for="${checkId}">Checkbox Label</label>`; break;
            case 'radio': el = iframeDoc.createElement('div'); const radioName = `radio${id()}`; el.innerHTML = `<div><input type="radio" id="${radioName}-1" name="${radioName}" style="margin-right: 5px;" checked><label for="${radioName}-1">Option A</label></div><div><input type="radio" id="${radioName}-2" name="${radioName}" style="margin-right: 5px;"><label for="${radioName}-2">Option B</label></div>`; break;
            default: el = iframeDoc.createElement('div'); el.textContent = `New ${type}`; break;
        }

        // Apply base properties
        el.className = el.className ? `${el.className} ${baseClasses}` : baseClasses;
        el.dataset.id = id();
        el.dataset.type = type;
        
        // Ensure all child builder elements also get unique IDs
        this.assignNewIdsToChildren(el);

        return el;
    }

    /**
     * Recursively assigns new unique IDs to all child elements with the 'builder-element' class.
     * @param {HTMLElement} parentElement - The element whose children need new IDs.
     */
    assignNewIdsToChildren(parentElement) {
        const { stateManager } = this.webBuilder;
        parentElement.querySelectorAll('.builder-element').forEach(child => {
            if (!child.dataset.id) { // Only assign if it doesn't have one
                child.dataset.id = stateManager.nextId++;
            }
        });
    }
}

export default ElementFactory;