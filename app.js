document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initMobileMenu();
  initLoginModal();
  initSearch();
  initCart();
});

/* =============================
   Utilidades
============================= */
function initYear() {
  document.getElementById("year").textContent = new Date().getFullYear();
}

/* =============================
   Mobile Menu
============================= */
function initMobileMenu() {
  const btnMobile = document.getElementById("btn-mobile-menu");
  const mobileNav = document.getElementById("mobile-nav");
  const btnMobileClose = document.getElementById("btn-mobile-close");

  if (!btnMobile || !mobileNav) return;

  btnMobile.addEventListener("click", () => {
    mobileNav.classList.add("is-open");
    mobileNav.setAttribute("aria-hidden", "false");
  });

  btnMobileClose?.addEventListener("click", () => {
    mobileNav.classList.remove("is-open");
    mobileNav.setAttribute("aria-hidden", "true");
  });
}

/* =============================
   Login Modal
============================= */
function initLoginModal() {
  const userIcon = document.getElementById("user-icon");
  const loginModal = document.getElementById("login-modal");
  const closeModal = document.getElementById("close-modal");

  if (!userIcon || !loginModal) return;

  userIcon.addEventListener("click", () => loginModal.classList.add("active"));
  closeModal?.addEventListener("click", () => loginModal.classList.remove("active"));
  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) loginModal.classList.remove("active");
  });
}

/* =============================
   Busca
============================= */
function initSearch() {
  const btnSearch = document.getElementById("btn-search");
  const searchWrapper = btnSearch?.closest(".search-wrapper");
  const searchInput = document.getElementById("search-input");
  const searchGo = document.getElementById("search-go");
  const suggestions = document.getElementById("search-suggestions");

  if (!btnSearch || !searchWrapper) return;

  btnSearch.addEventListener("click", () => {
    searchWrapper.classList.toggle("active");
    if (searchWrapper.classList.contains("active")) {
      setTimeout(() => searchInput?.focus(), 200);
    }
  });

  document.addEventListener("click", (e) => {
    if (!searchWrapper.contains(e.target)) {
      searchWrapper.classList.remove("active");
    }
  });

  suggestions?.addEventListener("click", (e) => {
    const s = e.target.closest(".suggestion");
    if (!s) return;
    searchInput.value = s.textContent;
    doSearch(s.textContent);
  });

  searchGo?.addEventListener("click", () => doSearch(searchInput.value));
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch(searchInput.value);
  });

  function doSearch(q) {
    if (!q.trim()) return alert("Digite algo para pesquisar.");
    const results = Array.from(document.querySelectorAll(".product-card"))
      .filter((p) => p.textContent.toLowerCase().includes(q.toLowerCase()));

    if (results.length === 0) {
      alert(`Nenhum produto encontrado para "${q}".`);
      return;
    }
    results[0].scrollIntoView({ behavior: "smooth", block: "center" });
    results[0].style.outline = "2px solid #004d4d";
    setTimeout(() => (results[0].style.outline = "none"), 1500);
  }
}

/* =============================
   Carrinho
============================= */
function initCart() {
  const state = { items: [] };
  const cartPanel = document.getElementById("cart-panel");
  const cartBtn = document.getElementById("btn-cart");
  const closeCartBtn = document.getElementById("close-cart");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const cartCountEl = document.getElementById("cart-count");

  function renderCart() {
    cartItemsEl.innerHTML = "";
    if (state.items.length === 0) {
      cartItemsEl.innerHTML = '<div style="color:var(--muted);font-size:14px">Seu carrinho está vazio — adicione produtos.</div>';
      cartTotalEl.textContent = "R$ 0,00";
      cartCountEl.textContent = "0";
      return;
    }

    let total = 0;
    state.items.forEach((item) => {
      total += item.price * item.qty;
      const el = document.createElement("div");
      el.className = "cart-item";
      el.innerHTML = `
        <img src="${item.img}" alt="${item.name}" />
        <div>
          <div>${item.name}</div>
          <div>${item.qty} x R$ ${item.price.toFixed(2)}</div>
        </div>
        <button onclick="removeItem('${item.id}')">✕</button>
      `;
      cartItemsEl.appendChild(el);
    });

    cartTotalEl.textContent = `R$ ${total.toFixed(2)}`;
    cartCountEl.textContent = state.items.reduce((s, i) => s + i.qty, 0);
  }

  function addToCart(product) {
    const found = state.items.find((i) => i.id === product.id);
    if (found) found.qty++;
    else state.items.push({ ...product, qty: 1 });
    renderCart();
    openCart();
  }

  function openCart() {
    cartPanel.classList.add("open");
    cartPanel.setAttribute("aria-hidden", "false");
    cartBtn.setAttribute("aria-expanded", "true");
  }

  function closeCart() {
    cartPanel.classList.remove("open");
    cartPanel.setAttribute("aria-hidden", "true");
    cartBtn.setAttribute("aria-expanded", "false");
  }

  cartBtn?.addEventListener("click", () => {
    if (cartPanel.classList.contains("open")) closeCart();
    else openCart();
  });
  closeCartBtn?.addEventListener("click", closeCart);

  // Ativar botões nos produtos
  document.querySelectorAll(".product-card").forEach((prod) => {
    const btn = prod.querySelector(".add-btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const id = prod.dataset.id;
      const name = prod.dataset.name;
      const price = parseFloat(prod.dataset.price);
      const img = prod.querySelector("img")?.src || "";
      addToCart({ id, name, price, img });
    });
  });

  // remover global
  window.removeItem = (id) => {
    state.items = state.items.filter((i) => i.id !== id);
    renderCart();
  };
}
