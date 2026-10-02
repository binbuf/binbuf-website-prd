/* Interactive browser counterparts of the Files and System Settings Qt Quick shells. */
"use strict";
window.NativeApps = (() => {
  const directoryData = new WeakMap();
  const trashContents = new WeakMap();
  const mounted = new WeakMap();
  const fileCommands = new WeakMap();
  const catalog = window.DFSettingsCatalog;
  const panes = catalog.categories;
  let settingsWindowCount = 0;
  const colors = [
    ["Blue", "#357bf1"],
    ["Purple", "#af6ce8"],
    ["Pink", "#ec6ea6"],
    ["Red", "#ec625d"],
    ["Orange", "#ed9a46"],
    ["Yellow", "#e3bc3c"],
    ["Green", "#a1d677"],
    ["Graphite", "#8b9196"],
  ];
  const placeIcons = {
    Home: "user-home",
    Desktop: "user-desktop",
    Documents: "folder-documents",
    Downloads: "folder-download",
    Pictures: "folder-images",
    Music: "folder-music",
    Videos: "folder-videos",
    Trash: "user-trash",
    Computer: "computer",
  };
  const quote = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const ico = (name) => '<svg aria-hidden="true" class="nf-icon"><use href="#i-' + name + '"></use></svg>';
  const image = (name, cls = "") =>
    '<img class="nf-place-img ' + cls + '" src="../dragonfruit/assets/native/' + name + '.svg" alt="" draggable="false">';
  const art = (name) => image(placeIcons[name] || "folder");
  const tool = (action, label, glyph) =>
    '<button type="button" class="nf-tool" data-na="' +
    action +
    '" aria-label="' +
    quote(label) +
    '" title="' +
    quote(label) +
    '">' +
    ico(glyph) +
    "</button>";
  const traffic = () =>
    '<div class="nf-traffic">' +
    [
      ["close", "Close", "x"],
      ["minimize", "Minimize", "minus"],
      ["zoom", "Zoom", "maximize"],
    ]
      .map(
        ([id, label, glyph]) =>
          '<button type="button" data-capture="' +
          id +
          '" title="' +
          label +
          ' window" aria-label="' +
          label +
          ' window"><i>' +
          ico(glyph) +
          "</i></button>",
      )
      .join("") +
    "</div>";

  function chrome(root, kind, title, sidebar, toolbar) {
    mounted.get(root)?.();
    const owned = !root.closest(".sim-window,.drawer-app-body");
    const external = !!root.closest(".sim-window");
    root.classList.add("native-app-host");
    root.classList.toggle("nf-standalone", owned);
    root.innerHTML =
      '<div class="df-native na-' +
      kind +
      (external ? " nf-external" : "") +
      '" role="group" aria-label="' +
      title +
      '">' +
      '<div class="nf-frame"><aside class="nf-side"><div class="nf-top-left">' +
      (external ? "" : owned ? traffic() : '<span class="nf-side-title">' + title + "</span>") +
      "</div>" +
      sidebar +
      '</aside><section class="nf-pane"><div class="nf-toolbar">' +
      '<button type="button" class="nf-toggle-side nf-tool" data-na="sidebar" aria-label="Show sidebar" title="Show sidebar">' +
      ico("layout-navbar") +
      "</button>" +
      toolbar +
      '</div><div class="nf-content"></div></section></div></div>' +
      (owned ? '<button type="button" class="nf-reopen" hidden>Reopen ' + title + "</button>" : "");
    const frame = root.querySelector(".df-native");
    const abort = new AbortController();
    const on = (node, evt, fn) => node.addEventListener(evt, fn, { signal: abort.signal });
    const sidebarToggle = frame.querySelector(".nf-toggle-side");
    const sidebarContents = [...frame.querySelector(".nf-side").children].filter(
      (el) => !el.classList.contains("nf-top-left"),
    );
    function syncSidebar() {
      const compact = frame.clientWidth < 400;
      const open = frame.classList.contains("nf-side-open");
      sidebarToggle.setAttribute("aria-expanded", String(!compact || open));
      sidebarToggle.setAttribute("aria-label", open ? "Hide sidebar" : "Show sidebar");
      if (kind === "settings") sidebarContents.forEach((el) => (el.inert = compact && !open));
    }
    const observer = kind === "settings" ? new ResizeObserver(syncSidebar) : null;
    observer?.observe(frame);
    const dispose = () => {
      abort.abort();
      observer?.disconnect();
      mounted.delete(root);
    };
    mounted.set(root, dispose);
    on(root, "click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.na === "sidebar") {
        frame.classList.toggle("nf-side-open");
        syncSidebar();
      }
      if (b.dataset.capture) {
        if (b.dataset.capture === "zoom") frame.classList.toggle("nf-zoom");
        else {
          frame.hidden = true;
          const reopen = root.querySelector(".nf-reopen");
          reopen.textContent = (b.dataset.capture === "minimize" ? "Restore " : "Reopen ") + title;
          reopen.hidden = false;
          reopen.focus({ preventScroll: true });
        }
      }
      if (b.matches(".nf-reopen")) {
        b.hidden = true;
        frame.hidden = false;
        frame.querySelector("button")?.focus({ preventScroll: true });
      }
    });
    syncSidebar();
    return { frame, on, dispose, syncSidebar, content: frame.querySelector(".nf-content") };
  }

  function mountSettings(root, api) {
    const { pref, setPref, preferences, walls, title } = api;
    const radioName = "os-menu-glyph-" + ++settingsWindowCount;
    const model = catalog.modelFor(pref);
    const paneButton = (pane) =>
      '<button type="button" class="nf-side-item" data-pane="' +
      quote(pane.name) +
      '"><i class="nf-setting-icon" style="--tile-start:' +
      pane.start +
      ";--tile-end:" +
      pane.end +
      '"><img src="../dragonfruit/assets/native/settings/' +
      pane.glyph +
      '-fill.svg" alt=""></i><span>' +
      quote(pane.name) +
      "</span></button>";
    const sections = ["connectivity", "desktop", "input"]
      .map(
        (id) =>
          '<div class="nf-category-section" role="group" aria-label="' +
          id.charAt(0).toUpperCase() +
          id.slice(1) +
          '">' +
          panes
            .filter((pane) => pane.group === id)
            .map(paneButton)
            .join("") +
          "</div>",
      )
      .join("");
    const sidebar =
      '<label class="nf-search nf-settings-search">' +
      ico("search") +
      '<input type="search" placeholder="Search" aria-label="Search System Settings" autocomplete="off"></label><div class="nf-side-list">' +
      sections +
      '</div><p class="nf-no-panes" hidden>No matching settings</p>';
    const toolbar =
      '<div class="nf-tools nf-history">' +
      tool("back", "Go back", "chevron-left") +
      tool("forward", "Go forward", "chevron-right") +
      '</div><strong class="nf-page-title"></strong>';
    const { frame, content, on, dispose, syncSidebar } = chrome(
      root,
      "settings",
      "System Settings",
      sidebar,
      toolbar,
    );
    const search = frame.querySelector('input[type="search"]');
    const requested = panes.find((pane) => pane.id === api.initialPane || pane.name === api.initialPane);
    const history =
      String(api.initialPane || "").toLowerCase() === "storage"
        ? ["General", "Storage"]
        : [requested?.name || "Appearance"];
    let cursor = history.length - 1;
    const prefButton = (key, value, label, body, cls) =>
      '<button type="button" class="nf-choice ' +
      cls +
      '" data-pref="' +
      key +
      '" data-value="' +
      quote(value) +
      '" aria-label="' +
      quote(label) +
      '">' +
      body +
      "</button>";
    const group = (name, inner) =>
      '<section class="nf-group"><h5>' + name + '</h5><div class="nf-card">' + inner + "</div></section>";
    const menuMark = (id) =>
      '<img class="nf-mark" src="../dragonfruit/assets/' + (id === "tux" ? "native/tux" : "dragonfruit") + '.svg" alt="">';
    function appearance() {
      const modes = ["Light", "Dark", "Auto"]
        .map((mode) =>
          prefButton(
            "appearance",
            mode,
            mode + " appearance",
            '<i class="nf-mode-sample mode-' +
              mode.toLowerCase() +
              '"><span></span></i><span>' +
              mode +
              "</span>",
            "nf-appearance",
          ),
        )
        .join("");
      return (
        group("Appearance", '<div class="nf-mode-list">' + modes + "</div>") +
        group(
          "Glass",
          '<div class="nf-glass-preview"><div class="nf-attached-sample">' +
            ico("search") +
            '<span>Search</span></div></div><div class="nf-setting-row"><label>Glass tint<input type="range" aria-label="Glass tint for attached menus" min="0" max="1" step="0.01" data-range="glassTint"></label></div>',
        ) +
        group(
          "Theme",
          '<div class="nf-setting-row"><span>Accent color</span><div class="nf-colors">' +
            colors
              .map(([name, c]) =>
                prefButton(
                  "accent",
                  c,
                  name + " accent",
                  '<i style="background:' + c + '"></i>',
                  "nf-swatch",
                ),
              )
              .join("") +
            "</div></div>",
        )
      );
    }
    function wallpaper() {
      return (
        '<div class="nf-wall-hero"><img alt="" src="../dragonfruit/assets/' +
        quote(pref.wall) +
        '.webp"><div><strong>' +
        quote(title(pref.wall)) +
        "</strong><small>Current wallpaper</small></div></div>" +
        group(
          "Built-in",
          '<div class="nf-walls">' +
            walls
              .map((w) =>
                prefButton(
                  "wall",
                  w,
                  title(w) + " wallpaper",
                  '<img src="../dragonfruit/assets/' + quote(w) + '.webp" alt=""><span>' + quote(title(w)) + "</span>",
                  "nf-wall",
                ),
              )
              .join("") +
            "</div>",
        )
      );
    }
    function dock() {
      return group(
        "Dock",
        '<div class="nf-setting-row"><label>Dock size<input aria-label="Dock size" type="range" min="0.80" max="1.18" step="0.01" value="' +
          Number(pref.size) +
          '" data-range="size"></label></div>' +
          '<div class="nf-setting-row"><label>Magnification<input type="checkbox" data-switch="magnification" role="switch"' +
          (pref.magnification !== false ? " checked" : "") +
          "></label></div>",
      );
    }
    function glyphs() {
      const options = [
        ["dragonfruit", "Dragonfruit", "Project mark"],
        ["tux", "Tux", "Linux penguin"],
      ];
      return (
        '<fieldset class="nf-glyph-field"><legend>OS Menu Glyph</legend>' +
        '<div class="nf-glyph-cards">' +
        options
          .map(
            ([id, name, caption]) =>
              '<label class="nf-glyph-card nf-glyph-' +
              id +
              '">' +
              '<input type="radio" name="' +
              radioName +
              '" data-os-option="' +
              id +
              '" data-value="' +
              id +
              '" value="' +
              id +
              '" aria-label="' +
              name +
              ' menu glyph">' +
              '<span class="nf-glyph-art" aria-hidden="true">' +
              menuMark(id) +
              '</span><span class="nf-glyph-caption"><strong>' +
              name +
              "</strong><small>" +
              caption +
              '</small></span><i class="nf-glyph-check" aria-hidden="true">' +
              ico("check") +
              "</i></label>",
          )
          .join("") +
        "</div></fieldset>" +
        '<div class="nf-bar-sample" aria-label="Menu bar preview"><span data-live-os></span><strong>Files</strong><span>File</span><span>Edit</span><span>View</span>' +
        ico("wifi") +
        "</div>"
      );
    }
    function sync() {
      const glyph = pref.osGlyph === "tux" ? "tux" : "dragonfruit";
      frame.querySelectorAll("[data-os-option]").forEach((radio) => (radio.checked = radio.value === glyph));
      const strip = frame.querySelector("[data-live-os]");
      if (strip && strip.dataset.liveOs !== glyph) {
        strip.dataset.liveOs = glyph;
        strip.innerHTML = menuMark(glyph);
      }
      frame.querySelectorAll("[data-pref]").forEach((b) => {
        const key = b.dataset.pref;
        const current = key === "osGlyph" ? pref.osGlyph || "dragonfruit" : pref[key];
        b.setAttribute("aria-pressed", String(current === b.dataset.value));
      });
      frame.querySelectorAll("[data-range]").forEach((slider) => {
        slider.value = Number(pref[slider.dataset.range] ?? 0.5255);
      });
      frame.style.setProperty("--nf-menu-tint", String(0.78 - 0.39 * Number(pref.glassTint ?? 0.5255)));
      const toggle = frame.querySelector("[data-switch]");
      if (toggle) toggle.checked = pref.magnification !== false;
      const hero = frame.querySelector(".nf-wall-hero");
      if (hero) {
        hero.querySelector("img").src = "../dragonfruit/assets/" + pref.wall + ".webp";
        hero.querySelector("strong").textContent = title(pref.wall);
      }
    }
    function render() {
      const name = history[cursor];
      frame.querySelector(".nf-page-title").textContent = name;
      frame
        .querySelectorAll("[data-pane]")
        .forEach((b) =>
          b.setAttribute(
            "aria-current",
            b.dataset.pane === (name === "Storage" ? "General" : name) ? "page" : "false",
          ),
        );
      frame.querySelector('[data-na="back"]').disabled = cursor === 0;
      frame.querySelector('[data-na="forward"]').disabled = cursor === history.length - 1;
      const page = name === "Storage" ? { id: "storage" } : panes.find((pane) => pane.name === name);
      const custom = {
        Appearance: appearance,
        Wallpaper: wallpaper,
        "Desktop & Dock": dock,
        "Menu Bar": glyphs,
      }[name];
      content.innerHTML =
        '<div class="nf-settings-body" data-category="' +
        page.id +
        '">' +
        (custom ? custom() : catalog.render(page.id, model)) +
        "</div>";
      catalog.sync(frame, model);
      const selected = frame.querySelector('[data-pane][aria-current="page"]');
      const list = frame.querySelector(".nf-side-list");
      if (selected && !selected.hidden && list.clientHeight) {
        const within = selected.getBoundingClientRect().top - list.getBoundingClientRect().top;
        if (within < 0 || within > list.clientHeight - selected.offsetHeight) {
          list.scrollTop += within - list.clientHeight / 2 + selected.offsetHeight / 2;
        }
      }
      content.scrollTop = 0;
      sync();
    }
    function navigate(name) {
      if (name !== history[cursor]) {
        history.splice(cursor + 1, Infinity, name);
        cursor++;
      }
      frame.classList.remove("nf-side-open");
      syncSidebar();
      render();
    }
    on(frame, "click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.pad) {
        b.parentElement.querySelector('[role="status"]').textContent = b.dataset.pad + " pressed";
      } else if (b.dataset.catalogAction === "sound") catalog.playTone(frame, model);
      else if (b.dataset.subpane) navigate(b.dataset.subpane);
      else if (b.dataset.pane) navigate(b.dataset.pane);
      else if (b.dataset.pref) setPref(b.dataset.pref, b.dataset.value);
      else if (["back", "forward"].includes(b.dataset.na)) {
        cursor += b.dataset.na === "back" ? -1 : 1;
        render();
      }
    });
    on(frame, "input", (e) => {
      if (e.target.dataset.range) setPref(e.target.dataset.range, Number(e.target.value));
      if (e.target.dataset.setting) {
        const control = e.target;
        model[control.dataset.setting] =
          control.type === "checkbox"
            ? control.checked
            : control.type === "range"
              ? Number(control.value)
              : control.value;
        preferences.dispatchEvent(new Event("catalogchange"));
      }
      if (e.target === search) {
        const query = search.value.toLowerCase().trim();
        const buttons = [...frame.querySelectorAll("[data-pane]")];
        buttons.forEach(
          (b, i) => (b.hidden = ![panes[i].name, panes[i].terms].join(" ").toLowerCase().includes(query)),
        );
        frame
          .querySelectorAll(".nf-category-section")
          .forEach((group) => (group.hidden = !group.querySelector("[data-pane]:not([hidden])")));
        frame.querySelector(".nf-no-panes").hidden = buttons.some((b) => !b.hidden);
      }
    });
    on(frame, "change", (e) => {
      if (e.target.dataset.switch) setPref("magnification", e.target.checked);
      if (e.target.dataset.osOption && e.target.checked) setPref("osGlyph", e.target.value);
    });
    on(search, "keydown", (e) => {
      if (e.key === "Enter") frame.querySelector("[data-pane]:not([hidden])")?.click();
    });
    on(preferences, "change", sync);
    on(preferences, "catalogchange", () => catalog.sync(frame, model));
    render();
    return dispose;
  }

  const isPicture = (name) => /\.webp$/i.test(name);
  const fileKind = (name) => (isPicture(name) ? "Image" : "Text document");
  function nativeTree(state) {
    if (!directoryData.has(state)) {
      const tree = new Map(
        Object.entries({
          Documents: ["Field notes.txt"],
          Pictures: ["Default.webp", "Lagoon.webp", "Midnight.webp"],
          Projects: ["Ideas", "References"],
        }),
      );
      if (Array.isArray(state.desktopFolders)) {
        tree.set("Desktop", state.desktopFolders);
        if (state.desktopFolders.includes("Projects")) tree.set("Desktop/Projects", ["Ideas", "References"]);
      }
      directoryData.set(state, tree);
      trashContents.set(state, new Map());
    }
    return directoryData.get(state);
  }
  function availableName(names, base) {
    let result = base;
    for (let n = 2; names.includes(result); n++) result = base + " (" + n + ")";
    return result;
  }
  function trashFolder(state, parent, name) {
    const tree = nativeTree(state),
      siblings = parent ? tree.get(parent) : state.folders;
    const index = siblings?.indexOf(name) ?? -1;
    if (index < 0) return false;
    const key = [parent, name].filter(Boolean).join("/");
    const contents = new Map();
    for (const [p, items] of tree) {
      if (p === key || p.startsWith(key + "/")) {
        contents.set(p.slice(key.length), items);
        tree.delete(p);
      }
    }
    siblings.splice(index, 1);
    state.trash ||= [];
    const label = availableName(state.trash, name);
    state.trash.push(label);
    trashContents.get(state).set(label, { parent, name, contents });
    return true;
  }
  function restoreTrash(state, label) {
    const index = state.trash?.indexOf(label) ?? -1;
    if (index < 0) return "";
    const tree = nativeTree(state),
      saved = trashContents.get(state).get(label);
    const parent = saved && tree.has(saved.parent) ? saved.parent : "";
    const siblings = parent ? tree.get(parent) : state.folders;
    const name = availableName(siblings, saved?.name || label);
    const key = [parent, name].filter(Boolean).join("/");
    siblings.push(name);
    for (const [suffix, items] of saved?.contents || []) tree.set(key + suffix, items);
    state.trash.splice(index, 1);
    trashContents.get(state).delete(label);
    return name;
  }
  function mountFiles(root, state, initial = "Home") {
    state ||= {};
    state.folders ||= ["Documents", "Downloads", "Pictures", "Projects"];
    state.trash ||= [];
    const files = nativeTree(state);
    const favorites = ["Desktop", "Documents", "Downloads", "Pictures", "Music", "Videos"];
    const sidebar =
      '<div class="nf-source-list"><h5>Favorites</h5>' +
      favorites
        .map(
          (name) =>
            '<button type="button" class="nf-side-item" data-place="' +
            name +
            '">' +
            art(name) +
            "<span>" +
            name +
            "</span></button>",
        )
        .join("") +
      "<h5>Locations</h5>" +
      ["Home", "Computer", "Trash"]
        .map(
          (name) =>
            '<button type="button" class="nf-side-item" data-place="' +
            name +
            '">' +
            art(name) +
            "<span>" +
            name +
            "</span></button>",
        )
        .join("") +
      "</div>";
    const toolbar =
      '<div class="nf-tools nf-history">' +
      tool("back", "Go back", "chevron-left") +
      tool("forward", "Go forward", "chevron-right") +
      '</div><strong class="nf-page-title"></strong><div class="nf-spacer"></div><div class="nf-tools nf-views">' +
      tool("grid", "Icon view", "layout-grid") +
      tool("list", "List view", "list") +
      '</div><button type="button" data-na="actions" class="nf-tool nf-dots" aria-label="File actions" title="File actions">···</button>' +
      tool("search", "Search this folder", "search");
    const { frame, content, on, dispose } = chrome(root, "files", "Files", sidebar, toolbar);
    content.innerHTML =
      '<div class="nf-file-search" hidden><label class="nf-search">' +
      ico("search") +
      '<input type="search" placeholder="Search this folder" aria-label="Filter files"></label></div><div class="nf-browser" tabindex="0" aria-label="Folder contents"></div><div class="nf-footer"><div class="nf-path"></div><span class="nf-count"></span></div>';
    const browser = content.querySelector(".nf-browser"),
      searchBox = content.querySelector(".nf-file-search"),
      search = searchBox.querySelector("input");
    const starts = initial === "Home" ? [] : String(initial).split("/").filter(Boolean);
    const history = [[...starts]];
    let cursor = 0,
      mode = "grid",
      selected = "",
      selectKind = "",
      popup = null,
      inspector = null;
    const selection = new Set();
    const loc = () => history[cursor],
      label = () => loc().at(-1) || "Home",
      key = () => loc().join("/");
    function entries() {
      if (label() === "Trash") return state.trash;
      if (label() === "Computer") return ["Home"];
      return loc().length === 0 ? state.folders : files.get(key()) || [];
    }
    function childArray() {
      if (!loc().length) return state.folders;
      if (!files.has(key())) files.set(key(), []);
      return files.get(key());
    }
    const kind = (name) =>
      files.has([...loc(), name].join("/")) || !/\.(txt|webp)$/i.test(name) ? "Folder" : fileKind(name);
    const fileArt = (name) =>
      kind(name) === "Folder"
        ? art(name)
        : isPicture(name)
          ? '<img class="nf-thumb" src="../dragonfruit/assets/' +
            quote(name.slice(0, -5).toLowerCase()) +
            '.webp" alt="" draggable="false">'
          : '<i class="nf-document-art">' + ico("file-text") + "</i>";
    function closePopup() {
      popup?.remove();
      popup = null;
    }
    function closeInspector() {
      inspector?.remove();
      inspector = null;
    }
    function renderListing() {
      const all = entries();
      const shown = all.filter((n) => n.toLowerCase().includes(search.value.toLowerCase().trim()));
      browser.dataset.view = mode;
      browser.innerHTML =
        (mode === "list" && shown.length
          ? '<div class="nf-list-head"><span>Name</span><span>Kind</span></div>'
          : "") +
        (shown.length
          ? '<div class="nf-entries">' +
            shown
              .map(
                (name) =>
                  '<button type="button" class="nf-entry" data-entry="' +
                  quote(name) +
                  '" aria-pressed="' +
                  selection.has(name) +
                  '" title="' +
                  quote(name) +
                  '">' +
                  fileArt(name) +
                  "<span>" +
                  quote(name) +
                  "</span><small>" +
                  kind(name) +
                  "</small></button>",
              )
              .join("") +
            "</div>"
          : '<div class="nf-no-files">' +
            ico(search.value ? "search" : label() === "Trash" ? "trash" : "folder") +
            "<span>" +
            (search.value
              ? "No matching items"
              : label() === "Trash"
                ? "Trash is empty"
                : "This folder is empty") +
            "</span></div>");
      content.querySelector(".nf-count").textContent =
        shown.length + (shown.length === 1 ? " item" : " items");
    }
    function render() {
      closePopup();
      closeInspector();
      frame.querySelector(".nf-page-title").textContent = label();
      frame.querySelector('[data-na="back"]').disabled = cursor === 0;
      frame.querySelector('[data-na="forward"]').disabled = cursor === history.length - 1;
      frame
        .querySelectorAll(".nf-views button")
        .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.na === mode)));
      frame.querySelectorAll("[data-place]").forEach((b) => {
        b.setAttribute("aria-current", b.dataset.place === label() ? "page" : "false");
        b.hidden =
          favorites.includes(b.dataset.place) &&
          b.dataset.place !== "Home" &&
          !state.folders.includes(b.dataset.place);
      });
      const path = ["Home", ...loc()];
      content.querySelector(".nf-path").innerHTML = path
        .map(
          (name, i) =>
            (i ? ico("chevron-right") : "") +
            '<button type="button" data-crumb="' +
            i +
            '">' +
            (i === 0 ? art("Home") : "") +
            quote(name) +
            "</button>",
        )
        .join("");
      renderListing();
    }
    function navigate(path) {
      if (JSON.stringify(loc()) !== JSON.stringify(path)) {
        history.splice(cursor + 1, Infinity, path);
        cursor++;
      }
      selected = "";
      selectKind = "";
      selection.clear();
      search.value = "";
      searchBox.hidden = true;
      frame.classList.remove("nf-side-open");
      render();
    }
    function markSelection() {
      selected = [...selection].at(-1) || "";
      selectKind = selected ? kind(selected) : "";
      browser
        .querySelectorAll("[data-entry]")
        .forEach((b) => b.setAttribute("aria-pressed", String(selection.has(b.dataset.entry))));
    }
    function choose(name, toggle = false) {
      if (!toggle) selection.clear();
      if (name) {
        if (toggle && selection.has(name)) selection.delete(name);
        else selection.add(name);
      }
      markSelection();
    }
    function dismissInspector() {
      closeInspector();
      browser.focus({ preventScroll: true });
    }
    function panel(title, body) {
      closePopup();
      closeInspector();
      inspector = document.createElement("div");
      inspector.className = "nf-modal-wrap";
      inspector.innerHTML =
        '<section class="nf-modal" role="dialog" aria-label="' +
        quote(title) +
        '"><header><strong>' +
        quote(title) +
        "</strong>" +
        tool("dismiss", "Close dialog", "x") +
        "</header>" +
        body +
        "</section>";
      frame.append(inspector);
      (inspector.querySelector("input, .nf-modal-confirm") || inspector.querySelector("button")).focus({
        preventScroll: true,
      });
      return inspector;
    }
    function openEntry() {
      if (!selected || selection.size !== 1) return;
      if (label() === "Trash") {
        showInfo();
        return;
      }
      if (selectKind === "Folder") {
        navigate(label() === "Computer" ? [] : [...loc(), selected]);
        return;
      }
      panel(
        selected,
        isPicture(selected)
          ? '<img class="nf-preview-img" src="../dragonfruit/assets/' +
              quote(selected.slice(0, -5).toLowerCase()) +
              '.webp" alt="' +
              quote(selected) +
              '">'
          : '<article class="nf-preview-note"><h5>Field notes</h5><p>The ridge catches the first light. Follow the trail along the water and keep the afternoon free.</p></article>',
      );
    }
    function showInfo() {
      if (selection.size > 1) {
        const counts = [...selection].reduce((result, name) => {
          const type = kind(name);
          result[type] = (result[type] || 0) + 1;
          return result;
        }, {});
        panel(
          "Get Info",
          '<div class="nf-info-hero">' +
            art("folder") +
            "<strong>" +
            selection.size +
            ' items</strong></div><dl class="nf-info">' +
            Object.entries(counts)
              .map(([type, count]) => "<dt>" + type + "</dt><dd>" + count + "</dd>")
              .join("") +
            "</dl>",
        );
        return;
      }
      const name = selected || label();
      panel(
        "Get Info",
        '<div class="nf-info-hero">' +
          fileArt(name) +
          "<strong>" +
          quote(name) +
          '</strong></div><dl class="nf-info"><dt>Kind</dt><dd>' +
          kind(name) +
          "</dd><dt>Where</dt><dd>" +
          quote(["Home", ...loc()].join(" / ")) +
          "</dd></dl>",
      );
    }
    function notifyChange() {
      root.dispatchEvent(new CustomEvent("nativefileschange", { bubbles: true, detail: { state } }));
    }
    function renameTree(oldKey, newKey) {
      [...files].forEach(([path, value]) => {
        if (path === oldKey || path.startsWith(oldKey + "/")) {
          files.set(newKey + path.slice(oldKey.length), value);
          files.delete(path);
        }
      });
    }
    function editName(rename) {
      const old = selected;
      const dialog = panel(
        rename ? "Rename" : "New Folder",
        '<form class="nf-name-form"><label>' +
          (rename ? "Folder name" : "Name") +
          '<input type="text" required maxlength="100" aria-label="Folder name"></label><small role="status"></small><button type="submit" class="nf-modal-confirm">' +
          (rename ? "Rename" : "Create") +
          "</button></form>",
      );
      const input = dialog.querySelector("input");
      input.value = rename ? old : "Untitled Folder";
      input.select();
      dialog.querySelector("form").onsubmit = (e) => {
        e.preventDefault();
        const name = input.value.trim(),
          array = childArray();
        if (
          !name ||
          /[\\/]/.test(name) ||
          name === "." ||
          name === ".." ||
          ((name !== old || !rename) && array.includes(name))
        ) {
          dialog.querySelector('[role="status"]').textContent =
            "Choose a unique folder name without a slash.";
          return;
        }
        if (rename) {
          if (old !== name) {
            array[array.indexOf(old)] = name;
            renameTree([...loc(), old].join("/"), [...loc(), name].join("/"));
          }
        } else array.push(name);
        const newKey = [...loc(), name].join("/");
        if (!files.has(newKey)) files.set(newKey, []);
        choose(name);
        render();
        notifyChange();
      };
    }
    function moveTrash() {
      [...selection].forEach((name) => {
        if (kind(name) === "Folder") trashFolder(state, key(), name);
      });
      choose("");
      render();
      notifyChange();
    }
    function restore() {
      [...selection].forEach((name) => restoreTrash(state, name));
      choose("");
      render();
      notifyChange();
    }
    function context(x, y) {
      closePopup();
      const actions =
        label() === "Trash"
          ? selected
            ? [
                ["Put Back", restore],
                ["Get Info", showInfo],
              ]
            : []
          : selected
            ? [
                ...(selection.size === 1 ? [["Open", openEntry]] : []),
                ["Get Info", showInfo],
                ...([...selection].every((n) => kind(n) === "Folder") && label() !== "Computer"
                  ? [
                      ...(selection.size === 1 ? [["Rename…", () => editName(true)]] : []),
                      ["Move to Trash", moveTrash],
                    ]
                  : []),
              ]
            : [
                ...(label() !== "Computer" ? [["New Folder…", () => editName(false)]] : []),
                ["Get Info", showInfo],
              ];
      if (!actions.length) return;
      popup = document.createElement("div");
      popup.className = "nf-context";
      popup.setAttribute("role", "menu");
      actions.forEach(([name, action]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = name;
        b.setAttribute("role", "menuitem");
        b.onclick = () => {
          closePopup();
          action();
        };
        popup.append(b);
      });
      frame.append(popup);
      const r = frame.getBoundingClientRect();
      popup.style.left = Math.max(4, Math.min(x - r.left, r.width - popup.offsetWidth - 4)) + "px";
      popup.style.top = Math.max(4, Math.min(y - r.top, r.height - popup.offsetHeight - 4)) + "px";
      popup.firstElementChild.focus({ preventScroll: true });
    }
    on(frame, "pointerdown", (e) => {
      if (popup && !popup.contains(e.target) && !e.target.closest('[data-na="actions"]')) closePopup();
    });
    on(frame, "focusout", (e) => {
      if (popup && e.relatedTarget && !popup.contains(e.relatedTarget)) closePopup();
    });
    on(frame, "contextmenu", (e) => {
      if (!browser.contains(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      const name = e.target.closest("[data-entry]")?.dataset.entry || "";
      if (!selection.has(name)) choose(name);
      context(e.clientX, e.clientY);
    });
    on(frame, "click", (e) => {
      const b = e.target.closest("button");
      if (!b) {
        if (browser.contains(e.target)) choose("");
        return;
      }
      if (b.dataset.entry) {
        choose(b.dataset.entry, e.ctrlKey || e.metaKey);
        if (e.pointerType === "touch" || e.detail === 0) openEntry();
      } else if (b.dataset.place) navigate(b.dataset.place === "Home" ? [] : [b.dataset.place]);
      else if (b.dataset.crumb !== undefined) navigate(loc().slice(0, Number(b.dataset.crumb)));
      else
        switch (b.dataset.na) {
          case "grid":
          case "list":
            mode = b.dataset.na;
            render();
            break;
          case "back":
          case "forward":
            cursor += b.dataset.na === "back" ? -1 : 1;
            choose("");
            search.value = "";
            searchBox.hidden = true;
            render();
            break;
          case "actions": {
            if (popup) {
              closePopup();
              break;
            }
            const r = b.getBoundingClientRect();
            context(r.left, r.bottom + 4);
            break;
          }
          case "search":
            searchBox.hidden = !searchBox.hidden;
            if (searchBox.hidden) {
              search.value = "";
              renderListing();
            } else search.focus({ preventScroll: true });
            break;
          case "dismiss":
            dismissInspector();
            break;
        }
    });
    on(browser, "dblclick", (e) => {
      if (e.target.closest("[data-entry]")) openEntry();
    });
    on(search, "input", renderListing);
    on(frame, "keydown", (e) => {
      if (e.key === "Escape" && (inspector || popup || !searchBox.hidden)) {
        e.preventDefault();
        e.stopPropagation();
        closePopup();
        closeInspector();
        searchBox.hidden = true;
        search.value = "";
        renderListing();
        browser.focus({ preventScroll: true });
      } else if (popup && ["ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        const rows = [...popup.children];
        rows[
          (rows.indexOf(document.activeElement) + (e.key === "ArrowDown" ? 1 : -1) + rows.length) %
            rows.length
        ].focus({ preventScroll: true });
      } else if (!inspector && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchBox.hidden = false;
        search.focus({ preventScroll: true });
      } else if (browser.contains(e.target) && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        commands.selectAll();
      } else if (
        browser.contains(e.target) &&
        e.key === "F2" &&
        selection.size === 1 &&
        selectKind === "Folder" &&
        !["Trash", "Computer"].includes(label())
      ) {
        e.preventDefault();
        editName(true);
      }
    });
    const toolbarCommand = (name) => {
      const button = frame.querySelector('[data-na="' + name + '"]');
      if (button && !button.disabled) button.click();
    };
    const commands = {
      icons: () => toolbarCommand("grid"),
      grid: () => toolbarCommand("grid"),
      list: () => toolbarCommand("list"),
      back: () => toolbarCommand("back"),
      forward: () => toolbarCommand("forward"),
      home: () => navigate([]),
      search: () => {
        searchBox.hidden = false;
        search.focus({ preventScroll: true });
      },
      newFolder: () => {
        if (!["Trash", "Computer"].includes(label())) editName(false);
      },
      selectAll: () => {
        selection.clear();
        browser.querySelectorAll("[data-entry]").forEach((b) => selection.add(b.dataset.entry));
        markSelection();
      },
      open: openEntry,
      getInfo: showInfo,
    };
    fileCommands.set(root, commands);
    render();
    return dispose;
  }
  function fileCommand(root, command) {
    const handler = fileCommands.get(root)?.[command];
    if (typeof handler !== "function") return false;
    handler();
    return true;
  }
  return { mountFiles, mountSettings, fileCommand, trashFolder, restoreTrash };
})();
