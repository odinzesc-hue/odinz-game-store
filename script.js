/* script.js - ODINZGAMES PRO VERSION */
const apiKey = '32b3e42957bc4705aef4316b8cc8179c'; 

// 1. Manual Price Mapping
const STEAM_PRICES = {
    "Grand Theft Auto V": 599, "The Witcher 3: Wild Hunt": 399, "Cyberpunk 2077": 1799,
    "Elden Ring": 1990, "Red Dead Redemption 2": 1599, "God of War": 1290,
    "Resident Evil 4": 1929, "Resident Evil 2": 899, "Resident Evil Village": 1299,
    "Stardew Valley": 315, "Hollow Knight": 315, "Terraria": 219, "Baldur's Gate III": 1290, "Assassin's Creed Shadows": 1890
};

function getPrice(gameName, rating) {
    if (STEAM_PRICES[gameName]) return STEAM_PRICES[gameName];
    if (rating > 4.5) return 1890;
    if (rating > 4.0) return 1290;
    return 590;
}

// 2. Cart System
let cart = JSON.parse(localStorage.getItem('cart')) || [];
function addToCart(id, title, price, image) {
    if (cart.find(item => item.id === id)) { 
        return false; 
    }
    cart.push({ id, title, price, image });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    return true; 
}

function buyNow(id, title, price, image) {
    addToCart(id, title, price, image); 
    openCheckout(); 
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI(); renderCartModal();
}
function updateCartUI() { document.getElementById('cart-count').innerText = cart.length; }

// 3. Wishlist System
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
function toggleWishlist(id) {
    const btn = event.currentTarget;
    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(itemId => itemId !== id);
        btn.classList.remove('active');
        btn.innerHTML = '<i class="far fa-heart"></i>'; 
    } else {
        wishlist.push(id);
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-heart"></i>'; 
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// 4. Checkout System
function openCheckout() {
    toggleCart(); 
    document.getElementById('checkout-modal').style.display = 'flex';
}
function closeCheckout() {
    document.getElementById('checkout-modal').style.display = 'none';
    document.getElementById('checkout-form').style.display = 'block';
    document.getElementById('checkout-loading').style.display = 'none';
    document.getElementById('checkout-success').style.display = 'none';
}
function processPayment(e) {
    e.preventDefault();
    document.getElementById('checkout-form').style.display = 'none';
    document.getElementById('checkout-loading').style.display = 'block';

    setTimeout(() => {
        document.getElementById('checkout-loading').style.display = 'none';
        document.getElementById('checkout-success').style.display = 'block';
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }, 2000);
}

// 5. Home Page Logic
let currentPage = 1;
let currentSearch = '';
let currentGenre = '';

async function initHome() {
    const genres = [
        {name: 'Action', slug: 'action'}, {name: 'RPG', slug: 'role-playing-games-rpg'},
        {name: 'Shooter', slug: 'shooter'}, {name: 'Adventure', slug: 'adventure'},
        {name: 'Indie', slug: 'indie'}, {name: 'Sports', slug: 'sports'},
        {name: 'Racing', slug: 'racing'}, {name: 'Strategy', slug: 'strategy'}
    ];
    const genreBar = document.getElementById('genre-bar');
    genres.forEach(g => {
        genreBar.innerHTML += `<div class="genre-pill" onclick="filterGenre('${g.slug}', this)">${g.name}</div>`;
    });

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery) {
        currentSearch = searchQuery;
        document.getElementById('hero-slider').style.display = 'none';
        document.getElementById('section-title').innerText = `ผลการค้นหา: "${searchQuery}"`;
        document.getElementById('search-input').value = searchQuery;
        await loadGames(1, searchQuery);
    } else {
        await loadSlider();
        await loadGames(1);
    }

    document.getElementById('load-more-btn').addEventListener('click', () => {
        currentPage++;
        loadGames(currentPage, currentSearch, currentGenre);
    });
}

