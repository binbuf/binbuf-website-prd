"use strict";
(() => {
  const {
    icon,
    escape,
    apps,
    walls,
    title,
    announce,
    setPref,
    mountDock,
    titlebar,
    folder,
    mountDrawer,
    mountSettings,
    mountMenu,
    mountFiles,
    mountCalendar,
    mountTerminal,
    mountGallery,
  } = Desktop;
  const q = (s) => document.querySelector(s);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const theme = q(".theme-switch");
  function syncTheme() {
    const light = document.documentElement.dataset.theme === "light";
    theme.innerHTML = icon(light ? "moon" : "sun");
    theme.title = light ? "Switch to dark mode" : "Switch to light mode";
    theme.setAttribute("aria-label", theme.title);
    const color = getComputedStyle(document.documentElement).getPropertyValue("--header").trim();
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => { meta.content = color; });
  }
  theme.onclick = () => {
    const value = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = value;
    try {
      localStorage.setItem("binbuf-theme", value);
    } catch {}
    syncTheme();
  };
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    try {
      if (localStorage.getItem("binbuf-theme")) return;
    } catch { /* Follow the system when storage is unavailable. */ }
    document.documentElement.dataset.theme = event.matches ? "dark" : "light";
    syncTheme();
  });
  syncTheme();
  const headerApps = q(".apps-nav");
  document.addEventListener("click", (e) => {
    if (!headerApps.contains(e.target)) headerApps.open = false;
  });
  headerApps.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      headerApps.open = false;
      headerApps.querySelector("summary").focus();
    }
  });
  const hero = q(".hero"),
    playback = hero.querySelector(".wall-playback");
  let playing = !reducedMotion.matches,
    heroVisible = false,
    slideTimer;
  function advanceWallpaper(step) {
    const index = (walls.indexOf(hero.dataset.wall) + step + walls.length) % walls.length;
    Desktop.setSurfaceWallpaper(hero, walls[index]);
  }
  function scheduleSlide() {
    clearTimeout(slideTimer);
    if (playing && heroVisible && !document.hidden) {
      slideTimer = setTimeout(() => {
        advanceWallpaper(1);
        scheduleSlide();
      }, 7000);
    }
  }
  function setPlayback(enabled) {
    playing = enabled;
    playback.title = (enabled ? "Pause" : "Play") + " wallpaper slideshow";
    playback.setAttribute("aria-label", playback.title);
    playback.innerHTML = icon(enabled ? "pause" : "play");
    scheduleSlide();
  }
  playback.onclick = () => setPlayback(!playing);
  hero.querySelectorAll(".wall-select [data-step]").forEach((button) => {
    button.onclick = () => {
      advanceWallpaper(Number(button.dataset.step));
      announce("Wallpaper set to " + title(hero.dataset.wall));
      scheduleSlide();
    };
  });
  setPlayback(playing);
  reducedMotion.addEventListener("change", () => setPlayback(!reducedMotion.matches));
  document.addEventListener("visibilitychange", scheduleSlide);
  new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    scheduleSlide();
  }).observe(hero);
  function sessionSheet(host, mode, onResume) {
    host.querySelector(".session-sheet")?.remove();
    const sheet = document.createElement("div");
    sheet.className = "session-sheet";
    sheet.setAttribute("role", "dialog");
    const about = mode === "About This System",
      lock = mode === "Lock Screen" || mode === "Sleep";
    sheet.setAttribute("aria-label", mode);
    sheet.innerHTML =
      "<div>" +
      icon(about ? "fruit" : lock ? "lock" : "device-desktop") +
      "<h4>" +
      escape(mode) +
      "</h4><p>" +
      (about
        ? "Dragonfruit Desktop · Wayland<br>Rust / Smithay compositor · Qt Quick shell"
        : lock
          ? "The preview is paused."
          : escape(mode) + " this simulated session?") +
      "</p><div>" +
      (about || lock ? "" : "<button data-cancel>Cancel</button>") +
      "<button data-confirm>" +
      (about ? "Done" : lock ? "Resume preview" : escape(mode)) +
      "</button></div></div>";
    host.append(sheet);
    sheet.querySelector("button").focus({ preventScroll: true });
    const dismiss = () => {
      sheet.remove();
      host.querySelector(".os-brand")?.focus({ preventScroll: true });
    };
    sheet.onclick = (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      dismiss();
      if (b.hasAttribute("data-confirm") && !about && !lock) onResume();
    };
    sheet.onkeydown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        dismiss();
      }
    };
  }
  function filesMenuEntries(kind, ops) {
    switch (kind) {
      case "File":
        return [["New Folder", ops.newFolder, "Shift+Super+N"], null, ["Close Window", ops.close, "Super+W"]];
      case "Edit":
        return [["Select All", () => ops.command("selectAll"), "Super+A"]];
      case "View":
        return [
          ["as Icons", () => ops.command("icons"), "Super+1"],
          ["as List", () => ops.command("list"), "Super+2"],
        ];
      case "Go":
        return ["Home", "Documents", "Downloads", "Pictures"].map((n) => [n, () => ops.place(n)]);
      case "Window":
        return [
          ["Minimize", ops.minimize, "Super+M"],
          ["Zoom", ops.zoom],
        ];
      case "Help":
        return [["Files Help", () => q("#files").scrollIntoView()]];
      default:
        return null;
    }
  }
  function completeFilesCommand(body, cmd) {
    window.NativeApps.fileCommand?.(body, cmd);
  }
  function workspace(host) {
    const layer = host.querySelector(".workspace-layer"),
      slot = host.querySelector(".dock-slot"),
      items = host.querySelector(".desktop-items"),
      bar = host.querySelector(".menubar-slot");
    let state = { id: host.dataset.workspace, folders: [], desktopFolders: [], trash: [] };
    const windows = new Map();
    let active = null,
      menu = null,
      context = null,
      stack = 0,
      serial = 0;
    const running = mountDock(slot, open);
    function dropContext() {
      if (context) {
        context.remove();
        context = null;
        return true;
      }
      return false;
    }
    function redraw() {
      running([...windows.keys()]);
      slot.dataset.fullTrash = String(state.trash.length > 0);
      menu?.name(active ? apps[active].name : "Desktop");
      const heroCopy = host.querySelector(".hero-copy");
      if (heroCopy) {
        heroCopy.inert = !!active;
        heroCopy.setAttribute("aria-hidden", String(!!active));
      }
    }
    function focus(id) {
      const rec = windows.get(id);
      if (!rec) return;
      rec.motion?.cancel();
      rec.motion = null;
      const restoring = rec.el.hidden;
      rec.el.hidden = false;
      rec.el.style.zIndex = ++stack;
      active = id;
      redraw();
      if (restoring && !reducedMotion.matches) {
        const keys = dockKeyframes(id);
        rec.el.animate(keys.reverse(), { duration: 240, easing: "cubic-bezier(.2,.78,.25,1)" });
      }
    }
    function dockKeyframes(id) {
      const el = windows.get(id).el,
        from = el.getBoundingClientRect(),
        to = slot.querySelector('[data-open="' + id + '"]').getBoundingClientRect();
      const x = to.left + to.width / 2 - from.left - from.width / 2,
        y = to.top + to.height / 2 - from.top - from.height / 2;
      return [
        { translate: "0 0", scale: 1, opacity: 1 },
        { translate: x + "px " + y + "px", scale: 0.09, opacity: 0 },
      ];
    }
    function nextActive() {
      active =
        [...windows]
          .filter(([, r]) => !r.el.hidden)
          .sort((a, b) => Number(b[1].el.style.zIndex) - Number(a[1].el.style.zIndex))[0]?.[0] || null;
      redraw();
    }
    function close(id, restoreFocus = true) {
      const rec = windows.get(id);
      if (!rec) return;
      rec.motion?.cancel();
      rec.dispose?.();
      rec.el.remove();
      windows.delete(id);
      nextActive();
      if (restoreFocus)
        (slot.querySelector('[data-open="' + id + '"]') || slot.querySelector('[data-open="drawer"]')).focus({
          preventScroll: true,
        });
    }
    function action(id, kind) {
      const el = windows.get(id)?.el;
      if (!el) return;
      if (kind === "close") {
        close(id);
        return;
      }
      if (kind === "minimize") {
        const rec = windows.get(id);
        if (rec.motion) return;
        const finish = () => {
          rec.motion = null;
          el.hidden = true;
          nextActive();
          slot.querySelector('[data-open="' + id + '"]').focus({ preventScroll: true });
          announce(apps[id].name + " minimized");
        };
        if (reducedMotion.matches) {
          finish();
        } else {
          rec.motion = el.animate(dockKeyframes(id), { duration: 220, easing: "cubic-bezier(.35,0,.8,.55)" });
          rec.motion.onfinish = finish;
        }
        return;
      }
      if (kind === "zoom") {
        const zoom = el.classList.toggle("zoomed");
        el.style.left = "";
        el.style.top = "";
        el.style.transform = "";
        focus(id);
        el.querySelector("[data-window-action=zoom]").setAttribute("aria-pressed", zoom);
      }
    }
    function enableDrag(el, id) {
      const handle = el;
      let drag = null;
      handle.addEventListener("pointerdown", (e) => {
        if (
          e.button !== 0 ||
          !e.target.closest(".titlebar,.nf-top-left,.nf-toolbar") ||
          e.target.closest("button,input") ||
          el.classList.contains("zoomed")
        )
          return;
        const box = el.getBoundingClientRect(),
          bounds = layer.getBoundingClientRect();
        drag = { x: e.clientX - box.left, y: e.clientY - box.top, bounds };
        handle.setPointerCapture(e.pointerId);
      });
      handle.onpointermove = (e) => {
        if (!drag) return;
        const b = drag.bounds;
        el.style.transform = "none";
        el.style.left = Math.max(0, Math.min(b.width - el.offsetWidth, e.clientX - b.left - drag.x)) + "px";
        el.style.top = Math.max(0, Math.min(b.height - el.offsetHeight, e.clientY - b.top - drag.y)) + "px";
      };
      handle.onlostpointercapture = () => (drag = null);
      handle.ondblclick = (e) => {
        if (e.target.closest(".titlebar,.nf-top-left,.nf-toolbar") && !e.target.closest("button,input"))
          action(id, "zoom");
      };
    }
    function open(id, place, takeFocus = true) {
      dropContext();
      menu?.close();
      if (windows.has(id)) {
        focus(id);
        const rec = windows.get(id);
        if (id === "files" && place) rec.dispose = mountFiles(rec.body, state, place);
        rec.el.focus({ preventScroll: true });
        return;
      }
      const el = document.createElement("div");
      el.className = "sim-window";
      el.dataset.app = id;
      if (id === "trash") el.classList.add("trash-window");
      el.tabIndex = -1;
      el.setAttribute("role", "group");
      el.setAttribute("aria-label", apps[id].name + " window");
      el.innerHTML = titlebar(apps[id].name) + '<div class="window-body"></div>';
      layer.append(el);
      const body = el.querySelector(".window-body"),
        rec = { el, body, dispose: null };
      windows.set(id, rec);
      if (layer.clientWidth > 620) {
        const offset = (windows.size - 1) % 4;
        el.style.left = 46 + offset * 3 + "%";
        el.style.top = 49 + offset * 2 + "%";
      }
      el.addEventListener("pointerdown", () => {
        if (active !== id) focus(id);
      });
      el.addEventListener("focusin", () => {
        if (active !== id) focus(id);
      });
      el.querySelector(".traffic").onclick = (e) => {
        const b = e.target.closest("[data-window-action]");
        if (b) action(id, b.dataset.windowAction);
      };
      enableDrag(el, id);
      switch (id) {
        case "files":
          rec.dispose = mountFiles(body, state, place);
          break;
        case "drawer":
          mountDrawer(
            body,
            (app) => {
              close("drawer", false);
              open(app);
            },
            () => close("drawer"),
          );
          break;
        case "settings":
          rec.dispose = mountSettings(body);
          break;
        case "web":
          Desktop.mountWeb(body);
          break;
        case "gallery":
          mountGallery(body);
          break;
        case "calendar":
          mountCalendar(body);
          break;
        case "terminal":
          mountTerminal(body, state);
          break;
        case "trash":
          rec.dispose = mountFiles(body, state, "Trash");
          break;
      }
      focus(id);
      if (takeFocus)
        (body.querySelector("input[type=search],.term input") || el).focus({ preventScroll: true });
    }
    function syncDesktop() {
      slot.dataset.fullTrash = String(state.trash.length > 0);
      if (items) items.innerHTML = state.desktopFolders.map((n) => folder(n, "desktop-file")).join("");
    }
    function refreshFiles() {
      if (windows.has("files")) {
        const rec = windows.get("files");
        rec.dispose = mountFiles(rec.body, state, "Desktop");
      }
      syncDesktop();
    }
    function newFolder() {
      let name;
      do {
        name = "New Folder" + (++serial > 1 ? " " + serial : "");
      } while (state.desktopFolders.includes(name));
      state.desktopFolders.push(name);
      refreshFiles();
      announce(name + " created");
    }
    function settings() {
      open("settings");
    }
    function menuItems(kind) {
      if (kind === "System")
        return Desktop.systemItems(
          () => sessionSheet(host, "About This System", reset),
          settings,
          (mode) => sessionSheet(host, mode, reset),
        );
      const app = active || "files",
        name = apps[app].name;
      const entries = filesMenuEntries(kind, {
        newFolder: () => {
          open("files");
          completeFilesCommand(windows.get("files").body, "newFolder");
        },
        close: () => close(app),
        place: (n) => open("files", n),
        command: (cmd) => {
          open("files");
          completeFilesCommand(windows.get("files").body, cmd);
        },
        minimize: () => action(app, "minimize"),
        zoom: () => action(app, "zoom"),
      });
      if (entries) return entries;
      if (!active)
        return [
          ["Open in Files", () => open("files", "Desktop")],
          ["New Folder", newFolder],
        ];
      return [
        ["About " + name, () => sessionSheet(host, "About This System", reset)],
        ["Settings…", settings],
        null,
        ["Hide " + name, () => action(app, "minimize"), "Super+H"],
        ["Quit " + name, () => close(app), "Super+Q"],
      ];
    }
    host.addEventListener("nativefileschange", (e) => {
      for (const [id, rec] of windows)
        if ((id === "files" || id === "trash") && !rec.el.contains(e.target))
          rec.dispose = mountFiles(rec.body, state, id === "trash" ? "Trash" : "Home");
      syncDesktop();
      redraw();
    });
    if (bar) menu = mountMenu(bar, menuItems);
    if (items) {
      items.onclick = (e) => {
        const b = e.target.closest("[data-folder]");
        if (b) open("files", "Desktop/" + b.dataset.folder);
      };
      host.addEventListener("contextmenu", (e) => {
        if (e.target.closest(".sim-window,.menubar-slot,.dock-slot")) return;
        e.preventDefault();
        dropContext();
        menu.close();
        const target = e.target.closest("[data-folder]"),
          name = target?.dataset.folder;
        const actions = name
          ? [["Open", () => open("files", "Desktop/" + name), "folder"]]
          : [
              ["Open in Files", () => open("files", "Desktop"), "folder"],
              ["New Folder", newFolder, "folder"],
              [
                "Clean Up",
                () => {
                  state.desktopFolders.sort((a, b) => a.localeCompare(b));
                  syncDesktop();
                  announce("Desktop icons arranged");
                },
                "layout-grid",
              ],
            ];
        context = document.createElement("div");
        context.className = "popover";
        context.setAttribute("aria-label", "Desktop context menu");
        actions.forEach(([label, fn, symbol]) => {
          const b = document.createElement("button");
          b.innerHTML = icon(symbol) + label;
          b.onclick = () => {
            dropContext();
            fn();
          };
          context.append(b);
        });
        host.append(context);
        const rect = host.getBoundingClientRect();
        context.style.left =
          Math.max(4, Math.min(host.clientWidth - context.offsetWidth - 4, e.clientX - rect.left)) + "px";
        context.style.top =
          Math.max(32, Math.min(host.clientHeight - context.offsetHeight - 4, e.clientY - rect.top)) + "px";
        context.querySelector("button").focus({ preventScroll: true });
      });
      document.addEventListener("pointerdown", (e) => {
        if (context && !context.contains(e.target)) dropContext();
      });
    }
    host.addEventListener("keydown", (e) => {
      if (e.key === "F4") {
        e.preventDefault();
        if (windows.has("drawer")) close("drawer");
        else open("drawer");
        return;
      }
      if (e.key !== "Escape") return;
      if (dropContext()) {
        host.querySelector(".os-brand")?.focus();
        return;
      }
      if (menu?.close(true)) return;
      if (active) close(active);
    });
    function reset(initial = false) {
      [...windows.keys()].forEach((id) => close(id, false));
      dropContext();
      menu?.close();
      state = {
        id: host.dataset.workspace,
        folders: ["Desktop", "Documents", "Downloads", "Music", "Pictures", "Projects", "Videos"],
        desktopFolders: ["Projects", "Field notes"],
        trash: [],
      };
      serial = 0;
      if (items) items.hidden = false;
      refreshFiles();
      if (bar) {
        open("files", "Home", false);
        if (!initial) q("#reset-desktop").focus({ preventScroll: true });
      }
      redraw();
    }
    new ResizeObserver(() => {
      for (const { el } of windows.values()) {
        if (el.hidden || el.style.transform !== "none") continue;
        el.style.left =
          Math.max(0, Math.min(parseFloat(el.style.left), layer.clientWidth - el.offsetWidth)) + "px";
        el.style.top =
          Math.max(0, Math.min(parseFloat(el.style.top), layer.clientHeight - el.offsetHeight)) + "px";
      }
    }).observe(layer);
    reset(true);
    return { reset };
  }
  workspace(q("[data-workspace=hero]"));
  const full = workspace(q("[data-workspace=full]"));
  q("#reset-desktop").onclick = () => {
    full.reset();
    announce("Sample files and windows reset");
  };

  const demoDock = q("#demo-dock"),
    readout = demoDock.querySelector(".dock-readout");
  const setRunning = mountDock(demoDock.querySelector(".dock-slot"), (id, place) => {
    const isTrash = id === "trash",
      slot = demoDock.querySelector(".dock-slot");
    setRunning(isTrash ? [] : [id]);
    const message = isTrash
      ? slot.dataset.fullTrash === "true"
        ? "Trash contains one sample item"
        : "Trash is empty"
      : (place || apps[id].name) + " is open";
    readout.innerHTML =
      icon(isTrash ? "trash" : "app-window") + "<span>" + message + "</span><button>Close</button>";
    readout.querySelector("button").onclick = () => {
      readout.textContent = "";
      setRunning([]);
      demoDock.querySelector('[data-open="' + id + '"]')?.focus();
    };
  });
  const demoTrash = demoDock.querySelector(".dock-slot");
  demoDock.querySelectorAll("[data-trash]").forEach(
    (b) =>
      (b.onclick = () => {
        demoTrash.dataset.fullTrash = String(b.dataset.trash === "full");
        demoDock.querySelectorAll("[data-trash]").forEach((v) => v.setAttribute("aria-pressed", v === b));
        announce("Trash is " + b.dataset.trash);
      }),
  );
  const menuDemo = q("#demo-menu");
  menuDemo.innerHTML =
    '<div class="menu-scene"><div class="mini-menubar"></div><div class="scene-folders"></div><div class="scene-file-host" hidden></div></div>';
  const scene = menuDemo.firstElementChild,
    sceneFolders = scene.querySelector(".scene-folders"),
    fileHost = scene.querySelector(".scene-file-host");
  const menuState = {
    id: "menu-files",
    folders: ["Desktop", "Documents", "Downloads", "Music", "Pictures", "Projects", "Videos"],
    desktopFolders: ["Projects", "Field notes"],
    trash: [],
  };
  let disposeSceneFiles;
  function drawSceneFolders() {
    sceneFolders.innerHTML = menuState.desktopFolders.map((name) => folder(name, "desktop-file")).join("");
  }
  function showSceneFiles(place = "Home") {
    disposeSceneFiles?.();
    fileHost.hidden = false;
    disposeSceneFiles = mountFiles(fileHost, menuState, place);
    miniMenu.name("Files");
    fileHost.querySelector(".nf-browser").focus({ preventScroll: true });
  }
  function closeSceneFiles() {
    disposeSceneFiles?.();
    disposeSceneFiles = null;
    fileHost.hidden = true;
    fileHost.replaceChildren();
    miniMenu.name("Desktop");
    scene.querySelector(".app-menu").focus({ preventScroll: true });
  }
  function sceneCommand(cmd) {
    if (fileHost.hidden) showSceneFiles();
    completeFilesCommand(fileHost, cmd);
  }
  const openSettingsChapter = () => {
    const heading = q("#settings-title");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    q("#settings").scrollIntoView({ block: "center" });
  };
  const miniMenu = mountMenu(scene.querySelector(".mini-menubar"), (kind) => {
    if (kind === "System")
      return Desktop.systemItems(
        () => sessionSheet(scene, "About System", closeSceneFiles),
        openSettingsChapter,
        (mode) => sessionSheet(scene, mode, closeSceneFiles),
      );
    if (scene.querySelector(".app-menu").textContent === "Desktop")
      return [["Open in Files", () => showSceneFiles("Desktop")]];
    return (
      filesMenuEntries(kind, {
        command: sceneCommand,
        newFolder: () => sceneCommand("newFolder"),
        close: fileHost.hidden ? null : closeSceneFiles,
        place: showSceneFiles,
        minimize: fileHost.hidden ? null : closeSceneFiles,
        zoom: () => {
          if (fileHost.hidden) showSceneFiles();
          fileHost.querySelector(".df-native").classList.toggle("nf-zoom");
        },
      }) || [
        ["Settings…", openSettingsChapter],
        ["Hide Files", fileHost.hidden ? null : closeSceneFiles, "Super+H"],
        ["Quit Files", closeSceneFiles, "Super+Q"],
      ]
    );
  });
  sceneFolders.onclick = (e) => {
    const tile = e.target.closest("[data-folder]");
    if (tile) showSceneFiles("Desktop/" + tile.dataset.folder);
  };
  scene.addEventListener("nativefileschange", drawSceneFolders);
  scene.addEventListener("click", (e) => {
    if (e.target.closest('[data-capture="close"],[data-capture="minimize"]')) closeSceneFiles();
  });
  drawSceneFolders();
  miniMenu.name("Files");
  miniMenu.show("Go");
  q(".glyph-options").addEventListener("change", (e) => {
    if (!e.target.matches("[name=tour-os-glyph]") || !e.target.checked) return;
    setPref("osGlyph", e.target.value);
    announce("System menu glyph set to " + e.target.getAttribute("aria-label"));
  });
  const drawerDemo = q("#demo-drawer");
  const drawerState = { id: "drawer-preview", folders: ["Documents", "Pictures", "Downloads", "Projects"] };
  let leaveDrawerApp = null;
  function closeDemoDrawer() {
    drawerDemo.innerHTML =
      '<button class="restore-control">' + icon("layout-grid") + " Open Applications</button>";
    drawerDemo.querySelector("button").onclick = () => demoDrawer(true);
    drawerDemo.querySelector("button").focus({ preventScroll: true });
  }
  function demoDrawer(focus = false) {
    leaveDrawerApp?.();
    leaveDrawerApp = null;
    mountDrawer(
      drawerDemo,
      (id) => {
        drawerDemo.innerHTML =
          '<div class="drawer-panel drawer-launch"><div class="drawer-app-bar"><button class="demo-back">' +
          icon("chevron-left") +
          " Apps</button><strong>" +
          apps[id].name +
          '</strong></div><div class="drawer-app-body"></div></div>';
        const body = drawerDemo.querySelector(".drawer-app-body"),
          back = drawerDemo.querySelector(".demo-back");
        if (id === "files") mountFiles(body, drawerState);
        if (id === "settings") leaveDrawerApp = mountSettings(body);
        if (id === "web") Desktop.mountWeb(body);
        if (id === "gallery") mountGallery(body);
        if (id === "calendar") mountCalendar(body);
        if (id === "terminal") mountTerminal(body, drawerState);
        back.onclick = () => demoDrawer(true);
        back.focus({ preventScroll: true });
        announce(apps[id].name + " launched");
      },
      closeDemoDrawer,
    );
    if (focus) drawerDemo.querySelector("input").focus({ preventScroll: true });
  }
  demoDrawer();
  mountSettings(q("#demo-settings"));
  mountFiles(q("#demo-files"), {
    id: "files-chapter",
    folders: ["Desktop", "Documents", "Downloads", "Music", "Pictures", "Projects", "Videos"],
    trash: [],
  });
  drawerDemo.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawerDemo.querySelector(".drawer-launch")) demoDrawer(true);
  });
  const controls = q("#demo-controls");
  controls.innerHTML =
    '<div class="sample-window" role="group" aria-label="Empty window"><div class="titlebar">' +
    Desktop.traffic() +
    '</div><div class="empty-window-body" aria-hidden="true"></div></div>';
  controls
    .querySelectorAll('[data-window-action="close"],[data-window-action="minimize"]')
    .forEach((button) => {
      button.setAttribute("aria-disabled", "true");
    });
  const zoomButton = controls.querySelector('[data-window-action="zoom"]');
  zoomButton.setAttribute("aria-pressed", "false");
  zoomButton.onclick = () => {
    const zoomed = controls.querySelector(".sample-window").classList.toggle("zoomed");
    zoomButton.setAttribute("aria-pressed", String(zoomed));
  };
  const ctx = q("#demo-context");
  ctx.innerHTML =
    '<div class="context-desk" tabindex="0" aria-label="Sample desktop"><div class="context-tiles"></div><div class="context-menu-host"></div><div class="context-browser" hidden></div><div class="context-toolbar"><button class="study-button">Desktop menu</button><span role="status"></span></div></div>';
  const desk = ctx.firstElementChild,
    ctxTiles = ctx.querySelector(".context-tiles"),
    ctxMenu = ctx.querySelector(".context-menu-host"),
    ctxFile = ctx.querySelector(".context-browser"),
    ctxStatus = ctx.querySelector("[role=status]"),
    ctxButton = ctx.querySelector(".study-button");
  const ctxState = { id: "context-files", folders: ["Projects", "Field notes"], trash: [] };
  let folderCount = 0,
    ctxDispose = null;
  function drawTiles() {
    ctxTiles.innerHTML = ctxState.folders.map((n) => folder(n, "desktop-file")).join("");
  }
  function closeDirectory() {
    ctxDispose?.();
    ctxDispose = null;
    ctxFile.hidden = true;
    ctxFile.replaceChildren();
  }
  function directory(n) {
    closeDirectory();
    ctxFile.hidden = false;
    ctxFile.innerHTML =
      '<div class="context-browser-body"></div><button class="study-button back-to-desk">Back to desktop</button>';
    ctxDispose = mountFiles(ctxFile.firstElementChild, ctxState, n || "Home");
    ctxFile.lastElementChild.onclick = () => {
      closeDirectory();
      ctxButton.focus();
    };
  }
  function contextMenu(target, event, takeFocus = true) {
    closeDirectory();
    ctxMenu.innerHTML = '<div class="popover native-context"></div>';
    const pop = ctxMenu.firstElementChild;
    const actions = target
      ? [["Open", () => directory(target)]]
      : [
          ["Open in Files", () => directory()],
          null,
          [
            "New Folder",
            () => {
              const name = "New Folder" + (++folderCount > 1 ? " " + folderCount : "");
              ctxState.folders.push(name);
              drawTiles();
              ctxStatus.textContent = name + " created";
            },
            "Shift+Super+N",
          ],
          [
            "Clean Up",
            () => {
              ctxState.folders.sort((a, b) => a.localeCompare(b));
              drawTiles();
              ctxStatus.textContent = "Icons arranged by name";
            },
          ],
        ];
    actions.forEach((row) => {
      if (!row) {
        pop.append(document.createElement("hr"));
        return;
      }
      const [n, fn, key] = row,
        b = document.createElement("button");
      b.innerHTML = "<span>" + n + "</span>" + (key ? "<kbd>" + key + "</kbd>" : "");
      b.onclick = () => {
        ctxMenu.replaceChildren();
        fn();
        if (ctxFile.hidden) ctxButton.focus({ preventScroll: true });
      };
      pop.append(b);
    });
    const r = desk.getBoundingClientRect();
    pop.style.left =
      Math.max(
        6,
        Math.min(
          desk.clientWidth - pop.offsetWidth - 6,
          event ? event.clientX - r.left : desk.clientWidth * 0.39,
        ),
      ) + "px";
    pop.style.top =
      Math.max(
        7,
        Math.min(
          desk.clientHeight - pop.offsetHeight - 48,
          event ? event.clientY - r.top : desk.clientHeight * 0.28,
        ),
      ) + "px";
    if (takeFocus) pop.querySelector("button").focus({ preventScroll: true });
  }
  drawTiles();
  contextMenu(null, null, false);
  ctxButton.onclick = () => contextMenu(null);
  ctxTiles.onclick = (e) => {
    const b = e.target.closest("[data-folder]");
    if (b) contextMenu(b.dataset.folder);
  };
  desk.oncontextmenu = (e) => {
    if (!ctxFile.hidden) return;
    e.preventDefault();
    contextMenu(e.target.closest("[data-folder]")?.dataset.folder, e);
  };
  desk.onkeydown = (e) => {
    if (e.key === "Escape") {
      if (!ctxFile.hidden) closeDirectory();
      ctxMenu.replaceChildren();
      ctxButton.focus({ preventScroll: true });
    }
    if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
      e.preventDefault();
      contextMenu(e.target.closest("[data-folder]")?.dataset.folder);
    }
  };
  desk.addEventListener("pointerdown", (e) => {
    if (ctxFile.hidden && !e.target.closest("button,.popover") && e.button === 0) ctxMenu.replaceChildren();
  });
  new ResizeObserver(() => {
    const pop = ctxMenu.firstElementChild;
    if (pop) {
      pop.style.left =
        Math.max(6, Math.min(parseFloat(pop.style.left), desk.clientWidth - pop.offsetWidth - 6)) + "px";
    }
  }).observe(desk);
  Desktop.applyPreferences();
  Desktop.updateClocks();
  setInterval(Desktop.updateClocks, 30000);

  const distroTrack = q("#distro-track"),
    distroControls = q(".distro-controls");
  function syncDistroArrows() {
    const atStart = distroTrack.scrollLeft <= 2,
      atEnd = Math.ceil(distroTrack.scrollLeft + distroTrack.clientWidth) >= distroTrack.scrollWidth - 2;
    distroControls.hidden = atStart && atEnd;
    distroTrack.tabIndex = distroControls.hidden ? -1 : 0;
    distroControls.querySelector('[data-step="-1"]').setAttribute("aria-disabled", String(atStart));
    distroControls.querySelector('[data-step="1"]').setAttribute("aria-disabled", String(atEnd));
  }
  function scrollDistros(step) {
    const cards = distroTrack.children;
    const stride = cards[1].offsetLeft - cards[0].offsetLeft;
    const page = Math.max(1, Math.floor(distroTrack.clientWidth / stride));
    const target = (Math.round(distroTrack.scrollLeft / stride) + step * page) * stride;
    distroTrack.scrollTo({ left: target, behavior: reducedMotion.matches ? "instant" : "smooth" });
  }
  distroControls.onclick = (e) => {
    const button = e.target.closest("[data-step]");
    if (button && button.getAttribute("aria-disabled") !== "true") scrollDistros(Number(button.dataset.step));
  };
  distroTrack.onkeydown = (e) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    if (e.key === "Home" || e.key === "End")
      distroTrack.scrollTo({
        left: e.key === "Home" ? 0 : distroTrack.scrollWidth,
        behavior: reducedMotion.matches ? "instant" : "smooth",
      });
    else scrollDistros(e.key === "ArrowLeft" ? -1 : 1);
  };
  distroTrack.addEventListener("scroll", syncDistroArrows, { passive: true });
  new ResizeObserver(syncDistroArrows).observe(distroTrack);
  syncDistroArrows();

  const links = [...document.querySelectorAll(".tour-links a")],
    sections = links.map((a) => q(a.hash));
  let frame = 0;
  const chapters = [...document.querySelectorAll(".chapter")];
  const visible = new Set();
  const motionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      });
      if (!frame) frame = requestAnimationFrame(updateSection);
    },
    { rootMargin: "15% 0px" },
  );
  chapters.forEach((el) => motionObserver.observe(el));
  function updateSection() {
    frame = 0;
    if (!reducedMotion.matches)
      visible.forEach((el) => {
        const box = el.getBoundingClientRect();
        const p = Math.max(
          -1,
          Math.min(1, (box.top + box.height / 2 - innerHeight / 2) / ((innerHeight + box.height) / 2)),
        );
        const travel = Math.sign(p) * Math.pow(Math.max(0, (Math.abs(p) - 0.24) / 0.76), 1.25);
        const direction = el.matches(":nth-child(even)") ? -1 : 1;
        el.style.setProperty("--prop-x", (travel * direction * 22).toFixed(2) + "px");
        el.style.setProperty("--prop-y", (travel * 30).toFixed(2) + "px");
        el.style.setProperty("--prop-scale", (1 - Math.abs(travel) * 0.055).toFixed(4));
        el.style.setProperty("--land-y", (-p * 22).toFixed(2) + "px");
        el.style.setProperty("--copy-y", (travel * 12).toFixed(2) + "px");
      });
    let current = 0;
    sections.forEach((el, i) => {
      if (el.getBoundingClientRect().top < Math.min(250, innerHeight * 0.35)) current = i;
    });
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 2) current = links.length - 1;
    links.forEach((a, i) => {
      if (i === current) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
    if (!reducedMotion.matches && scrollY < sections[0].offsetHeight + 80)
      sections[0].style.setProperty("--hero-shift", Math.min(60, scrollY * 0.1) + "px");
  }
  addEventListener(
    "scroll",
    () => {
      if (!frame) frame = requestAnimationFrame(updateSection);
    },
    { passive: true },
  );
  addEventListener("resize", () => {
    if (!frame) frame = requestAnimationFrame(updateSection);
  });
  reducedMotion.addEventListener("change", updateSection);
  updateSection();
  if ("IntersectionObserver" in window) {
    const entrances = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entrances.unobserve(entry.target);
          if (!reducedMotion.matches)
            entry.target.animate(
              [
                { opacity: 0.77, translate: "0 14px" },
                { opacity: 1, translate: "0 0" },
              ],
              { duration: 500, easing: "cubic-bezier(.2,.7,.3,1)" },
            );
        }
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll(".build-note").forEach((el) => entrances.observe(el));
  }
})();
