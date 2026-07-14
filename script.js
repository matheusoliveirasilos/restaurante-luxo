/* ==========================================================================
   LA BELLE ÉPOQUE — SCRIPT
   JavaScript puro, sem dependências externas.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  const navLinks = document.getElementById("nav-links");

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
    const wasOpen = navbar.classList.contains("menu-open");
    navbar.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("nav-locked");
    // Devolve o foco ao botão para quem navega por teclado.
    if (wasOpen && document.activeElement && document.activeElement.closest(".nav-links")) {
      navToggle.focus();
    }
  };

  const openMobileMenu = () => {
    navbar.classList.add("menu-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Fechar menu");
    document.body.classList.add("nav-locked");
    // Move o foco para o primeiro item do menu (acessibilidade via teclado).
    const firstLink = navLinks.querySelector("a");
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 350);
    }
  };

  navToggle.addEventListener("click", () => {
    if (navbar.classList.contains("menu-open")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
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

  // Fecha o menu automaticamente se a tela for redimensionada para o layout desktop
  // (evita que o menu fique "preso" aberto ao girar o dispositivo ou redimensionar a janela)
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860 && navbar.classList.contains("menu-open")) {
      closeMobileMenu();
    }
  });

  /* ---------------------------------------------------------
     2.1 MODAL — CARDÁPIO COMPLETO
     Abre uma experiência em tela cheia com o cardápio completo,
     isolando o foco do usuário até que ele decida voltar ao site.
  --------------------------------------------------------- */
  const menuModal = document.getElementById("menu-modal");
  const menuModalOverlay = document.getElementById("menu-modal-overlay");
  const menuModalClose = document.getElementById("menu-modal-close");
  const menuModalScroll = document.getElementById("menu-modal-scroll");
  const menuModalTabs = document.querySelectorAll(".menu-tab");
  const menuModalCategories = document.querySelectorAll(".menu-modal-category");
  const menuModalTriggers = document.querySelectorAll(
    'a[href="#menu"], #open-full-menu-btn'
  );

  let lastFocusedElement = null;

  const getFocusableModalElements = () =>
    menuModal.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

  const openMenuModal = (triggerEl) => {
    lastFocusedElement = triggerEl || document.activeElement;

    // Garante que o menu mobile feche antes de abrir o cardápio.
    if (navbar.classList.contains("menu-open")) {
      closeMobileMenu();
    }

    menuModal.classList.add("is-open");
    menuModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("nav-locked");

    if (menuModalScroll) {
      menuModalScroll.scrollTop = 0;
    }

    setTimeout(() => {
      menuModalClose.focus();
    }, 350);
  };

  const closeMenuModal = () => {
    if (!menuModal.classList.contains("is-open")) return;
    menuModal.classList.remove("is-open");
    menuModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("nav-locked");

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  };

  menuModalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openMenuModal(trigger);
    });
  });

  menuModalClose.addEventListener("click", closeMenuModal);
  menuModalOverlay.addEventListener("click", closeMenuModal);

  // Fecha o cardápio ao pressionar Esc, e mantém o foco preso dentro
  // do modal (acessibilidade) enquanto ele estiver aberto.
  document.addEventListener("keydown", (event) => {
    if (!menuModal.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeMenuModal();
      return;
    }

    if (event.key === "Tab") {
      const focusable = Array.from(getFocusableModalElements());
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // Navegação por categorias dentro do cardápio: rola suavemente até a
  // seção correspondente sem afetar a URL da página principal.
  menuModalTabs.forEach((tab) => {
    tab.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = tab.dataset.cat;
      const targetSection = document.getElementById(targetId);
      if (!targetSection || !menuModalScroll) return;

      const offset = targetSection.offsetTop - 110;
      menuModalScroll.scrollTo({ top: offset, behavior: "smooth" });
    });
  });

  // Destaca a categoria ativa nas abas conforme o usuário rola o cardápio.
  if (menuModalCategories.length && menuModalScroll) {
    const setActiveTab = (id) => {
      menuModalTabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.cat === id);
      });
    };

    const categoryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      {
        root: menuModalScroll,
        threshold: 0.2,
        rootMargin: "-100px 0px -55% 0px",
      }
    );

    menuModalCategories.forEach((section) => categoryObserver.observe(section));
  }

  // Permite abrir o cardápio diretamente via link compartilhado (#menu na URL).
  if (window.location.hash === "#menu") {
    window.addEventListener("load", () => {
      setTimeout(() => openMenuModal(), 900);
    });
  }

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

  if (isTouchDevice || prefersReducedMotion) {
    // Em dispositivos de toque ou com "reduzir movimento" ativado, mantém a imagem
    // fixa e estável (sem parallax) para não tremer nem causar desconforto.
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

    // Respeita a preferência por movimento reduzido: mostra o valor final direto.
    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString("pt-BR") + suffix;
      return;
    }

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

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setFieldInvalid = (field, invalid) => {
    if (!field) return;
    field.classList.toggle("is-invalid", invalid);
    field.setAttribute("aria-invalid", invalid ? "true" : "false");
  };

  reservationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameField = document.getElementById("name");
    const emailField = document.getElementById("email");
    const dateField = document.getElementById("date");
    const guestsField = document.getElementById("guests");

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const date = dateField.value;
    const guests = guestsField.value;

    const isEmailValid = emailPattern.test(email);

    setFieldInvalid(nameField, !name);
    setFieldInvalid(emailField, !email || !isEmailValid);
    setFieldInvalid(dateField, !date);
    setFieldInvalid(guestsField, !guests);

    if (!name || !date || !guests) {
      formFeedback.className = "form-feedback is-error";
      formFeedback.textContent = "Por favor, preencha todos os campos para continuar.";
      return;
    }

    if (!email || !isEmailValid) {
      formFeedback.className = "form-feedback is-error";
      formFeedback.textContent = "Por favor, informe um e-mail válido.";
      return;
    }

    // Feedback de sucesso (simulação — sem envio real de dados)
    formFeedback.className = "form-feedback is-success";
    formFeedback.textContent = `Obrigado, ${name.split(" ")[0]}! Sua solicitação de reserva para ${guests} em ${new Date(
      date + "T00:00:00"
    ).toLocaleDateString("pt-BR")} foi recebida. Em breve enviaremos a confirmação para ${email}.`;

    reservationForm.reset();
    [nameField, emailField, dateField, guestsField].forEach((field) => setFieldInvalid(field, false));
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

  /* ---------------------------------------------------------
     9. SCROLL SPY — destaca o item do menu correspondente
     à seção visível no momento (funciona no menu desktop e no mobile,
     pois ambos compartilham os mesmos links).
  --------------------------------------------------------- */
  const navLinksWithSection = document.querySelectorAll(".nav-links a[data-section]");

  if (navLinksWithSection.length) {
    const sectionMap = new Map();
    navLinksWithSection.forEach((link) => {
      const section = document.getElementById(link.dataset.section);
      if (section) sectionMap.set(section, link);
    });

    const setActiveLink = (activeSection) => {
      navLinksWithSection.forEach((link) => {
        const isActive = link.dataset.section === activeSection;
        link.classList.toggle("active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = sectionMap.get(entry.target);
            if (link) setActiveLink(link.dataset.section);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-30% 0px -50% 0px" }
    );

    sectionMap.forEach((_link, section) => spyObserver.observe(section));
  }

});