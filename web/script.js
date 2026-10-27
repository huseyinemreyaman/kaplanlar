(() => {
  "use strict";

  const root = document.documentElement;
  const themeButton = document.querySelector(".theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const menuButton = document.querySelector(".menu-btn");
  const navigation = document.querySelector(".site-nav");
  const topButton = document.querySelector(".back-to-top");
  const year = document.querySelector("[data-year]");

  if (year) year.textContent = String(new Date().getFullYear());

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    if (themeButton) {
      const nextTheme = theme === "dark" ? "light" : "dark";
      themeButton.setAttribute(
        "aria-label",
        nextTheme === "light" ? "Açık temaya geç" : "Koyu temaya geç"
      );
      themeButton.innerHTML = `<span aria-hidden="true">${nextTheme === "light" ? "☼" : "◐"}</span>`;
    }
    if (themeMeta) {
      themeMeta.content = theme === "dark" ? "#0c141b" : "#fbfaf7";
    }
  };

  try {
    const savedTheme = window.localStorage.getItem("bkm-theme");
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
  } catch (error) {
    console.warn("Tema tercihi bu tarayıcıda okunamadı.", error);
  }

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
      try {
        window.localStorage.setItem("bkm-theme", nextTheme);
      } catch (error) {
        console.warn("Tema tercihi bu tarayıcıda saklanamadı.", error);
      }
    });
  }

  if (menuButton && navigation) {
    const closeMenu = () => {
      navigation.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Menüyü aç");
    };

    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Menüyü kapat" : "Menüyü aç");
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  if (topButton) {
    const updateTopButton = () => {
      topButton.classList.toggle("visible", window.scrollY > 420);
    };

    window.addEventListener("scroll", updateTopButton, { passive: true });
    updateTopButton();
    topButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const memberSearch = document.getElementById("memberSearch");
  const memberCards = Array.from(document.querySelectorAll(".member-card"));
  const memberCount = document.getElementById("memberCount");
  const memberEmpty = document.getElementById("memberEmpty");
  const memberFilterButtons = Array.from(
    document.querySelectorAll("[data-member-filter]")
  );
  let selectedMemberFilter = "all";

  if (memberSearch && memberCount && memberEmpty) {
    const updateMembers = () => {
      const query = memberSearch.value.trim().toLocaleLowerCase("tr");
      let visibleCount = 0;

      memberCards.forEach((card) => {
        const searchableText = card.dataset.member || "";
        const skills = (card.dataset.skill || "").split(" ");
        const matchesQuery = searchableText.toLocaleLowerCase("tr").includes(query);
        const matchesFilter =
          selectedMemberFilter === "all" ||
          skills.includes(selectedMemberFilter);
        const isMatch = matchesQuery && matchesFilter;
        card.hidden = !isMatch;
        if (isMatch) visibleCount += 1;
      });

      memberCount.textContent = `${visibleCount} takım arkadaşı`;
      memberEmpty.hidden = visibleCount > 0;
    };

    memberSearch.addEventListener("input", updateMembers);
    memberFilterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        selectedMemberFilter = button.dataset.memberFilter || "all";
        memberFilterButtons.forEach((filterButton) => {
          const isActive = filterButton === button;
          filterButton.classList.toggle("active", isActive);
          filterButton.setAttribute("aria-pressed", String(isActive));
        });
        updateMembers();
      });
    });
  }

  const projectGrid = document.getElementById("projectDirectory");
  const projectCards = Array.from(document.querySelectorAll(".directory-card"));
  const projectSearch = document.getElementById("projectSearch");
  const projectEmpty = document.getElementById("projectEmpty");
  const savedProjectCount = document.getElementById("savedProjectCount");
  const projectFilterButtons = Array.from(
    document.querySelectorAll("[data-project-filter]")
  );
  const favoriteStorageKey = "bkm-saved-projects";
  let selectedProjectFilter = "all";
  let savedProjects = [];

  const updateProjects = () => {
    if (!projectGrid || !projectEmpty || !savedProjectCount) return;

    const query = projectSearch?.value.trim().toLocaleLowerCase("tr") || "";
    let visibleCount = 0;

    projectCards.forEach((card) => {
      const projectId = card.querySelector("[data-project-id]")?.dataset.projectId;
      const categories = (card.dataset.projectCategory || "").split(" ");
      const searchableText = card.dataset.projectName || "";
      const matchesQuery = searchableText.toLocaleLowerCase("tr").includes(query);
      const matchesFilter =
        selectedProjectFilter === "all" ||
        (selectedProjectFilter === "saved"
          ? savedProjects.includes(projectId)
          : categories.includes(selectedProjectFilter));
      const isMatch = matchesQuery && matchesFilter;
      card.hidden = !isMatch;
      if (isMatch) visibleCount += 1;
    });

    projectEmpty.hidden = visibleCount > 0;
    savedProjectCount.textContent = `${savedProjects.length} kayıtlı proje`;
    projectCards.forEach((card) => {
      const button = card.querySelector("[data-project-id]");
      if (!button) return;
      const isSaved = savedProjects.includes(button.dataset.projectId);
      button.setAttribute("aria-pressed", String(isSaved));
      button.textContent = isSaved ? "♥" : "♡";
      button.setAttribute(
        "aria-label",
        `${button.closest("article")?.querySelector("h3")?.textContent || "Proje"} projesini ${isSaved ? "kayıttan çıkar" : "kaydet"}`
      );
    });
  };

  if (projectGrid && projectEmpty && savedProjectCount) {
    try {
      const storedProjects = JSON.parse(
        window.localStorage.getItem(favoriteStorageKey) || "[]"
      );
      if (Array.isArray(storedProjects)) {
        savedProjects = storedProjects.filter((item) => typeof item === "string");
      }
    } catch (error) {
      console.warn("Kayıtlı projeler okunamadı.", error);
    }

    projectSearch?.addEventListener("input", updateProjects);
    projectFilterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        selectedProjectFilter = button.dataset.projectFilter || "all";
        projectFilterButtons.forEach((filterButton) => {
          const isActive = filterButton === button;
          filterButton.classList.toggle("active", isActive);
          filterButton.setAttribute("aria-pressed", String(isActive));
        });
        updateProjects();
      });
    });

    projectGrid.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("[data-project-id]");
      if (!button) return;

      const projectId = button.dataset.projectId;
      if (!projectId) return;
      savedProjects = savedProjects.includes(projectId)
        ? savedProjects.filter((item) => item !== projectId)
        : [...savedProjects, projectId];

      try {
        window.localStorage.setItem(
          favoriteStorageKey,
          JSON.stringify(savedProjects)
        );
        updateProjects();
      } catch (error) {
        console.error("Kayıtlı projeler saklanamadı.", error);
      }
    });

    updateProjects();
  }

  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const draftStatus = document.getElementById("draftStatus");
  const clearDraftButton = document.getElementById("clearDraft");
  const draftStorageKey = "bkm-contact-draft";

  if (contactForm && formStatus) {
    const draftFields = ["name", "email", "topic", "message"];
    const saveDraft = () => {
      if (!draftStatus) return;
      const draft = Object.fromEntries(
        draftFields.map((name) => [
          name,
          String(new FormData(contactForm).get(name) || "")
        ])
      );

      try {
        window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
        draftStatus.textContent = "Taslağın bu cihazda otomatik kaydediliyor.";
      } catch (error) {
        draftStatus.textContent = "Taslak bu tarayıcıda saklanamadı.";
        console.error("İletişim taslağı saklanamadı.", error);
      }
    };

    try {
      const storedDraft = JSON.parse(
        window.localStorage.getItem(draftStorageKey) || "null"
      );
      if (storedDraft && typeof storedDraft === "object") {
        draftFields.forEach((name) => {
          const field = contactForm.elements.namedItem(name);
          if (field && typeof storedDraft[name] === "string") {
            field.value = storedDraft[name];
          }
        });
        if (draftStatus) {
          draftStatus.textContent = "Kaydedilmiş taslağın bu cihazdan geri yüklendi.";
        }
      }
    } catch (error) {
      if (draftStatus) draftStatus.textContent = "Kaydedilmiş taslak okunamadı.";
      console.error("İletişim taslağı okunamadı.", error);
    }

    let draftTimer;
    contactForm.addEventListener("input", () => {
      window.clearTimeout(draftTimer);
      draftTimer = window.setTimeout(saveDraft, 300);
    });
    contactForm.addEventListener("change", saveDraft);

    clearDraftButton?.addEventListener("click", () => {
      contactForm.reset();
      try {
        window.localStorage.removeItem(draftStorageKey);
        if (draftStatus) draftStatus.textContent = "Taslak temizlendi.";
      } catch (error) {
        if (draftStatus) draftStatus.textContent = "Taslak bu tarayıcıdan silinemedi.";
        console.error("İletişim taslağı silinemedi.", error);
      }
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      formStatus.textContent =
        "Form kontrol edildi ancak mesaj gönderimi henüz etkin değil. Mesajın gönderilmedi.";
    });
  }

  const eventForm = document.getElementById("eventForm");
  const eventList = document.getElementById("eventList");
  const eventEmpty = document.getElementById("eventEmpty");
  const eventStatus = document.getElementById("eventStatus");
  const clearEventsButton = document.getElementById("clearEvents");
  const eventDateInput = document.getElementById("eventDate");
  const eventStorageKey = "bkm-planned-events";
  let plannedEvents = [];

  const localDateValue = (date) => {
    const yearValue = date.getFullYear();
    const monthValue = String(date.getMonth() + 1).padStart(2, "0");
    const dayValue = String(date.getDate()).padStart(2, "0");
    return `${yearValue}-${monthValue}-${dayValue}`;
  };

  const escapeCalendarText = (value) =>
    String(value)
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");

  const createCalendarFile = (activity) => {
    const [yearValue, monthValue, dayValue] = activity.date.split("-").map(Number);
    const [hourValue, minuteValue] = activity.time.split(":").map(Number);
    const starts = new Date(yearValue, monthValue - 1, dayValue, hourValue, minuteValue);
    const ends = new Date(starts.getTime() + 60 * 60 * 1000);
    const formatLocal = (date) =>
      `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}00`;
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const contents = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BKM Tigers//Etkinlik Planlayici//TR",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${activity.id}@bkmtigers.local`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Europe/Istanbul:${formatLocal(starts)}`,
      `DTEND;TZID=Europe/Istanbul:${formatLocal(ends)}`,
      `SUMMARY:${escapeCalendarText(activity.title)}`,
      `DESCRIPTION:${escapeCalendarText(`${activity.type}${activity.notes ? ` - ${activity.notes}` : ""}`)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([contents], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activity.date}-bkm-tigers.ics`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (eventStatus) {
      eventStatus.textContent = "Takvim dosyasının indirilmesi başlatıldı.";
    }
  };

  const renderEvents = () => {
    if (!eventList || !eventEmpty) return;
    eventList.replaceChildren();

    const sortedEvents = [...plannedEvents].sort((a, b) =>
      `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
    );
    eventEmpty.hidden = sortedEvents.length > 0;
    if (eventStatus) {
      eventStatus.textContent = sortedEvents.length
        ? `${sortedEvents.length} etkinlik planlandı.`
        : "";
    }

    sortedEvents.forEach((activity) => {
      const card = document.createElement("article");
      card.className = "event-card";

      const date = document.createElement("div");
      date.className = "event-date";
      const dateValue = new Date(`${activity.date}T${activity.time}`);
      date.textContent = new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "short"
      }).format(dateValue);

      const content = document.createElement("div");
      content.className = "event-card-content";
      const title = document.createElement("h3");
      title.textContent = activity.title;
      const meta = document.createElement("p");
      meta.textContent = `${activity.type} · ${activity.time}`;
      content.append(title, meta);

      if (activity.notes) {
        const notes = document.createElement("p");
        notes.className = "event-card-notes";
        notes.textContent = activity.notes;
        content.append(notes);
      }

      const actions = document.createElement("div");
      actions.className = "event-card-actions";
      const calendarButton = document.createElement("button");
      calendarButton.className = "icon-action";
      calendarButton.type = "button";
      calendarButton.textContent = "Takvime ekle";
      calendarButton.addEventListener("click", () => createCalendarFile(activity));
      const deleteButton = document.createElement("button");
      deleteButton.className = "icon-action delete-action";
      deleteButton.type = "button";
      deleteButton.textContent = "Sil";
      deleteButton.setAttribute("aria-label", `${activity.title} etkinliğini sil`);
      deleteButton.addEventListener("click", () => {
        plannedEvents = plannedEvents.filter((item) => item.id !== activity.id);
        persistEvents();
      });
      actions.append(calendarButton, deleteButton);
      card.append(date, content, actions);
      eventList.append(card);
    });
  };

  const persistEvents = () => {
    try {
      window.localStorage.setItem(eventStorageKey, JSON.stringify(plannedEvents));
      renderEvents();
    } catch (error) {
      if (eventStatus) {
        eventStatus.textContent = "Etkinlikler bu tarayıcıda saklanamadı.";
      }
      console.error("Etkinlik planları saklanamadı.", error);
    }
  };

  if (eventForm && eventList && eventEmpty) {
    if (eventDateInput) eventDateInput.min = localDateValue(new Date());
    try {
      const storedEvents = JSON.parse(
        window.localStorage.getItem(eventStorageKey) || "[]"
      );
      if (Array.isArray(storedEvents)) {
        plannedEvents = storedEvents.filter(
          (item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            typeof item.date === "string" &&
            typeof item.time === "string"
        );
      }
    } catch (error) {
      if (eventStatus) eventStatus.textContent = "Kayıtlı etkinlikler okunamadı.";
      console.error("Etkinlik planları okunamadı.", error);
    }
    renderEvents();

    eventForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!eventForm.reportValidity()) return;
      const formData = new FormData(eventForm);
      plannedEvents.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: String(formData.get("title") || "").trim(),
        date: String(formData.get("date") || ""),
        time: String(formData.get("time") || ""),
        type: String(formData.get("type") || ""),
        notes: String(formData.get("notes") || "").trim()
      });
      persistEvents();
      eventForm.reset();
      if (eventDateInput) eventDateInput.min = localDateValue(new Date());
    });

    clearEventsButton?.addEventListener("click", () => {
      if (!plannedEvents.length) return;
      plannedEvents = [];
      persistEvents();
    });
  }
})();
