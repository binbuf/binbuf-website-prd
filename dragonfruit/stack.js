/* An annotated map of the native desktop. Routes reuse the actual nodes on the map. */
(() => {
  "use strict";
  const root = document.getElementById("stack-explorer");
  if (!root) return;
  const owners = {
    df: { name: "Dragonfruit", full: "Dragonfruit project", mark: "M1 1h10v10H1z" },
    upstream: { name: "Upstream", full: "Upstream userspace", mark: "M6 1a5 5 0 1 0 .01 0" },
    kernel: { name: "Kernel", full: "Linux kernel", mark: "M6 .5 11.5 6 6 11.5.5 6z" },
    hardware: { name: "Hardware", full: "Hardware", mark: "m6 .7 5.7 10H.3z" },
  };
  // Each entry is an architectural component or a closely related subsystem.
  // The owner field identifies the actual maintainer or authority behind the work.
  const nodes = {
    files: [
      "Files",
      "df",
      "File manager",
      "Dragonfruit project",
      "Files uses the files-core library to read directories and carry out operations such as renaming, moving and trashing files.",
      "Open Projects from the desktop and the file manager shows the contents of that directory.",
      "Explore Files",
      "https://github.com/binbuf/dragonfruit/blob/main/docs/design/09-files.md",
    ],
    syssettings: [
      "System Settings",
      "df",
      "Preferences app",
      "Dragonfruit project",
      "System Settings turns choices in the UI into requests for the service that owns each setting.",
      "Pick Tux for the system menu. The shell receives the saved preference and changes its icon.",
      "Explore System Settings",
      "https://github.com/binbuf/dragonfruit/blob/main/docs/design/08-settings.md",
    ],
    shell: [
      "Dragonfruit Shell",
      "df",
      "Dock · menu bar · Control Center",
      "Dragonfruit project",
      "The shell draws the Dock, menu bar and Control Center around your apps.",
      "Restart the shell and your open windows stay on screen. The compositor still holds them.",
      "Explore the shell design",
      "https://github.com/binbuf/dragonfruit/blob/main/docs/design/04-shell.md",
    ],
    desktopicons: [
      "Files desktop",
      "df",
      "Folders & desktop icons",
      "Dragonfruit project",
      "A separate Files process draws the contents of your Desktop folder on a layer between the wallpaper and app windows.",
      "Save a document to Desktop and its icon appears alongside your folders. Double-click a folder to open it in Files.",
      "Explore the Files desktop",
      "https://github.com/binbuf/dragonfruit/blob/main/docs/design/09-files.md",
    ],
    qt: [
      "Qt Quick",
      "upstream",
      "UI toolkit",
      "Qt project",
      "Qt Quick turns QML descriptions of controls, layouts and animations into pixels.",
      "When a Dock icon grows under your pointer, Qt Quick draws the in-between sizes.",
      "Explore the Qt Quick scene graph",
      "https://doc.qt.io/qt-6/qtquick-visualcanvas-scenegraph.html",
    ],
    qml: [
      "QML",
      "upstream",
      "Declarative UI language",
      "Qt project",
      "QML describes UI objects and binds their properties to changing data. Dragonfruit uses it to build Qt Quick interfaces.",
      "A QML height binding can resize the Dock when its size preference changes.",
      "Read about QML property bindings",
      "https://doc.qt.io/qt-6/qtqml-syntax-propertybinding.html",
    ],
    qtwayland: [
      "Qt Wayland",
      "upstream",
      "Wayland client plugin",
      "Qt project",
      "The Qt Wayland plugin connects ordinary Qt application windows to the compositor. It handles window sizes, input and the buffers that carry each frame.",
      "When you resize the Files window, the plugin delivers the new size to Qt so Files can lay out its contents again.",
      "Read about Qt on Wayland",
      "https://doc.qt.io/qt-6/wayland-and-qt.html",
    ],
    portals: [
      "XDG Desktop Portals",
      "upstream",
      "App requests",
      "XDG Desktop Portal project",
      "Portals let an app request a desktop service over D-Bus. The portal frontend routes each request to a suitable backend.",
      "When a sandboxed app asks to open a file, the same request can bring up the file picker for the current desktop.",
      "Follow a portal request",
      "https://flatpak.github.io/xdg-desktop-portal/docs/",
    ],
    portal: [
      "Dragonfruit portal backend",
      "df",
      "Desktop file & screen pickers",
      "Dragonfruit project",
      "A portal gives apps a desktop-owned picker for requests such as opening a file or sharing a screen.",
      "A sandboxed app asks for a file. You choose it in the picker, which returns access to your selection.",
      "See how the file chooser works",
      "https://github.com/binbuf/dragonfruit/blob/main/docs/design/adr/0077-filechooser-picker-seat.md",
    ],
    settings: [
      "settingsd",
      "df",
      "Desktop settings daemon",
      "Dragonfruit project",
      "This service checks preference values, saves them and tells listeners when they change.",
      "Turn on reduced motion once. The shell and compositor can apply that same choice to their animations.",
      "Follow a preference change",
      "https://github.com/binbuf/dragonfruit/blob/main/docs/design/adr/0034-compositor-policy-via-shell-bridge.md",
    ],
    menu: [
      "menu-broker & app-index",
      "df",
      "Menu & app identity daemons",
      "Dragonfruit project",
      "The app index identifies the focused app. The menu broker finds the commands that app exports.",
      "Bring Files forward and its Go menu appears at the top of the desktop.",
      "Follow the focused app’s menu",
      "https://github.com/binbuf/dragonfruit/blob/main/docs/design/06-global-menu.md",
    ],
    notifications: [
      "Notifications",
      "df",
      "Banners & history",
      "Dragonfruit project",
      "Apps send messages to the notification service. It keeps their history and signals the shell when a banner should appear.",
      "Dismiss a banner and you can still find the message in Notification Center.",
      "Explore the notification service",
      "https://github.com/binbuf/dragonfruit/tree/main/services/notifications",
    ],
    wallpaper: [
      "wallpaperd",
      "df",
      "Wallpaper catalogue",
      "Dragonfruit project",
      "The wallpaper service supplies the built-in scene and caches downloaded pictures before the desktop needs to draw them.",
      "Browse wallpapers in System Settings while your current background stays on screen.",
      "Explore the wallpaper service",
      "https://github.com/binbuf/dragonfruit/tree/main/services/wallpaperd",
    ],
    session: [
      "Session entry",
      "df",
      "Login & logout",
      "Dragonfruit project",
      "A display-manager login starts the Dragonfruit systemd user target. The compositor anchors the session and the user units supervise its services.",
      "If the shell crashes while you work, systemd can restart it while the compositor keeps your application windows open.",
      "Read the native session entry",
      "https://github.com/binbuf/dragonfruit/blob/main/services/session/dragonfruit-session-entry",
    ],
    wayland: [
      "Wayland",
      "upstream",
      "Surface protocol",
      "Wayland project",
      "Wayland defines how an app hands a finished image to the compositor and receives input.",
      "As you resize a window, the compositor suggests a size and the app sends back content that fits.",
      "Follow a Wayland surface",
      "https://wayland-book.com/surfaces-in-depth/lifecycle.html",
    ],
    compositor: [
      "Dragonfruit compositor",
      "df",
      "Rust · focus & frames",
      "Dragonfruit project",
      "The compositor assembles app windows into a frame and decides which window receives input.",
      "Click a partly covered window. One process can bring it forward and send your next keystroke there.",
      "Explore window and focus policy",
      "https://github.com/binbuf/dragonfruit/blob/main/docs/design/02-compositor.md",
    ],
    smithay: [
      "Smithay",
      "upstream",
      "Compositor toolkit",
      "Smithay project",
      "Smithay supplies the Rust building blocks for a Wayland compositor, including protocol and device handling.",
      "Smithay handles the request to create a window. Dragonfruit decides where that window belongs.",
      "Explore Smithay’s building blocks",
      "https://smithay.github.io/smithay/smithay/",
    ],
    private: [
      "Shell protocol",
      "df",
      "Trusted window control",
      "Dragonfruit project",
      "A private Wayland protocol lets the trusted shell ask the compositor to act on a particular window.",
      "Click a minimized app in the Dock. Its window identifier tells the compositor exactly which surface to restore.",
      "Read the shell protocol",
      "https://github.com/binbuf/dragonfruit/tree/main/protocols",
    ],
    xwayland: [
      "Xwayland",
      "upstream",
      "For X11 applications",
      "X.Org project",
      "Xwayland connects an older X11 app to a desktop that speaks Wayland.",
      "An X11 editor can still get keyboard focus when you switch back from a native Wayland app.",
      "See how Xwayland fits in",
      "https://wayland.freedesktop.org/docs/html/ch05.html",
    ],
    input: [
      "libinput & libseat",
      "upstream",
      "Input & seat access",
      "libinput and seat-management projects",
      "libseat provides access to the active session’s devices. libinput turns raw events into pointer motion and gestures.",
      "Two fingers moving together on a touchpad can become one scroll gesture.",
      "See how libinput recognizes gestures",
      "https://wayland.freedesktop.org/libinput/doc/latest/gestures.html",
    ],
    mesa: [
      "Mesa",
      "upstream",
      "Graphics drivers",
      "Mesa project",
      "Mesa provides userspace drivers that implement graphics APIs for many Linux GPUs.",
      "With a Mesa driver, the compositor’s drawing commands become work for the GPU behind the monitor.",
      "Explore the Mesa graphics stack",
      "https://docs.mesa3d.org/",
    ],
    egl: [
      "EGL & GBM",
      "upstream",
      "Contexts & buffers",
      "Khronos Group and Mesa project",
      "EGL creates the compositor’s rendering context. GBM provides buffers that its native display backend can use.",
      "During a window drag, the compositor needs somewhere to draw the next frame before sending it to the monitor.",
      "See Dragonfruit’s native backend",
      "https://github.com/binbuf/dragonfruit/blob/main/compositor/src/backend/drm.rs",
    ],
    opengl: [
      "OpenGL ES",
      "upstream",
      "Compositor drawing API",
      "Khronos Group",
      "Smithay’s GLES renderer blends window textures and effects into the image the compositor presents on a monitor.",
      "Drag a window across another and the renderer draws the overlapping surfaces in their new positions.",
      "Explore OpenGL ES",
      "https://www.khronos.org/opengles/",
    ],
    dbus: [
      "D-Bus",
      "upstream",
      "Service messages",
      "D-Bus ecosystem",
      "D-Bus lets separate processes send requests and subscribe to changes.",
      "When a power service reports a battery change, the shell can update its meter without repeatedly asking for a reading.",
      "Explore D-Bus messages",
      "https://dbus.freedesktop.org/doc/dbus-tutorial.html",
    ],
    status: [
      "system-status",
      "df",
      "Host service adapters",
      "Dragonfruit project",
      "This session service translates shell requests into operations on the host and reports the resulting device state.",
      "Move the volume slider. The audio adapter sets the level, then reads back the value that the host applied.",
      "Explore the audio adapter",
      "https://github.com/binbuf/dragonfruit/tree/main/services/audio",
    ],
    media: [
      "PipeWire & WirePlumber",
      "upstream",
      "Audio graph & routing",
      "PipeWire and WirePlumber projects",
      "PipeWire carries audio between apps and devices. WirePlumber decides how to connect them.",
      "Plug in headphones and a routing policy can send a playing song to the new output.",
      "Explore audio routing",
      "https://pipewire.pages.freedesktop.org/wireplumber/",
    ],
    host: [
      "NetworkManager & BlueZ",
      "upstream",
      "Wi-Fi & Bluetooth",
      "NetworkManager and BlueZ projects",
      "NetworkManager tracks connections and BlueZ manages Bluetooth devices. Dragonfruit reads their state through its host adapters.",
      "Open the Wi-Fi menu to see networks discovered by NetworkManager, or Bluetooth to see devices known to BlueZ.",
      "Explore the host service contract",
      "https://github.com/binbuf/dragonfruit/blob/main/docs/design/distro-compatibility.md",
    ],
    storagepower: [
      "UPower & UDisks2",
      "upstream",
      "Batteries & storage",
      "UPower and UDisks projects",
      "UPower reports battery state. UDisks2 identifies drives and exposes operations such as mounting a volume.",
      "The battery meter and the list of removable drives each reflect the state reported by a host service.",
      "Explore the host service matrix",
      "https://github.com/binbuf/dragonfruit/blob/main/docs/design/distro-compatibility.md",
    ],
    polkit: [
      "polkit",
      "upstream",
      "Authorization",
      "polkit project",
      "When a system service receives a privileged request, polkit checks host policy and can ask the session’s authentication agent to confirm your identity.",
      "An administrator prompt can authorize one operation while the Settings app keeps running with your normal permissions.",
      "Explore polkit authorization",
      "https://www.freedesktop.org/software/polkit/docs/latest/polkit.8.html",
    ],
    systemd: [
      "systemd / logind",
      "upstream",
      "Process & login lifecycle",
      "systemd project",
      "systemd manages services. Its login service, logind, tracks sessions and seats so device access follows the active login.",
      "Switch to a different login session and the compositor’s access to the seat’s devices can change with it.",
      "Explore login sessions and seats",
      "https://www.freedesktop.org/software/systemd/man/latest/systemd-logind.service.html",
    ],
    glibc: [
      "glibc",
      "upstream",
      "C runtime library",
      "GNU C Library project",
      "glibc provides common functions and wrappers for Linux system calls used by applications and libraries.",
      "Reading a configuration file through the C library ultimately asks the kernel to read bytes from an open file.",
      "Explore the GNU C Library",
      "https://sourceware.org/glibc/",
    ],
    udev: [
      "udev",
      "upstream",
      "Device discovery",
      "systemd project",
      "udev tells userspace which devices are present and announces changes. Dragonfruit’s native backend uses that information to find graphics and input devices on your seat.",
      "Plug in a mouse and the input stack can discover it while your session is running.",
      "See native device discovery",
      "https://github.com/binbuf/dragonfruit/blob/main/compositor/src/backend/drm.rs",
    ],
    linux: [
      "Linux",
      "kernel",
      "Operating system kernel",
      "Linux kernel project",
      "Linux schedules processes, manages memory and exposes device interfaces to userspace.",
      "While a browser loads a page, the scheduler can also give the compositor CPU time to prepare the next frame.",
      "Explore the Linux kernel",
      "https://docs.kernel.org/",
    ],
    kms: [
      "DRM / KMS",
      "kernel",
      "Native display output",
      "Linux kernel graphics subsystem",
      "The kernel’s display interface chooses an output mode and schedules which framebuffer the monitor sees next.",
      "At refresh time, a page flip switches the display to the frame the compositor just prepared.",
      "See how a page flip works",
      "https://docs.kernel.org/gpu/drm-kms.html",
    ],
    evdev: [
      "evdev",
      "kernel",
      "Input event interface",
      "Linux kernel input subsystem",
      "evdev gives Linux input drivers a shared way to report key presses, motion and button releases.",
      "Press a mouse button and libinput can read a standard event regardless of the mouse brand.",
      "Read the Linux input event guide",
      "https://docs.kernel.org/input/event-codes.html",
    ],
    drivers: [
      "Device drivers",
      "kernel",
      "Audio · network · storage",
      "Linux kernel driver subsystems",
      "Kernel drivers translate system requests into commands a particular device understands.",
      "When you save a document, the storage driver sends writes to the drive’s controller.",
      "Explore the Linux driver model",
      "https://docs.kernel.org/driver-api/driver-model/overview.html",
    ],
    cpu: [
      "CPU",
      "hardware",
      "x86-64 · ARM64",
      "Processor designers and manufacturers",
      "The CPU executes the machine code for applications and the kernel. x86-64 and ARM64 are two instruction set architectures.",
      "Launching an app requires executable code that the processor can run, either directly or through a compatible translation layer.",
      "Explore CPU architectures in Linux",
      "https://docs.kernel.org/arch/",
    ],
    memory: [
      "Memory",
      "hardware",
      "RAM",
      "Memory manufacturers",
      "RAM holds the working data of the kernel, compositor and applications. The kernel manages how much memory each process can address.",
      "Switch back to an open folder and Files can reuse directory information it already holds in memory.",
      "Explore Linux memory management",
      "https://docs.kernel.org/admin-guide/mm/concepts.html",
    ],
    display: [
      "GPU & display",
      "hardware",
      "Render & scan out",
      "Graphics and display manufacturers",
      "The GPU draws pixels into memory. The display engine reads a completed frame and sends it to the screen.",
      "A 120 Hz display has a new refresh about every 8.3 milliseconds, giving the next frame a chance to appear.",
      "Follow a frame to the display",
      "https://docs.kernel.org/gpu/drm-kms.html",
    ],
    controls: [
      "Keyboard & pointer",
      "hardware",
      "Physical input",
      "Input-device manufacturers",
      "Key switches and pointing sensors turn physical movement into device reports.",
      "A key press starts as a switch changing state. Higher layers decide which app receives it and what letter appears.",
      "Explore input device reports",
      "https://docs.kernel.org/hid/hidintro.html",
    ],
    devices: [
      "Audio & I/O devices",
      "hardware",
      "Sound · radios · disks",
      "Device manufacturers",
      "Speakers, radios and drives turn commands into sound, wireless signals or stored data.",
      "Follow a song all the way down and it ends with a speaker moving air.",
      "Explore the Linux sound system",
      "https://docs.kernel.org/sound/index.html",
    ],
  };
  const rows = [
    [
      "Application Layer",
      ["files", "syssettings"],
      '<rect x="12" y="6" width="36" height="26" rx="3"/><path d="M12 14h36m-30-4h1m4 0h1m-6 10h9m-9 6h18"/>',
    ],
    [
      "Desktop Shell",
      ["shell", "desktopicons"],
      '<rect x="10" y="6" width="40" height="26" rx="3"/><path d="M10 12h40"/><rect x="17" y="23" width="26" height="6" rx="3"/><path d="M22 26h1m6 0h1m6 0h1"/>',
    ],
    [
      "UI Framework",
      ["qt", "qml", "qtwayland"],
      '<rect x="12" y="7" width="13" height="12" rx="2"/><rect x="31" y="7" width="16" height="7" rx="2"/><rect x="31" y="19" width="16" height="12" rx="2"/><path d="M12 26h13m-13 5h8"/>',
    ],
    [
      "Desktop Platform",
      ["portals", "portal", "settings", "menu", "session", "notifications", "wallpaper"],
      '<path d="M29 15v6m-13 4v-4h27v4"/><rect x="22" y="5" width="16" height="10" rx="2"/><rect x="10" y="25" width="12" height="7" rx="1.5"/><rect x="37" y="25" width="12" height="7" rx="1.5"/>',
    ],
    [
      "Windowing System",
      ["wayland", "compositor", "smithay", "private", "xwayland", "input"],
      '<rect x="11" y="7" width="28" height="20" rx="2"/><rect x="22" y="15" width="27" height="18" rx="2"/><path d="M15 12h12m-1 8h19"/>',
    ],
    [
      "Graphics Subsystem",
      ["mesa", "egl", "opengl"],
      '<path d="m10 30 15-23 9 19 7-12 9 17H10zm15-23 3 23m0 0 13-16m-16-7 16 7"/>',
    ],
    [
      "System Services",
      ["dbus", "status", "media", "host", "storagepower", "polkit"],
      '<path d="m17 23 12-11 15 12m-25 1 9 5 13-5"/><circle cx="15" cy="24" r="4"/><circle cx="30" cy="11" r="4"/><circle cx="45" cy="24" r="4"/>',
    ],
    [
      "System Runtime",
      ["systemd", "glibc", "udev"],
      '<rect x="11" y="8" width="38" height="24" rx="3"/><path d="m17 16 6 5-6 5m12 0h12"/>',
    ],
    [
      "Operating System Kernel",
      ["linux", "kms", "evdev", "drivers"],
      '<path d="M20 11V7m7 4V7m7 4V7m7 4V7M20 31v4m7-4v4m7-4v4m7-4v4M15 16h-5m5 6h-5m5 6h-5m36-12h5m-5 6h5m-5 6h5"/><rect x="15" y="11" width="31" height="20" rx="3"/><rect x="22" y="16" width="17" height="10" rx="1"/>',
    ],
    [
      "Hardware Platform",
      ["cpu", "memory", "display", "controls", "devices"],
      '<rect x="10" y="6" width="34" height="22" rx="2"/><path d="M11 23h32m-17 5v5m-8 0h16"/><rect x="46" y="13" width="7" height="18" rx="1.5"/><path d="M49 17h1m-1 5h1"/>',
    ],
  ];
  function layerGlyph(motif) {
    return (
      '<div class="am-rail" aria-hidden="true"><svg class="am-layer-glyph" viewBox="0 0 60 50" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-linecap="round"><g class="am-plinth"><path d="m3 31 27-13 27 13v5L30 49 3 36z"/><path d="m3 31 27 13 27-13m-27 13v5"/></g><g class="am-motif">' +
      motif +
      "</g></svg></div>"
    );
  }
  // Neutral links describe the interfaces in the complete map. Trace paths show
  // direction and include the return leg when a service replies to the shell.
  const edges = [
    ["files", "qt"],
    ["syssettings", "qt"],
    ["desktopicons", "private"],
    ["shell", "qt"],
    ["qml", "qt"],
    ["qtwayland", "wayland"],
    ["qt", "qtwayland"],
    ["notifications", "dbus"],
    ["wallpaper", "dbus"],
    ["shell", "private"],
    ["shell", "menu"],
    ["syssettings", "dbus"],
    ["dbus", "settings"],
    ["dbus", "status"],
    ["portals", "portal"],
    ["portal", "dbus"],
    ["session", "systemd"],
    ["wayland", "compositor"],
    ["private", "compositor"],
    ["xwayland", "compositor"],
    ["compositor", "smithay"],
    ["compositor", "opengl"],
    ["compositor", "egl"],
    ["compositor", "input"],
    ["opengl", "mesa"],
    ["mesa", "kms"],
    ["egl", "kms"],
    ["status", "media"],
    ["status", "host"],
    ["media", "drivers"],
    ["host", "drivers"],
    ["status", "storagepower"],
    ["storagepower", "drivers"],
    ["polkit", "dbus"],
    ["input", "systemd"],
    ["input", "evdev"],
    ["systemd", "linux"],
    ["input", "udev"],
    ["udev", "linux"],
    ["glibc", "linux"],
    ["linux", "cpu"],
    ["linux", "memory"],
    ["kms", "display"],
    ["evdev", "controls"],
    ["drivers", "devices"],
  ];
  const routes = {
    all: { label: "All components" },
    frame: {
      label: "Draw a frame",
      steps: [
        ["files", "Files updates its folder view when you open a directory."],
        ["qt", "Qt Quick renders the updated view into the app’s window buffer."],
        ["wayland", "The application attaches its buffer and commits the surface."],
        ["compositor", "The compositor assembles visible windows and effects for this output."],
        ["egl", "The native backend uses an EGL context and GBM buffers for its output."],
        ["opengl", "Smithay’s OpenGL ES renderer draws the visible surfaces into the output buffer."],
        ["kms", "The DRM backend queues a framebuffer for presentation."],
        ["display", "The display engine scans the framebuffer to the panel."],
      ],
    },
    focus: {
      label: "Switch windows",
      steps: [
        ["controls", "A button press starts at the physical pointer."],
        ["evdev", "The kernel makes that input event available to userspace."],
        ["input", "libinput decodes the event for the compositor’s active seat."],
        ["compositor", "Hit testing finds the window and the compositor updates focus."],
        ["private", "The shell receives the focused toplevel’s identity over its private protocol."],
        ["shell", "The shell resolves the app and requests its menu."],
        ["menu", "The broker selects the focused app’s available menu model."],
        ["shell", "The menu bar updates its app name and menu titles."],
      ],
    },
    motion: {
      label: "Reduce motion",
      steps: [
        ["syssettings", "The Accessibility pane requests a reduced-motion preference."],
        ["dbus", "A typed Set request reaches the desktop settings service."],
        ["settings", "settingsd validates and persists the value, then emits a change signal."],
        ["shell", "The shell updates its animations and forwards the resolved policy."],
        ["private", "The private protocol sends the reduced-motion setting to the compositor."],
        ["compositor", "Window effects now follow the same preference as the shell."],
      ],
    },
    audio: {
      label: "Change volume",
      steps: [
        ["shell", "The volume slider requests a new level for the default output."],
        ["dbus", "The shell sends SetVolume to the system-status service."],
        ["status", "The audio adapter invokes wpctl to apply the requested output level."],
        ["media", "WirePlumber applies the change to the default PipeWire sink."],
        ["status", "The adapter refreshes the real device snapshot."],
        ["shell", "The shell displays the reported output level."],
      ],
    },
  };
  const esc = (s) =>
    s.replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const glyph = (owner) =>
    '<svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="' +
    owners[owner].mark +
    '"/></svg>';
  const ownerTag = (owner, long = false) =>
    '<span class="am-owner" data-owner="' +
    owner +
    '">' +
    glyph(owner) +
    esc(long ? owners[owner].full : owners[owner].name) +
    "</span>";
  const traceModes = Object.entries(routes)
    .map(
      ([id, item]) =>
        '<button class="am-mode" data-mode="' +
        id +
        '" aria-pressed="' +
        (id === "all") +
        '">' +
        esc(item.label) +
        "</button>",
    )
    .join("");
  function componentTile(id) {
    const [label, owner, sub, authority, role, value] = nodes[id];
    return `<button class="am-node" data-node="${id}" data-owner="${owner}"
      aria-pressed="false" aria-controls="am-detail" aria-describedby="am-desc-${id}">
      ${ownerTag(owner)}<strong>${esc(label)}</strong><small>${esc(sub)}</small>
    </button><span hidden id="am-desc-${id}">${esc(authority)}. ${esc(role)} ${esc(value)}</span>`;
  }
  const mapRows = rows
    .map(([name, ids, motif], index) => {
      const level = rows.length - index;
      const columns = ids.length > 5 ? Math.ceil(ids.length / 2) : ids.length;
      return `<section class="am-band" aria-labelledby="am-level-${level}">
      ${layerGlyph(motif)}
      <h4 id="am-level-${level}"><span class="am-level">${level}.</span> ${esc(name)}</h4>
      <div class="am-nodes" style="--count: ${columns}">${ids.map(componentTile).join("")}</div>
    </section>`;
    })
    .join("");
  root.querySelector(".am-instruction").hidden = false;
  root.querySelector(".am-key").innerHTML = Object.keys(owners)
    .map((owner) => ownerTag(owner, true))
    .join("");
  root.querySelector(".am-outline").outerHTML =
    '<div class="am-board"><div class="am-toolbar"><span class="am-toolbar-title">Trace a path</span><div class="am-options" role="group" aria-label="Architecture paths">' +
    traceModes +
    "</div></div>" +
    '<div class="am-run" hidden><div class="am-run-info"><b class="am-count"></b><span class="am-step-description" aria-live="polite" aria-atomic="true"><strong class="am-step-layer"></strong><span class="am-step-text"></span></span></div><div class="am-playback"><button data-control="prev" aria-label="Previous trace step">‹</button><button data-control="play">Play</button><button data-control="next" aria-label="Next trace step">›</button></div></div>' +
    '<div class="am-drawing"><svg class="am-lines" aria-hidden="true" preserveAspectRatio="none"><g class="am-wires"></g><g class="am-route-lines"></g></svg>' +
    mapRows +
    "</div>" +
    '<aside class="am-insight" id="am-detail" aria-label="Selected component" data-owner="df"><div class="am-insight-name"></div><div class="am-insight-facts"></div></aside></div>';
  const q = (s) => root.querySelector(s),
    all = (s) => [...root.querySelectorAll(s)];
  const field = q(".am-drawing"),
    insight = q(".am-insight"),
    lines = q(".am-lines"),
    run = q(".am-run");
  const elements = new Map(all(".am-node").map((el) => [el.dataset.node, el]));
  const hover = matchMedia("(hover: hover) and (min-width: 701px)");
  const less = matchMedia("(prefers-reduced-motion: reduce)");
  let mode = "all",
    step = 0,
    chosen = "compositor",
    timer = null,
    openTip = null,
    layoutFrame = 0;
  const tip = document.createElement("div");
  tip.className = "am-tip";
  tip.setAttribute("role", "region");
  tip.hidden = true;
  root.append(tip);
  let tipClose;
  function hideTip() {
    clearTimeout(tipClose);
    if (openTip) elements.get(openTip).closest(".am-band").removeAttribute("data-preview");
    tip.hidden = true;
    openTip = null;
  }
  function positionTip(button) {
    const rect = button.getBoundingClientRect(),
      box = tip.getBoundingClientRect(),
      gap = 10;
    const left = Math.max(
      10,
      Math.min(innerWidth - box.width - 10, rect.left + (rect.width - box.width) / 2),
    );
    let top = rect.bottom + gap;
    if (top + box.height > innerHeight - 10 && rect.top - box.height - gap >= 10)
      top = rect.top - box.height - gap;
    tip.style.left = left + "px";
    tip.style.top = Math.max(8, Math.min(innerHeight - box.height - 8, top)) + "px";
  }
  function lesson(id) {
    const [, , , , role, example] = nodes[id];
    return (
      '<p class="am-role">' +
      esc(role) +
      '</p><div class="am-example"><span>On your desktop</span><p>' +
      esc(example) +
      "</p></div>"
    );
  }
  function byline(id) {
    const [, owner, , authority] = nodes[id];
    return (
      '<div class="am-byline">' +
      ownerTag(owner) +
      (owner === "df" ? "" : "<span>" + esc(authority) + "</span>") +
      "</div>"
    );
  }
  function readingLink(id) {
    const [, , , , , , read, url] = nodes[id];
    return (
      '<a class="am-reading" href="' + esc(url) + '">' + esc(read) + ' <span aria-hidden="true">↗</span></a>'
    );
  }
  function tooltip(id) {
    if (!hover.matches) return;
    if (openTip && openTip !== id) hideTip();
    clearTimeout(tipClose);
    const [name, owner] = nodes[id];
    elements.get(id).closest(".am-band").setAttribute("data-preview", "");
    tip.setAttribute("aria-label", name + " preview");
    tip.dataset.owner = owner;
    tip.innerHTML = byline(id) + "<strong>" + esc(name) + "</strong>" + lesson(id) + readingLink(id);
    tip.hidden = false;
    openTip = id;
    positionTip(elements.get(id));
  }
  function updateDetail(id) {
    chosen = id;
    const [name, owner] = nodes[id];
    insight.dataset.owner = owner;
    q(".am-insight-name").innerHTML = byline(id) + "<h4>" + esc(name) + "</h4>";
    q(".am-insight-facts").innerHTML = lesson(id) + readingLink(id);
    for (const [key, el] of elements) el.setAttribute("aria-pressed", String(id === key));
  }
  function selectNode(id) {
    updateDetail(id);
    scheduleDraw();
  }
  function stop() {
    clearTimeout(timer);
    timer = null;
    q('[data-control="play"]').textContent = less.matches ? "Next step" : "Play";
    q('[data-control="play"]').setAttribute(
      "aria-label",
      less.matches ? "Advance the trace" : "Play the trace",
    );
  }
  function chooseStep(index) {
    const steps = routes[mode].steps;
    step = index;
    const [id, detail] = steps[index];
    q(".am-count").textContent = index + 1 + " / " + steps.length;
    const layer = elements.get(id).closest(".am-band").querySelector("h4");
    q(".am-step-layer").textContent = layer.textContent + " · " + nodes[id][0];
    q(".am-step-text").textContent = detail;
    q('[data-control="prev"]').disabled = index === 0;
    q('[data-control="next"]').disabled = index === steps.length - 1;
    selectNode(id);
  }
  function setMode(id) {
    stop();
    hideTip();
    restoreDetailLocation();
    mode = id;
    root.dataset.route = id;
    for (const el of all("[data-mode]")) el.setAttribute("aria-pressed", String(el.dataset.mode === id));
    const steps = routes[id].steps;
    run.hidden = !steps;
    for (const [key, el] of elements) el.classList.toggle("am-on-path", !!steps?.some(([x]) => x === key));
    if (steps) chooseStep(0);
    else selectNode(chosen);
  }
  function play() {
    if (timer !== null) {
      stop();
      return;
    }
    const last = routes[mode].steps.length - 1;
    if (less.matches) {
      chooseStep(step === last ? 0 : step + 1);
      return;
    }
    if (step === last) chooseStep(0);
    q('[data-control="play"]').textContent = "Pause";
    q('[data-control="play"]').setAttribute("aria-label", "Pause the trace");
    const tick = () => {
      if (step === last) {
        stop();
        return;
      }
      chooseStep(step + 1);
      timer = setTimeout(tick, 2100);
    };
    timer = setTimeout(tick, 1400);
  }
  function pathFor(a, b, offset, local) {
    const down = b.y >= a.y;
    const ax = a.x + a.w * 0.5,
      ay = down ? a.y + a.h : a.y;
    const bx = b.x + b.w * 0.5,
      by = down ? b.y : b.y + b.h;
    // Same band: use the local gutter above or below its cards.
    if (Math.abs(a.y - b.y) < 3) {
      const y = ay + 4 + offset;
      return "M" + ax + " " + ay + " V" + y + " H" + bx + " V" + (b.y + b.h);
    }
    if (local) {
      const mid = (ay + by) / 2 + offset;
      return "M" + ax + " " + ay + " V" + mid + " H" + bx + " V" + by;
    }
    // Long and cross-band connections take the outer gutter, away from labels.
    const edge = field.clientWidth - 4 - (Math.abs(offset) % 3) * 2;
    const y1 = ay + (down ? 4 : -4),
      y2 = by + (down ? -4 : 4);
    return "M" + ax + " " + ay + " V" + y1 + " H" + edge + " V" + y2 + " H" + bx + " V" + by;
  }
  function draw() {
    layoutFrame = 0;
    const origin = field.getBoundingClientRect(),
      rects = new Map();
    if (!origin.width) return;
    for (const [id, el] of elements) {
      const r = el.getBoundingClientRect();
      rects.set(id, { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height });
    }
    lines.setAttribute("viewBox", "0 0 " + origin.width + " " + origin.height);
    const tops = [...new Set([...rects.values()].map((r) => Math.round(r.y)))].sort((a, b) => a - b);
    // Parallel wires in a shared gutter are offset to keep their endpoints legible.
    const wire = (a, b, i, active = false, focus = false) => {
      const r1 = rects.get(a),
        r2 = rects.get(b);
      const adjacent = Math.abs(tops.indexOf(Math.round(r1.y)) - tops.indexOf(Math.round(r2.y))) <= 1;
      const d = pathFor(r1, r2, (i % 3) - 1, adjacent);
      const end = Math.abs(r1.y - r2.y) < 3 ? r2.y + r2.h : r2.y >= r1.y ? r2.y : r2.y + r2.h,
        x = r2.x + r2.w / 2;
      return (
        '<g class="' +
        (active ? "am-trace " : "") +
        (focus ? "am-wire-focus" : "") +
        '"><path d="' +
        d +
        '"/><circle cx="' +
        x +
        '" cy="' +
        end +
        '" r="' +
        (active ? 2.7 : 1.8) +
        '"/></g>'
      );
    };
    q(".am-wires").innerHTML = edges
      .map(([a, b], i) => wire(a, b, i, false, mode === "all" && (chosen === a || chosen === b)))
      .join("");
    const steps = routes[mode].steps || [];
    q(".am-route-lines").innerHTML = steps
      .slice(1)
      .map(([id], i) => wire(steps[i][0], id, i, true, i === Math.max(0, step - 1)))
      .join("");
  }
  function scheduleDraw() {
    if (!layoutFrame) layoutFrame = requestAnimationFrame(draw);
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.mode) {
      setMode(b.dataset.mode);
      return;
    }
    if (b.dataset.node) {
      stop();
      hideTip();
      selectNode(b.dataset.node);
      b.closest(".am-band").after(insight);
      insight.classList.add("am-inline");
      if (e.detail === 0) insight.querySelector(".am-reading").focus({ preventScroll: true });
      if (!hover.matches || e.detail === 0) {
        insight.scrollIntoView({ block: "nearest", behavior: less.matches ? "instant" : "smooth" });
      }
      return;
    }
    if (b.dataset.control === "play") play();
    if (b.dataset.control === "prev") {
      stop();
      chooseStep(Math.max(0, step - 1));
    }
    if (b.dataset.control === "next") {
      stop();
      chooseStep(Math.min(routes[mode].steps.length - 1, step + 1));
    }
  });
  root.addEventListener("pointerover", (e) => {
    const b = e.target.closest(".am-node");
    if (e.pointerType === "touch" || !hover.matches || !b || b.contains(e.relatedTarget)) return;
    if (timer !== null) return;
    tooltip(b.dataset.node);
  });
  root.addEventListener("pointerout", (e) => {
    const b = e.target.closest(".am-node");
    if (b && !b.contains(e.relatedTarget)) tipClose = setTimeout(hideTip, 160);
  });
  root.addEventListener("focusin", (e) => {
    const b = e.target.closest(".am-node");
    if (b) {
      stop();
      tooltip(b.dataset.node);
    }
  });
  tip.addEventListener("pointerenter", () => clearTimeout(tipClose));
  tip.addEventListener("pointerleave", () => {
    if (!tip.contains(document.activeElement)) hideTip();
  });
  root.addEventListener("focusout", (e) => {
    if (!tip.contains(e.relatedTarget)) hideTip();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && openTip) {
      if (tip.contains(document.activeElement)) elements.get(openTip).focus({ preventScroll: true });
      hideTip();
    }
  });
  root.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      stop();
      return;
    }
    const b = e.target.closest(".am-mode,.am-node");
    if (!b || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    const options = b.matches(".am-mode") ? all(".am-mode") : all(".am-node");
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? options.length - 1
          : (options.indexOf(b) + (e.key === "ArrowLeft" ? -1 : 1) + options.length) % options.length;
    e.preventDefault();
    options[next].focus();
    if (b.matches(".am-mode")) setMode(options[next].dataset.mode);
  });
  function restoreDetailLocation() {
    if (insight.classList.contains("am-inline")) {
      field.after(insight);
      insight.classList.remove("am-inline");
      scheduleDraw();
    }
  }
  hover.addEventListener("change", () => {
    hideTip();
    restoreDetailLocation();
  });
  less.addEventListener("change", stop);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
  window.addEventListener(
    "scroll",
    () => {
      if (!openTip) return;
      const button = elements.get(openTip);
      if (button.matches(":hover, :focus-visible") || tip.matches(":hover")) positionTip(button);
      else hideTip();
    },
    { passive: true },
  );
  if ("ResizeObserver" in window) new ResizeObserver(scheduleDraw).observe(field);
  else window.addEventListener("resize", scheduleDraw);
  if ("IntersectionObserver" in window)
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stop();
    }).observe(root);
  setMode("all");
  scheduleDraw();
})();
