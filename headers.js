/*
 * js/templates/headers.js
 * Contains template data for Header components.
*/
const year = new Date().getFullYear();
const idPlaceholder = `{{id}}`;

const headers = [
    {
        name: 'Standard Header',
        type: 'component',
        preview: 'https://cdn.dribbble.com/userupload/4255190/file/original-27488c963282297870428d093dd15682.png?resize=1024x768',
        html: `<header class="builder-element" data-id="${idPlaceholder}" data-type="header" style="padding: 20px 40px; background-color: rgb(255, 255, 255); border-bottom: 1px solid rgb(224, 224, 224); display: flex; justify-content: space-between; align-items: center;"> <h3 class="builder-element" data-id="${idPlaceholder}" data-type="heading" style="color: #6d42f5; margin:0; font-size: 24px;">YourLogo</h3> <nav class="builder-element" data-id="${idPlaceholder}" data-type="h-container" style="display:flex; gap: 25px; align-items:center;"> <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="text-decoration: none; color: rgb(73, 80, 87);">Home</a> <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="text-decoration: none; color: rgb(73, 80, 87);">About</a> <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="text-decoration: none; color: rgb(73, 80, 87);">Contact</a> <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="button" style="display: inline-block; padding: 8px 18px; background-color: #6d42f5; color: white; text-decoration: none; border-radius: 5px;" data-hover-enabled="true" data-hover-bg-color="#5a34d4">Sign Up</a> </nav> </header>`
    },
    {
    name: 'Centered Navigation Header',
    type: 'component',
    preview: 'https://cdn.dribbble.com/userupload/4255194/file/original-d29c31f0669ddf826fb22c5b9f7294b2.png?resize=1024x768',
    html: `<header class="builder-element" data-id="\${idPlaceholder}" data-type="header" style="padding: 20px 60px; background-color: #f8f9fa; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #dee2e6;">
        <div class="builder-element" data-id="\${idPlaceholder}" data-type="h-container" style="flex: 1;">
            <h2 class="builder-element" data-id="\${idPlaceholder}" data-type="heading" style="color: #343a40; font-size: 22px; margin: 0;">MyBrand</h2>
        </div>
        <nav class="builder-element" data-id="\${idPlaceholder}" data-type="h-container" style="flex: 2; display: flex; justify-content: center; gap: 30px;">
            <a href="#" class="builder-element" data-id="\${idPlaceholder}" data-type="link" style="text-decoration: none; color: #495057;">Services</a>
            <a href="#" class="builder-element" data-id="\${idPlaceholder}" data-type="link" style="text-decoration: none; color: #495057;">Pricing</a>
            <a href="#" class="builder-element" data-id="\${idPlaceholder}" data-type="link" style="text-decoration: none; color: #495057;">Blog</a>
        </nav>
        <div class="builder-element" data-id="\${idPlaceholder}" data-type="h-container" style="flex: 1; display: flex; justify-content: flex-end;">
            <a href="#" class="builder-element" data-id="\${idPlaceholder}" data-type="button" style="padding: 8px 20px; background-color: #20c997; color: white; border-radius: 4px; text-decoration: none;" data-hover-enabled="true" data-hover-bg-color="#17b28d">Get Started</a>
        </div>
    </header>`
}

];

export default headers;