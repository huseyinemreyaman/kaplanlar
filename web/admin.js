(() => {
  "use strict";

  const loginPanel = document.getElementById("loginPanel");
  const loginForm = document.getElementById("loginForm");
  const loginFeedback = document.getElementById("loginFeedback");
  const loginButton = document.getElementById("loginButton");
  const passwordInput = document.getElementById("adminPassword");
  const passwordVisibility = document.getElementById("passwordVisibility");
  const dashboard = document.getElementById("dashboard");
  const dashboardFeedback = document.getElementById("dashboardFeedback");
  const pageStatistics = document.getElementById("pageStatistics");
  const emptyTraffic = document.getElementById("emptyTraffic");

  const pageLabels = {
    "/": "Ana sayfa",
    "/projects": "Projeler",
    "/projects/tubitak": "TÜBİTAK",
    "/projects/teknofest": "TEKNOFEST",
    "/projects/lego-spike": "LEGO SPIKE",
    "/projects/lego-vex": "LEGO VEX",
    "/projects/kodlama": "Kodlama",
    "/members": "Ekibimiz",
    "/events": "Etkinlik planlayıcı",
    "/support": "Destek",
    "/contact": "İletişim"
  };

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const setView = (authenticated) => {
    loginPanel.hidden = authenticated;
    dashboard.hidden = !authenticated;
    if (authenticated) {
      dashboardFeedback.textContent = "";
    }
  };

  const formatNumber = (value) =>
    new Intl.NumberFormat("tr-TR").format(Number(value) || 0);

  const formatUptime = (seconds) => {
    const totalMinutes = Math.floor(Math.max(0, Number(seconds) || 0) / 60);
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    const parts = [];
    if (days) parts.push(`${days} gün`);
    if (hours || days) parts.push(`${hours} saat`);
    parts.push(`${minutes} dk`);
    return parts.join(" ");
  };

  const renderStatistics = (statistics) => {
    document.getElementById("totalViews").textContent =
      formatNumber(statistics.totalPageViews);
    document.getElementById("recentViews").textContent =
      formatNumber(statistics.pageViews24Hours);
    document.getElementById("uptime").textContent =
      formatUptime(statistics.uptimeSeconds);
    document.getElementById("updatedAt").textContent =
      `Son güncelleme: ${new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(statistics.generatedAt))}`;

    const pages = Array.isArray(statistics.pages) ? statistics.pages : [];
    const totalViews = Number(statistics.totalPageViews) || 0;
    const maximumViews = Math.max(1, ...pages.map((page) => Number(page.views) || 0));
    pageStatistics.replaceChildren();

    pages.forEach((page) => {
      const row = document.createElement("tr");
      const nameCell = document.createElement("td");
      const name = document.createElement("span");
      name.className = "page-path";
      name.textContent = pageLabels[page.path] || page.path;
      nameCell.append(name);

      const viewsCell = document.createElement("td");
      viewsCell.className = "view-number";
      viewsCell.textContent = formatNumber(page.views);

      const shareCell = document.createElement("td");
      const track = document.createElement("div");
      track.className = "bar-track";
      track.setAttribute("role", "img");
      const percentage = totalViews
        ? Math.round((Number(page.views) / totalViews) * 100)
        : 0;
      track.setAttribute("aria-label", `Toplam görüntülemelerin yüzde ${percentage}si`);
      const fill = document.createElement("div");
      fill.className = "bar-fill";
      fill.style.width = `${Math.round(((Number(page.views) || 0) / maximumViews) * 100)}%`;
      track.append(fill);
      shareCell.append(track);
      row.append(nameCell, viewsCell, shareCell);
      pageStatistics.append(row);
    });

    emptyTraffic.hidden = pages.length > 0;
  };

  const loadStatistics = async () => {
    const response = await fetch("/api/admin/stats", {
      credentials: "same-origin",
      cache: "no-store"
    });
    if (response.status === 401) {
      setView(false);
      return false;
    }
    if (!response.ok) {
      throw new Error("İstatistikler şu anda yüklenemedi.");
    }

    const statistics = await response.json();
    renderStatistics(statistics);
    setView(true);
    return true;
  };

  if (passwordVisibility && passwordInput) {
    passwordVisibility.addEventListener("click", () => {
      const isVisible = passwordInput.type === "text";
      passwordInput.type = isVisible ? "password" : "text";
      passwordVisibility.textContent = isVisible ? "Göster" : "Gizle";
      passwordVisibility.setAttribute(
        "aria-label",
        isVisible ? "Parolayı göster" : "Parolayı gizle"
      );
      passwordVisibility.setAttribute("aria-pressed", String(!isVisible));
    });
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginFeedback.textContent = "";
    loginButton.disabled = true;
    loginButton.textContent = "Kontrol ediliyor…";

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput.value })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Giriş yapılamadı.");
      }

      passwordInput.value = "";
      await loadStatistics();
    } catch (error) {
      loginFeedback.textContent = error.message || "Sunucuya bağlanılamadı.";
    } finally {
      loginButton.disabled = false;
      loginButton.innerHTML = 'Giriş yap <span aria-hidden="true">→</span>';
    }
  });

  document.getElementById("refreshButton").addEventListener("click", async () => {
    dashboardFeedback.textContent = "";
    try {
      await loadStatistics();
    } catch (error) {
      dashboardFeedback.textContent = error.message || "İstatistikler yenilenemedi.";
    }
  });

  document.getElementById("logoutButton").addEventListener("click", async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error("Oturum kapatılamadı.");
      }
      setView(false);
      loginFeedback.textContent = "Oturum kapatıldı.";
    } catch (error) {
      dashboardFeedback.textContent = error.message || "Oturum kapatılamadı.";
    }
  });

  loadStatistics().catch((error) => {
    setView(false);
    loginFeedback.textContent = error.message || "Yönetim servisine ulaşılamıyor.";
  });
})();
