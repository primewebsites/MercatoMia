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

document.addEventListener("DOMContentLoaded", () => {
  // ============================
  // ELEMENTOS
  // ============================
  const cartToggle = document.getElementById("cart-toggle");
  const cartClose = document.getElementById("close-cart");
  const sideCart = document.getElementById("side-cart");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartSubtotal = document.getElementById("cart-total"); // ajustado para seu HTML
  const clearCartBtn = document.getElementById("clear-cart");
  const checkoutBtn = document.querySelector(".side-cart__checkout"); // class
  const couponInput = document.getElementById("coupon-code"); // id ajustado
  const applyCouponBtn = document.getElementById("apply-coupon");
  const cartCountEl = document.querySelector(".cart-count");

  let cart = [];
  let discount = 0;

  // ============================
  // ABRIR/FECHAR CARRINHO
  // ============================
  const openCart = () => sideCart.classList.add("active");
  const closeCart = () => sideCart.classList.remove("active");

  cartToggle.addEventListener("click", () => {
    sideCart.classList.toggle("active");
  });
  cartClose.addEventListener("click", closeCart);

  // ============================
  // ADICIONAR PRODUTO
  // ============================
  document.querySelectorAll(".product-card__link").forEach(product => {
    product.addEventListener("click", (e) => {
      e.preventDefault();
      const title = product.querySelector("h3").innerText;
      const priceText = product.querySelector("p").innerText.replace("R$", "").replace(",", ".").trim();
      const price = parseFloat(priceText);
      const imgSrc = product.querySelector("img").src;
      addToCart({ title, price, imgSrc });
    });
  });

  function addToCart(item) {
    const existingItem = cart.find(ci => ci.title === item.title);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ ...item, quantity: 1 });
    }

    renderCart();
    openCart(); // garante abrir sempre ao adicionar
  }

  // ============================
  // RENDERIZAR CARRINHO
  // ============================
  function renderCart() {
    cartItemsContainer.innerHTML = "";
    let subtotal = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `<div style="color:var(--muted);font-size:14px">Seu carrinho está vazio — adicione produtos.</div>`;
      cartSubtotal.innerText = "R$ 0,00";
      cartCountEl.innerText = "0";
      return;
    }

    cart.forEach((item, index) => {
      subtotal += item.price * item.quantity;

      const div = document.createElement("div");
      div.classList.add("side-cart__item");
      div.innerHTML = `
        <img src="${item.imgSrc}" alt="${item.title}">
        <div class="side-cart__item-title">${item.title}</div>
        <div class="side-cart__item-controls">
          <button class="decrease" data-index="${index}">-</button>
          <span>${item.quantity}</span>
          <button class="increase" data-index="${index}">+</button>
          <button class="remove" data-index="${index}">Remover</button>
        </div>
        <div class="side-cart__item-price">R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}</div>
      `;
      cartItemsContainer.appendChild(div);
    });

    subtotal -= discount;
    if (subtotal < 0) subtotal = 0;
    cartSubtotal.innerText = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;

    updateCartCount();
  }

  // ============================
  // CONTROLES DOS ITENS (DELEGATION)
  // ============================
  cartItemsContainer.addEventListener("click", (e) => {
    const index = e.target.dataset.index;
    if (e.target.classList.contains("increase")) {
      cart[index].quantity++;
      renderCart();
    } else if (e.target.classList.contains("decrease")) {
      if (cart[index].quantity > 1) {
        cart[index].quantity--;
      } else {
        cart.splice(index, 1);
      }
      renderCart();
    } else if (e.target.classList.contains("remove")) {
      cart.splice(index, 1);
      renderCart();
    }
  });

  // ============================
  // LIMPAR CARRINHO
  // ============================
  clearCartBtn.addEventListener("click", () => {
    cart = [];
    discount = 0;
    renderCart();
  });

  // ============================
  // APLICAR CUPOM
  // ============================
  applyCouponBtn.addEventListener("click", () => {
    const code = couponInput.value.trim();
    if (code === "DESCONTO10") {
      discount = 10;
      renderCart();
      alert("Cupom aplicado! R$10 de desconto.");
    } else {
      alert("Cupom inválido");
    }
  });

  // ============================
  // ATUALIZA CARRINHO NO ÍCONE
  // ============================
  function updateCartCount() {
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCountEl.innerText = count;
  }

  // ============================
  // FINALIZAR COMPRA
  // ============================
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }
    alert("Checkout realizado com sucesso!");
    cart = [];
    discount = 0;
    renderCart();
  });

  // Render inicial
  renderCart();
});