function filterGenre(slug, btn) {
    document.querySelectorAll('.genre-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentGenre = slug;
    currentSearch = ''; 
    currentPage = 1;
    document.getElementById('search-input').value = '';
    document.getElementById('section-title').innerText = `หมวดหมู่: ${btn.innerText}`;
    loadGames(1, '', slug);
}

function showSkeleton(count) {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = '';
    for(let i=0; i<count; i++) {
        grid.innerHTML += `
            <div class="skeleton skeleton-card">
                <div class="skeleton-img"></div>
                <div class="skeleton-text" style="width:70%"></div>
                <div class="skeleton-text" style="width:40%"></div>
                <div class="skeleton-btn"></div>
            </div>`;
    }
}

async function loadSlider() {
    try {
        const res = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&dates=2024-01-01,2025-12-31&ordering=-rating&page_size=5`);
        const data = await res.json();
        const container = document.getElementById('hero-slider');
        container.innerHTML = '';
        data.results.forEach((game, index) => {
            container.innerHTML += `
                <div class="slide ${index===0?'active':''}" style="background-image: url('${game.background_image}')">
                    <div class="slide-content">
                        <h2 class="slide-title">${game.name}</h2>
                        <div style="color:var(--primary-blue); font-size:1.5rem; font-weight:bold;">฿${getPrice(game.name, game.rating)}</div>
                        <a href="detail.html?id=${game.id}" style="display:inline-block; margin-top:10px; background:white; color:black; padding:8px 20px; border-radius:5px; font-weight:bold;">ดูรายละเอียด</a>
                    </div>
                </div>`;
        });
        let current = 0;
        const slides = document.querySelectorAll('.slide');
        if(slides.length) setInterval(() => {
            slides[current].classList.remove('active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('active');
        }, 4000);
    } catch(e) { console.log(e); }
}

async function loadGames(page, search='', genre='') {
    const grid = document.getElementById('game-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if(page === 1) showSkeleton(8); 
    loadMoreBtn.style.display = 'none';

    let url = `https://api.rawg.io/api/games?key=${apiKey}&page_size=20&page=${page}`;
    if(search) url += `&search=${search}`;
    else if(genre) url += `&genres=${genre}`;
    else url += `&dates=2023-01-01,2025-12-31&ordering=-added`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if(page === 1) grid.innerHTML = ''; 
        
        if(!data.results || data.results.length === 0) {
            grid.innerHTML = '<p style="color:#888; grid-column:1/-1; text-align:center; padding:20px;">ไม่พบเกม</p>';
            return;
        }

        data.results.forEach(game => {
            const price = getPrice(game.name, game.rating);
            const isWish = wishlist.includes(game.id) ? 'active' : '';
            const heartIcon = isWish ? 'fas' : 'far';

            grid.innerHTML += `
                <div class="game-card">
                    <button class="wishlist-btn ${isWish}" onclick="toggleWishlist(${game.id})">
                        <i class="${heartIcon} fa-heart"></i>
                    </button>
                    <a href="detail.html?id=${game.id}"><img src="${game.background_image || 'https://via.placeholder.com/300x200?text=No+Image'}"></a>
                    <div class="card-body">
                        <h3 class="game-title">${game.name}</h3>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:var(--primary-blue); font-weight:bold;">฿${price}</span>
                            <span style="font-size:0.8rem; color:gold;"><i class="fas fa-star"></i> ${game.rating}</span>
                        </div>
                        <div class="action-buttons">
                            <button class="btn-cart" onclick="addToCart(${game.id}, '${game.name.replace(/'/g, "\\'")}', ${price}, '${game.background_image}'); this.innerHTML='<i class=\\'fas fa-check\\'></i>';">
                                <i class="fas fa-cart-plus"></i> ใส่ตะกร้า
                            </button>
                            <button class="btn-buy" onclick="buyNow(${game.id}, '${game.name.replace(/'/g, "\\'")}', ${price}, '${game.background_image}')">
                                ซื้อเลย
                            </button>
                        </div>
                    </div>
                </div>`;
        });

        if(data.next) loadMoreBtn.style.display = 'inline-block';

    } catch(err) { console.error(err); }
}

async function initDetail() {
    const id = new URLSearchParams(window.location.search).get('id');
    if(!id) return;
    try {
        const [gameRes, screenRes] = await Promise.all([
            fetch(`https://api.rawg.io/api/games/${id}?key=${apiKey}`),
            fetch(`https://api.rawg.io/api/games/${id}/screenshots?key=${apiKey}`)
        ]);
        const game = await gameRes.json();
        const screens = await screenRes.json();
        const price = getPrice(game.name, game.rating);

        document.getElementById('detail-title').innerText = game.name;
        document.getElementById('detail-price').innerText = `฿${price}`;
        document.getElementById('main-img').src = game.background_image;
        document.getElementById('desc-box').innerHTML = game.description || "ไม่มีรายละเอียด";
        
        const gallery = document.getElementById('sub-gallery');
        if(screens.results) screens.results.slice(0,4).forEach(s => {
            gallery.innerHTML += `<img src="${s.image}" onclick="document.getElementById('main-img').src='${s.image}'">`;
        });

        const feat = document.getElementById('feature-list');
        if(game.parent_platforms) game.parent_platforms.forEach(p => {
            let icon = p.platform.slug==='pc'?'fa-windows':(p.platform.slug==='playstation'?'fa-playstation':'fa-gamepad');
            feat.innerHTML += `<div class="feature-item"><i class="fab ${icon}"></i> ${p.platform.name}</div>`;
        });
        feat.innerHTML += `<div class="feature-item"><i class="fas fa-user"></i> Single Player</div>`;

        const btnContainer = document.getElementById('detail-actions');
        btnContainer.innerHTML = `
             <button class="btn-cart" style="padding:15px; font-size:1.1rem;" onclick="addToCart(${game.id}, '${game.name.replace(/'/g, "\\'")}', ${price}, '${game.background_image}'); this.innerHTML='<i class=\\'fas fa-check\\'></i> เพิ่มแล้ว';">
                <i class="fas fa-cart-plus"></i> ใส่ตะกร้า
            </button>
            <button class="btn-buy" style="padding:15px; font-size:1.1rem;" onclick="buyNow(${game.id}, '${game.name.replace(/'/g, "\\'")}', ${price}, '${game.background_image}')">
                ซื้อเลย
            </button>
        `;

        const sys = document.getElementById('sys-req');
        const pc = game.platforms.find(p => p.platform.slug === 'pc');
        sys.innerHTML = pc && pc.requirements && pc.requirements.minimum ? pc.requirements.minimum : "<p>ไม่ระบุสเปคขั้นต่ำ</p>";

    } catch(e) { console.error(e); }
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
    if (modal.style.display === 'flex') renderCartModal();
}
function renderCartModal() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    container.innerHTML = '';
    let total = 0;
    if (cart.length === 0) container.innerHTML = '<p style="text-align:center; color:#888;">ตะกร้าว่างเปล่า</p>';
    else {
        cart.forEach(item => {
            total += item.price;
            container.innerHTML += `
                <div class="cart-item">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">
                        <div><div style="font-weight:bold;">${item.title}</div><div style="color:var(--primary-blue);">฿${item.price}</div></div>
                    </div>
                    <button onclick="removeFromCart(${item.id})" style="color:red; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </div>`;
        });
    }
    totalEl.innerText = `฿${total.toLocaleString()}`;
}
function handleSearch(e) {
    if (e.key === 'Enter') {
        const query = e.target.value;
        if (query) window.location.href = `index.html?search=${query}`;
    }
}
function toggleReadMore() {
    const box = document.getElementById('desc-box');
    const btn = document.getElementById('read-more-btn');
    box.classList.toggle('expanded');
    btn.innerText = box.classList.contains('expanded') ? "ย่อข้อมูล <" : "อ่านเพิ่มเติม >";
}

window.onload = () => {
    updateCartUI();
    const searchInput = document.getElementById('search-input');
    if(searchInput) searchInput.addEventListener('keypress', handleSearch);

    if(document.getElementById('hero-slider')) initHome();
    if(document.getElementById('detail-title')) initDetail();
};