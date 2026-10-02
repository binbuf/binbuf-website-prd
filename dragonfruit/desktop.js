/* Shared browser representations of the shell, window chrome, and apps. */
"use strict";
window.Desktop = (() => {
  const icon = (name) => '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
    );
  const apps = {
    files: { name: "Files", group: "Utilities" },
    drawer: { name: "Applications", group: "Shell" },
    terminal: { name: "Terminal", group: "Utilities" },
    gallery: { name: "Gallery", group: "Creativity" },
    calendar: { name: "Calendar", group: "Productivity & Finance" },
    settings: { name: "System Settings", group: "Utilities" },
    web: { name: "Web", group: "Information" },
    downloads: { name: "Downloads", group: "Shell" },
    trash: { name: "Trash", group: "Shell" },
  };
  const walls = ["default", "lagoon", "midnight"];
  const title = (value) => value.charAt(0).toUpperCase() + value.slice(1);
  const pref = {
    appearance: "Auto",
    wall: "default",
    accent: "#357bf1",
    size: 1,
    osGlyph: "dragonfruit",
    magnification: true,
    glassTint: 0.5255,
  };
  const preferences = new EventTarget();
  const systemDark = matchMedia("(prefers-color-scheme: dark)");
  const announce = (message) => {
    document.querySelector("#announcer").textContent = message;
  };
  function applyPreferences() {
    const ui =
      pref.appearance === "Auto" ? (systemDark.matches ? "dark" : "light") : pref.appearance.toLowerCase();
    document.querySelectorAll(".surface,.demo").forEach((el) => {
      el.dataset.ui = ui;
      el.dataset.glyph = pref.osGlyph;
      el.style.setProperty("--menu-opacity", (58 + pref.glassTint * 38).toFixed(1) + "%");
      el.style.setProperty("--glass-overlay", (18 + pref.glassTint * 49).toFixed(1) + "%");
      el.style.setProperty("--desk-accent", pref.accent);
      el.style.setProperty(
        "--selected",
        ui === "dark"
          ? "color-mix(in srgb," + pref.accent + " 38%,#27372b)"
          : "color-mix(in srgb," + pref.accent + " 54%,#fff)",
      );
      if (el.matches(".surface,.dock-demo")) el.style.setProperty("--dock-scale", pref.size);
    });
    document.querySelectorAll('input[name="tour-os-glyph"]').forEach((option) => {
      option.checked = option.value === pref.osGlyph;
    });
    preferences.dispatchEvent(new Event("change"));
  }
  function setSurfaceWallpaper(surface, wall) {
    if (surface.dataset.wall === wall) return;
    const heroArt = surface.querySelector(".hero-art");
    const background = heroArt || surface;
    background.querySelector(":scope > .wallpaper-transition")?.remove();
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const prior = document.createElement("div");
      prior.className = "wallpaper-transition";
      prior.setAttribute("aria-hidden", "true");
      prior.style.backgroundImage = getComputedStyle(background).backgroundImage;
      prior.style.backgroundPosition = getComputedStyle(background).backgroundPosition;
      background.prepend(prior);
      prior.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: heroArt ? 850 : 320,
        easing: "ease-in-out",
        fill: "forwards",
      }).onfinish = () => prior.remove();
    }
    surface.dataset.wall = wall;
    if (heroArt) {
      surface.querySelector(".wall-name").textContent = title(wall);
      surface.querySelector(".wall-count").textContent =
        String(walls.indexOf(wall) + 1).padStart(2, "0") + " / " + String(walls.length).padStart(2, "0");
    }
  }
  function setPref(key, value) {
    pref[key] = value;
    if (key === "wall") document.querySelectorAll(".surface").forEach((el) => setSurfaceWallpaper(el, value));
    applyPreferences();
  }
  systemDark.addEventListener("change", () => {
    if (pref.appearance === "Auto") applyPreferences();
  });
  function art(app) {
    const shellFiles = { files: "files", settings: "settings", drawer: "view-app-grid", downloads: "folder" };
    if (shellFiles[app])
      return '<img class="app-art native-art" src="../dragonfruit/assets/shell/' + shellFiles[app] + '.svg" alt="">';
    if (app === "trash") return '<span class="app-art native-art trash-art" aria-hidden="true"></span>';
    const now = new Date();
    const content = {
      terminal: icon("terminal"),
      web: icon("world"),
      gallery: '<i class="art-sun"></i><i class="art-mountain"></i>',
      calendar:
        '<span class="cal-month">' +
        now.toLocaleDateString("en-US", { month: "short" }).toUpperCase() +
        '</span><span class="cal-day">' +
        now.getDate() +
        "</span>",
    };
    return '<span class="app-art app-' + app + '" aria-hidden="true">' + content[app] + "</span>";
  }
  function mountDock(slot, launch) {
    slot.innerHTML = '<div class="dock" role="group" aria-label="Application Dock"></div>';
    const dock = slot.firstElementChild;
    const pinned = ["files", "drawer", "settings", "terminal", "web"];
    let displayed = "",
      stackPanel = null;
    function closeStack() {
      if (stackPanel) {
        stackPanel.remove();
        stackPanel = null;
      }
    }
    function render(ids) {
      const ordered = [
        ...pinned,
        ...ids.filter((id) => !pinned.includes(id) && !["downloads", "trash"].includes(id)),
        "downloads",
        "trash",
      ];
      if (ordered.join(" ") !== displayed) {
        dock.innerHTML = ordered
          .map(
            (id) =>
              (id === "downloads" ? '<span class="dock-separator"></span>' : "") +
              '<button class="dock-item" data-open="' +
              id +
              '" aria-label="Open ' +
              apps[id].name +
              '">' +
              art(id) +
              '<span class="tooltip" aria-hidden="true">' +
              apps[id].name +
              "</span></button>",
          )
          .join("");
        displayed = ordered.join(" ");
      }
      dock
        .querySelectorAll("button")
        .forEach((b) => b.classList.toggle("running", ids.includes(b.dataset.open)));
    }
    render([]);
    dock.addEventListener("click", (e) => {
      const b = e.target.closest("[data-open]");
      if (!b) return;
      const wasOpen = !!stackPanel;
      closeStack();
      if (b.dataset.open === "downloads") {
        if (wasOpen) return;
        stackPanel = document.createElement("div");
        stackPanel.className = "stack-popover popover";
        stackPanel.innerHTML =
          "<strong>Downloads</strong><p>This folder is empty.</p><button>Open in Files</button>";
        slot.append(stackPanel);
        stackPanel.querySelector("button").onclick = () => {
          closeStack();
          launch("files", "Downloads");
        };
        stackPanel.querySelector("button").focus({ preventScroll: true });
        return;
      }
      launch(b.dataset.open);
    });
    slot.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && stackPanel) {
        e.stopPropagation();
        closeStack();
        dock.querySelector("[data-open=downloads]").focus();
      }
    });
    document.addEventListener("pointerdown", (e) => {
      if (!slot.contains(e.target)) closeStack();
    });
    dock.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      dock.querySelectorAll("button").forEach((item) => {
        const box = item.getBoundingClientRect();
        item.style.setProperty(
          "--lift",
          pref.magnification
            ? Math.max(0, 1 - Math.abs(e.clientX - box.left - box.width / 2) / (box.width * 1.55))
            : 0,
        );
      });
    });
    dock.addEventListener("pointerleave", () =>
      dock.querySelectorAll("button").forEach((b) => b.style.removeProperty("--lift")),
    );
    return render;
  }
  function traffic() {
    return (
      '<div class="traffic">' +
      [
        ["close", "Close window", "x"],
        ["minimize", "Minimize window", "minus"],
        ["zoom", "Toggle window zoom", "maximize"],
      ]
        .map(
          ([id, label, symbol]) =>
            '<button data-window-action="' +
            id +
            '" aria-label="' +
            label +
            '" title="' +
            label +
            '"><i class="light-' +
            id +
            '">' +
            icon(symbol) +
            "</i></button>",
        )
        .join("") +
      "</div>"
    );
  }
  function titlebar(name) {
    return (
      '<div class="titlebar">' +
      traffic() +
      '<h4 class="window-heading">' +
      name +
      "</h4>" +
      icon("app-window") +
      "</div>"
    );
  }
  function folder(label, cls = "file-tile") {
    return (
      '<button class="' +
      cls +
      '" data-folder="' +
      escape(label) +
      '"><span class="folder-art" aria-hidden="true"></span><span>' +
      escape(label) +
      "</span></button>"
    );
  }
  function mountDrawer(root, launch, onClose) {
    root.innerHTML =
      '<div class="drawer-panel"><div class="drawer-search"><button class="drawer-back" aria-label="Close Applications">' +
      icon("chevron-left") +
      '</button><label class="search-field">' +
      icon("search") +
      '<input type="search" aria-label="Search applications" placeholder="Applications" autocomplete="off"></label><button class="drawer-options" aria-label="Applications options" aria-expanded="false">•••</button></div><div class="filters" aria-label="App categories"></div><div class="app-grid"></div></div>';
    const grid = root.querySelector(".app-grid"),
      search = root.querySelector("input"),
      filters = root.querySelector(".filters");
    const categories = ["All", "Productivity & Finance", "Utilities", "Creativity", "Information"];
    let category = "All";
    function update() {
      filters.innerHTML = categories
        .map(
          (v) =>
            '<button class="filter ' +
            (v === category ? "selected" : "") +
            '" aria-pressed="' +
            (v === category) +
            '">' +
            escape(v) +
            "</button>",
        )
        .join("");
      const choices = Object.entries(apps)
        .filter(
          ([, app]) =>
            app.group !== "Shell" &&
            (category === "All" || app.group === category) &&
            app.name.toLowerCase().includes(search.value.trim().toLowerCase()),
        )
        .sort((a, b) => a[1].name.localeCompare(b[1].name));
      grid.innerHTML =
        choices
          .map(
            ([id, app]) =>
              '<button class="launch-app" data-launch="' +
              id +
              '">' +
              art(id) +
              "<span>" +
              app.name +
              "</span></button>",
          )
          .join("") || '<p class="drawer-empty" role="status">No applications found.</p>';
    }
    filters.onclick = (e) => {
      if (e.target.matches("button")) {
        category = e.target.textContent;
        update();
        [...filters.children].find((b) => b.textContent === category)?.focus({ preventScroll: true });
      }
    };
    grid.onclick = (e) => {
      const b = e.target.closest("[data-launch]");
      if (b) launch(b.dataset.launch);
    };
    search.oninput = update;
    const close = () => {
      if (onClose) onClose();
      else {
        search.value = "";
        category = "All";
        update();
        search.focus();
      }
    };
    root.querySelector(".drawer-back").onclick = close;
    root.querySelector(".drawer-panel").onkeydown = (e) => {
      const buttons = [...grid.querySelectorAll("button")];
      if (e.key === "Enter" && e.target === search) {
        buttons[0]?.click();
        return;
      }
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (
        !["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key) ||
        (!grid.contains(e.target) && e.target !== search)
      )
        return;
      if (e.target === search && ["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault();
      const cols = Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(" ").length);
      const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }[e.key];
      const i =
        e.target === search
          ? 0
          : Math.max(0, Math.min(buttons.length - 1, buttons.indexOf(e.target) + delta));
      buttons[i]?.focus();
    };
    const options = root.querySelector(".drawer-options");
    options.onclick = () => {
      const old = root.querySelector(".drawer-more");
      if (old) {
        old.remove();
        options.setAttribute("aria-expanded", "false");
        return;
      }
      const more = document.createElement("div");
      more.className = "drawer-more popover";
      more.innerHTML = "<button>Refresh Applications</button>";
      options.parentElement.append(more);
      options.setAttribute("aria-expanded", "true");
      more.firstElementChild.onclick = () => {
        more.remove();
        options.setAttribute("aria-expanded", "false");
        search.value = "";
        category = "All";
        update();
        search.focus();
        announce("Applications refreshed");
      };
    };
    update();
  }
  function mountSettings(root, initialPane = "Appearance") {
    return window.NativeApps.mountSettings(root, {
      pref,
      setPref,
      preferences,
      icon,
      walls,
      title,
      initialPane,
    });
  }
  function mountMenu(slot, getItems) {
    const headings = ["File", "Edit", "View", "Go", "Window", "Help"];
    slot.innerHTML =
      '<div class="menubar"><button class="os-brand" data-menu="System" aria-label="System menu">' +
      icon("fruit") +
      icon("tux") +
      '</button><button class="app-menu" data-menu="Application">Desktop</button>' +
      headings
        .map((name) => '<button class="export-menu" data-menu="' + name + '">' + name + "</button>")
        .join("") +
      '<span class="bar-status">' +
      icon("wifi") +
      icon("battery") +
      icon("adjustments-horizontal") +
      "<time></time></span></div>";
    const buttons = [...slot.querySelectorAll("[data-menu]")];
    let popup = null,
      opener = null;
    function close(focus = false) {
      if (!popup) return false;
      popup.remove();
      popup = null;
      opener.setAttribute("aria-expanded", "false");
      if (focus) opener.focus();
      return true;
    }
    function show(b) {
      const was = b === opener && popup;
      close();
      if (was) return;
      opener = b;
      popup = document.createElement("div");
      popup.className = "popover";
      popup.setAttribute("aria-label", b.textContent + " menu");
      getItems(b.dataset.menu).forEach((entry) => {
        if (!entry) {
          popup.append(document.createElement("hr"));
          return;
        }
        const [label, action, shortcut] = entry;
        const row = document.createElement("button");
        row.innerHTML =
          "<span>" + escape(label) + "</span>" + (shortcut ? "<kbd>" + escape(shortcut) + "</kbd>" : "");
        row.disabled = !action;
        row.onclick = () => {
          close(true);
          action();
        };
        popup.append(row);
      });
      slot.append(popup);
      popup.style.top = slot.querySelector(".menubar").offsetHeight + "px";
      popup.style.left = Math.max(3, Math.min(b.offsetLeft, slot.clientWidth - popup.offsetWidth - 4)) + "px";
      b.setAttribute("aria-expanded", "true");
    }
    buttons.forEach((b) => {
      b.setAttribute("aria-expanded", "false");
      b.onclick = () => show(b);
      b.onkeydown = (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (!popup || opener !== b) show(b);
          popup?.firstElementChild?.focus();
        }
      };
    });
    slot.addEventListener("keydown", (e) => {
      if (!popup) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        close(true);
        return;
      }
      if (popup.contains(e.target) && ["ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        const rows = [...popup.querySelectorAll("button:not(:disabled)")];
        rows[(rows.indexOf(e.target) + (e.key === "ArrowDown" ? 1 : -1) + rows.length) % rows.length].focus();
      }
    });
    document.addEventListener("pointerdown", (e) => {
      if (!slot.contains(e.target)) close();
    });
    slot.addEventListener("focusout", (e) => {
      if (e.relatedTarget && !slot.contains(e.relatedTarget)) close();
    });
    return {
      close,
      show: (name) => show(buttons.find((b) => b.dataset.menu === name)),
      name: (value, exported = value === "Files" ? headings : []) => {
        if (slot.querySelector(".app-menu").textContent !== value) close();
        slot.querySelector(".app-menu").textContent = value;
        slot.querySelectorAll(".export-menu").forEach((b) => (b.hidden = !exported.includes(b.dataset.menu)));
      },
    };
  }
  function mountWeb(root) {
    root.innerHTML =
      '<div class="simple-app"><h4>Project bookmarks</h4><p class="small-copy">Project pages open in your browser.</p><div class="web-links"><a href="https://github.com/binbuf/dragonfruit" target="_blank" rel="noopener">Dragonfruit source</a><a href="https://github.com/binbuf/dragonfruit/tree/main/docs/design" target="_blank" rel="noopener">Design documents</a></div></div>';
  }
  function systemItems(about, settings, session) {
    return [
      ["About This System", about],
      null,
      ["System Settings", settings],
      ["App Store", null],
      null,
      ["Sleep", () => session("Sleep")],
      ["Restart…", () => session("Restart")],
      ["Shut Down…", () => session("Shut Down")],
      null,
      ["Lock Screen", () => session("Lock Screen"), "Super+Ctrl+Q"],
      ["Log Out Guest…", () => session("Log Out"), "Super+Shift+Q"],
    ];
  }
  function updateClocks() {
    document
      .querySelectorAll(".bar-status time")
      .forEach(
        (el) =>
          (el.textContent = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })),
      );
  }
  function mountFiles(root, state, initial = "Home") {
    return window.NativeApps.mountFiles(root, state, initial);
  }
  function mountCalendar(root) {
    const now = new Date(),
      month = new Date(now.getFullYear(), now.getMonth(), 1);
    function render() {
      const blanks = month.getDay(),
        days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      root.innerHTML =
        '<div class="simple-app"><div class="calendar-nav"><button data-month="-1" aria-label="Previous month">' +
        icon("chevron-left") +
        "</button><strong>" +
        month.toLocaleDateString("en-US", { month: "long", year: "numeric" }) +
        '</strong><button data-month="1" aria-label="Next month">' +
        icon("chevron-right") +
        '</button></div><div class="mini-calendar">' +
        ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => "<b>" + d + "</b>").join("") +
        "<span></span>".repeat(blanks) +
        Array.from(
          { length: days },
          (_, i) =>
            '<span class="' +
            (now.getFullYear() === month.getFullYear() &&
            now.getMonth() === month.getMonth() &&
            now.getDate() === i + 1
              ? "today"
              : "") +
            '">' +
            (i + 1) +
            "</span>",
        ).join("") +
        "</div></div>";
    }
    root.onclick = (e) => {
      const b = e.target.closest("[data-month]");
      if (b) {
        month.setMonth(month.getMonth() + Number(b.dataset.month));
        render();
        root.querySelector('[data-month="' + b.dataset.month + '"]').focus({ preventScroll: true });
      }
    };
    render();
  }
  function mountTerminal(root, state) {
    root.innerHTML =
      '<div class="term"><pre>Dragonfruit preview shell\nType help to list commands.\n</pre><form><label for="terminal-' +
      state.id +
      '">guest ~ $</label><input id="terminal-' +
      state.id +
      '" aria-label="Terminal command" autocomplete="off" spellcheck="false" maxlength="120"></form></div>';
    const log = root.querySelector("pre"),
      input = root.querySelector("input");
    root.querySelector("form").onsubmit = (e) => {
      e.preventDefault();
      const cmd = input.value.trim();
      input.value = "";
      if (!cmd) return;
      if (cmd === "clear") {
        log.textContent = "";
        return;
      }
      const replies = {
        help: "help  ls  pwd  date  clear",
        ls: state.folders.join("  "),
        pwd: "/home/guest",
        date: new Date().toLocaleString(),
      };
      log.textContent +=
        "guest ~ $ " +
        cmd +
        "\n" +
        (Object.hasOwn(replies, cmd) ? replies[cmd] : "Unknown preview command. Type help.") +
        "\n";
      input.scrollIntoView({ block: "nearest" });
    };
  }
  function mountGallery(root) {
    let index = walls.indexOf(pref.wall);
    function render() {
      const wall = walls[index];
      root.innerHTML =
        '<div class="viewer"><img class="viewer-img" src="../dragonfruit/assets/' +
        wall +
        '.webp" alt="' +
        title(wall) +
        ' wallpaper"><div class="gallery-actions"><button data-gallery="-1" aria-label="Previous picture">' +
        icon("chevron-left") +
        "</button><strong>" +
        title(wall) +
        '</strong><button data-gallery="1" aria-label="Next picture">' +
        icon("chevron-right") +
        "</button></div></div>";
    }
    root.onclick = (e) => {
      const b = e.target.closest("[data-gallery]");
      if (b) {
        index = (index + Number(b.dataset.gallery) + walls.length) % walls.length;
        render();
        root.querySelector('[data-gallery="' + b.dataset.gallery + '"]').focus({ preventScroll: true });
      }
    };
    render();
  }
  return {
    icon,
    escape,
    apps,
    walls,
    title,
    pref,
    announce,
    applyPreferences,
    setSurfaceWallpaper,
    setPref,
    art,
    mountDock,
    mountWeb,
    systemItems,
    traffic,
    titlebar,
    folder,
    mountDrawer,
    mountSettings,
    mountMenu,
    updateClocks,
    mountFiles,
    mountCalendar,
    mountTerminal,
    mountGallery,
  };
})();
