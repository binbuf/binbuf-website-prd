/* Sidebar order, identifiers, category artwork and gradients follow apps/settings/SettingsPanes.qml. */
"use strict";
window.DFSettingsCatalog = (() => {
  const categories = [
    ["wifi", "Wi-Fi", "connectivity", "wifi-high", "#3f8cff", "#1f5fd6"],
    ["bluetooth", "Bluetooth", "connectivity", "bluetooth", "#4a9bff", "#2158d0"],
    ["network", "Network", "connectivity", "globe", "#3aa0ff", "#1667c8"],
    ["vpn", "VPN", "connectivity", "lock", "#5d8ef0", "#2b4fa8"],
    ["battery", "Energy", "connectivity", "battery-full", "#34c759", "#14883a"],
    ["general", "General", "desktop", "gear", "#8e8e93", "#58585c"],
    ["accessibility", "Accessibility", "desktop", "person", "#2f7bff", "#1450c4"],
    ["appearance", "Appearance", "desktop", "swatches", "#4a4a55", "#1c1c24"],
    ["desktop-dock", "Desktop & Dock", "desktop", "desktop", "#5a5a66", "#26262e"],
    ["displays", "Displays", "desktop", "monitor", "#2e8dff", "#1555c0"],
    ["menu-bar", "Menu Bar", "desktop", "list", "#8a8f98", "#4f545c"],
    ["search", "Search", "desktop", "magnifying-glass", "#3f8cff", "#1f5fd6"],
    ["wallpaper", "Wallpaper", "desktop", "image", "#46b6e6", "#1f74b8"],
    ["screen-saver", "Screen Saver", "desktop", "monitor-play", "#3f8cff", "#1f5fd6"],
    ["notifications", "Notifications", "input", "bell", "#ff5a5f", "#c62431"],
    ["sound", "Sound", "input", "speaker-high", "#ff5f6d", "#c62a52"],
    ["focus", "Focus", "input", "moon", "#a06bff", "#6236c4"],
    ["lock-screen", "Lock Screen", "input", "lock", "#5d8ef0", "#2b4fa8"],
    ["privacy", "Privacy & Security", "input", "shield-check", "#3f7bff", "#1a4fb8"],
    ["users-groups", "Users & Groups", "input", "users", "#6b7bff", "#3a3fc0"],
    ["online-accounts", "Online Accounts", "input", "circles-three", "#4ab6e6", "#1f74b8"],
    ["keyboard", "Keyboard", "input", "keyboard", "#8a8f98", "#4f545c"],
    ["mouse", "Mouse", "input", "mouse", "#8a8f98", "#4f545c"],
    ["trackpad", "Trackpad", "input", "hand-pointing", "#8a8f98", "#4f545c"],
    ["game-controllers", "Game Controllers", "input", "squares-four", "#8a8f98", "#4f545c"],
    ["printers", "Printers & Scanners", "input", "printer", "#5c8fd6", "#2d559c"],
  ].map(([id, name, group, glyph, start, end]) => ({ id, name, group, glyph, start, end }));
  // Rows are a curated, browser-safe subset of their corresponding Qt Quick panes.
  const toggle = (label, key, initial = false) => ({ type: "toggle", label, key, initial });
  const pick = (label, key, options, initial = options[0]) => ({
    type: "pick",
    label,
    key,
    options,
    initial,
  });
  const range = (label, key, initial) => ({ type: "range", label, key, initial });
  const value = (label, text) => ({ type: "value", label, text });
  const detail = (label, text) => ({ type: "detail", label, text });
  const unavailable = (label, reason) => ({ type: "unavailable", label, text: reason });
  const group = (label, ...rows) => ({ label, rows });
  const preview = (id) => ({ type: "preview", id });
  const sample = "Sample hardware";
  const panes = {
    wifi: [
      group("Wi-Fi", toggle("Wi-Fi", "wifi", true), preview("wifi")),
      group(
        "Known Networks",
        detail("Studio network", "Sample network · WPA3 Personal · 5 GHz"),
        toggle("Auto-join", "autoJoin", true),
      ),
      group("New Networks", pick("Ask to join networks", "askNetworks", ["Off", "Notify", "Ask"], "Notify")),
    ],
    bluetooth: [
      group("Bluetooth", toggle("Bluetooth", "bluetooth", true), preview("bluetooth")),
      group(
        "My Devices",
        detail("Studio keyboard", "Sample keyboard · wireless · 86% battery"),
        toggle("Connect keyboard", "btKeyboard", true),
      ),
    ],
    network: [
      group(
        "Services",
        preview("network"),
        detail("Wired network", "Sample hardware · automatic IPv4 and IPv6 configuration"),
      ),
      group(
        "Firewall",
        toggle("Firewall", "firewall", true),
        detail("Firewall Options", "Incoming connections follow the firewall setting in this preview."),
      ),
    ],
    vpn: [
      group("Connections", preview("vpn"), toggle("Connect studio tunnel", "vpn")),
      group(
        "WireGuard",
        value("Connection type", "WireGuard"),
        detail("Connection details", "Sample VPN configuration · native WireGuard tunnel"),
        unavailable(
          "Add VPN Configuration…",
          "Creating a system profile requires NetworkManager on the desktop.",
        ),
      ),
    ],
    battery: [
      group(
        "Battery",
        value("Charge", "82%"),
        pick("Power mode", "power", ["Power Saver", "Balanced", "Performance"], "Balanced"),
      ),
      group(
        "Usage History",
        pick("History range", "batteryRange", ["Last 24 Hours", "Last 10 Days"]),
        preview("battery"),
      ),
      group("Power Settings", toggle("Dim on battery", "dimBattery", true)),
    ],
    general: [
      group(
        "System",
        detail(
          "About",
          "Dragonfruit Desktop runs a Wayland session with a Rust compositor and a Qt Quick shell.",
        ),
        { type: "subpane", label: "Storage" },
        detail(
          "Software Update",
          "The native pane delegates updates to the distribution’s package service. Package updates are unavailable in the browser.",
        ),
      ),
      group(
        "Preferences",
        detail("Date & Time", "The preview clock follows your browser’s local time zone."),
        detail("Language & Region", "This demonstration uses English for interface labels."),
      ),
    ],
    storage: [
      group("Storage", preview("storage")),
      group(
        "Categories",
        detail("System · 120 GB", "Operating system, installed components and system-wide data."),
        detail("Home · 340 GB", "Documents, downloads and the contents of the user’s home directory."),
        detail("Media · 20 GB", "Media files accounted for by the category sampler."),
      ),
      group(
        "Recommendations",
        detail(
          "Review Home",
          "The home directory occupies about two thirds of this sample disk. Review large files in Files before removing them.",
        ),
      ),
      group("Volumes", value("System volume", "512 GB"), value("Available", "32 GB")),
    ],
    accessibility: [
      group(
        "Vision",
        toggle("Increase contrast", "contrast"),
        toggle("Reduce transparency", "reduceGlass"),
        preview("contrast"),
      ),
      group(
        "Physical and Motor",
        detail(
          "Keyboard",
          "Keyboard navigation moves focus through controls. Use Tab to move and Space to activate a focused button.",
        ),
      ),
      group(
        "Hearing",
        detail(
          "Audio",
          "The native desktop offers visual and audio accommodations, including mono audio and balance.",
        ),
      ),
    ],
    displays: [
      group(
        "Displays",
        value("Display", "Built-in display"),
        pick("Resolution", "resolution", ["Larger Text", "Default", "More Space"], "Default"),
        range("Brightness", "brightness", 76),
        preview("display"),
      ),
      group(
        "Display settings",
        detail("Arrangement", "The sample configuration has one main display."),
        unavailable("Night Light schedule", "Applying a night-light curve requires the native compositor."),
      ),
    ],
    search: [
      group(
        "Search Results",
        toggle("Applications", "findApps", true),
        toggle("Files", "findFiles", true),
        toggle("Folders", "findFolders", true),
        preview("search"),
      ),
      group(
        "Indexing",
        unavailable("Rebuild index", "The browser preview has no access to your file index."),
      ),
    ],
    "screen-saver": [
      group(
        "Screen Saver",
        pick("Style", "screenStyle", ["Clock", "None"]),
        pick(
          "Start after",
          "saverAfter",
          ["Never", "After 1 minute", "After 5 minutes", "After 10 minutes"],
          "After 5 minutes",
        ),
        toggle("Show date", "clockDate", true),
        preview("saver"),
      ),
    ],
    notifications: [
      group(
        "Notifications",
        pick("Show previews", "notifyPreview", ["Always", "When Unlocked", "Never"], "When Unlocked"),
        toggle("When screen is locked", "lockNotify"),
        preview("notification"),
      ),
      group(
        "Application Notifications",
        detail(
          "Files",
          "Sample notification · the desktop shows app-specific controls after an app sends its first notification.",
        ),
      ),
    ],
    sound: [
      group(
        "Sound Effects",
        pick("Alert sound", "tone", ["Chime", "Marimba", "Pulse", "Woodblock", "Breeze"]),
        range("Alert volume", "volume", 52),
        { type: "action", id: "sound", label: "Play alert sound" },
      ),
      group(
        "Output & Input",
        value("Output", "Built-in speakers"),
        unavailable("Change audio device", "Selecting an audio route requires the desktop audio service."),
      ),
    ],
    focus: [
      group("Focus", pick("Active Focus", "focus", ["Off", "Do Not Disturb", "Work"]), preview("focus")),
      group("Allowed Apps", toggle("Files", "focusFiles"), toggle("System Settings", "focusSettings")),
    ],
    "lock-screen": [
      group(
        "Lock Screen",
        pick(
          "Dim screen when inactive",
          "dimAfter",
          ["Never", "After 1 minute", "After 5 minutes", "After 10 minutes"],
          "After 5 minutes",
        ),
        pick("Require password after display off or lock", "askPassword", [
          "Immediately",
          "After 5 seconds",
          "After 1 minute",
        ]),
      ),
      group("Login Window", toggle("Show user name and photo", "lockPhoto", true), preview("lock")),
    ],
    privacy: [
      group("Location Services", toggle("Location Services", "location"), preview("location")),
      group(
        "App access",
        pick("Location access for Maps", "mapsLocation", ["Ask", "Allowed", "Denied"]),
        detail(
          "Camera and microphone",
          "The native desktop reads permissions from the portal. This preview makes no camera or microphone requests.",
        ),
      ),
      group(
        "Security",
        unavailable("Disk encryption", "Disk and encryption status require access to the installed system."),
      ),
    ],
    "users-groups": [
      group(
        "Users",
        detail("Studio user", "Sample account · Standard · local account"),
        detail("Administrator", "Sample account · Administrator · local account"),
        unavailable("Add User…", "Account changes require authorization on the installed system."),
      ),
      group("Groups", detail("Users", "The sample Studio user belongs to the local users group.")),
    ],
    "online-accounts": [
      group(
        "Online Accounts",
        detail("Studio calendar", "Sample account · calendar synchronization"),
        toggle("Sync calendars", "syncCalendar", true),
        preview("accounts"),
      ),
      group(
        "Account service",
        unavailable("Add Account…", "Sign-in is handled by the native online-accounts service."),
      ),
    ],
    keyboard: [
      group(
        "Keyboard",
        range("Key repeat rate", "keyRate", 60),
        range("Delay until repeat", "keyDelay", 38),
        preview("keys"),
      ),
      group(
        "Keyboard Navigation",
        toggle("Keyboard navigation", "keyboardNav", true),
        detail(
          "Keyboard shortcuts",
          "The Settings window supports Tab and Shift+Tab to move between controls.",
        ),
      ),
    ],
    mouse: [
      group(
        "Point & Click",
        range("Tracking speed", "mouseSpeed", 50),
        pick("Secondary click", "mouseSecondary", ["Right", "Left"]),
        preview("mouse"),
      ),
      group(
        "Scrolling",
        toggle("Natural scrolling", "mouseNatural", true),
        range("Scroll speed", "mouseScroll", 52),
      ),
    ],
    trackpad: [
      group(
        "Point & Click",
        range("Tracking speed", "trackSpeed", 55),
        toggle("Tap to click", "tapClick", true),
        preview("trackpad"),
      ),
      group(
        "Scroll & Zoom",
        toggle("Natural scrolling", "trackNatural", true),
        pick("Scroll method", "trackScroll", ["Two Fingers", "Edge Scrolling"]),
      ),
    ],
    "game-controllers": [
      group(
        "Controllers",
        detail("Wireless controller", "Sample controller · standard gamepad layout · two analog sticks"),
        detail("Mapping", "Left stick · move. Right stick · look. Face buttons · actions."),
        preview("controller"),
      ),
    ],
    printers: [
      group(
        "Printing",
        pick("Default printer", "printer", ["Last Printer Used", "Studio printer"]),
        pick("Default paper size", "paper", ["A4", "US Letter", "US Legal", "A3", "A5"]),
      ),
      group(
        "Printers",
        detail("Studio printer", "Sample printer · idle · no jobs waiting"),
        preview("paper"),
      ),
      group(
        "Scanners",
        unavailable("Open Scanner", "Scanning requires a device connected to the native scanning service."),
      ),
    ],
  };
  const customTerms = {
    appearance: "light dark auto theme glass tint transparency accent color",
    wallpaper: "built-in desktop picture background",
    "desktop-dock": "dock size magnification icons",
    "menu-bar": "os menu glyph logo tux dragonfruit",
  };
  const samplePanes = new Set([
    "wifi",
    "bluetooth",
    "network",
    "vpn",
    "battery",
    "storage",
    "displays",
    "sound",
    "users-groups",
    "online-accounts",
    "game-controllers",
    "printers",
    "keyboard",
    "mouse",
    "trackpad",
  ]);
  const models = new WeakMap();
  const initials = {};
  Object.values(panes)
    .flatMap((sections) => sections.flatMap((section) => section.rows))
    .forEach((row) => {
      if (row.key) initials[row.key] = row.initial;
    });
  function modelFor(pref) {
    if (!models.has(pref)) models.set(pref, { ...initials });
    return models.get(pref);
  }
  categories.forEach((category) => {
    const sections = panes[category.id] || [];
    category.terms = [
      category.id,
      customTerms[category.id] || "",
      ...sections.flatMap((s) => [s.label, ...s.rows.map((r) => r.label || "")]),
    ]
      .join(" ")
      .toLowerCase();
  });
  const escape = (text) =>
    String(text).replace(
      /[<>&"']/g,
      (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[char],
    );
  function rowHtml(row, model) {
    const name = escape(row.label || "");
    if (row.type === "preview") return '<div class="ns-output" data-output="' + row.id + '"></div>';
    if (row.type === "action")
      return (
        '<div class="ns-row"><button type="button" class="ns-action" data-catalog-action="' +
        row.id +
        '">' +
        name +
        '</button><span class="ns-feedback" role="status"></span></div>'
      );
    if (row.type === "detail")
      return (
        '<details class="ns-detail"><summary>' + name + "</summary><p>" + escape(row.text) + "</p></details>"
      );
    if (row.type === "subpane")
      return (
        '<button type="button" class="ns-subpane" data-subpane="' +
        name +
        '"><span>' +
        name +
        '</span><span aria-hidden="true">›</span></button>'
      );
    if (row.type === "unavailable")
      return (
        '<div class="ns-row ns-disabled"><span>' +
        name +
        "</span><small>" +
        escape(row.text) +
        "</small></div>"
      );
    if (row.type === "value")
      return '<div class="ns-row"><span>' + name + "</span><strong>" + escape(row.text) + "</strong></div>";
    const attr = ' data-setting="' + row.key + '" aria-label="' + name + '"';
    let control;
    if (row.type === "toggle")
      control = '<input type="checkbox" role="switch"' + attr + (model[row.key] ? " checked" : "") + ">";
    if (row.type === "pick")
      control =
        "<select" +
        attr +
        ">" +
        row.options
          .map(
            (option) =>
              "<option" + (model[row.key] === option ? " selected" : "") + ">" + escape(option) + "</option>",
          )
          .join("") +
        "</select>";
    if (row.type === "range")
      control = '<input type="range" min="0" max="100" step="1" value="' + model[row.key] + '"' + attr + ">";
    return '<label class="ns-row"><span>' + name + "</span>" + control + "</label>";
  }
  function render(id, model) {
    const tag = samplePanes.has(id)
      ? '<p class="ns-scope">' +
        (["users-groups", "online-accounts", "vpn"].includes(id) ? "Sample configuration" : sample) +
        "</p>"
      : "";
    return (
      tag +
      panes[id]
        .map(
          (section) =>
            '<section class="nf-group"><h5>' +
            escape(section.label) +
            '</h5><div class="nf-card">' +
            section.rows.map((row) => rowHtml(row, model)).join("") +
            "</div></section>",
        )
        .join("")
    );
  }
  function chart(model) {
    const values =
      model.batteryRange === "Last 24 Hours"
        ? [66, 63, 60, 56, 51, 49, 45, 40, 43, 54, 68, 81, 96, 94, 90, 86, 82]
        : [93, 81, 74, 58, 85, 64, 71, 90, 80, 82];
    return (
      '<div class="ns-chart" role="img" aria-label="Sample battery levels across ' +
      escape(model.batteryRange) +
      '">' +
      values.map((n) => '<i style="height:' + n + '%"></i>').join("") +
      "</div>"
    );
  }
  function sampleHtml(id, m) {
    switch (id) {
      case "wifi":
        return m.wifi ? "Connected to Studio network" : "Wi-Fi is off";
      case "bluetooth":
        return m.bluetooth
          ? m.btKeyboard
            ? "Studio keyboard connected"
            : "Studio keyboard disconnected"
          : "Bluetooth is off";
      case "network":
        return "Wired network connected · Firewall " + (m.firewall ? "on" : "off");
      case "vpn":
        return m.vpn ? "Studio tunnel connected" : "Studio tunnel disconnected";
      case "battery":
        return chart(m);
      case "storage":
        return '<div class="ns-disk"><strong>System disk</strong><span>480 GB used of 512 GB · 32 GB available</span><div class="ns-disk-chart" role="img" aria-label="System 120 GB, Home 340 GB, Media 20 GB, free 32 GB"><i></i><i></i><i></i><i></i></div><div class="ns-disk-legend"><small>System</small><small>Home</small><small>Media</small><small>Free</small></div></div>';
      case "contrast":
        return (
          '<div class="ns-contrast' +
          (m.contrast ? " high" : "") +
          (m.reduceGlass ? " solid" : "") +
          '">Display preview</div>'
        );
      case "display":
        return (
          '<div class="ns-display" style="--brightness:' +
          (0.36 + m.brightness * 0.0064) +
          ";--scale:" +
          (m.resolution === "More Space" ? ".87" : m.resolution === "Larger Text" ? "1.18" : "1") +
          '"><span>Display preview</span></div>'
        );
      case "search": {
        const results = [
          m.findApps && "Files app",
          m.findFiles && "Field notes.txt",
          m.findFolders && "Projects folder",
        ].filter(Boolean);
        return results.length ? "Sample results · " + results.join(" · ") : "No sample categories selected";
      }
      case "saver": {
        const now = new Date();
        return m.screenStyle === "None"
          ? "Screen saver off"
          : '<div class="ns-clock"><b>' +
              now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
              "</b>" +
              (m.clockDate
                ? "<small>" +
                  now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }) +
                  "</small>"
                : "") +
              "</div>";
      }
      case "notification":
        return (
          '<div class="ns-banner"><b>Files</b><span>' +
          (m.notifyPreview === "Never" ? "Notification" : "Copy complete") +
          "</span></div>"
        );
      case "focus":
        return m.focus === "Off"
          ? "All app notifications are delivered."
          : escape(m.focus) +
              " is on · " +
              ([m.focusFiles && "Files", m.focusSettings && "System Settings"]
                .filter(Boolean)
                .join(" and ") || "No apps") +
              " allowed.";
      case "lock":
        return (
          '<div class="ns-clock">' +
          (m.lockPhoto ? "<b>Studio user</b><small>" : "<small>") +
          "Locked</small></div>"
        );
      case "location":
        return m.location ? "Maps · " + escape(m.mapsLocation) : "Location Services is off";
      case "accounts":
        return m.syncCalendar ? "Calendar synchronization on" : "Calendar synchronization paused";
      case "keys":
        return (
          "Sample key repeat · " +
          Math.round(2 + m.keyRate * 0.28) +
          " repeats per second after " +
          Math.round(150 + m.keyDelay * 8.5) +
          " ms"
        );
      case "mouse":
        return (
          '<div class="ns-motion"><i style="left:' +
          (6 + m.mouseSpeed * 0.88) +
          '%"></i></div><small>Pointer travel · ' +
          m.mouseSpeed +
          "%</small>"
        );
      case "trackpad":
        return (
          '<div class="ns-motion"><i style="left:' +
          (6 + m.trackSpeed * 0.88) +
          '%"></i></div><small>' +
          (m.tapClick ? "Tap or press to click" : "Press to click") +
          "</small>"
        );
      case "controller":
        return (
          '<div class="ns-pad" aria-label="Controller button test">' +
          ["A", "B", "X", "Y"]
            .map(
              (k) =>
                '<button type="button" data-pad="' +
                k +
                '" aria-label="Test controller button ' +
                k +
                '">' +
                k +
                "</button>",
            )
            .join("") +
          '<span role="status">Test a button</span></div>'
        );
      case "paper":
        return "Sample print format · " + escape(m.paper) + " · " + escape(m.printer);
      default:
        return "";
    }
  }
  function sync(frame, model) {
    frame.querySelectorAll("[data-output]").forEach((node) => {
      if (node.dataset.output === "controller" && node.childElementCount) return;
      const html = sampleHtml(node.dataset.output, model);
      if (node.innerHTML !== html) node.innerHTML = html;
    });
    frame.querySelectorAll("[data-setting]").forEach((node) => {
      if (node.type === "checkbox") node.checked = model[node.dataset.setting];
      else if (node.value !== String(model[node.dataset.setting])) node.value = model[node.dataset.setting];
      if (node.dataset.setting === "btKeyboard") node.disabled = !model.bluetooth;
      if (node.dataset.setting === "autoJoin") node.disabled = !model.wifi;
      if (node.dataset.setting === "mapsLocation") node.disabled = !model.location;
    });
  }
  let audio;
  async function playTone(frame, model) {
    const feedback = frame.querySelector(".ns-feedback");
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) throw new Error("Audio unavailable");
      audio ||= new Context();
      if (audio.state === "suspended") await audio.resume();
      const oscillator = audio.createOscillator(),
        gain = audio.createGain(),
        now = audio.currentTime;
      oscillator.type = model.tone === "Woodblock" ? "triangle" : "sine";
      const freq = { Chime: 880, Marimba: 523, Pulse: 440, Woodblock: 630, Breeze: 784 }[model.tone];
      oscillator.frequency.setValueAtTime(freq, now);
      oscillator.frequency.exponentialRampToValueAtTime(freq * 0.75, now + 0.28);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(model.volume * 0.0017, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.32);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
      feedback.textContent = model.volume ? "Played " + model.tone : "Muted";
    } catch {
      if (feedback) feedback.textContent = "Audio playback unavailable";
    }
  }
  return { categories, modelFor, render, sync, playTone };
})();
