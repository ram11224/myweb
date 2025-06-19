/*
 * js/templates/home-pages.js
 * Contains template data for full Home Page layouts.
 */
const year = new Date().getFullYear();
const idPlaceholder = `{{id}}`;

const homePages = [
    // ... (आपके मौजूदा होम पेज टेम्पलेट्स यहाँ रहेंगे) ...
    
    // --- यहाँ से नया रॉयल ज्वेलरी टेम्पलेट शुरू होता है ---
    {
        name: 'Royal Jewellery Store',
        type: 'full',
        preview: 'https://cdn.dribbble.com/userupload/13019859/file/original-b184dd6f722a4666cf30084f8ed8ceb3.png?resize=1024x768',
        html: `<!-- Google Fonts: Great Vibes (for titles) & Cormorant Garamond (for text) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Great+Vibes&display=swap" rel="stylesheet">
<style>
    /* पूरे पेज पर डिफ़ॉल्ट रूप से फ़ॉन्ट्स लागू करें */
    body { font-family: 'Cormorant Garamond', serif !important; color: #1c1c1c; }
    .royal-title { font-family: 'Great Vibes', cursive !important; }

    /* मोबाइल मेनू के लिए स्टाइल */
    .mobile-nav-menu {
        position: fixed;
        top: 0;
        right: -100%; /* शुरू में छिपा हुआ */
        width: 80%;
        max-width: 320px;
        height: 100vh;
        background-color: #1a1a1a;
        box-shadow: -5px 0 15px rgba(0,0,0,0.2);
        transition: right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        z-index: 1001;
        display: flex;
        flex-direction: column;
        padding: 40px;
        gap: 25px;
    }
    .mobile-nav-menu.active {
        right: 0; /* सक्रिय होने पर दिखाई देगा */
    }
    .mobile-nav-menu a {
        color: white;
        text-decoration: none;
        font-size: 18px;
    }
    .mobile-nav-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s ease;
    }
    .mobile-nav-overlay.active {
        opacity: 1;
        pointer-events: auto;
    }

    @media (max-width: 768px) {
        .desktop-nav { display: none !important; }
        .mobile-hamburger { display: block !important; }
    }
</style>

<!-- HEADER with Mobile Functionality -->
<header class="builder-element" data-id="${idPlaceholder}" data-type="header" style="position: sticky; top: 0; z-index: 999; background-color: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-bottom: 1px solid #f0f0f0; padding: 20px 5%; display: flex; justify-content: space-between; align-items: center;">
    <div class="builder-element royal-title" data-id="${idPlaceholder}" data-type="text" style="font-size: 32px; color: #b58d3c;">Elysian Jewels</div>
    
    <!-- Desktop Navigation -->
    <nav class="builder-element desktop-nav" data-id="${idPlaceholder}" data-type="h-container" style="display: flex; gap: 40px; align-items: center;">
        <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="color: #333; font-weight: 600; text-decoration: none; font-size: 16px;">Collections</a>
        <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="color: #333; font-weight: 600; text-decoration: none; font-size: 16px;">Engagement</a>
        <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="color: #333; font-weight: 600; text-decoration: none; font-size: 16px;">Our Story</a>
    </nav>

    <div class="builder-element" data-id="${idPlaceholder}" data-type="h-container" style="display: flex; align-items: center; gap: 20px;">
        <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></a>
        <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></a>
        <!-- Hamburger Icon for Mobile -->
        <div id="hamburger-menu" class="builder-element mobile-hamburger" data-id="${idPlaceholder}" data-type="button" style="display:none; cursor:pointer;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></div>
    </div>
</header>

<!-- Mobile Navigation Menu -->
<div id="mobile-nav-container" class="mobile-nav-menu">
    <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link">Collections</a>
    <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link">Engagement</a>
    <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link">Our Story</a>
    <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link">Contact</a>
</div>
<!-- Overlay for mobile menu -->
<div id="mobile-nav-overlay-container" class="mobile-nav-overlay"></div>

<!-- HERO SECTION -->
<section class="builder-element" data-id="${idPlaceholder}" data-type="section" style="height: 90vh; display: flex; align-items: center; justify-content: center; background-image: url('https://images.unsplash.com/photo-1610480356555-5349e5d79907?q=80&w=1965'); background-size: cover; background-position: center; position: relative;">
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);"></div>
    <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="text-align: center; z-index: 1; color: white;">
        <h1 class="builder-element royal-title" data-id="${idPlaceholder}" data-type="heading" style="font-size: 82px; font-weight: 400; text-shadow: 2px 2px 10px rgba(0,0,0,0.5);">Timeless Elegance</h1>
        <p class="builder-element" data-id="${idPlaceholder}" data-type="text" style="font-size: 20px; max-width: 600px; margin: 0 auto 30px; line-height: 1.7;">Crafted with passion, designed for eternity. Discover pieces that tell your story.</p>
        <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="button" style="padding: 14px 40px; background-color: transparent; color: white; border: 1.5px solid white; text-decoration: none; border-radius: 30px; font-size: 16px; font-weight: 600; transition: all 0.3s;" data-hover-enabled="true" data-hover-bg-color="rgba(255,255,255,1)" data-hover-text-color="rgba(28,28,28,1)">Explore Collections</a>
    </div>
</section>

<!-- COLLECTION SECTION -->
<section class="builder-element" data-id="${idPlaceholder}" data-type="section" style="padding: 100px 5%; background-color: #fdfdfd;">
    <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="text-align:center; margin-bottom: 60px;">
        <h2 class="builder-element royal-title" data-id="${idPlaceholder}" data-type="heading" style="font-size: 48px; color: #b58d3c; margin-bottom: 10px;">Our Collections</h2>
        <p class="builder-element" data-id="${idPlaceholder}" data-type="text" style="max-width: 600px; margin: auto; font-size: 18px; color: #555;">Each piece is a masterpiece of art and craftsmanship.</p>
    </div>
    <div class="builder-element" data-id="${idPlaceholder}" data-type="grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; max-width: 1200px; margin: auto;">
        
        <!-- Collection Item 1 -->
        <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="overflow:hidden;">
            <div style="overflow: hidden; border-radius: 8px;"><img class="builder-element" data-id="${idPlaceholder}" data-type="image" src="https://images.unsplash.com/photo-1611591437134-477a3466186b?q=80&w=1964" style="width: 100%; height: 400px; object-fit: cover; transition: transform 0.4s ease;" data-hover-enabled="true" data-hover-animation="grow"></div>
            <h3 class="builder-element" data-id="${idPlaceholder}" data-type="heading" style="margin-top: 20px; font-size: 22px; font-weight: 600;">The Solitaire Ring</h3>
            <p class="builder-element" data-id="${idPlaceholder}" data-type="text" style="color: #b58d3c; font-weight: 700;">From $2,499</p>
        </div>
        <!-- Collection Item 2 -->
        <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="overflow:hidden;">
             <div style="overflow: hidden; border-radius: 8px;"><img class="builder-element" data-id="${idPlaceholder}" data-type="image" src="https://images.unsplash.com/photo-1599351432463-e39537f0c13e?q=80&w=1966" style="width: 100%; height: 400px; object-fit: cover; transition: transform 0.4s ease;" data-hover-enabled="true" data-hover-animation="grow"></div>
            <h3 class="builder-element" data-id="${idPlaceholder}" data-type="heading" style="margin-top: 20px; font-size: 22px; font-weight: 600;">Eternity Bands</h3>
            <p class="builder-element" data-id="${idPlaceholder}" data-type="text" style="color: #b58d3c; font-weight: 700;">From $1,899</p>
        </div>
        <!-- Collection Item 3 -->
        <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="overflow:hidden;">
             <div style="overflow: hidden; border-radius: 8px;"><img class="builder-element" data-id="${idPlaceholder}" data-type="image" src="https://images.unsplash.com/photo-1620656335391-b3848b788647?q=80&w=1974" style="width: 100%; height: 400px; object-fit: cover; transition: transform 0.4s ease;" data-hover-enabled="true" data-hover-animation="grow"></div>
            <h3 class="builder-element" data-id="${idPlaceholder}" data-type="heading" style="margin-top: 20px; font-size: 22px; font-weight: 600;">Diamond Pendants</h3>
            <p class="builder-element" data-id="${idPlaceholder}" data-type="text" style="color: #b58d3c; font-weight: 700;">From $999</p>
        </div>

    </div>
</section>

<!-- FOOTER -->
<footer class="builder-element" data-id="${idPlaceholder}" data-type="footer" style="padding: 60px 5%; background-color: #1c1c1c; color: #f0f0f0;">
    <div class="builder-element" data-id="${idPlaceholder}" data-type="grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; max-width: 1200px; margin: auto; padding-bottom: 50px;">
        <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container">
            <h4 class="builder-element royal-title" data-id="${idPlaceholder}" data-type="heading" style="font-size: 28px; color: #b58d3c;">Elysian Jewels</h4>
        </div>
        <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="gap: 15px;">
            <h4 class="builder-element" data-id="${idPlaceholder}" data-type="heading">Shop</h4>
            <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="text-decoration:none; color: #ccc;">Rings</a>
            <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="text-decoration:none; color: #ccc;">Necklaces</a>
            <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="text-decoration:none; color: #ccc;">Bracelets</a>
        </div>
        <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="gap: 15px;">
            <h4 class="builder-element" data-id="${idPlaceholder}" data-type="heading">About</h4>
            <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="text-decoration:none; color: #ccc;">Our Story</a>
            <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="text-decoration:none; color: #ccc;">Craftsmanship</a>
            <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="text-decoration:none; color: #ccc;">Contact</a>
        </div>
        <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="gap: 15px;">
            <h4 class="builder-element" data-id="${idPlaceholder}" data-type="heading">Newsletter</h4>
            <p class="builder-element" data-id="${idPlaceholder}" data-type="text" style="color: #ccc; font-size:14px; margin-bottom: 10px;">Sign up for exclusive offers.</p>
            <input type="email" placeholder="Your Email" style="width: 100%; padding: 8px 10px; border: 1px solid #555; background: #333; color: white; border-radius: 4px;">
        </div>
    </div>
    <div class="builder-element" data-id="${idPlaceholder}" data-type="text" style="text-align: center; margin-top: 50px; padding-top: 30px; border-top: 1px solid #444; color: #888;">© ${year} Elysian Jewels. All rights reserved.</div>
</footer>

<!-- JavaScript for Mobile Menu Functionality -->
<script>
    (function() {
        // यह सुनिश्चित करने के लिए कि यह कोड केवल एक बार चले, हम एक चेकर का उपयोग करते हैं
        if (document.body.dataset.navScriptLoaded === 'true') {
            return;
        }
        document.body.dataset.navScriptLoaded = 'true';

        // एलिमेंट्स का चयन करें
        const hamburgerBtn = document.getElementById('hamburger-menu');
        const mobileNav = document.getElementById('mobile-nav-container');
        const navOverlay = document.getElementById('mobile-nav-overlay-container');

        // अगर एलिमेंट्स मौजूद नहीं हैं, तो कुछ न करें (सुरक्षा जाँच)
        if (!hamburgerBtn || !mobileNav || !navOverlay) {
            return;
        }

        const toggleMenu = () => {
            mobileNav.classList.toggle('active');
            navOverlay.classList.toggle('active');
        };

        // हैमबर्गर बटन और ओवरले पर इवेंट्स लगाएँ
        hamburgerBtn.addEventListener('click', toggleMenu);
        navOverlay.addEventListener('click', toggleMenu);

    })();
</script>
`
    },
    // ... (आपके मौजूदा होम पेज टेम्पलेट्स के बाद इसे जोड़ें) ...
{
    name: 'Modern Real Estate',
    type: 'full',
    preview: 'https://cdn.dribbble.com/userupload/13019918/file/original-d16be944111ce3d0ab84f67cfef19a86.png?resize=1024x768',
    html: `<!-- Google Fonts: Inter -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
    body { font-family: 'Inter', sans-serif !important; }
    .mobile-nav-menu-re { position: fixed; top: 0; right: -100%; width: 80%; max-width: 320px; height: 100vh; background-color: #1a1a1a; box-shadow: -5px 0 15px rgba(0,0,0,0.2); transition: right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); z-index: 1001; display: flex; flex-direction: column; padding: 40px; gap: 25px; }
    .mobile-nav-menu-re.active { right: 0; }
    .mobile-nav-menu-re a { color: white; text-decoration: none; font-size: 18px; }
    .mobile-nav-overlay-re { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; opacity: 0; pointer-events: none; transition: opacity 0.4s ease; }
    .mobile-nav-overlay-re.active { opacity: 1; pointer-events: auto; }
    @media (max-width: 768px) { .desktop-nav-re { display: none !important; } .mobile-hamburger-re { display: flex !important; align-items: center; } }
</style>

<!-- HEADER -->
<header class="builder-element" data-id="${idPlaceholder}" data-type="header" style="position: sticky; top: 0; z-index: 999; background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-bottom: 1px solid #e5e7eb; padding: 15px 5%; display: flex; justify-content: space-between; align-items: center;">
    <div class="builder-element" data-id="${idPlaceholder}" data-type="text" style="font-size: 24px; font-weight: 700; color: #111827;">Urban Nest</div>
    <nav class="builder-element desktop-nav-re" data-id="${idPlaceholder}" data-type="h-container" style="display: flex; gap: 30px; align-items: center;">
        <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="color: #374151; font-weight: 500; text-decoration: none;">For Sale</a>
        <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="color: #374151; font-weight: 500; text-decoration: none;">For Rent</a>
        <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="color: #374151; font-weight: 500; text-decoration: none;">About Us</a>
        <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="color: #374151; font-weight: 500; text-decoration: none;">Contact</a>
    </nav>
    <div class="builder-element" data-id="${idPlaceholder}" data-type="h-container">
        <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="button" style="display: inline-block; padding: 10px 22px; background-color: #111827; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;" data-hover-enabled="true" data-hover-bg-color="#374151">Add Listing</a>
        <div id="hamburger-menu-re" class="builder-element mobile-hamburger-re" data-id="${idPlaceholder}" data-type="button" style="display:none; cursor:pointer; margin-left: 15px;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></div>
    </div>
</header>
<div id="mobile-nav-container-re" class="mobile-nav-menu-re">
    <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link">For Sale</a>
    <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link">For Rent</a>
    <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link">About Us</a>
    <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link">Contact</a>
</div>
<div id="mobile-nav-overlay-re" class="mobile-nav-overlay-re"></div>

<!-- HERO SECTION -->
<section class="builder-element" data-id="${idPlaceholder}" data-type="section" style="padding: 60px 5%; background-color: #f9fafb;">
    <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="text-align: center;">
        <h1 class="builder-element" data-id="${idPlaceholder}" data-type="heading" style="font-size: 52px; font-weight: 700; color: #111827; margin-bottom: 20px; line-height: 1.2;">Find Your Dream Home</h1>
        <p class="builder-element" data-id="${idPlaceholder}" data-type="text" style="font-size: 18px; color: #4b5563; max-width: 650px; margin: auto;">We provide a complete service for the sale, purchase or rental of real estate.</p>
        <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="max-width: 800px; margin: 40px auto 0; background: white; padding: 15px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
            <div class="builder-element" data-id="${idPlaceholder}" data-type="h-container" style="display:flex; padding: 10px; gap: 10px; flex-wrap: wrap;">
                <input type="text" placeholder="Enter an address, city, or ZIP code" style="flex-grow:1; border:none; padding:15px; font-size: 16px; outline: none;">
                <select style="border:none; background: #f9fafb; padding:15px; font-size: 16px; border-radius: 8px;">
                    <option>For Sale</option><option>For Rent</option>
                </select>
                <button class="builder-element" data-id="${idPlaceholder}" data-type="button" style="display: inline-flex; align-items:center; gap: 8px; padding: 15px 30px; background-color: #111827; color: white; border-radius: 8px; border:none; cursor:pointer;" data-hover-enabled="true" data-hover-bg-color="#374151">Search
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
            </div>
        </div>
    </div>
</section>

<!-- FEATURED PROPERTIES -->
<section class="builder-element" data-id="${idPlaceholder}" data-type="section" style="padding: 100px 5%;">
    <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="text-align:center; margin-bottom: 60px;">
        <h2 class="builder-element" data-id="${idPlaceholder}" data-type="heading" style="font-size: 36px; font-weight: 700; color: #111827;">Featured Properties</h2>
    </div>
    <div class="builder-element" data-id="${idPlaceholder}" data-type="grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; max-width: 1200px; margin: auto;">
        <!-- Property Card 1 -->
        <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="background: white; border-radius: 12px; box-shadow: 0 4px 25px rgba(0,0,0,0.05); overflow:hidden;" data-animation-name="fadeInUp">
            <div style="position:relative;">
                <img class="builder-element" data-id="${idPlaceholder}" data-type="image" src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070" style="width: 100%; height: 250px; object-fit: cover;">
                <div style="position:absolute; top: 15px; left: 15px; background: rgba(17,24,39,0.8); color: white; padding: 5px 12px; font-size: 14px; border-radius: 6px;">For Sale</div>
            </div>
            <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="padding: 25px;">
                <h3 class="builder-element" data-id="${idPlaceholder}" data-type="heading" style="font-size: 20px; font-weight: 600; margin: 0 0 10px 0;">Modern Villa in a Quiet Suburb</h3>
                <p class="builder-element" data-id="${idPlaceholder}" data-type="text" style="color: #6b7280; margin-bottom: 20px;">Los Angeles, CA</p>
                <div class="builder-element" data-id="${idPlaceholder}" data-type="h-container" style="display:flex; gap: 20px; font-size: 14px; color: #4b5563; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
                    <span>4 Beds</span><span>3 Baths</span><span>2,500 sqft</span>
                </div>
                <div class="builder-element" data-id="${idPlaceholder}" data-type="h-container" style="display:flex; align-items:center; justify-content:space-between; padding-top:20px;">
                    <p class="builder-element" data-id="${idPlaceholder}" data-type="text" style="font-weight: 700; font-size: 22px; color: #111827;">$1,200,000</p>
                    <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="button" style="padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; text-decoration: none; color: #374151;">Details</a>
                </div>
            </div>
        </div>
        <!-- ... More property cards can be added here following the same structure ... -->
    </div>
</section>

<script>
    (function() {
        if (document.body.dataset.navScriptLoadedRE === 'true') return;
        document.body.dataset.navScriptLoadedRE = 'true';
        const hamburgerBtn = document.getElementById('hamburger-menu-re');
        const mobileNav = document.getElementById('mobile-nav-container-re');
        const navOverlay = document.getElementById('mobile-nav-overlay-re');
        if (!hamburgerBtn || !mobileNav || !navOverlay) return;
        const toggleMenu = () => { mobileNav.classList.toggle('active'); navOverlay.classList.toggle('active'); };
        hamburgerBtn.addEventListener('click', toggleMenu);
        navOverlay.addEventListener('click', toggleMenu);
    })();
</script>
`
},
// ... (आपके मौजूदा होम पेज टेम्पलेट्स के बाद इसे जोड़ें) ...
{
    name: 'Modern Gym/Fitness',
    type: 'full',
    preview: 'https://cdn.dribbble.com/userupload/13019946/file/original-b1836f3efdcd7cc29e8edc0b5f1cdb6d.png?resize=1024x768',
    html: `<!-- Google Fonts: Oswald (for titles) & Roboto (for text) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
<style>
    body { font-family: 'Roboto', sans-serif !important; background-color: #000; color: #fff; }
    .title-font { font-family: 'Oswald', sans-serif !important; text-transform: uppercase; }
    .highlight-text { color: #facc15; }
    .mobile-nav-menu-ft { position: fixed; top: 0; right: -100%; width: 80%; max-width: 320px; height: 100vh; background-color: #111; box-shadow: -5px 0 15px rgba(0,0,0,0.5); transition: right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); z-index: 1001; display: flex; flex-direction: column; padding: 40px; gap: 25px; }
    .mobile-nav-menu-ft.active { right: 0; }
    .mobile-nav-menu-ft a { color: white; text-decoration: none; font-size: 18px; font-family: 'Oswald'; }
    .mobile-nav-overlay-ft { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; opacity: 0; pointer-events: none; transition: opacity 0.4s ease; }
    .mobile-nav-overlay-ft.active { opacity: 1; pointer-events: auto; }
    @media (max-width: 768px) { .desktop-nav-ft { display: none !important; } .mobile-hamburger-ft { display: flex !important; align-items: center; } }
</style>

<!-- HEADER -->
<header class="builder-element" data-id="${idPlaceholder}" data-type="header" style="position: sticky; top: 0; z-index: 999; background-color: rgba(0,0,0, 0.8); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-bottom: 1px solid #222; padding: 15px 5%; display: flex; justify-content: space-between; align-items: center;">
    <div class="builder-element title-font" data-id="${idPlaceholder}" data-type="text" style="font-size: 26px; font-weight: 700;">IRON <span class="highlight-text">DEN</span></div>
    <nav class="builder-element desktop-nav-ft" data-id="${idPlaceholder}" data-type="h-container" style="display: flex; gap: 30px; align-items: center;">
        <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="color: #fff; text-decoration: none;">Classes</a>
        <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="color: #fff; text-decoration: none;">Coaches</a>
        <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link" style="color: #fff; text-decoration: none;">Pricing</a>
    </nav>
    <div class="builder-element" data-id="${idPlaceholder}" data-type="h-container">
        <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="button" style="display: inline-block; padding: 10px 22px; background-color: #facc15; color: black; text-decoration: none; border-radius: 6px; font-weight: 700;" data-hover-enabled="true" data-hover-bg-color="#eab308">Join Now</a>
        <div id="hamburger-menu-ft" class="builder-element mobile-hamburger-ft" data-id="${idPlaceholder}" data-type="button" style="display:none; cursor:pointer; margin-left: 15px;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></div>
    </div>
</header>
<div id="mobile-nav-container-ft" class="mobile-nav-menu-ft">
    <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link">Classes</a>
    <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link">Coaches</a>
    <a href="#" class="builder-element" data-id="${idPlaceholder}" data-type="link">Pricing</a>
</div>
<div id="mobile-nav-overlay-ft" class="mobile-nav-overlay-ft"></div>

<!-- HERO SECTION -->
<section class="builder-element" data-id="${idPlaceholder}" data-type="section" style="height: 95vh; display: flex; align-items: center; justify-content: flex-start; text-align: left; background-image: url('https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1974'); background-size: cover; background-position: center; position: relative; padding: 0 5%;">
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to right, rgba(0,0,0,0.9) 20%, transparent 80%);"></div>
    <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="z-index: 1; color: white; max-width: 600px;">
        <h1 class="builder-element title-font" data-id="${idPlaceholder}" data-type="heading" style="font-size: 72px; line-height: 1.1;">Forge Your <span class="highlight-text">Strength</span></h1>
        <p class="builder-element" data-id="${idPlaceholder}" data-type="text" style="font-size: 18px; margin: 20px 0 30px; line-height: 1.7;">Where commitment meets results. State-of-the-art equipment, expert trainers, and a community that motivates you.</p>
        <a href="#" class="builder-element title-font" data-id="${idPlaceholder}" data-type="button" style="display: inline-flex; align-items:center; gap: 8px; padding: 14px 30px; background-color: #facc15; color: #000; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 700;" data-hover-enabled="true" data-hover-bg-color="#eab308">START YOUR JOURNEY
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
    </div>
</section>

<!-- WHY CHOOSE US SECTION -->
<section class="builder-element" data-id="${idPlaceholder}" data-type="section" style="padding: 100px 5%; background-color: #111;">
    <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="text-align:center; margin-bottom: 60px;">
        <h2 class="builder-element title-font" data-id="${idPlaceholder}" data-type="heading" style="font-size: 42px; letter-spacing: 1px;">WHY <span class="highlight-text">CHOOSE US?</span></h2>
    </div>
    <div class="builder-element" data-id="${idPlaceholder}" data-type="grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; max-width: 1200px; margin: auto;">
        
        <!-- Feature 1 -->
        <div class="builder-element" data-id="${idPlaceholder}" data-type="v-container" style="text-align:center; background: #1f1f1f; padding: 40px; border-radius: 12px; border: 1px solid #333;">
            <div style="background-color: #facc15; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>
            </div>
            <h3 class="builder-element title-font" data-id="${idPlaceholder}" data-type="heading" style="font-size: 22px; margin-bottom: 10px;">EXPERT COACHES</h3>
            <p class="builder-element" data-id="${idPlaceholder}" data-type="text" style="color: #aaa; line-height: 1.6;">Our certified trainers are here to guide you at every step.</p>
        </div>
        <!-- ... More features can be added here ... -->

    </div>
</section>

<script>
    (function() {
        if (document.body.dataset.navScriptLoadedFT === 'true') return;
        document.body.dataset.navScriptLoadedFT = 'true';
        const hamburgerBtn = document.getElementById('hamburger-menu-ft');
        const mobileNav = document.getElementById('mobile-nav-container-ft');
        const navOverlay = document.getElementById('mobile-nav-overlay-ft');
        if (!hamburgerBtn || !mobileNav || !navOverlay) return;
        const toggleMenu = () => { mobileNav.classList.toggle('active'); navOverlay.classList.toggle('active'); };
        hamburgerBtn.addEventListener('click', toggleMenu);
        navOverlay.addEventListener('click', toggleMenu);
    })();
</script>
`
},
    // --- यहाँ रॉयल ज्वेलरी टेम्पलेट समाप्त होता है ---
];

export default homePages;