/*
 * js/templates/cta-sections.js
 * Contains template data for CTA (Call to Action) components.
*/
const idPlaceholder = `{{id}}`;

const ctaSections = [
    {
        name: 'Simple CTA Banner',
        type: 'component',
        preview: 'https://cdn.dribbble.com/userupload/6182101/file/original-b4723c28a368a356391497259048b64e.png?resize=1024x768',
        html: `<div class="builder-element" data-id="${idPlaceholder}" data-type="section" style="padding: 60px 20px; text-align: center; background-color: #f8f9fa; border-radius: 8px;">
            <h2 class="builder-element" data-id="${idPlaceholder}" data-type="heading" style="font-size: 32px; margin-bottom: 20px;">Ready to Dive In?</h2>
            <p class="builder-element" data-id="${idPlaceholder}" data-type="text" style="font-size: 18px; color: #6c757d; max-width: 600px; margin: 0 auto 30px auto;">Start your free trial today. No credit card required.</p>
            <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="button" style="display: inline-block; padding: 12px 28px; background-color: #6d42f5; color: white; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">Get Started Now</a>
        </div>`
    },
    {
        name: 'CTA with Image',
        type: 'component',
        preview: 'https://cdn.dribbble.com/userupload/3990473/file/original-0994f18ba0401b3a1a5118c644c9b3a7.png?resize=1024x768',
        html: `<div class="builder-element" data-id="${idPlaceholder}" data-type="section" style="padding: 40px; background-color: white;">
            <div class="builder-element" data-id="${idPlaceholder}" data-type="grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; max-w: 1100px; margin: auto;">
                <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container">
                    <h2 class="builder-element" data-id="${idPlaceholder}" data-type="heading" style="font-size: 36px; line-height: 1.3;">Take Your Project to the Next Level</h2>
                    <p class="builder-element" data-id="${idPlaceholder}" data-type="text" style="color: #6c757d; font-size: 16px; margin-top: 15px;">Unlock powerful features and integrations. See how our platform can transform your workflow.</p>
                    <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="button" style="display: inline-block; padding: 12px 28px; background-color: #0d6efd; color: white; text-decoration: none; border-radius: 4px; margin-top: 25px;">Request a Demo</a>
                </div>
                <img class="builder-element" data-id="${idPlaceholder}" data-type="image" src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1974" style="width: 100%; height: auto; border-radius: 8px;">
            </div>
        </div>`
    },
];

export default ctaSections;