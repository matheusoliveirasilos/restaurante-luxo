/* ==========================================================================
   LA BELLE ÉPOQUE — SCRIPT
   JavaScript puro, sem dependências externas.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------------------------------------
     1. LOADING SCREEN
     Esconde a tela de carregamento assim que a página termina
     de carregar (com um pequeno delay para suavizar a transição).
  --------------------------------------------------------- */
  const loadingScreen = document.getElementById("loading-screen");

  window.addEventListener("load", () => {
    setTimeout(() => {
      loadingScreen.classList.add("hidden");
    }, 600);
  });

  /* ---------------------------------------------------------
     2. NAVBAR — efeito ao rolar + menu mobile
  --------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("nav-toggle");
  const navOverlay = document.getElementById("nav-overlay");

  const handleNavbarScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  };
  handleNavbarScroll();
  window.addEventListener("scroll", handleNavbarScroll, { passive: true });

  const closeMobileMenu = () => {
    navbar.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Fecha o menu mobile ao clicar em um link (item do menu)
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  // Fecha o menu mobile ao clicar fora dele (área escurecida)
  if (navOverlay) {
    navOverlay.addEventListener("click", closeMobileMenu);
  }

  // Fecha o menu mobile ao pressionar Esc
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navbar.classList.contains("menu-open")) {
      closeMobileMenu();
    }
  });

  /* ---------------------------------------------------------
     2.1 SEÇÃO "MENU EM DESTAQUE" — fica oculta até o clique
     no link "Menu" (no menu de três pontinhos ou no rodapé).
  --------------------------------------------------------- */
  const menuSection = document.getElementById("menu");

  document.querySelectorAll('a[href="#menu"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      menuSection.classList.remove("menu-hidden");
      requestAnimationFrame(() => {
        menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });

  /* ---------------------------------------------------------
     3. PARALLAX SUAVE NO HERO
     Move a imagem de fundo em velocidade diferente do scroll.
     Usa requestAnimationFrame para evitar tremores/engasgos, e
     fica desativado em telas de toque (celular/tablet), onde o
     scroll por arrasto costuma causar tremor visual no parallax.
  --------------------------------------------------------- */
  const heroBg = document.getElementById("hero-bg");
  const hero = document.getElementById("hero");
  const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  let parallaxTicking = false;

  const applyParallax = () => {
    const scrollY = window.scrollY;
    if (scrollY < hero.offsetHeight) {
      heroBg.style.transform = `translate3d(0, ${(scrollY * 0.35).toFixed(1)}px, 0) scale(1.05)`;
    }
    parallaxTicking = false;
  };

  const handleParallax = () => {
    if (!parallaxTicking) {
      requestAnimationFrame(applyParallax);
      parallaxTicking = true;
    }
  };

  if (isTouchDevice) {
    // Em dispositivos de toque, mantém a imagem fixa e estável (sem parallax) para não tremer.
    heroBg.style.transform = "translate3d(0, 0, 0) scale(1.05)";
  } else {
    window.addEventListener("scroll", handleParallax, { passive: true });
  }

  /* ---------------------------------------------------------
     4. ANIMAÇÕES DE SCROLL (Intersection Observer)
     Revela elementos suavemente conforme entram na viewport.
  --------------------------------------------------------- */
  const revealElements = document.querySelectorAll(
    ".reveal-fade, .reveal-left, .reveal-right"
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // pequeno atraso escalonado para elementos vizinhos
          const delay = (index % 3) * 90;
          setTimeout(() => entry.target.classList.add("in-view"), delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ---------------------------------------------------------
     5. CONTADORES ANIMADOS (estatísticas do restaurante)
  --------------------------------------------------------- */
  const statNumbers = document.querySelectorAll(".stat-number");

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1800; // ms
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // easing suave (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString("pt-BR") + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString("pt-BR") + suffix;
      }
    };
    requestAnimationFrame(step);
  };

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  statNumbers.forEach((el) => statsObserver.observe(el));

  /* ---------------------------------------------------------
     6. FORMULÁRIO DE RESERVAS
     Validação simples e feedback ao usuário (sem backend real).
  --------------------------------------------------------- */
  const reservationForm = document.getElementById("reservation-form");
  const formFeedback = document.getElementById("form-feedback");
  const dateInput = document.getElementById("date");

  // Impede reservas em datas passadas
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  reservationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const date = document.getElementById("date").value;
    const guests = document.getElementById("guests").value;

    if (!name || !email || !date || !guests) {
      formFeedback.textContent = "Por favor, preencha todos os campos para continuar.";
      formFeedback.style.color = "#e08b8b";
      return;
    }

    // Feedback de sucesso (simulação — sem envio real de dados)
    formFeedback.style.color = "#e6c866";
    formFeedback.textContent = `Obrigado, ${name.split(" ")[0]}! Sua solicitação de reserva para ${guests} em ${new Date(
      date + "T00:00:00"
    ).toLocaleDateString("pt-BR")} foi recebida. Em breve enviaremos a confirmação para ${email}.`;

    reservationForm.reset();
  });

  /* ---------------------------------------------------------
     7. BOTÃO "VOLTAR AO TOPO"
  --------------------------------------------------------- */
  const backToTopBtn = document.getElementById("back-to-top");

  const toggleBackToTop = () => {
    if (window.scrollY > 700) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  };
  window.addEventListener("scroll", toggleBackToTop, { passive: true });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------------------------------------------------------
     8. ANO ATUAL NO RODAPÉ
  --------------------------------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();

});