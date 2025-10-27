const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["codeMirrorModule.js","form.js","settings.js","form.css","codeMirrorModule.css"])))=>i.map(i=>d[i]);
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { R as React, j as jsxRuntimeExports, r as reactExports, P as PreferencesForm, c as clientExports } from "./form.js";
import { d as defaultSettings, l as loadSettings, a as addSettingsChangedListener, r as removeSettingsChangedListener } from "./settings.js";
import { a as aiSelfHealingService, s as selfHealingService, b as apiTestingService } from "./apiTestingService.js";
function useMeasure() {
  const ref = React.useRef(null);
  const [measure, setMeasure] = React.useState(new DOMRect(0, 0, 10, 10));
  React.useLayoutEffect(() => {
    const target = ref.current;
    if (!target)
      return;
    const bounds = target.getBoundingClientRect();
    setMeasure(new DOMRect(0, 0, bounds.width, bounds.height));
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry && entry.contentRect)
        setMeasure(entry.contentRect);
    });
    resizeObserver.observe(target);
    return () => resizeObserver.disconnect();
  }, [ref]);
  return [measure, ref];
}
function msToString(ms) {
  if (ms < 0 || !isFinite(ms))
    return "-";
  if (ms === 0)
    return "0";
  if (ms < 1e3)
    return ms.toFixed(0) + "ms";
  const seconds = ms / 1e3;
  if (seconds < 60)
    return seconds.toFixed(1) + "s";
  const minutes = seconds / 60;
  if (minutes < 60)
    return minutes.toFixed(1) + "m";
  const hours = minutes / 60;
  if (hours < 24)
    return hours.toFixed(1) + "h";
  const days = hours / 24;
  return days.toFixed(1) + "d";
}
function copy(text) {
  const textArea = document.createElement("textarea");
  textArea.style.position = "absolute";
  textArea.style.zIndex = "-1000";
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
}
function useSetting(name, defaultValue) {
  if (name)
    defaultValue = settings.getObject(name, defaultValue);
  const [value, setValue] = React.useState(defaultValue);
  const setValueWrapper = React.useCallback((value2) => {
    if (name)
      settings.setObject(name, value2);
    else
      setValue(value2);
  }, [name, setValue]);
  React.useEffect(() => {
    if (name) {
      const onStoreChange = () => setValue(settings.getObject(name, defaultValue));
      settings.onChangeEmitter.addEventListener(name, onStoreChange);
      return () => settings.onChangeEmitter.removeEventListener(name, onStoreChange);
    }
  }, [defaultValue, name]);
  return [value, setValueWrapper];
}
class Settings {
  constructor() {
    this.onChangeEmitter = new EventTarget();
  }
  getString(name, defaultValue) {
    return localStorage[name] || defaultValue;
  }
  setString(name, value) {
    var _a;
    localStorage[name] = value;
    this.onChangeEmitter.dispatchEvent(new Event(name));
    (_a = window.saveSettings) == null ? void 0 : _a.call(window);
  }
  getObject(name, defaultValue) {
    if (!localStorage[name])
      return defaultValue;
    try {
      return JSON.parse(localStorage[name]);
    } catch {
      return defaultValue;
    }
  }
  setObject(name, value) {
    var _a;
    localStorage[name] = JSON.stringify(value);
    this.onChangeEmitter.dispatchEvent(new Event(name));
    (_a = window.saveSettings) == null ? void 0 : _a.call(window);
  }
}
const settings = new Settings();
function clsx(...classes) {
  return classes.filter(Boolean).join(" ");
}
const kControlCodesRe = "\\u0000-\\u0020\\u007f-\\u009f";
const kWebLinkRe = new RegExp("(?:[a-zA-Z][a-zA-Z0-9+.-]{2,}:\\/\\/|www\\.)[^\\s" + kControlCodesRe + '"]{2,}[^\\s' + kControlCodesRe + `"')}\\],:;.!?]`, "ug");
function applyTheme() {
  if (document.playwrightThemeInitialized)
    return;
  document.playwrightThemeInitialized = true;
  document.defaultView.addEventListener("focus", (event) => {
    if (event.target.document.nodeType === Node.DOCUMENT_NODE)
      document.body.classList.remove("inactive");
  }, false);
  document.defaultView.addEventListener("blur", (event) => {
    document.body.classList.add("inactive");
  }, false);
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const defaultTheme = prefersDarkScheme.matches ? "dark-mode" : "light-mode";
  const currentTheme2 = settings.getString("theme", defaultTheme);
  if (currentTheme2 === "dark-mode")
    document.body.classList.add("dark-mode");
}
const listeners = /* @__PURE__ */ new Set();
function toggleTheme() {
  const oldTheme = currentTheme();
  const newTheme = oldTheme === "dark-mode" ? "light-mode" : "dark-mode";
  if (oldTheme)
    document.body.classList.remove(oldTheme);
  document.body.classList.add(newTheme);
  settings.setString("theme", newTheme);
  for (const listener of listeners)
    listener(newTheme);
}
function currentTheme() {
  return document.body.classList.contains("dark-mode") ? "dark-mode" : "light-mode";
}
const Toolbar = ({
  noShadow,
  children,
  noMinHeight,
  className,
  sidebarBackground,
  onClick
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: clsx("toolbar", noShadow && "no-shadow", noMinHeight && "no-min-height", className, sidebarBackground && "toolbar-sidebar-background"), onClick, children });
};
const ToolbarButton = reactExports.forwardRef(function ToolbarButton2({
  children,
  title = "",
  icon,
  disabled = false,
  toggled = false,
  onClick = () => {
  },
  style,
  testId,
  className,
  ariaLabel
}, ref) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      ref,
      className: clsx(className, "toolbar-button", icon, toggled && "toggled"),
      onMouseDown: preventDefault,
      onClick,
      onDoubleClick: preventDefault,
      title,
      disabled: !!disabled,
      style,
      "data-testid": testId,
      "aria-label": ariaLabel || title,
      children: [
        icon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `codicon codicon-${icon}`, style: children ? { marginRight: 5 } : {} }),
        children
      ]
    }
  );
});
const ToolbarSeparator = ({
  style
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "toolbar-separator", style });
};
const preventDefault = (e) => {
  e.stopPropagation();
  e.preventDefault();
};
const Dialog = ({ isOpen, onClose, title, children }) => {
  if (!isOpen)
    return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "dialog-overlay", role: "dialog", "aria-label": title, onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dialog-box", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dialog-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "dialog-close", onClick: onClose, children: "×" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "dialog-content", children })
  ] }) });
};
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    let allSettled2 = function(promises) {
      return Promise.all(
        promises.map(
          (p) => Promise.resolve(p).then(
            (value) => ({ status: "fulfilled", value }),
            (reason) => ({ status: "rejected", reason })
          )
        )
      );
    };
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = allSettled2(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
function ansi2html(text, defaultColors) {
  const regex = /(\x1b\[(\d+(;\d+)*)m)|([^\x1b]+)/g;
  const tokens = [];
  let match;
  let style = {};
  let reverse = false;
  let fg = defaultColors == null ? void 0 : defaultColors.fg;
  let bg = defaultColors == null ? void 0 : defaultColors.bg;
  while ((match = regex.exec(text)) !== null) {
    const [, , codeStr, , text2] = match;
    if (codeStr) {
      const code = +codeStr;
      switch (code) {
        case 0:
          style = {};
          break;
        case 1:
          style["font-weight"] = "bold";
          break;
        case 2:
          style["opacity"] = "0.8";
          break;
        case 3:
          style["font-style"] = "italic";
          break;
        case 4:
          style["text-decoration"] = "underline";
          break;
        case 7:
          reverse = true;
          break;
        case 8:
          style.display = "none";
          break;
        case 9:
          style["text-decoration"] = "line-through";
          break;
        case 22:
          delete style["font-weight"];
          delete style["font-style"];
          delete style["opacity"];
          delete style["text-decoration"];
          break;
        case 23:
          delete style["font-weight"];
          delete style["font-style"];
          delete style["opacity"];
          break;
        case 24:
          delete style["text-decoration"];
          break;
        case 27:
          reverse = false;
          break;
        case 30:
        case 31:
        case 32:
        case 33:
        case 34:
        case 35:
        case 36:
        case 37:
          fg = ansiColors[code - 30];
          break;
        case 39:
          fg = defaultColors == null ? void 0 : defaultColors.fg;
          break;
        case 40:
        case 41:
        case 42:
        case 43:
        case 44:
        case 45:
        case 46:
        case 47:
          bg = ansiColors[code - 40];
          break;
        case 49:
          bg = defaultColors == null ? void 0 : defaultColors.bg;
          break;
        case 53:
          style["text-decoration"] = "overline";
          break;
        case 90:
        case 91:
        case 92:
        case 93:
        case 94:
        case 95:
        case 96:
        case 97:
          fg = brightAnsiColors[code - 90];
          break;
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
          bg = brightAnsiColors[code - 100];
          break;
      }
    } else if (text2) {
      const styleCopy = { ...style };
      const color = reverse ? bg : fg;
      if (color !== void 0)
        styleCopy["color"] = color;
      const backgroundColor = reverse ? fg : bg;
      if (backgroundColor !== void 0)
        styleCopy["background-color"] = backgroundColor;
      tokens.push(`<span style="${styleBody(styleCopy)}">${escapeHTML(text2)}</span>`);
    }
  }
  return tokens.join("");
}
const ansiColors = {
  0: "var(--vscode-terminal-ansiBlack)",
  1: "var(--vscode-terminal-ansiRed)",
  2: "var(--vscode-terminal-ansiGreen)",
  3: "var(--vscode-terminal-ansiYellow)",
  4: "var(--vscode-terminal-ansiBlue)",
  5: "var(--vscode-terminal-ansiMagenta)",
  6: "var(--vscode-terminal-ansiCyan)",
  7: "var(--vscode-terminal-ansiWhite)"
};
const brightAnsiColors = {
  0: "var(--vscode-terminal-ansiBrightBlack)",
  1: "var(--vscode-terminal-ansiBrightRed)",
  2: "var(--vscode-terminal-ansiBrightGreen)",
  3: "var(--vscode-terminal-ansiBrightYellow)",
  4: "var(--vscode-terminal-ansiBrightBlue)",
  5: "var(--vscode-terminal-ansiBrightMagenta)",
  6: "var(--vscode-terminal-ansiBrightCyan)",
  7: "var(--vscode-terminal-ansiBrightWhite)"
};
function escapeHTML(text) {
  return text.replace(/[&"<>]/g, (c) => ({ "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" })[c]);
}
function styleBody(style) {
  return Object.entries(style).map(([name, value]) => `${name}: ${value}`).join("; ");
}
const CodeMirrorWrapper = ({
  text,
  language,
  mimeType,
  linkify,
  readOnly,
  highlight,
  revealLine,
  lineNumbers,
  isFocused,
  focusOnChange,
  wrapLines,
  onChange,
  onCursorActivity,
  dataTestId,
  placeholder
}) => {
  const [measure, codemirrorElement] = useMeasure();
  const [modulePromise] = reactExports.useState(__vitePreload(() => import("./codeMirrorModule.js"), true ? __vite__mapDeps([0,1,2,3,4]) : void 0).then((m) => m.default));
  const codemirrorRef = reactExports.useRef(null);
  const [codemirror, setCodemirror] = reactExports.useState();
  reactExports.useEffect(() => {
    (async () => {
      var _a, _b;
      const CodeMirror = await modulePromise;
      defineCustomMode(CodeMirror);
      const element = codemirrorElement.current;
      if (!element)
        return;
      const mode = languageToMode(language) || mimeTypeToMode(mimeType) || (linkify ? "text/linkified" : "");
      if (codemirrorRef.current && mode === codemirrorRef.current.cm.getOption("mode") && !!readOnly === codemirrorRef.current.cm.getOption("readOnly") && lineNumbers === codemirrorRef.current.cm.getOption("lineNumbers") && wrapLines === codemirrorRef.current.cm.getOption("lineWrapping") && placeholder === codemirrorRef.current.cm.getOption("placeholder")) {
        return;
      }
      (_b = (_a = codemirrorRef.current) == null ? void 0 : _a.cm) == null ? void 0 : _b.getWrapperElement().remove();
      const cm = CodeMirror(element, {
        value: "",
        mode,
        readOnly: !!readOnly,
        lineNumbers,
        lineWrapping: wrapLines,
        placeholder
      });
      codemirrorRef.current = { cm };
      if (isFocused)
        cm.focus();
      setCodemirror(cm);
      return cm;
    })();
  }, [modulePromise, codemirror, codemirrorElement, language, mimeType, linkify, lineNumbers, wrapLines, readOnly, isFocused, placeholder]);
  reactExports.useEffect(() => {
    if (codemirrorRef.current)
      codemirrorRef.current.cm.setSize(measure.width, measure.height);
  }, [measure]);
  reactExports.useLayoutEffect(() => {
    var _a;
    if (!codemirror)
      return;
    let valueChanged = false;
    if (codemirror.getValue() !== text) {
      codemirror.setValue(text);
      valueChanged = true;
      if (focusOnChange) {
        codemirror.execCommand("selectAll");
        codemirror.focus();
      }
    }
    if (valueChanged || JSON.stringify(highlight) !== JSON.stringify(codemirrorRef.current.highlight)) {
      for (const h of codemirrorRef.current.highlight || [])
        codemirror.removeLineClass(h.line - 1, "wrap");
      for (const h of highlight || [])
        codemirror.addLineClass(h.line - 1, "wrap", `source-line-${h.type}`);
      for (const w of codemirrorRef.current.widgets || [])
        codemirror.removeLineWidget(w);
      for (const m of codemirrorRef.current.markers || [])
        m.clear();
      const widgets = [];
      const markers = [];
      for (const h of highlight || []) {
        if (h.type !== "subtle-error" && h.type !== "error")
          continue;
        const line = (_a = codemirrorRef.current) == null ? void 0 : _a.cm.getLine(h.line - 1);
        if (line) {
          const attributes = {};
          attributes["title"] = h.message || "";
          markers.push(codemirror.markText(
            { line: h.line - 1, ch: 0 },
            { line: h.line - 1, ch: h.column || line.length },
            { className: "source-line-error-underline", attributes }
          ));
        }
        if (h.type === "error") {
          const errorWidgetElement = document.createElement("div");
          errorWidgetElement.innerHTML = ansi2html(h.message || "");
          errorWidgetElement.className = "source-line-error-widget";
          widgets.push(codemirror.addLineWidget(h.line, errorWidgetElement, { above: true, coverGutter: false }));
        }
      }
      codemirrorRef.current.highlight = highlight;
      codemirrorRef.current.widgets = widgets;
      codemirrorRef.current.markers = markers;
    }
    if (typeof revealLine === "number" && codemirrorRef.current.cm.lineCount() >= revealLine)
      codemirror.scrollIntoView({ line: Math.max(0, revealLine - 1), ch: 0 }, 50);
    let changeListener;
    if (onChange) {
      changeListener = () => onChange(codemirror.getValue());
      codemirror.on("change", changeListener);
    }
    let cursorActivityListener;
    if (onCursorActivity) {
      cursorActivityListener = () => {
        if (codemirrorRef.current.cm.hasFocus())
          onCursorActivity(codemirrorRef.current.cm.getCursor());
      };
      codemirror.on("cursorActivity", cursorActivityListener);
    }
    return () => {
      if (changeListener)
        codemirror.off("change", changeListener);
      if (cursorActivityListener)
        codemirror.off("cursorActivity", cursorActivityListener);
    };
  }, [codemirror, text, highlight, revealLine, focusOnChange, onChange, onCursorActivity]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-testid": dataTestId, className: "cm-wrapper", ref: codemirrorElement, onClick: onCodeMirrorClick });
};
function onCodeMirrorClick(event) {
  var _a;
  if (!(event.target instanceof HTMLElement))
    return;
  let url;
  if (event.target.classList.contains("cm-linkified")) {
    url = event.target.textContent;
  } else if (event.target.classList.contains("cm-link") && ((_a = event.target.nextElementSibling) == null ? void 0 : _a.classList.contains("cm-url"))) {
    url = event.target.nextElementSibling.textContent.slice(1, -1);
  }
  if (url) {
    event.preventDefault();
    event.stopPropagation();
    window.open(url, "_blank");
  }
}
let customModeDefined = false;
function defineCustomMode(cm) {
  if (customModeDefined)
    return;
  customModeDefined = true;
  cm.defineSimpleMode("text/linkified", {
    start: [
      { regex: kWebLinkRe, token: "linkified" }
    ]
  });
}
function mimeTypeToMode(mimeType) {
  if (!mimeType)
    return;
  if (mimeType.includes("javascript") || mimeType.includes("json"))
    return "javascript";
  if (mimeType.includes("python"))
    return "python";
  if (mimeType.includes("csharp"))
    return "text/x-csharp";
  if (mimeType.includes("java"))
    return "text/x-java";
  if (mimeType.includes("markdown"))
    return "markdown";
  if (mimeType.includes("html") || mimeType.includes("svg"))
    return "htmlmixed";
  if (mimeType.includes("css"))
    return "css";
}
function languageToMode(language) {
  if (!language)
    return;
  return {
    javascript: "javascript",
    jsonl: "javascript",
    python: "python",
    csharp: "text/x-csharp",
    java: "text/x-java",
    markdown: "markdown",
    html: "htmlmixed",
    css: "css",
    yaml: "yaml"
  }[language];
}
const kMinSize = 50;
const SplitView = ({
  sidebarSize,
  sidebarHidden = false,
  sidebarIsFirst = false,
  orientation = "vertical",
  minSidebarSize = kMinSize,
  settingName,
  sidebar,
  main
}) => {
  const defaultSize = Math.max(minSidebarSize, sidebarSize) * window.devicePixelRatio;
  const [hSize, setHSize] = useSetting(settingName ? settingName + "." + orientation + ":size" : void 0, defaultSize);
  const [vSize, setVSize] = useSetting(settingName ? settingName + "." + orientation + ":size" : void 0, defaultSize);
  const [resizing, setResizing] = reactExports.useState(null);
  const [measure, ref] = useMeasure();
  let size;
  if (orientation === "vertical") {
    size = vSize / window.devicePixelRatio;
    if (measure && measure.height < size)
      size = measure.height - 10;
  } else {
    size = hSize / window.devicePixelRatio;
    if (measure && measure.width < size)
      size = measure.width - 10;
  }
  document.body.style.userSelect = resizing ? "none" : "inherit";
  let resizerStyle = {};
  if (orientation === "vertical") {
    if (sidebarIsFirst)
      resizerStyle = { top: resizing ? 0 : size - 4, bottom: resizing ? 0 : void 0, height: resizing ? "initial" : 8 };
    else
      resizerStyle = { bottom: resizing ? 0 : size - 4, top: resizing ? 0 : void 0, height: resizing ? "initial" : 8 };
  } else {
    if (sidebarIsFirst)
      resizerStyle = { left: resizing ? 0 : size - 4, right: resizing ? 0 : void 0, width: resizing ? "initial" : 8 };
    else
      resizerStyle = { right: resizing ? 0 : size - 4, left: resizing ? 0 : void 0, width: resizing ? "initial" : 8 };
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: clsx("split-view", orientation, sidebarIsFirst && "sidebar-first"), ref, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "split-view-main", children: main }),
    !sidebarHidden && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flexBasis: size }, className: "split-view-sidebar", children: sidebar }),
    !sidebarHidden && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: resizerStyle,
        className: "split-view-resizer",
        onMouseDown: (event) => setResizing({ offset: orientation === "vertical" ? event.clientY : event.clientX, size }),
        onMouseUp: () => setResizing(null),
        onMouseMove: (event) => {
          if (!event.buttons) {
            setResizing(null);
          } else if (resizing) {
            const offset = orientation === "vertical" ? event.clientY : event.clientX;
            const delta = offset - resizing.offset;
            const newSize = sidebarIsFirst ? resizing.size + delta : resizing.size - delta;
            const splitView = event.target.parentElement;
            const rect = splitView.getBoundingClientRect();
            const size2 = Math.min(Math.max(minSidebarSize, newSize), (orientation === "vertical" ? rect.height : rect.width) - minSidebarSize);
            if (orientation === "vertical")
              setVSize(size2 * window.devicePixelRatio);
            else
              setHSize(size2 * window.devicePixelRatio);
          }
        }
      }
    )
  ] });
};
const TabbedPane = ({ tabs, selectedTab, setSelectedTab, leftToolbar, rightToolbar, dataTestId, mode }) => {
  const id = reactExports.useId();
  if (!selectedTab)
    selectedTab = tabs[0].id;
  if (!mode)
    mode = "default";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tabbed-pane", "data-testid": dataTestId, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "vbox", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Toolbar, { children: [
      leftToolbar && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: "none", display: "flex", margin: "0 4px", alignItems: "center" }, children: [
        ...leftToolbar
      ] }),
      mode === "default" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: "auto", display: "flex", height: "100%", overflow: "hidden" }, role: "tablist", children: [
        ...tabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabbedPaneTab,
          {
            id: tab.id,
            ariaControls: `${id}-${tab.id}`,
            title: tab.title,
            count: tab.count,
            errorCount: tab.errorCount,
            selected: selectedTab === tab.id,
            onSelect: setSelectedTab
          },
          tab.id
        ))
      ] }),
      mode === "select" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: "auto", display: "flex", height: "100%", overflow: "hidden" }, role: "tablist", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { style: { width: "100%", background: "none", cursor: "pointer" }, value: selectedTab, onChange: (e) => {
        setSelectedTab == null ? void 0 : setSelectedTab(tabs[e.currentTarget.selectedIndex].id);
      }, children: tabs.map((tab) => {
        let suffix = "";
        if (tab.count)
          suffix = ` (${tab.count})`;
        if (tab.errorCount)
          suffix = ` (${tab.errorCount})`;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: tab.id, role: "tab", "aria-controls": `${id}-${tab.id}`, children: [
          tab.title,
          suffix
        ] }, tab.id);
      }) }) }),
      rightToolbar && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: "none", display: "flex", alignItems: "center" }, children: [
        ...rightToolbar
      ] })
    ] }),
    tabs.map((tab) => {
      const className = "tab-content tab-" + tab.id;
      if (tab.component)
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: `${id}-${tab.id}`, role: "tabpanel", "aria-label": tab.title, className, style: { display: selectedTab === tab.id ? "inherit" : "none" }, children: tab.component }, tab.id);
      if (selectedTab === tab.id)
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: `${id}-${tab.id}`, role: "tabpanel", "aria-label": tab.title, className, children: tab.render() }, tab.id);
    })
  ] }) });
};
const TabbedPaneTab = ({ id, title, count, errorCount, selected, onSelect, ariaControls }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: clsx("tabbed-pane-tab", selected && "selected"),
      onClick: () => onSelect == null ? void 0 : onSelect(id),
      role: "tab",
      title,
      "aria-controls": ariaControls,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tabbed-pane-tab-label", children: title }),
        !!count && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tabbed-pane-tab-counter", children: count }),
        !!errorCount && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tabbed-pane-tab-counter error", children: errorCount })
      ]
    }
  );
};
const SourceChooser = ({ sources, fileId, setFileId }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "source-chooser", hidden: !sources.length, title: "Source chooser", value: fileId, onChange: (event) => {
    setFileId(event.target.selectedOptions[0].value);
  }, children: renderSourceOptions(sources) });
};
function renderSourceOptions(sources) {
  const transformTitle = (title) => title.replace(/.*[/\\]([^/\\]+)/, "$1");
  const renderOption = (source) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: source.id, children: transformTitle(source.label) }, source.id);
  const sourcesByGroups = /* @__PURE__ */ new Map();
  for (const source of sources) {
    let list = sourcesByGroups.get(source.group || "Debugger");
    if (!list) {
      list = [];
      sourcesByGroups.set(source.group || "Debugger", list);
    }
    list.push(source);
  }
  return [...sourcesByGroups.entries()].map(([group, sources2]) => /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: group, children: sources2.filter((s) => (s.group || "Debugger") === group).map((source) => renderOption(source)) }, group));
}
function emptySource() {
  return {
    id: "default",
    isRecorded: false,
    text: "",
    language: "javascript",
    label: "",
    highlight: []
  };
}
const between = function(num, first, last) {
  return num >= first && num <= last;
};
function digit(code) {
  return between(code, 48, 57);
}
function hexdigit(code) {
  return digit(code) || between(code, 65, 70) || between(code, 97, 102);
}
function uppercaseletter(code) {
  return between(code, 65, 90);
}
function lowercaseletter(code) {
  return between(code, 97, 122);
}
function letter(code) {
  return uppercaseletter(code) || lowercaseletter(code);
}
function nonascii(code) {
  return code >= 128;
}
function namestartchar(code) {
  return letter(code) || nonascii(code) || code === 95;
}
function namechar(code) {
  return namestartchar(code) || digit(code) || code === 45;
}
function nonprintable(code) {
  return between(code, 0, 8) || code === 11 || between(code, 14, 31) || code === 127;
}
function newline(code) {
  return code === 10;
}
function whitespace(code) {
  return newline(code) || code === 9 || code === 32;
}
const maximumallowedcodepoint = 1114111;
class InvalidCharacterError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidCharacterError";
  }
}
function preprocess(str) {
  const codepoints = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code === 13 && str.charCodeAt(i + 1) === 10) {
      code = 10;
      i++;
    }
    if (code === 13 || code === 12)
      code = 10;
    if (code === 0)
      code = 65533;
    if (between(code, 55296, 56319) && between(str.charCodeAt(i + 1), 56320, 57343)) {
      const lead = code - 55296;
      const trail = str.charCodeAt(i + 1) - 56320;
      code = Math.pow(2, 16) + lead * Math.pow(2, 10) + trail;
      i++;
    }
    codepoints.push(code);
  }
  return codepoints;
}
function stringFromCode(code) {
  if (code <= 65535)
    return String.fromCharCode(code);
  code -= Math.pow(2, 16);
  const lead = Math.floor(code / Math.pow(2, 10)) + 55296;
  const trail = code % Math.pow(2, 10) + 56320;
  return String.fromCharCode(lead) + String.fromCharCode(trail);
}
function tokenize(str1) {
  const str = preprocess(str1);
  let i = -1;
  const tokens = [];
  let code;
  const codepoint = function(i2) {
    if (i2 >= str.length)
      return -1;
    return str[i2];
  };
  const next = function(num) {
    if (num === void 0)
      num = 1;
    if (num > 3)
      throw "Spec Error: no more than three codepoints of lookahead.";
    return codepoint(i + num);
  };
  const consume = function(num) {
    if (num === void 0)
      num = 1;
    i += num;
    code = codepoint(i);
    return true;
  };
  const reconsume = function() {
    i -= 1;
    return true;
  };
  const eof = function(codepoint2) {
    if (codepoint2 === void 0)
      codepoint2 = code;
    return codepoint2 === -1;
  };
  const consumeAToken = function() {
    consumeComments();
    consume();
    if (whitespace(code)) {
      while (whitespace(next()))
        consume();
      return new WhitespaceToken();
    } else if (code === 34) {
      return consumeAStringToken();
    } else if (code === 35) {
      if (namechar(next()) || areAValidEscape(next(1), next(2))) {
        const token = new HashToken("");
        if (wouldStartAnIdentifier(next(1), next(2), next(3)))
          token.type = "id";
        token.value = consumeAName();
        return token;
      } else {
        return new DelimToken(code);
      }
    } else if (code === 36) {
      if (next() === 61) {
        consume();
        return new SuffixMatchToken();
      } else {
        return new DelimToken(code);
      }
    } else if (code === 39) {
      return consumeAStringToken();
    } else if (code === 40) {
      return new OpenParenToken();
    } else if (code === 41) {
      return new CloseParenToken();
    } else if (code === 42) {
      if (next() === 61) {
        consume();
        return new SubstringMatchToken();
      } else {
        return new DelimToken(code);
      }
    } else if (code === 43) {
      if (startsWithANumber()) {
        reconsume();
        return consumeANumericToken();
      } else {
        return new DelimToken(code);
      }
    } else if (code === 44) {
      return new CommaToken();
    } else if (code === 45) {
      if (startsWithANumber()) {
        reconsume();
        return consumeANumericToken();
      } else if (next(1) === 45 && next(2) === 62) {
        consume(2);
        return new CDCToken();
      } else if (startsWithAnIdentifier()) {
        reconsume();
        return consumeAnIdentlikeToken();
      } else {
        return new DelimToken(code);
      }
    } else if (code === 46) {
      if (startsWithANumber()) {
        reconsume();
        return consumeANumericToken();
      } else {
        return new DelimToken(code);
      }
    } else if (code === 58) {
      return new ColonToken();
    } else if (code === 59) {
      return new SemicolonToken();
    } else if (code === 60) {
      if (next(1) === 33 && next(2) === 45 && next(3) === 45) {
        consume(3);
        return new CDOToken();
      } else {
        return new DelimToken(code);
      }
    } else if (code === 64) {
      if (wouldStartAnIdentifier(next(1), next(2), next(3)))
        return new AtKeywordToken(consumeAName());
      else
        return new DelimToken(code);
    } else if (code === 91) {
      return new OpenSquareToken();
    } else if (code === 92) {
      if (startsWithAValidEscape()) {
        reconsume();
        return consumeAnIdentlikeToken();
      } else {
        return new DelimToken(code);
      }
    } else if (code === 93) {
      return new CloseSquareToken();
    } else if (code === 94) {
      if (next() === 61) {
        consume();
        return new PrefixMatchToken();
      } else {
        return new DelimToken(code);
      }
    } else if (code === 123) {
      return new OpenCurlyToken();
    } else if (code === 124) {
      if (next() === 61) {
        consume();
        return new DashMatchToken();
      } else if (next() === 124) {
        consume();
        return new ColumnToken();
      } else {
        return new DelimToken(code);
      }
    } else if (code === 125) {
      return new CloseCurlyToken();
    } else if (code === 126) {
      if (next() === 61) {
        consume();
        return new IncludeMatchToken();
      } else {
        return new DelimToken(code);
      }
    } else if (digit(code)) {
      reconsume();
      return consumeANumericToken();
    } else if (namestartchar(code)) {
      reconsume();
      return consumeAnIdentlikeToken();
    } else if (eof()) {
      return new EOFToken();
    } else {
      return new DelimToken(code);
    }
  };
  const consumeComments = function() {
    while (next(1) === 47 && next(2) === 42) {
      consume(2);
      while (true) {
        consume();
        if (code === 42 && next() === 47) {
          consume();
          break;
        } else if (eof()) {
          return;
        }
      }
    }
  };
  const consumeANumericToken = function() {
    const num = consumeANumber();
    if (wouldStartAnIdentifier(next(1), next(2), next(3))) {
      const token = new DimensionToken();
      token.value = num.value;
      token.repr = num.repr;
      token.type = num.type;
      token.unit = consumeAName();
      return token;
    } else if (next() === 37) {
      consume();
      const token = new PercentageToken();
      token.value = num.value;
      token.repr = num.repr;
      return token;
    } else {
      const token = new NumberToken();
      token.value = num.value;
      token.repr = num.repr;
      token.type = num.type;
      return token;
    }
  };
  const consumeAnIdentlikeToken = function() {
    const str2 = consumeAName();
    if (str2.toLowerCase() === "url" && next() === 40) {
      consume();
      while (whitespace(next(1)) && whitespace(next(2)))
        consume();
      if (next() === 34 || next() === 39)
        return new FunctionToken(str2);
      else if (whitespace(next()) && (next(2) === 34 || next(2) === 39))
        return new FunctionToken(str2);
      else
        return consumeAURLToken();
    } else if (next() === 40) {
      consume();
      return new FunctionToken(str2);
    } else {
      return new IdentToken(str2);
    }
  };
  const consumeAStringToken = function(endingCodePoint) {
    if (endingCodePoint === void 0)
      endingCodePoint = code;
    let string2 = "";
    while (consume()) {
      if (code === endingCodePoint || eof()) {
        return new StringToken(string2);
      } else if (newline(code)) {
        reconsume();
        return new BadStringToken();
      } else if (code === 92) {
        if (eof(next()))
          ;
        else if (newline(next()))
          consume();
        else
          string2 += stringFromCode(consumeEscape());
      } else {
        string2 += stringFromCode(code);
      }
    }
    throw new Error("Internal error");
  };
  const consumeAURLToken = function() {
    const token = new URLToken("");
    while (whitespace(next()))
      consume();
    if (eof(next()))
      return token;
    while (consume()) {
      if (code === 41 || eof()) {
        return token;
      } else if (whitespace(code)) {
        while (whitespace(next()))
          consume();
        if (next() === 41 || eof(next())) {
          consume();
          return token;
        } else {
          consumeTheRemnantsOfABadURL();
          return new BadURLToken();
        }
      } else if (code === 34 || code === 39 || code === 40 || nonprintable(code)) {
        consumeTheRemnantsOfABadURL();
        return new BadURLToken();
      } else if (code === 92) {
        if (startsWithAValidEscape()) {
          token.value += stringFromCode(consumeEscape());
        } else {
          consumeTheRemnantsOfABadURL();
          return new BadURLToken();
        }
      } else {
        token.value += stringFromCode(code);
      }
    }
    throw new Error("Internal error");
  };
  const consumeEscape = function() {
    consume();
    if (hexdigit(code)) {
      const digits = [code];
      for (let total = 0; total < 5; total++) {
        if (hexdigit(next())) {
          consume();
          digits.push(code);
        } else {
          break;
        }
      }
      if (whitespace(next()))
        consume();
      let value = parseInt(digits.map(function(x) {
        return String.fromCharCode(x);
      }).join(""), 16);
      if (value > maximumallowedcodepoint)
        value = 65533;
      return value;
    } else if (eof()) {
      return 65533;
    } else {
      return code;
    }
  };
  const areAValidEscape = function(c1, c2) {
    if (c1 !== 92)
      return false;
    if (newline(c2))
      return false;
    return true;
  };
  const startsWithAValidEscape = function() {
    return areAValidEscape(code, next());
  };
  const wouldStartAnIdentifier = function(c1, c2, c3) {
    if (c1 === 45)
      return namestartchar(c2) || c2 === 45 || areAValidEscape(c2, c3);
    else if (namestartchar(c1))
      return true;
    else if (c1 === 92)
      return areAValidEscape(c1, c2);
    else
      return false;
  };
  const startsWithAnIdentifier = function() {
    return wouldStartAnIdentifier(code, next(1), next(2));
  };
  const wouldStartANumber = function(c1, c2, c3) {
    if (c1 === 43 || c1 === 45) {
      if (digit(c2))
        return true;
      if (c2 === 46 && digit(c3))
        return true;
      return false;
    } else if (c1 === 46) {
      if (digit(c2))
        return true;
      return false;
    } else if (digit(c1)) {
      return true;
    } else {
      return false;
    }
  };
  const startsWithANumber = function() {
    return wouldStartANumber(code, next(1), next(2));
  };
  const consumeAName = function() {
    let result = "";
    while (consume()) {
      if (namechar(code)) {
        result += stringFromCode(code);
      } else if (startsWithAValidEscape()) {
        result += stringFromCode(consumeEscape());
      } else {
        reconsume();
        return result;
      }
    }
    throw new Error("Internal parse error");
  };
  const consumeANumber = function() {
    let repr = "";
    let type = "integer";
    if (next() === 43 || next() === 45) {
      consume();
      repr += stringFromCode(code);
    }
    while (digit(next())) {
      consume();
      repr += stringFromCode(code);
    }
    if (next(1) === 46 && digit(next(2))) {
      consume();
      repr += stringFromCode(code);
      consume();
      repr += stringFromCode(code);
      type = "number";
      while (digit(next())) {
        consume();
        repr += stringFromCode(code);
      }
    }
    const c1 = next(1), c2 = next(2), c3 = next(3);
    if ((c1 === 69 || c1 === 101) && digit(c2)) {
      consume();
      repr += stringFromCode(code);
      consume();
      repr += stringFromCode(code);
      type = "number";
      while (digit(next())) {
        consume();
        repr += stringFromCode(code);
      }
    } else if ((c1 === 69 || c1 === 101) && (c2 === 43 || c2 === 45) && digit(c3)) {
      consume();
      repr += stringFromCode(code);
      consume();
      repr += stringFromCode(code);
      consume();
      repr += stringFromCode(code);
      type = "number";
      while (digit(next())) {
        consume();
        repr += stringFromCode(code);
      }
    }
    const value = convertAStringToANumber(repr);
    return { type, value, repr };
  };
  const convertAStringToANumber = function(string2) {
    return +string2;
  };
  const consumeTheRemnantsOfABadURL = function() {
    while (consume()) {
      if (code === 41 || eof()) {
        return;
      } else if (startsWithAValidEscape()) {
        consumeEscape();
      } else ;
    }
  };
  let iterationCount = 0;
  while (!eof(next())) {
    tokens.push(consumeAToken());
    iterationCount++;
    if (iterationCount > str.length * 2)
      throw new Error("I'm infinite-looping!");
  }
  return tokens;
}
class CSSParserToken {
  constructor() {
    this.tokenType = "";
  }
  toJSON() {
    return { token: this.tokenType };
  }
  toString() {
    return this.tokenType;
  }
  toSource() {
    return "" + this;
  }
}
class BadStringToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.tokenType = "BADSTRING";
  }
}
class BadURLToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.tokenType = "BADURL";
  }
}
class WhitespaceToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.tokenType = "WHITESPACE";
  }
  toString() {
    return "WS";
  }
  toSource() {
    return " ";
  }
}
class CDOToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.tokenType = "CDO";
  }
  toSource() {
    return "<!--";
  }
}
class CDCToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.tokenType = "CDC";
  }
  toSource() {
    return "-->";
  }
}
class ColonToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.tokenType = ":";
  }
}
class SemicolonToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.tokenType = ";";
  }
}
class CommaToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.tokenType = ",";
  }
}
class GroupingToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.value = "";
    this.mirror = "";
  }
}
class OpenCurlyToken extends GroupingToken {
  constructor() {
    super();
    this.tokenType = "{";
    this.value = "{";
    this.mirror = "}";
  }
}
class CloseCurlyToken extends GroupingToken {
  constructor() {
    super();
    this.tokenType = "}";
    this.value = "}";
    this.mirror = "{";
  }
}
class OpenSquareToken extends GroupingToken {
  constructor() {
    super();
    this.tokenType = "[";
    this.value = "[";
    this.mirror = "]";
  }
}
class CloseSquareToken extends GroupingToken {
  constructor() {
    super();
    this.tokenType = "]";
    this.value = "]";
    this.mirror = "[";
  }
}
class OpenParenToken extends GroupingToken {
  constructor() {
    super();
    this.tokenType = "(";
    this.value = "(";
    this.mirror = ")";
  }
}
class CloseParenToken extends GroupingToken {
  constructor() {
    super();
    this.tokenType = ")";
    this.value = ")";
    this.mirror = "(";
  }
}
class IncludeMatchToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.tokenType = "~=";
  }
}
class DashMatchToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.tokenType = "|=";
  }
}
class PrefixMatchToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.tokenType = "^=";
  }
}
class SuffixMatchToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.tokenType = "$=";
  }
}
class SubstringMatchToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.tokenType = "*=";
  }
}
class ColumnToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.tokenType = "||";
  }
}
class EOFToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.tokenType = "EOF";
  }
  toSource() {
    return "";
  }
}
class DelimToken extends CSSParserToken {
  constructor(code) {
    super();
    this.tokenType = "DELIM";
    this.value = "";
    this.value = stringFromCode(code);
  }
  toString() {
    return "DELIM(" + this.value + ")";
  }
  toJSON() {
    const json = this.constructor.prototype.constructor.prototype.toJSON.call(this);
    json.value = this.value;
    return json;
  }
  toSource() {
    if (this.value === "\\")
      return "\\\n";
    else
      return this.value;
  }
}
class StringValuedToken extends CSSParserToken {
  constructor() {
    super(...arguments);
    this.value = "";
  }
  ASCIIMatch(str) {
    return this.value.toLowerCase() === str.toLowerCase();
  }
  toJSON() {
    const json = this.constructor.prototype.constructor.prototype.toJSON.call(this);
    json.value = this.value;
    return json;
  }
}
class IdentToken extends StringValuedToken {
  constructor(val) {
    super();
    this.tokenType = "IDENT";
    this.value = val;
  }
  toString() {
    return "IDENT(" + this.value + ")";
  }
  toSource() {
    return escapeIdent(this.value);
  }
}
class FunctionToken extends StringValuedToken {
  constructor(val) {
    super();
    this.tokenType = "FUNCTION";
    this.value = val;
    this.mirror = ")";
  }
  toString() {
    return "FUNCTION(" + this.value + ")";
  }
  toSource() {
    return escapeIdent(this.value) + "(";
  }
}
class AtKeywordToken extends StringValuedToken {
  constructor(val) {
    super();
    this.tokenType = "AT-KEYWORD";
    this.value = val;
  }
  toString() {
    return "AT(" + this.value + ")";
  }
  toSource() {
    return "@" + escapeIdent(this.value);
  }
}
class HashToken extends StringValuedToken {
  constructor(val) {
    super();
    this.tokenType = "HASH";
    this.value = val;
    this.type = "unrestricted";
  }
  toString() {
    return "HASH(" + this.value + ")";
  }
  toJSON() {
    const json = this.constructor.prototype.constructor.prototype.toJSON.call(this);
    json.value = this.value;
    json.type = this.type;
    return json;
  }
  toSource() {
    if (this.type === "id")
      return "#" + escapeIdent(this.value);
    else
      return "#" + escapeHash(this.value);
  }
}
class StringToken extends StringValuedToken {
  constructor(val) {
    super();
    this.tokenType = "STRING";
    this.value = val;
  }
  toString() {
    return '"' + escapeString(this.value) + '"';
  }
}
class URLToken extends StringValuedToken {
  constructor(val) {
    super();
    this.tokenType = "URL";
    this.value = val;
  }
  toString() {
    return "URL(" + this.value + ")";
  }
  toSource() {
    return 'url("' + escapeString(this.value) + '")';
  }
}
class NumberToken extends CSSParserToken {
  constructor() {
    super();
    this.tokenType = "NUMBER";
    this.type = "integer";
    this.repr = "";
  }
  toString() {
    if (this.type === "integer")
      return "INT(" + this.value + ")";
    return "NUMBER(" + this.value + ")";
  }
  toJSON() {
    const json = super.toJSON();
    json.value = this.value;
    json.type = this.type;
    json.repr = this.repr;
    return json;
  }
  toSource() {
    return this.repr;
  }
}
class PercentageToken extends CSSParserToken {
  constructor() {
    super();
    this.tokenType = "PERCENTAGE";
    this.repr = "";
  }
  toString() {
    return "PERCENTAGE(" + this.value + ")";
  }
  toJSON() {
    const json = this.constructor.prototype.constructor.prototype.toJSON.call(this);
    json.value = this.value;
    json.repr = this.repr;
    return json;
  }
  toSource() {
    return this.repr + "%";
  }
}
class DimensionToken extends CSSParserToken {
  constructor() {
    super();
    this.tokenType = "DIMENSION";
    this.type = "integer";
    this.repr = "";
    this.unit = "";
  }
  toString() {
    return "DIM(" + this.value + "," + this.unit + ")";
  }
  toJSON() {
    const json = this.constructor.prototype.constructor.prototype.toJSON.call(this);
    json.value = this.value;
    json.type = this.type;
    json.repr = this.repr;
    json.unit = this.unit;
    return json;
  }
  toSource() {
    const source = this.repr;
    let unit = escapeIdent(this.unit);
    if (unit[0].toLowerCase() === "e" && (unit[1] === "-" || between(unit.charCodeAt(1), 48, 57))) {
      unit = "\\65 " + unit.slice(1, unit.length);
    }
    return source + unit;
  }
}
function escapeIdent(string2) {
  string2 = "" + string2;
  let result = "";
  const firstcode = string2.charCodeAt(0);
  for (let i = 0; i < string2.length; i++) {
    const code = string2.charCodeAt(i);
    if (code === 0)
      throw new InvalidCharacterError("Invalid character: the input contains U+0000.");
    if (between(code, 1, 31) || code === 127 || i === 0 && between(code, 48, 57) || i === 1 && between(code, 48, 57) && firstcode === 45)
      result += "\\" + code.toString(16) + " ";
    else if (code >= 128 || code === 45 || code === 95 || between(code, 48, 57) || between(code, 65, 90) || between(code, 97, 122))
      result += string2[i];
    else
      result += "\\" + string2[i];
  }
  return result;
}
function escapeHash(string2) {
  string2 = "" + string2;
  let result = "";
  for (let i = 0; i < string2.length; i++) {
    const code = string2.charCodeAt(i);
    if (code === 0)
      throw new InvalidCharacterError("Invalid character: the input contains U+0000.");
    if (code >= 128 || code === 45 || code === 95 || between(code, 48, 57) || between(code, 65, 90) || between(code, 97, 122))
      result += string2[i];
    else
      result += "\\" + code.toString(16) + " ";
  }
  return result;
}
function escapeString(string2) {
  string2 = "" + string2;
  let result = "";
  for (let i = 0; i < string2.length; i++) {
    const code = string2.charCodeAt(i);
    if (code === 0)
      throw new InvalidCharacterError("Invalid character: the input contains U+0000.");
    if (between(code, 1, 31) || code === 127)
      result += "\\" + code.toString(16) + " ";
    else if (code === 34 || code === 92)
      result += "\\" + string2[i];
    else
      result += string2[i];
  }
  return result;
}
class InvalidSelectorError extends Error {
}
function parseCSS(selector, customNames) {
  let tokens;
  try {
    tokens = tokenize(selector);
    if (!(tokens[tokens.length - 1] instanceof EOFToken))
      tokens.push(new EOFToken());
  } catch (e) {
    const newMessage = e.message + ` while parsing css selector "${selector}". Did you mean to CSS.escape it?`;
    const index = (e.stack || "").indexOf(e.message);
    if (index !== -1)
      e.stack = e.stack.substring(0, index) + newMessage + e.stack.substring(index + e.message.length);
    e.message = newMessage;
    throw e;
  }
  const unsupportedToken = tokens.find((token) => {
    return token instanceof AtKeywordToken || token instanceof BadStringToken || token instanceof BadURLToken || token instanceof ColumnToken || token instanceof CDOToken || token instanceof CDCToken || token instanceof SemicolonToken || // TODO: Consider using these for something, e.g. to escape complex strings.
    // For example :xpath{ (//div/bar[@attr="foo"])[2]/baz }
    // Or this way :xpath( {complex-xpath-goes-here("hello")} )
    token instanceof OpenCurlyToken || token instanceof CloseCurlyToken || // TODO: Consider treating these as strings?
    token instanceof URLToken || token instanceof PercentageToken;
  });
  if (unsupportedToken)
    throw new InvalidSelectorError(`Unsupported token "${unsupportedToken.toSource()}" while parsing css selector "${selector}". Did you mean to CSS.escape it?`);
  let pos = 0;
  const names = /* @__PURE__ */ new Set();
  function unexpected() {
    return new InvalidSelectorError(`Unexpected token "${tokens[pos].toSource()}" while parsing css selector "${selector}". Did you mean to CSS.escape it?`);
  }
  function skipWhitespace() {
    while (tokens[pos] instanceof WhitespaceToken)
      pos++;
  }
  function isIdent(p = pos) {
    return tokens[p] instanceof IdentToken;
  }
  function isString(p = pos) {
    return tokens[p] instanceof StringToken;
  }
  function isNumber(p = pos) {
    return tokens[p] instanceof NumberToken;
  }
  function isComma(p = pos) {
    return tokens[p] instanceof CommaToken;
  }
  function isOpenParen(p = pos) {
    return tokens[p] instanceof OpenParenToken;
  }
  function isCloseParen(p = pos) {
    return tokens[p] instanceof CloseParenToken;
  }
  function isFunction(p = pos) {
    return tokens[p] instanceof FunctionToken;
  }
  function isStar(p = pos) {
    return tokens[p] instanceof DelimToken && tokens[p].value === "*";
  }
  function isEOF(p = pos) {
    return tokens[p] instanceof EOFToken;
  }
  function isClauseCombinator(p = pos) {
    return tokens[p] instanceof DelimToken && [">", "+", "~"].includes(tokens[p].value);
  }
  function isSelectorClauseEnd(p = pos) {
    return isComma(p) || isCloseParen(p) || isEOF(p) || isClauseCombinator(p) || tokens[p] instanceof WhitespaceToken;
  }
  function consumeFunctionArguments() {
    const result2 = [consumeArgument()];
    while (true) {
      skipWhitespace();
      if (!isComma())
        break;
      pos++;
      result2.push(consumeArgument());
    }
    return result2;
  }
  function consumeArgument() {
    skipWhitespace();
    if (isNumber())
      return tokens[pos++].value;
    if (isString())
      return tokens[pos++].value;
    return consumeComplexSelector();
  }
  function consumeComplexSelector() {
    const result2 = { simples: [] };
    skipWhitespace();
    if (isClauseCombinator()) {
      result2.simples.push({ selector: { functions: [{ name: "scope", args: [] }] }, combinator: "" });
    } else {
      result2.simples.push({ selector: consumeSimpleSelector(), combinator: "" });
    }
    while (true) {
      skipWhitespace();
      if (isClauseCombinator()) {
        result2.simples[result2.simples.length - 1].combinator = tokens[pos++].value;
        skipWhitespace();
      } else if (isSelectorClauseEnd()) {
        break;
      }
      result2.simples.push({ combinator: "", selector: consumeSimpleSelector() });
    }
    return result2;
  }
  function consumeSimpleSelector() {
    let rawCSSString = "";
    const functions = [];
    while (!isSelectorClauseEnd()) {
      if (isIdent() || isStar()) {
        rawCSSString += tokens[pos++].toSource();
      } else if (tokens[pos] instanceof HashToken) {
        rawCSSString += tokens[pos++].toSource();
      } else if (tokens[pos] instanceof DelimToken && tokens[pos].value === ".") {
        pos++;
        if (isIdent())
          rawCSSString += "." + tokens[pos++].toSource();
        else
          throw unexpected();
      } else if (tokens[pos] instanceof ColonToken) {
        pos++;
        if (isIdent()) {
          if (!customNames.has(tokens[pos].value.toLowerCase())) {
            rawCSSString += ":" + tokens[pos++].toSource();
          } else {
            const name = tokens[pos++].value.toLowerCase();
            functions.push({ name, args: [] });
            names.add(name);
          }
        } else if (isFunction()) {
          const name = tokens[pos++].value.toLowerCase();
          if (!customNames.has(name)) {
            rawCSSString += `:${name}(${consumeBuiltinFunctionArguments()})`;
          } else {
            functions.push({ name, args: consumeFunctionArguments() });
            names.add(name);
          }
          skipWhitespace();
          if (!isCloseParen())
            throw unexpected();
          pos++;
        } else {
          throw unexpected();
        }
      } else if (tokens[pos] instanceof OpenSquareToken) {
        rawCSSString += "[";
        pos++;
        while (!(tokens[pos] instanceof CloseSquareToken) && !isEOF())
          rawCSSString += tokens[pos++].toSource();
        if (!(tokens[pos] instanceof CloseSquareToken))
          throw unexpected();
        rawCSSString += "]";
        pos++;
      } else {
        throw unexpected();
      }
    }
    if (!rawCSSString && !functions.length)
      throw unexpected();
    return { css: rawCSSString || void 0, functions };
  }
  function consumeBuiltinFunctionArguments() {
    let s = "";
    let balance = 1;
    while (!isEOF()) {
      if (isOpenParen() || isFunction())
        balance++;
      if (isCloseParen())
        balance--;
      if (!balance)
        break;
      s += tokens[pos++].toSource();
    }
    return s;
  }
  const result = consumeFunctionArguments();
  if (!isEOF())
    throw unexpected();
  if (result.some((arg) => typeof arg !== "object" || !("simples" in arg)))
    throw new InvalidSelectorError(`Error while parsing css selector "${selector}". Did you mean to CSS.escape it?`);
  return { selector: result, names: Array.from(names) };
}
const kNestedSelectorNames = /* @__PURE__ */ new Set(["internal:has", "internal:has-not", "internal:and", "internal:or", "internal:chain", "left-of", "right-of", "above", "below", "near"]);
const kNestedSelectorNamesWithDistance = /* @__PURE__ */ new Set(["left-of", "right-of", "above", "below", "near"]);
const customCSSNames = /* @__PURE__ */ new Set(["not", "is", "where", "has", "scope", "light", "visible", "text", "text-matches", "text-is", "has-text", "above", "below", "right-of", "left-of", "near", "nth-match"]);
function parseSelector(selector) {
  const parsedStrings = parseSelectorString(selector);
  const parts = [];
  for (const part of parsedStrings.parts) {
    if (part.name === "css" || part.name === "css:light") {
      if (part.name === "css:light")
        part.body = ":light(" + part.body + ")";
      const parsedCSS = parseCSS(part.body, customCSSNames);
      parts.push({
        name: "css",
        body: parsedCSS.selector,
        source: part.body
      });
      continue;
    }
    if (kNestedSelectorNames.has(part.name)) {
      let innerSelector;
      let distance;
      try {
        const unescaped = JSON.parse("[" + part.body + "]");
        if (!Array.isArray(unescaped) || unescaped.length < 1 || unescaped.length > 2 || typeof unescaped[0] !== "string")
          throw new InvalidSelectorError(`Malformed selector: ${part.name}=` + part.body);
        innerSelector = unescaped[0];
        if (unescaped.length === 2) {
          if (typeof unescaped[1] !== "number" || !kNestedSelectorNamesWithDistance.has(part.name))
            throw new InvalidSelectorError(`Malformed selector: ${part.name}=` + part.body);
          distance = unescaped[1];
        }
      } catch (e) {
        throw new InvalidSelectorError(`Malformed selector: ${part.name}=` + part.body);
      }
      const nested = { name: part.name, source: part.body, body: { parsed: parseSelector(innerSelector), distance } };
      const lastFrame = [...nested.body.parsed.parts].reverse().find((part2) => part2.name === "internal:control" && part2.body === "enter-frame");
      const lastFrameIndex = lastFrame ? nested.body.parsed.parts.indexOf(lastFrame) : -1;
      if (lastFrameIndex !== -1 && selectorPartsEqual(nested.body.parsed.parts.slice(0, lastFrameIndex + 1), parts.slice(0, lastFrameIndex + 1)))
        nested.body.parsed.parts.splice(0, lastFrameIndex + 1);
      parts.push(nested);
      continue;
    }
    parts.push({ ...part, source: part.body });
  }
  if (kNestedSelectorNames.has(parts[0].name))
    throw new InvalidSelectorError(`"${parts[0].name}" selector cannot be first`);
  return {
    capture: parsedStrings.capture,
    parts
  };
}
function selectorPartsEqual(list1, list2) {
  return stringifySelector({ parts: list1 }) === stringifySelector({ parts: list2 });
}
function stringifySelector(selector, forceEngineName) {
  if (typeof selector === "string")
    return selector;
  return selector.parts.map((p, i) => {
    let includeEngine = true;
    if (!forceEngineName && i !== selector.capture) {
      if (p.name === "css")
        includeEngine = false;
      else if (p.name === "xpath" && p.source.startsWith("//") || p.source.startsWith(".."))
        includeEngine = false;
    }
    const prefix = includeEngine ? p.name + "=" : "";
    return `${i === selector.capture ? "*" : ""}${prefix}${p.source}`;
  }).join(" >> ");
}
function parseSelectorString(selector) {
  let index = 0;
  let quote;
  let start = 0;
  const result = { parts: [] };
  const append = () => {
    const part = selector.substring(start, index).trim();
    const eqIndex = part.indexOf("=");
    let name;
    let body;
    if (eqIndex !== -1 && part.substring(0, eqIndex).trim().match(/^[a-zA-Z_0-9-+:*]+$/)) {
      name = part.substring(0, eqIndex).trim();
      body = part.substring(eqIndex + 1);
    } else if (part.length > 1 && part[0] === '"' && part[part.length - 1] === '"') {
      name = "text";
      body = part;
    } else if (part.length > 1 && part[0] === "'" && part[part.length - 1] === "'") {
      name = "text";
      body = part;
    } else if (/^\(*\/\//.test(part) || part.startsWith("..")) {
      name = "xpath";
      body = part;
    } else {
      name = "css";
      body = part;
    }
    let capture = false;
    if (name[0] === "*") {
      capture = true;
      name = name.substring(1);
    }
    result.parts.push({ name, body });
    if (capture) {
      if (result.capture !== void 0)
        throw new InvalidSelectorError(`Only one of the selectors can capture using * modifier`);
      result.capture = result.parts.length - 1;
    }
  };
  if (!selector.includes(">>")) {
    index = selector.length;
    append();
    return result;
  }
  const shouldIgnoreTextSelectorQuote = () => {
    const prefix = selector.substring(start, index);
    const match = prefix.match(/^\s*text\s*=(.*)$/);
    return !!match && !!match[1];
  };
  while (index < selector.length) {
    const c = selector[index];
    if (c === "\\" && index + 1 < selector.length) {
      index += 2;
    } else if (c === quote) {
      quote = void 0;
      index++;
    } else if (!quote && (c === '"' || c === "'" || c === "`") && !shouldIgnoreTextSelectorQuote()) {
      quote = c;
      index++;
    } else if (!quote && c === ">" && selector[index + 1] === ">") {
      append();
      index += 2;
      start = index;
    } else {
      index++;
    }
  }
  append();
  return result;
}
function parseAttributeSelector(selector, allowUnquotedStrings) {
  let wp = 0;
  let EOL = selector.length === 0;
  const next = () => selector[wp] || "";
  const eat1 = () => {
    const result2 = next();
    ++wp;
    EOL = wp >= selector.length;
    return result2;
  };
  const syntaxError = (stage) => {
    if (EOL)
      throw new InvalidSelectorError(`Unexpected end of selector while parsing selector \`${selector}\``);
    throw new InvalidSelectorError(`Error while parsing selector \`${selector}\` - unexpected symbol "${next()}" at position ${wp}` + (stage ? " during " + stage : ""));
  };
  function skipSpaces() {
    while (!EOL && /\s/.test(next()))
      eat1();
  }
  function isCSSNameChar(char) {
    return char >= "" || char >= "0" && char <= "9" || char >= "A" && char <= "Z" || char >= "a" && char <= "z" || char >= "0" && char <= "9" || char === "_" || char === "-";
  }
  function readIdentifier() {
    let result2 = "";
    skipSpaces();
    while (!EOL && isCSSNameChar(next()))
      result2 += eat1();
    return result2;
  }
  function readQuotedString(quote) {
    let result2 = eat1();
    if (result2 !== quote)
      syntaxError("parsing quoted string");
    while (!EOL && next() !== quote) {
      if (next() === "\\")
        eat1();
      result2 += eat1();
    }
    if (next() !== quote)
      syntaxError("parsing quoted string");
    result2 += eat1();
    return result2;
  }
  function readRegularExpression() {
    if (eat1() !== "/")
      syntaxError("parsing regular expression");
    let source = "";
    let inClass = false;
    while (!EOL) {
      if (next() === "\\") {
        source += eat1();
        if (EOL)
          syntaxError("parsing regular expression");
      } else if (inClass && next() === "]") {
        inClass = false;
      } else if (!inClass && next() === "[") {
        inClass = true;
      } else if (!inClass && next() === "/") {
        break;
      }
      source += eat1();
    }
    if (eat1() !== "/")
      syntaxError("parsing regular expression");
    let flags = "";
    while (!EOL && next().match(/[dgimsuy]/))
      flags += eat1();
    try {
      return new RegExp(source, flags);
    } catch (e) {
      throw new InvalidSelectorError(`Error while parsing selector \`${selector}\`: ${e.message}`);
    }
  }
  function readAttributeToken() {
    let token = "";
    skipSpaces();
    if (next() === `'` || next() === `"`)
      token = readQuotedString(next()).slice(1, -1);
    else
      token = readIdentifier();
    if (!token)
      syntaxError("parsing property path");
    return token;
  }
  function readOperator() {
    skipSpaces();
    let op = "";
    if (!EOL)
      op += eat1();
    if (!EOL && op !== "=")
      op += eat1();
    if (!["=", "*=", "^=", "$=", "|=", "~="].includes(op))
      syntaxError("parsing operator");
    return op;
  }
  function readAttribute() {
    eat1();
    const jsonPath = [];
    jsonPath.push(readAttributeToken());
    skipSpaces();
    while (next() === ".") {
      eat1();
      jsonPath.push(readAttributeToken());
      skipSpaces();
    }
    if (next() === "]") {
      eat1();
      return { name: jsonPath.join("."), jsonPath, op: "<truthy>", value: null, caseSensitive: false };
    }
    const operator = readOperator();
    let value = void 0;
    let caseSensitive = true;
    skipSpaces();
    if (next() === "/") {
      if (operator !== "=")
        throw new InvalidSelectorError(`Error while parsing selector \`${selector}\` - cannot use ${operator} in attribute with regular expression`);
      value = readRegularExpression();
    } else if (next() === `'` || next() === `"`) {
      value = readQuotedString(next()).slice(1, -1);
      skipSpaces();
      if (next() === "i" || next() === "I") {
        caseSensitive = false;
        eat1();
      } else if (next() === "s" || next() === "S") {
        caseSensitive = true;
        eat1();
      }
    } else {
      value = "";
      while (!EOL && (isCSSNameChar(next()) || next() === "+" || next() === "."))
        value += eat1();
      if (value === "true") {
        value = true;
      } else if (value === "false") {
        value = false;
      } else ;
    }
    skipSpaces();
    if (next() !== "]")
      syntaxError("parsing attribute value");
    eat1();
    if (operator !== "=" && typeof value !== "string")
      throw new InvalidSelectorError(`Error while parsing selector \`${selector}\` - cannot use ${operator} in attribute with non-string matching value - ${value}`);
    return { name: jsonPath.join("."), jsonPath, op: operator, value, caseSensitive };
  }
  const result = {
    name: "",
    attributes: []
  };
  result.name = readIdentifier();
  skipSpaces();
  while (next() === "[") {
    result.attributes.push(readAttribute());
    skipSpaces();
  }
  if (!EOL)
    syntaxError(void 0);
  if (!result.name && !result.attributes.length)
    throw new InvalidSelectorError(`Error while parsing selector \`${selector}\` - selector cannot be empty`);
  return result;
}
function escapeWithQuotes(text, char = "'") {
  const stringified = JSON.stringify(text);
  const escapedText = stringified.substring(1, stringified.length - 1).replace(/\\"/g, '"');
  if (char === "'")
    return char + escapedText.replace(/[']/g, "\\'") + char;
  if (char === '"')
    return char + escapedText.replace(/["]/g, '\\"') + char;
  if (char === "`")
    return char + escapedText.replace(/[`]/g, "`") + char;
  throw new Error("Invalid escape char");
}
function toTitleCase(name) {
  return name.charAt(0).toUpperCase() + name.substring(1);
}
function toSnakeCase(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/([A-Z])([A-Z][a-z])/g, "$1_$2").toLowerCase();
}
function normalizeEscapedRegexQuotes(source) {
  return source.replace(/(^|[^\\])(\\\\)*\\(['"`])/g, "$1$2$3");
}
function asLocator(lang, selector, isFrameLocator = false) {
  return asLocators(lang, selector, isFrameLocator, 1)[0];
}
function asLocators(lang, selector, isFrameLocator = false, maxOutputSize = 20, preferredQuote) {
  try {
    return innerAsLocators(new generators[lang](preferredQuote), parseSelector(selector), isFrameLocator, maxOutputSize);
  } catch (e) {
    return [selector];
  }
}
function innerAsLocators(factory, parsed, isFrameLocator = false, maxOutputSize = 20) {
  const parts = [...parsed.parts];
  const tokens = [];
  let nextBase = isFrameLocator ? "frame-locator" : "page";
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    const base = nextBase;
    nextBase = "locator";
    if (part.name === "internal:describe")
      continue;
    if (part.name === "nth") {
      if (part.body === "0")
        tokens.push([factory.generateLocator(base, "first", ""), factory.generateLocator(base, "nth", "0")]);
      else if (part.body === "-1")
        tokens.push([factory.generateLocator(base, "last", ""), factory.generateLocator(base, "nth", "-1")]);
      else
        tokens.push([factory.generateLocator(base, "nth", part.body)]);
      continue;
    }
    if (part.name === "visible") {
      tokens.push([factory.generateLocator(base, "visible", part.body), factory.generateLocator(base, "default", `visible=${part.body}`)]);
      continue;
    }
    if (part.name === "internal:text") {
      const { exact, text } = detectExact(part.body);
      tokens.push([factory.generateLocator(base, "text", text, { exact })]);
      continue;
    }
    if (part.name === "internal:has-text") {
      const { exact, text } = detectExact(part.body);
      if (!exact) {
        tokens.push([factory.generateLocator(base, "has-text", text, { exact })]);
        continue;
      }
    }
    if (part.name === "internal:has-not-text") {
      const { exact, text } = detectExact(part.body);
      if (!exact) {
        tokens.push([factory.generateLocator(base, "has-not-text", text, { exact })]);
        continue;
      }
    }
    if (part.name === "internal:has") {
      const inners = innerAsLocators(factory, part.body.parsed, false, maxOutputSize);
      tokens.push(inners.map((inner) => factory.generateLocator(base, "has", inner)));
      continue;
    }
    if (part.name === "internal:has-not") {
      const inners = innerAsLocators(factory, part.body.parsed, false, maxOutputSize);
      tokens.push(inners.map((inner) => factory.generateLocator(base, "hasNot", inner)));
      continue;
    }
    if (part.name === "internal:and") {
      const inners = innerAsLocators(factory, part.body.parsed, false, maxOutputSize);
      tokens.push(inners.map((inner) => factory.generateLocator(base, "and", inner)));
      continue;
    }
    if (part.name === "internal:or") {
      const inners = innerAsLocators(factory, part.body.parsed, false, maxOutputSize);
      tokens.push(inners.map((inner) => factory.generateLocator(base, "or", inner)));
      continue;
    }
    if (part.name === "internal:chain") {
      const inners = innerAsLocators(factory, part.body.parsed, false, maxOutputSize);
      tokens.push(inners.map((inner) => factory.generateLocator(base, "chain", inner)));
      continue;
    }
    if (part.name === "internal:label") {
      const { exact, text } = detectExact(part.body);
      tokens.push([factory.generateLocator(base, "label", text, { exact })]);
      continue;
    }
    if (part.name === "internal:role") {
      const attrSelector = parseAttributeSelector(part.body);
      const options = { attrs: [] };
      for (const attr of attrSelector.attributes) {
        if (attr.name === "name") {
          options.exact = attr.caseSensitive;
          options.name = attr.value;
        } else {
          if (attr.name === "level" && typeof attr.value === "string")
            attr.value = +attr.value;
          options.attrs.push({ name: attr.name === "include-hidden" ? "includeHidden" : attr.name, value: attr.value });
        }
      }
      tokens.push([factory.generateLocator(base, "role", attrSelector.name, options)]);
      continue;
    }
    if (part.name === "internal:testid") {
      const attrSelector = parseAttributeSelector(part.body);
      const { value } = attrSelector.attributes[0];
      tokens.push([factory.generateLocator(base, "test-id", value)]);
      continue;
    }
    if (part.name === "internal:attr") {
      const attrSelector = parseAttributeSelector(part.body);
      const { name, value, caseSensitive } = attrSelector.attributes[0];
      const text = value;
      const exact = !!caseSensitive;
      if (name === "placeholder") {
        tokens.push([factory.generateLocator(base, "placeholder", text, { exact })]);
        continue;
      }
      if (name === "alt") {
        tokens.push([factory.generateLocator(base, "alt", text, { exact })]);
        continue;
      }
      if (name === "title") {
        tokens.push([factory.generateLocator(base, "title", text, { exact })]);
        continue;
      }
    }
    if (part.name === "internal:control" && part.body === "enter-frame") {
      const lastTokens = tokens[tokens.length - 1];
      const lastPart = parts[index - 1];
      const transformed = lastTokens.map((token) => factory.chainLocators([token, factory.generateLocator(base, "frame", "")]));
      if (["xpath", "css"].includes(lastPart.name)) {
        transformed.push(
          factory.generateLocator(base, "frame-locator", stringifySelector({ parts: [lastPart] })),
          factory.generateLocator(base, "frame-locator", stringifySelector({ parts: [lastPart] }, true))
        );
      }
      lastTokens.splice(0, lastTokens.length, ...transformed);
      nextBase = "frame-locator";
      continue;
    }
    const nextPart = parts[index + 1];
    const selectorPart = stringifySelector({ parts: [part] });
    const locatorPart = factory.generateLocator(base, "default", selectorPart);
    if (nextPart && ["internal:has-text", "internal:has-not-text"].includes(nextPart.name)) {
      const { exact, text } = detectExact(nextPart.body);
      if (!exact) {
        const nextLocatorPart = factory.generateLocator("locator", nextPart.name === "internal:has-text" ? "has-text" : "has-not-text", text, { exact });
        const options = {};
        if (nextPart.name === "internal:has-text")
          options.hasText = text;
        else
          options.hasNotText = text;
        const combinedPart = factory.generateLocator(base, "default", selectorPart, options);
        tokens.push([factory.chainLocators([locatorPart, nextLocatorPart]), combinedPart]);
        index++;
        continue;
      }
    }
    let locatorPartWithEngine;
    if (["xpath", "css"].includes(part.name)) {
      const selectorPart2 = stringifySelector(
        { parts: [part] },
        /* forceEngineName */
        true
      );
      locatorPartWithEngine = factory.generateLocator(base, "default", selectorPart2);
    }
    tokens.push([locatorPart, locatorPartWithEngine].filter(Boolean));
  }
  return combineTokens(factory, tokens, maxOutputSize);
}
function combineTokens(factory, tokens, maxOutputSize) {
  const currentTokens = tokens.map(() => "");
  const result = [];
  const visit2 = (index) => {
    if (index === tokens.length) {
      result.push(factory.chainLocators(currentTokens));
      return result.length < maxOutputSize;
    }
    for (const taken of tokens[index]) {
      currentTokens[index] = taken;
      if (!visit2(index + 1))
        return false;
    }
    return true;
  };
  visit2(0);
  return result;
}
function detectExact(text) {
  let exact = false;
  const match = text.match(/^\/(.*)\/([igm]*)$/);
  if (match)
    return { text: new RegExp(match[1], match[2]) };
  if (text.endsWith('"')) {
    text = JSON.parse(text);
    exact = true;
  } else if (text.endsWith('"s')) {
    text = JSON.parse(text.substring(0, text.length - 1));
    exact = true;
  } else if (text.endsWith('"i')) {
    text = JSON.parse(text.substring(0, text.length - 1));
    exact = false;
  }
  return { exact, text };
}
class JavaScriptLocatorFactory {
  constructor(preferredQuote) {
    this.preferredQuote = preferredQuote;
  }
  generateLocator(base, kind, body, options = {}) {
    switch (kind) {
      case "default":
        if (options.hasText !== void 0)
          return `locator(${this.quote(body)}, { hasText: ${this.toHasText(options.hasText)} })`;
        if (options.hasNotText !== void 0)
          return `locator(${this.quote(body)}, { hasNotText: ${this.toHasText(options.hasNotText)} })`;
        return `locator(${this.quote(body)})`;
      case "frame-locator":
        return `frameLocator(${this.quote(body)})`;
      case "frame":
        return `contentFrame()`;
      case "nth":
        return `nth(${body})`;
      case "first":
        return `first()`;
      case "last":
        return `last()`;
      case "visible":
        return `filter({ visible: ${body === "true" ? "true" : "false"} })`;
      case "role":
        const attrs = [];
        if (isRegExp(options.name)) {
          attrs.push(`name: ${this.regexToSourceString(options.name)}`);
        } else if (typeof options.name === "string") {
          attrs.push(`name: ${this.quote(options.name)}`);
          if (options.exact)
            attrs.push(`exact: true`);
        }
        for (const { name, value } of options.attrs)
          attrs.push(`${name}: ${typeof value === "string" ? this.quote(value) : value}`);
        const attrString = attrs.length ? `, { ${attrs.join(", ")} }` : "";
        return `getByRole(${this.quote(body)}${attrString})`;
      case "has-text":
        return `filter({ hasText: ${this.toHasText(body)} })`;
      case "has-not-text":
        return `filter({ hasNotText: ${this.toHasText(body)} })`;
      case "has":
        return `filter({ has: ${body} })`;
      case "hasNot":
        return `filter({ hasNot: ${body} })`;
      case "and":
        return `and(${body})`;
      case "or":
        return `or(${body})`;
      case "chain":
        return `locator(${body})`;
      case "test-id":
        return `getByTestId(${this.toTestIdValue(body)})`;
      case "text":
        return this.toCallWithExact("getByText", body, !!options.exact);
      case "alt":
        return this.toCallWithExact("getByAltText", body, !!options.exact);
      case "placeholder":
        return this.toCallWithExact("getByPlaceholder", body, !!options.exact);
      case "label":
        return this.toCallWithExact("getByLabel", body, !!options.exact);
      case "title":
        return this.toCallWithExact("getByTitle", body, !!options.exact);
      default:
        throw new Error("Unknown selector kind " + kind);
    }
  }
  chainLocators(locators) {
    return locators.join(".");
  }
  regexToSourceString(re) {
    return normalizeEscapedRegexQuotes(String(re));
  }
  toCallWithExact(method, body, exact) {
    if (isRegExp(body))
      return `${method}(${this.regexToSourceString(body)})`;
    return exact ? `${method}(${this.quote(body)}, { exact: true })` : `${method}(${this.quote(body)})`;
  }
  toHasText(body) {
    if (isRegExp(body))
      return this.regexToSourceString(body);
    return this.quote(body);
  }
  toTestIdValue(value) {
    if (isRegExp(value))
      return this.regexToSourceString(value);
    return this.quote(value);
  }
  quote(text) {
    return escapeWithQuotes(text, this.preferredQuote ?? "'");
  }
}
class PythonLocatorFactory {
  generateLocator(base, kind, body, options = {}) {
    switch (kind) {
      case "default":
        if (options.hasText !== void 0)
          return `locator(${this.quote(body)}, has_text=${this.toHasText(options.hasText)})`;
        if (options.hasNotText !== void 0)
          return `locator(${this.quote(body)}, has_not_text=${this.toHasText(options.hasNotText)})`;
        return `locator(${this.quote(body)})`;
      case "frame-locator":
        return `frame_locator(${this.quote(body)})`;
      case "frame":
        return `content_frame`;
      case "nth":
        return `nth(${body})`;
      case "first":
        return `first`;
      case "last":
        return `last`;
      case "visible":
        return `filter(visible=${body === "true" ? "True" : "False"})`;
      case "role":
        const attrs = [];
        if (isRegExp(options.name)) {
          attrs.push(`name=${this.regexToString(options.name)}`);
        } else if (typeof options.name === "string") {
          attrs.push(`name=${this.quote(options.name)}`);
          if (options.exact)
            attrs.push(`exact=True`);
        }
        for (const { name, value } of options.attrs) {
          let valueString = typeof value === "string" ? this.quote(value) : value;
          if (typeof value === "boolean")
            valueString = value ? "True" : "False";
          attrs.push(`${toSnakeCase(name)}=${valueString}`);
        }
        const attrString = attrs.length ? `, ${attrs.join(", ")}` : "";
        return `get_by_role(${this.quote(body)}${attrString})`;
      case "has-text":
        return `filter(has_text=${this.toHasText(body)})`;
      case "has-not-text":
        return `filter(has_not_text=${this.toHasText(body)})`;
      case "has":
        return `filter(has=${body})`;
      case "hasNot":
        return `filter(has_not=${body})`;
      case "and":
        return `and_(${body})`;
      case "or":
        return `or_(${body})`;
      case "chain":
        return `locator(${body})`;
      case "test-id":
        return `get_by_test_id(${this.toTestIdValue(body)})`;
      case "text":
        return this.toCallWithExact("get_by_text", body, !!options.exact);
      case "alt":
        return this.toCallWithExact("get_by_alt_text", body, !!options.exact);
      case "placeholder":
        return this.toCallWithExact("get_by_placeholder", body, !!options.exact);
      case "label":
        return this.toCallWithExact("get_by_label", body, !!options.exact);
      case "title":
        return this.toCallWithExact("get_by_title", body, !!options.exact);
      default:
        throw new Error("Unknown selector kind " + kind);
    }
  }
  chainLocators(locators) {
    return locators.join(".");
  }
  regexToString(body) {
    const suffix = body.flags.includes("i") ? ", re.IGNORECASE" : "";
    return `re.compile(r"${normalizeEscapedRegexQuotes(body.source).replace(/\\\//, "/").replace(/"/g, '\\"')}"${suffix})`;
  }
  toCallWithExact(method, body, exact) {
    if (isRegExp(body))
      return `${method}(${this.regexToString(body)})`;
    if (exact)
      return `${method}(${this.quote(body)}, exact=True)`;
    return `${method}(${this.quote(body)})`;
  }
  toHasText(body) {
    if (isRegExp(body))
      return this.regexToString(body);
    return `${this.quote(body)}`;
  }
  toTestIdValue(value) {
    if (isRegExp(value))
      return this.regexToString(value);
    return this.quote(value);
  }
  quote(text) {
    return escapeWithQuotes(text, '"');
  }
}
class JavaLocatorFactory {
  generateLocator(base, kind, body, options = {}) {
    let clazz;
    switch (base) {
      case "page":
        clazz = "Page";
        break;
      case "frame-locator":
        clazz = "FrameLocator";
        break;
      case "locator":
        clazz = "Locator";
        break;
    }
    switch (kind) {
      case "default":
        if (options.hasText !== void 0)
          return `locator(${this.quote(body)}, new ${clazz}.LocatorOptions().setHasText(${this.toHasText(options.hasText)}))`;
        if (options.hasNotText !== void 0)
          return `locator(${this.quote(body)}, new ${clazz}.LocatorOptions().setHasNotText(${this.toHasText(options.hasNotText)}))`;
        return `locator(${this.quote(body)})`;
      case "frame-locator":
        return `frameLocator(${this.quote(body)})`;
      case "frame":
        return `contentFrame()`;
      case "nth":
        return `nth(${body})`;
      case "first":
        return `first()`;
      case "last":
        return `last()`;
      case "visible":
        return `filter(new ${clazz}.FilterOptions().setVisible(${body === "true" ? "true" : "false"}))`;
      case "role":
        const attrs = [];
        if (isRegExp(options.name)) {
          attrs.push(`.setName(${this.regexToString(options.name)})`);
        } else if (typeof options.name === "string") {
          attrs.push(`.setName(${this.quote(options.name)})`);
          if (options.exact)
            attrs.push(`.setExact(true)`);
        }
        for (const { name, value } of options.attrs)
          attrs.push(`.set${toTitleCase(name)}(${typeof value === "string" ? this.quote(value) : value})`);
        const attrString = attrs.length ? `, new ${clazz}.GetByRoleOptions()${attrs.join("")}` : "";
        return `getByRole(AriaRole.${toSnakeCase(body).toUpperCase()}${attrString})`;
      case "has-text":
        return `filter(new ${clazz}.FilterOptions().setHasText(${this.toHasText(body)}))`;
      case "has-not-text":
        return `filter(new ${clazz}.FilterOptions().setHasNotText(${this.toHasText(body)}))`;
      case "has":
        return `filter(new ${clazz}.FilterOptions().setHas(${body}))`;
      case "hasNot":
        return `filter(new ${clazz}.FilterOptions().setHasNot(${body}))`;
      case "and":
        return `and(${body})`;
      case "or":
        return `or(${body})`;
      case "chain":
        return `locator(${body})`;
      case "test-id":
        return `getByTestId(${this.toTestIdValue(body)})`;
      case "text":
        return this.toCallWithExact(clazz, "getByText", body, !!options.exact);
      case "alt":
        return this.toCallWithExact(clazz, "getByAltText", body, !!options.exact);
      case "placeholder":
        return this.toCallWithExact(clazz, "getByPlaceholder", body, !!options.exact);
      case "label":
        return this.toCallWithExact(clazz, "getByLabel", body, !!options.exact);
      case "title":
        return this.toCallWithExact(clazz, "getByTitle", body, !!options.exact);
      default:
        throw new Error("Unknown selector kind " + kind);
    }
  }
  chainLocators(locators) {
    return locators.join(".");
  }
  regexToString(body) {
    const suffix = body.flags.includes("i") ? ", Pattern.CASE_INSENSITIVE" : "";
    return `Pattern.compile(${this.quote(normalizeEscapedRegexQuotes(body.source))}${suffix})`;
  }
  toCallWithExact(clazz, method, body, exact) {
    if (isRegExp(body))
      return `${method}(${this.regexToString(body)})`;
    if (exact)
      return `${method}(${this.quote(body)}, new ${clazz}.${toTitleCase(method)}Options().setExact(true))`;
    return `${method}(${this.quote(body)})`;
  }
  toHasText(body) {
    if (isRegExp(body))
      return this.regexToString(body);
    return this.quote(body);
  }
  toTestIdValue(value) {
    if (isRegExp(value))
      return this.regexToString(value);
    return this.quote(value);
  }
  quote(text) {
    return escapeWithQuotes(text, '"');
  }
}
class CSharpLocatorFactory {
  generateLocator(base, kind, body, options = {}) {
    switch (kind) {
      case "default":
        if (options.hasText !== void 0)
          return `Locator(${this.quote(body)}, new() { ${this.toHasText(options.hasText)} })`;
        if (options.hasNotText !== void 0)
          return `Locator(${this.quote(body)}, new() { ${this.toHasNotText(options.hasNotText)} })`;
        return `Locator(${this.quote(body)})`;
      case "frame-locator":
        return `FrameLocator(${this.quote(body)})`;
      case "frame":
        return `ContentFrame`;
      case "nth":
        return `Nth(${body})`;
      case "first":
        return `First`;
      case "last":
        return `Last`;
      case "visible":
        return `Filter(new() { Visible = ${body === "true" ? "true" : "false"} })`;
      case "role":
        const attrs = [];
        if (isRegExp(options.name)) {
          attrs.push(`NameRegex = ${this.regexToString(options.name)}`);
        } else if (typeof options.name === "string") {
          attrs.push(`Name = ${this.quote(options.name)}`);
          if (options.exact)
            attrs.push(`Exact = true`);
        }
        for (const { name, value } of options.attrs)
          attrs.push(`${toTitleCase(name)} = ${typeof value === "string" ? this.quote(value) : value}`);
        const attrString = attrs.length ? `, new() { ${attrs.join(", ")} }` : "";
        return `GetByRole(AriaRole.${toTitleCase(body)}${attrString})`;
      case "has-text":
        return `Filter(new() { ${this.toHasText(body)} })`;
      case "has-not-text":
        return `Filter(new() { ${this.toHasNotText(body)} })`;
      case "has":
        return `Filter(new() { Has = ${body} })`;
      case "hasNot":
        return `Filter(new() { HasNot = ${body} })`;
      case "and":
        return `And(${body})`;
      case "or":
        return `Or(${body})`;
      case "chain":
        return `Locator(${body})`;
      case "test-id":
        return `GetByTestId(${this.toTestIdValue(body)})`;
      case "text":
        return this.toCallWithExact("GetByText", body, !!options.exact);
      case "alt":
        return this.toCallWithExact("GetByAltText", body, !!options.exact);
      case "placeholder":
        return this.toCallWithExact("GetByPlaceholder", body, !!options.exact);
      case "label":
        return this.toCallWithExact("GetByLabel", body, !!options.exact);
      case "title":
        return this.toCallWithExact("GetByTitle", body, !!options.exact);
      default:
        throw new Error("Unknown selector kind " + kind);
    }
  }
  chainLocators(locators) {
    return locators.join(".");
  }
  regexToString(body) {
    const suffix = body.flags.includes("i") ? ", RegexOptions.IgnoreCase" : "";
    return `new Regex(${this.quote(normalizeEscapedRegexQuotes(body.source))}${suffix})`;
  }
  toCallWithExact(method, body, exact) {
    if (isRegExp(body))
      return `${method}(${this.regexToString(body)})`;
    if (exact)
      return `${method}(${this.quote(body)}, new() { Exact = true })`;
    return `${method}(${this.quote(body)})`;
  }
  toHasText(body) {
    if (isRegExp(body))
      return `HasTextRegex = ${this.regexToString(body)}`;
    return `HasText = ${this.quote(body)}`;
  }
  toTestIdValue(value) {
    if (isRegExp(value))
      return this.regexToString(value);
    return this.quote(value);
  }
  toHasNotText(body) {
    if (isRegExp(body))
      return `HasNotTextRegex = ${this.regexToString(body)}`;
    return `HasNotText = ${this.quote(body)}`;
  }
  quote(text) {
    return escapeWithQuotes(text, '"');
  }
}
class JsonlLocatorFactory {
  generateLocator(base, kind, body, options = {}) {
    return JSON.stringify({
      kind,
      body,
      options
    });
  }
  chainLocators(locators) {
    const objects = locators.map((l) => JSON.parse(l));
    for (let i = 0; i < objects.length - 1; ++i)
      objects[i].next = objects[i + 1];
    return JSON.stringify(objects[0]);
  }
}
const generators = {
  javascript: JavaScriptLocatorFactory,
  python: PythonLocatorFactory,
  java: JavaLocatorFactory,
  csharp: CSharpLocatorFactory,
  jsonl: JsonlLocatorFactory
};
function isRegExp(obj) {
  return obj instanceof RegExp;
}
const CallLogView = ({
  language,
  log
}) => {
  const messagesEndRef = reactExports.useRef(null);
  const [expandOverrides, setExpandOverrides] = reactExports.useState(/* @__PURE__ */ new Map());
  reactExports.useLayoutEffect(() => {
    var _a;
    if (log.find((callLog) => callLog.reveal))
      (_a = messagesEndRef.current) == null ? void 0 : _a.scrollIntoView({ block: "center", inline: "nearest" });
  }, [messagesEndRef, log]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "call-log", style: { flex: "auto" }, children: [
    log.map((callLog) => {
      const expandOverride = expandOverrides.get(callLog.id);
      const isExpanded = typeof expandOverride === "boolean" ? expandOverride : callLog.status !== "done";
      const locator = callLog.params.selector ? asLocator(language, callLog.params.selector) : null;
      let titlePrefix = callLog.title;
      let titleSuffix = "";
      if (callLog.title.startsWith("expect.to") || callLog.title.startsWith("expect.not.to")) {
        titlePrefix = "expect(";
        titleSuffix = `).${callLog.title.substring("expect.".length)}()`;
      } else if (callLog.title.startsWith("locator.")) {
        titlePrefix = "";
        titleSuffix = `.${callLog.title.substring("locator.".length)}()`;
      } else if (locator || callLog.params.url) {
        titlePrefix = callLog.title + "(";
        titleSuffix = ")";
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: clsx("call-log-call", callLog.status), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "call-log-call-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: clsx("codicon", `codicon-chevron-${isExpanded ? "down" : "right"}`), style: { cursor: "pointer" }, onClick: () => {
            const newOverrides = new Map(expandOverrides);
            newOverrides.set(callLog.id, !isExpanded);
            setExpandOverrides(newOverrides);
          } }),
          titlePrefix,
          callLog.params.url ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "call-log-details", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "call-log-url", title: callLog.params.url, children: callLog.params.url }) }) : void 0,
          locator ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "call-log-details", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "call-log-selector", title: `page.${locator}`, children: `page.${locator}` }) }) : void 0,
          titleSuffix,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: clsx("codicon", iconClass(callLog)) }),
          typeof callLog.duration === "number" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "call-log-time", children: [
            "— ",
            msToString(callLog.duration)
          ] }) : void 0
        ] }),
        (isExpanded ? callLog.messages : []).map((message, i) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "call-log-message", children: message.trim() }, i);
        }),
        !!callLog.error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "call-log-message error", hidden: !isExpanded, children: callLog.error })
      ] }, callLog.id);
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: messagesEndRef })
  ] });
};
function iconClass(callLog) {
  switch (callLog.status) {
    case "done":
      return "codicon-check";
    case "in-progress":
      return "codicon-clock";
    case "paused":
      return "codicon-debug-pause";
    case "error":
      return "codicon-error";
  }
}
const ALIAS = Symbol.for("yaml.alias");
const DOC = Symbol.for("yaml.document");
const MAP = Symbol.for("yaml.map");
const PAIR = Symbol.for("yaml.pair");
const SCALAR$1 = Symbol.for("yaml.scalar");
const SEQ = Symbol.for("yaml.seq");
const NODE_TYPE = Symbol.for("yaml.node.type");
const isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
const isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
const isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
const isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
const isScalar$1 = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR$1;
const isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
function isCollection$1(node) {
  if (node && typeof node === "object")
    switch (node[NODE_TYPE]) {
      case MAP:
      case SEQ:
        return true;
    }
  return false;
}
function isNode(node) {
  if (node && typeof node === "object")
    switch (node[NODE_TYPE]) {
      case ALIAS:
      case MAP:
      case SCALAR$1:
      case SEQ:
        return true;
    }
  return false;
}
const hasAnchor = (node) => (isScalar$1(node) || isCollection$1(node)) && !!node.anchor;
const BREAK$1 = Symbol("break visit");
const SKIP$1 = Symbol("skip children");
const REMOVE$1 = Symbol("remove node");
function visit$1(node, visitor) {
  const visitor_ = initVisitor(visitor);
  if (isDocument(node)) {
    const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
    if (cd === REMOVE$1)
      node.contents = null;
  } else
    visit_(null, node, visitor_, Object.freeze([]));
}
visit$1.BREAK = BREAK$1;
visit$1.SKIP = SKIP$1;
visit$1.REMOVE = REMOVE$1;
function visit_(key, node, visitor, path) {
  const ctrl = callVisitor(key, node, visitor, path);
  if (isNode(ctrl) || isPair(ctrl)) {
    replaceNode(key, path, ctrl);
    return visit_(key, ctrl, visitor, path);
  }
  if (typeof ctrl !== "symbol") {
    if (isCollection$1(node)) {
      path = Object.freeze(path.concat(node));
      for (let i = 0; i < node.items.length; ++i) {
        const ci = visit_(i, node.items[i], visitor, path);
        if (typeof ci === "number")
          i = ci - 1;
        else if (ci === BREAK$1)
          return BREAK$1;
        else if (ci === REMOVE$1) {
          node.items.splice(i, 1);
          i -= 1;
        }
      }
    } else if (isPair(node)) {
      path = Object.freeze(path.concat(node));
      const ck = visit_("key", node.key, visitor, path);
      if (ck === BREAK$1)
        return BREAK$1;
      else if (ck === REMOVE$1)
        node.key = null;
      const cv = visit_("value", node.value, visitor, path);
      if (cv === BREAK$1)
        return BREAK$1;
      else if (cv === REMOVE$1)
        node.value = null;
    }
  }
  return ctrl;
}
async function visitAsync(node, visitor) {
  const visitor_ = initVisitor(visitor);
  if (isDocument(node)) {
    const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
    if (cd === REMOVE$1)
      node.contents = null;
  } else
    await visitAsync_(null, node, visitor_, Object.freeze([]));
}
visitAsync.BREAK = BREAK$1;
visitAsync.SKIP = SKIP$1;
visitAsync.REMOVE = REMOVE$1;
async function visitAsync_(key, node, visitor, path) {
  const ctrl = await callVisitor(key, node, visitor, path);
  if (isNode(ctrl) || isPair(ctrl)) {
    replaceNode(key, path, ctrl);
    return visitAsync_(key, ctrl, visitor, path);
  }
  if (typeof ctrl !== "symbol") {
    if (isCollection$1(node)) {
      path = Object.freeze(path.concat(node));
      for (let i = 0; i < node.items.length; ++i) {
        const ci = await visitAsync_(i, node.items[i], visitor, path);
        if (typeof ci === "number")
          i = ci - 1;
        else if (ci === BREAK$1)
          return BREAK$1;
        else if (ci === REMOVE$1) {
          node.items.splice(i, 1);
          i -= 1;
        }
      }
    } else if (isPair(node)) {
      path = Object.freeze(path.concat(node));
      const ck = await visitAsync_("key", node.key, visitor, path);
      if (ck === BREAK$1)
        return BREAK$1;
      else if (ck === REMOVE$1)
        node.key = null;
      const cv = await visitAsync_("value", node.value, visitor, path);
      if (cv === BREAK$1)
        return BREAK$1;
      else if (cv === REMOVE$1)
        node.value = null;
    }
  }
  return ctrl;
}
function initVisitor(visitor) {
  if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
    return Object.assign({
      Alias: visitor.Node,
      Map: visitor.Node,
      Scalar: visitor.Node,
      Seq: visitor.Node
    }, visitor.Value && {
      Map: visitor.Value,
      Scalar: visitor.Value,
      Seq: visitor.Value
    }, visitor.Collection && {
      Map: visitor.Collection,
      Seq: visitor.Collection
    }, visitor);
  }
  return visitor;
}
function callVisitor(key, node, visitor, path) {
  var _a, _b, _c, _d, _e;
  if (typeof visitor === "function")
    return visitor(key, node, path);
  if (isMap(node))
    return (_a = visitor.Map) == null ? void 0 : _a.call(visitor, key, node, path);
  if (isSeq(node))
    return (_b = visitor.Seq) == null ? void 0 : _b.call(visitor, key, node, path);
  if (isPair(node))
    return (_c = visitor.Pair) == null ? void 0 : _c.call(visitor, key, node, path);
  if (isScalar$1(node))
    return (_d = visitor.Scalar) == null ? void 0 : _d.call(visitor, key, node, path);
  if (isAlias(node))
    return (_e = visitor.Alias) == null ? void 0 : _e.call(visitor, key, node, path);
  return void 0;
}
function replaceNode(key, path, node) {
  const parent = path[path.length - 1];
  if (isCollection$1(parent)) {
    parent.items[key] = node;
  } else if (isPair(parent)) {
    if (key === "key")
      parent.key = node;
    else
      parent.value = node;
  } else if (isDocument(parent)) {
    parent.contents = node;
  } else {
    const pt = isAlias(parent) ? "alias" : "scalar";
    throw new Error(`Cannot replace node with ${pt} parent`);
  }
}
const escapeChars = {
  "!": "%21",
  ",": "%2C",
  "[": "%5B",
  "]": "%5D",
  "{": "%7B",
  "}": "%7D"
};
const escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
class Directives {
  constructor(yaml, tags) {
    this.docStart = null;
    this.docEnd = false;
    this.yaml = Object.assign({}, Directives.defaultYaml, yaml);
    this.tags = Object.assign({}, Directives.defaultTags, tags);
  }
  clone() {
    const copy2 = new Directives(this.yaml, this.tags);
    copy2.docStart = this.docStart;
    return copy2;
  }
  /**
   * During parsing, get a Directives instance for the current document and
   * update the stream state according to the current version's spec.
   */
  atDocument() {
    const res = new Directives(this.yaml, this.tags);
    switch (this.yaml.version) {
      case "1.1":
        this.atNextDocument = true;
        break;
      case "1.2":
        this.atNextDocument = false;
        this.yaml = {
          explicit: Directives.defaultYaml.explicit,
          version: "1.2"
        };
        this.tags = Object.assign({}, Directives.defaultTags);
        break;
    }
    return res;
  }
  /**
   * @param onError - May be called even if the action was successful
   * @returns `true` on success
   */
  add(line, onError) {
    if (this.atNextDocument) {
      this.yaml = { explicit: Directives.defaultYaml.explicit, version: "1.1" };
      this.tags = Object.assign({}, Directives.defaultTags);
      this.atNextDocument = false;
    }
    const parts = line.trim().split(/[ \t]+/);
    const name = parts.shift();
    switch (name) {
      case "%TAG": {
        if (parts.length !== 2) {
          onError(0, "%TAG directive should contain exactly two parts");
          if (parts.length < 2)
            return false;
        }
        const [handle, prefix] = parts;
        this.tags[handle] = prefix;
        return true;
      }
      case "%YAML": {
        this.yaml.explicit = true;
        if (parts.length !== 1) {
          onError(0, "%YAML directive should contain exactly one part");
          return false;
        }
        const [version] = parts;
        if (version === "1.1" || version === "1.2") {
          this.yaml.version = version;
          return true;
        } else {
          const isValid = /^\d+\.\d+$/.test(version);
          onError(6, `Unsupported YAML version ${version}`, isValid);
          return false;
        }
      }
      default:
        onError(0, `Unknown directive ${name}`, true);
        return false;
    }
  }
  /**
   * Resolves a tag, matching handles to those defined in %TAG directives.
   *
   * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
   *   `'!local'` tag, or `null` if unresolvable.
   */
  tagName(source, onError) {
    if (source === "!")
      return "!";
    if (source[0] !== "!") {
      onError(`Not a valid tag: ${source}`);
      return null;
    }
    if (source[1] === "<") {
      const verbatim = source.slice(2, -1);
      if (verbatim === "!" || verbatim === "!!") {
        onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
        return null;
      }
      if (source[source.length - 1] !== ">")
        onError("Verbatim tags must end with a >");
      return verbatim;
    }
    const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
    if (!suffix)
      onError(`The ${source} tag has no suffix`);
    const prefix = this.tags[handle];
    if (prefix) {
      try {
        return prefix + decodeURIComponent(suffix);
      } catch (error) {
        onError(String(error));
        return null;
      }
    }
    if (handle === "!")
      return source;
    onError(`Could not resolve tag: ${source}`);
    return null;
  }
  /**
   * Given a fully resolved tag, returns its printable string form,
   * taking into account current tag prefixes and defaults.
   */
  tagString(tag) {
    for (const [handle, prefix] of Object.entries(this.tags)) {
      if (tag.startsWith(prefix))
        return handle + escapeTagName(tag.substring(prefix.length));
    }
    return tag[0] === "!" ? tag : `!<${tag}>`;
  }
  toString(doc) {
    const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
    const tagEntries = Object.entries(this.tags);
    let tagNames;
    if (doc && tagEntries.length > 0 && isNode(doc.contents)) {
      const tags = {};
      visit$1(doc.contents, (_key, node) => {
        if (isNode(node) && node.tag)
          tags[node.tag] = true;
      });
      tagNames = Object.keys(tags);
    } else
      tagNames = [];
    for (const [handle, prefix] of tagEntries) {
      if (handle === "!!" && prefix === "tag:yaml.org,2002:")
        continue;
      if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
        lines.push(`%TAG ${handle} ${prefix}`);
    }
    return lines.join("\n");
  }
}
Directives.defaultYaml = { explicit: false, version: "1.2" };
Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
function anchorIsValid(anchor) {
  if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
    const sa = JSON.stringify(anchor);
    const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
    throw new Error(msg);
  }
  return true;
}
function anchorNames(root) {
  const anchors = /* @__PURE__ */ new Set();
  visit$1(root, {
    Value(_key, node) {
      if (node.anchor)
        anchors.add(node.anchor);
    }
  });
  return anchors;
}
function findNewAnchor(prefix, exclude) {
  for (let i = 1; true; ++i) {
    const name = `${prefix}${i}`;
    if (!exclude.has(name))
      return name;
  }
}
function createNodeAnchors(doc, prefix) {
  const aliasObjects = [];
  const sourceObjects = /* @__PURE__ */ new Map();
  let prevAnchors = null;
  return {
    onAnchor: (source) => {
      aliasObjects.push(source);
      if (!prevAnchors)
        prevAnchors = anchorNames(doc);
      const anchor = findNewAnchor(prefix, prevAnchors);
      prevAnchors.add(anchor);
      return anchor;
    },
    /**
     * With circular references, the source node is only resolved after all
     * of its child nodes are. This is why anchors are set only after all of
     * the nodes have been created.
     */
    setAnchors: () => {
      for (const source of aliasObjects) {
        const ref = sourceObjects.get(source);
        if (typeof ref === "object" && ref.anchor && (isScalar$1(ref.node) || isCollection$1(ref.node))) {
          ref.node.anchor = ref.anchor;
        } else {
          const error = new Error("Failed to resolve repeated object (this should not happen)");
          error.source = source;
          throw error;
        }
      }
    },
    sourceObjects
  };
}
function applyReviver(reviver, obj, key, val) {
  if (val && typeof val === "object") {
    if (Array.isArray(val)) {
      for (let i = 0, len = val.length; i < len; ++i) {
        const v0 = val[i];
        const v1 = applyReviver(reviver, val, String(i), v0);
        if (v1 === void 0)
          delete val[i];
        else if (v1 !== v0)
          val[i] = v1;
      }
    } else if (val instanceof Map) {
      for (const k of Array.from(val.keys())) {
        const v0 = val.get(k);
        const v1 = applyReviver(reviver, val, k, v0);
        if (v1 === void 0)
          val.delete(k);
        else if (v1 !== v0)
          val.set(k, v1);
      }
    } else if (val instanceof Set) {
      for (const v0 of Array.from(val)) {
        const v1 = applyReviver(reviver, val, v0, v0);
        if (v1 === void 0)
          val.delete(v0);
        else if (v1 !== v0) {
          val.delete(v0);
          val.add(v1);
        }
      }
    } else {
      for (const [k, v0] of Object.entries(val)) {
        const v1 = applyReviver(reviver, val, k, v0);
        if (v1 === void 0)
          delete val[k];
        else if (v1 !== v0)
          val[k] = v1;
      }
    }
  }
  return reviver.call(obj, key, val);
}
function toJS(value, arg, ctx) {
  if (Array.isArray(value))
    return value.map((v, i) => toJS(v, String(i), ctx));
  if (value && typeof value.toJSON === "function") {
    if (!ctx || !hasAnchor(value))
      return value.toJSON(arg, ctx);
    const data = { aliasCount: 0, count: 1, res: void 0 };
    ctx.anchors.set(value, data);
    ctx.onCreate = (res2) => {
      data.res = res2;
      delete ctx.onCreate;
    };
    const res = value.toJSON(arg, ctx);
    if (ctx.onCreate)
      ctx.onCreate(res);
    return res;
  }
  if (typeof value === "bigint" && !(ctx == null ? void 0 : ctx.keep))
    return Number(value);
  return value;
}
class NodeBase {
  constructor(type) {
    Object.defineProperty(this, NODE_TYPE, { value: type });
  }
  /** Create a copy of this node.  */
  clone() {
    const copy2 = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    if (this.range)
      copy2.range = this.range.slice();
    return copy2;
  }
  /** A plain JavaScript representation of this node. */
  toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
    if (!isDocument(doc))
      throw new TypeError("A document argument is required");
    const ctx = {
      anchors: /* @__PURE__ */ new Map(),
      doc,
      keep: true,
      mapAsMap: mapAsMap === true,
      mapKeyWarned: false,
      maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
    };
    const res = toJS(this, "", ctx);
    if (typeof onAnchor === "function")
      for (const { count, res: res2 } of ctx.anchors.values())
        onAnchor(res2, count);
    return typeof reviver === "function" ? applyReviver(reviver, { "": res }, "", res) : res;
  }
}
class Alias extends NodeBase {
  constructor(source) {
    super(ALIAS);
    this.source = source;
    Object.defineProperty(this, "tag", {
      set() {
        throw new Error("Alias nodes cannot have tags");
      }
    });
  }
  /**
   * Resolve the value of this alias within `doc`, finding the last
   * instance of the `source` anchor before this node.
   */
  resolve(doc) {
    let found = void 0;
    visit$1(doc, {
      Node: (_key, node) => {
        if (node === this)
          return visit$1.BREAK;
        if (node.anchor === this.source)
          found = node;
      }
    });
    return found;
  }
  toJSON(_arg, ctx) {
    if (!ctx)
      return { source: this.source };
    const { anchors, doc, maxAliasCount } = ctx;
    const source = this.resolve(doc);
    if (!source) {
      const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
      throw new ReferenceError(msg);
    }
    let data = anchors.get(source);
    if (!data) {
      toJS(source, null, ctx);
      data = anchors.get(source);
    }
    if (!data || data.res === void 0) {
      const msg = "This should not happen: Alias anchor was not resolved?";
      throw new ReferenceError(msg);
    }
    if (maxAliasCount >= 0) {
      data.count += 1;
      if (data.aliasCount === 0)
        data.aliasCount = getAliasCount(doc, source, anchors);
      if (data.count * data.aliasCount > maxAliasCount) {
        const msg = "Excessive alias count indicates a resource exhaustion attack";
        throw new ReferenceError(msg);
      }
    }
    return data.res;
  }
  toString(ctx, _onComment, _onChompKeep) {
    const src = `*${this.source}`;
    if (ctx) {
      anchorIsValid(this.source);
      if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
        const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new Error(msg);
      }
      if (ctx.implicitKey)
        return `${src} `;
    }
    return src;
  }
}
function getAliasCount(doc, node, anchors) {
  if (isAlias(node)) {
    const source = node.resolve(doc);
    const anchor = anchors && source && anchors.get(source);
    return anchor ? anchor.count * anchor.aliasCount : 0;
  } else if (isCollection$1(node)) {
    let count = 0;
    for (const item of node.items) {
      const c = getAliasCount(doc, item, anchors);
      if (c > count)
        count = c;
    }
    return count;
  } else if (isPair(node)) {
    const kc = getAliasCount(doc, node.key, anchors);
    const vc = getAliasCount(doc, node.value, anchors);
    return Math.max(kc, vc);
  }
  return 1;
}
const isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
class Scalar extends NodeBase {
  constructor(value) {
    super(SCALAR$1);
    this.value = value;
  }
  toJSON(arg, ctx) {
    return (ctx == null ? void 0 : ctx.keep) ? this.value : toJS(this.value, arg, ctx);
  }
  toString() {
    return String(this.value);
  }
}
Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
Scalar.PLAIN = "PLAIN";
Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
const defaultTagPrefix = "tag:yaml.org,2002:";
function findTagObject(value, tagName, tags) {
  if (tagName) {
    const match = tags.filter((t) => t.tag === tagName);
    const tagObj = match.find((t) => !t.format) ?? match[0];
    if (!tagObj)
      throw new Error(`Tag ${tagName} not found`);
    return tagObj;
  }
  return tags.find((t) => {
    var _a;
    return ((_a = t.identify) == null ? void 0 : _a.call(t, value)) && !t.format;
  });
}
function createNode(value, tagName, ctx) {
  var _a, _b, _c;
  if (isDocument(value))
    value = value.contents;
  if (isNode(value))
    return value;
  if (isPair(value)) {
    const map2 = (_b = (_a = ctx.schema[MAP]).createNode) == null ? void 0 : _b.call(_a, ctx.schema, null, ctx);
    map2.items.push(value);
    return map2;
  }
  if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
    value = value.valueOf();
  }
  const { aliasDuplicateObjects, onAnchor, onTagObj, schema: schema2, sourceObjects } = ctx;
  let ref = void 0;
  if (aliasDuplicateObjects && value && typeof value === "object") {
    ref = sourceObjects.get(value);
    if (ref) {
      if (!ref.anchor)
        ref.anchor = onAnchor(value);
      return new Alias(ref.anchor);
    } else {
      ref = { anchor: null, node: null };
      sourceObjects.set(value, ref);
    }
  }
  if (tagName == null ? void 0 : tagName.startsWith("!!"))
    tagName = defaultTagPrefix + tagName.slice(2);
  let tagObj = findTagObject(value, tagName, schema2.tags);
  if (!tagObj) {
    if (value && typeof value.toJSON === "function") {
      value = value.toJSON();
    }
    if (!value || typeof value !== "object") {
      const node2 = new Scalar(value);
      if (ref)
        ref.node = node2;
      return node2;
    }
    tagObj = value instanceof Map ? schema2[MAP] : Symbol.iterator in Object(value) ? schema2[SEQ] : schema2[MAP];
  }
  if (onTagObj) {
    onTagObj(tagObj);
    delete ctx.onTagObj;
  }
  const node = (tagObj == null ? void 0 : tagObj.createNode) ? tagObj.createNode(ctx.schema, value, ctx) : typeof ((_c = tagObj == null ? void 0 : tagObj.nodeClass) == null ? void 0 : _c.from) === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar(value);
  if (tagName)
    node.tag = tagName;
  else if (!tagObj.default)
    node.tag = tagObj.tag;
  if (ref)
    ref.node = node;
  return node;
}
function collectionFromPath(schema2, path, value) {
  let v = value;
  for (let i = path.length - 1; i >= 0; --i) {
    const k = path[i];
    if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
      const a = [];
      a[k] = v;
      v = a;
    } else {
      v = /* @__PURE__ */ new Map([[k, v]]);
    }
  }
  return createNode(v, void 0, {
    aliasDuplicateObjects: false,
    keepUndefined: false,
    onAnchor: () => {
      throw new Error("This should not happen, please report a bug.");
    },
    schema: schema2,
    sourceObjects: /* @__PURE__ */ new Map()
  });
}
const isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;
class Collection extends NodeBase {
  constructor(type, schema2) {
    super(type);
    Object.defineProperty(this, "schema", {
      value: schema2,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  /**
   * Create a copy of this collection.
   *
   * @param schema - If defined, overwrites the original's schema
   */
  clone(schema2) {
    const copy2 = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    if (schema2)
      copy2.schema = schema2;
    copy2.items = copy2.items.map((it) => isNode(it) || isPair(it) ? it.clone(schema2) : it);
    if (this.range)
      copy2.range = this.range.slice();
    return copy2;
  }
  /**
   * Adds a value to the collection. For `!!map` and `!!omap` the value must
   * be a Pair instance or a `{ key, value }` object, which may not have a key
   * that already exists in the map.
   */
  addIn(path, value) {
    if (isEmptyPath(path))
      this.add(value);
    else {
      const [key, ...rest] = path;
      const node = this.get(key, true);
      if (isCollection$1(node))
        node.addIn(rest, value);
      else if (node === void 0 && this.schema)
        this.set(key, collectionFromPath(this.schema, rest, value));
      else
        throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
  }
  /**
   * Removes a value from the collection.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(path) {
    const [key, ...rest] = path;
    if (rest.length === 0)
      return this.delete(key);
    const node = this.get(key, true);
    if (isCollection$1(node))
      return node.deleteIn(rest);
    else
      throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(path, keepScalar) {
    const [key, ...rest] = path;
    const node = this.get(key, true);
    if (rest.length === 0)
      return !keepScalar && isScalar$1(node) ? node.value : node;
    else
      return isCollection$1(node) ? node.getIn(rest, keepScalar) : void 0;
  }
  hasAllNullValues(allowScalar) {
    return this.items.every((node) => {
      if (!isPair(node))
        return false;
      const n = node.value;
      return n == null || allowScalar && isScalar$1(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
    });
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   */
  hasIn(path) {
    const [key, ...rest] = path;
    if (rest.length === 0)
      return this.has(key);
    const node = this.get(key, true);
    return isCollection$1(node) ? node.hasIn(rest) : false;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(path, value) {
    const [key, ...rest] = path;
    if (rest.length === 0) {
      this.set(key, value);
    } else {
      const node = this.get(key, true);
      if (isCollection$1(node))
        node.setIn(rest, value);
      else if (node === void 0 && this.schema)
        this.set(key, collectionFromPath(this.schema, rest, value));
      else
        throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
  }
}
const stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
function indentComment(comment, indent) {
  if (/^\n+$/.test(comment))
    return comment.substring(1);
  return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
}
const lineComment = (str, indent, comment) => str.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
const FOLD_FLOW = "flow";
const FOLD_BLOCK = "block";
const FOLD_QUOTED = "quoted";
function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
  if (!lineWidth || lineWidth < 0)
    return text;
  if (lineWidth < minContentWidth)
    minContentWidth = 0;
  const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
  if (text.length <= endStep)
    return text;
  const folds = [];
  const escapedFolds = {};
  let end = lineWidth - indent.length;
  if (typeof indentAtStart === "number") {
    if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
      folds.push(0);
    else
      end = lineWidth - indentAtStart;
  }
  let split = void 0;
  let prev = void 0;
  let overflow = false;
  let i = -1;
  let escStart = -1;
  let escEnd = -1;
  if (mode === FOLD_BLOCK) {
    i = consumeMoreIndentedLines(text, i, indent.length);
    if (i !== -1)
      end = i + endStep;
  }
  for (let ch; ch = text[i += 1]; ) {
    if (mode === FOLD_QUOTED && ch === "\\") {
      escStart = i;
      switch (text[i + 1]) {
        case "x":
          i += 3;
          break;
        case "u":
          i += 5;
          break;
        case "U":
          i += 9;
          break;
        default:
          i += 1;
      }
      escEnd = i;
    }
    if (ch === "\n") {
      if (mode === FOLD_BLOCK)
        i = consumeMoreIndentedLines(text, i, indent.length);
      end = i + indent.length + endStep;
      split = void 0;
    } else {
      if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
        const next = text[i + 1];
        if (next && next !== " " && next !== "\n" && next !== "	")
          split = i;
      }
      if (i >= end) {
        if (split) {
          folds.push(split);
          end = split + endStep;
          split = void 0;
        } else if (mode === FOLD_QUOTED) {
          while (prev === " " || prev === "	") {
            prev = ch;
            ch = text[i += 1];
            overflow = true;
          }
          const j = i > escEnd + 1 ? i - 2 : escStart - 1;
          if (escapedFolds[j])
            return text;
          folds.push(j);
          escapedFolds[j] = true;
          end = j + endStep;
          split = void 0;
        } else {
          overflow = true;
        }
      }
    }
    prev = ch;
  }
  if (overflow && onOverflow)
    onOverflow();
  if (folds.length === 0)
    return text;
  if (onFold)
    onFold();
  let res = text.slice(0, folds[0]);
  for (let i2 = 0; i2 < folds.length; ++i2) {
    const fold = folds[i2];
    const end2 = folds[i2 + 1] || text.length;
    if (fold === 0)
      res = `
${indent}${text.slice(0, end2)}`;
    else {
      if (mode === FOLD_QUOTED && escapedFolds[fold])
        res += `${text[fold]}\\`;
      res += `
${indent}${text.slice(fold + 1, end2)}`;
    }
  }
  return res;
}
function consumeMoreIndentedLines(text, i, indent) {
  let end = i;
  let start = i + 1;
  let ch = text[start];
  while (ch === " " || ch === "	") {
    if (i < start + indent) {
      ch = text[++i];
    } else {
      do {
        ch = text[++i];
      } while (ch && ch !== "\n");
      end = i;
      start = i + 1;
      ch = text[start];
    }
  }
  return end;
}
const getFoldOptions = (ctx, isBlock2) => ({
  indentAtStart: isBlock2 ? ctx.indent.length : ctx.indentAtStart,
  lineWidth: ctx.options.lineWidth,
  minContentWidth: ctx.options.minContentWidth
});
const containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
function lineLengthOverLimit(str, lineWidth, indentLength) {
  if (!lineWidth || lineWidth < 0)
    return false;
  const limit = lineWidth - indentLength;
  const strLen = str.length;
  if (strLen <= limit)
    return false;
  for (let i = 0, start = 0; i < strLen; ++i) {
    if (str[i] === "\n") {
      if (i - start > limit)
        return true;
      start = i + 1;
      if (strLen - start <= limit)
        return false;
    }
  }
  return true;
}
function doubleQuotedString(value, ctx) {
  const json = JSON.stringify(value);
  if (ctx.options.doubleQuotedAsJSON)
    return json;
  const { implicitKey } = ctx;
  const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
  const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
  let str = "";
  let start = 0;
  for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
    if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
      str += json.slice(start, i) + "\\ ";
      i += 1;
      start = i;
      ch = "\\";
    }
    if (ch === "\\")
      switch (json[i + 1]) {
        case "u":
          {
            str += json.slice(start, i);
            const code = json.substr(i + 2, 4);
            switch (code) {
              case "0000":
                str += "\\0";
                break;
              case "0007":
                str += "\\a";
                break;
              case "000b":
                str += "\\v";
                break;
              case "001b":
                str += "\\e";
                break;
              case "0085":
                str += "\\N";
                break;
              case "00a0":
                str += "\\_";
                break;
              case "2028":
                str += "\\L";
                break;
              case "2029":
                str += "\\P";
                break;
              default:
                if (code.substr(0, 2) === "00")
                  str += "\\x" + code.substr(2);
                else
                  str += json.substr(i, 6);
            }
            i += 5;
            start = i + 1;
          }
          break;
        case "n":
          if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
            i += 1;
          } else {
            str += json.slice(start, i) + "\n\n";
            while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
              str += "\n";
              i += 2;
            }
            str += indent;
            if (json[i + 2] === " ")
              str += "\\";
            i += 1;
            start = i + 1;
          }
          break;
        default:
          i += 1;
      }
  }
  str = start ? str + json.slice(start) : json;
  return implicitKey ? str : foldFlowLines(str, indent, FOLD_QUOTED, getFoldOptions(ctx, false));
}
function singleQuotedString(value, ctx) {
  if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
    return doubleQuotedString(value, ctx);
  const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
  const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
  return ctx.implicitKey ? res : foldFlowLines(res, indent, FOLD_FLOW, getFoldOptions(ctx, false));
}
function quotedString(value, ctx) {
  const { singleQuote } = ctx.options;
  let qs;
  if (singleQuote === false)
    qs = doubleQuotedString;
  else {
    const hasDouble = value.includes('"');
    const hasSingle = value.includes("'");
    if (hasDouble && !hasSingle)
      qs = singleQuotedString;
    else if (hasSingle && !hasDouble)
      qs = doubleQuotedString;
    else
      qs = singleQuote ? singleQuotedString : doubleQuotedString;
  }
  return qs(value, ctx);
}
let blockEndNewlines;
try {
  blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
} catch {
  blockEndNewlines = /\n+(?!\n|$)/g;
}
function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
  const { blockQuote, commentString, lineWidth } = ctx.options;
  if (!blockQuote || /\n[\t ]+$/.test(value) || /^\s*$/.test(value)) {
    return quotedString(value, ctx);
  }
  const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
  const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.BLOCK_FOLDED ? false : type === Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
  if (!value)
    return literal ? "|\n" : ">\n";
  let chomp;
  let endStart;
  for (endStart = value.length; endStart > 0; --endStart) {
    const ch = value[endStart - 1];
    if (ch !== "\n" && ch !== "	" && ch !== " ")
      break;
  }
  let end = value.substring(endStart);
  const endNlPos = end.indexOf("\n");
  if (endNlPos === -1) {
    chomp = "-";
  } else if (value === end || endNlPos !== end.length - 1) {
    chomp = "+";
    if (onChompKeep)
      onChompKeep();
  } else {
    chomp = "";
  }
  if (end) {
    value = value.slice(0, -end.length);
    if (end[end.length - 1] === "\n")
      end = end.slice(0, -1);
    end = end.replace(blockEndNewlines, `$&${indent}`);
  }
  let startWithSpace = false;
  let startEnd;
  let startNlPos = -1;
  for (startEnd = 0; startEnd < value.length; ++startEnd) {
    const ch = value[startEnd];
    if (ch === " ")
      startWithSpace = true;
    else if (ch === "\n")
      startNlPos = startEnd;
    else
      break;
  }
  let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
  if (start) {
    value = value.substring(start.length);
    start = start.replace(/\n+/g, `$&${indent}`);
  }
  const indentSize = indent ? "2" : "1";
  let header = (literal ? "|" : ">") + (startWithSpace ? indentSize : "") + chomp;
  if (comment) {
    header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
    if (onComment)
      onComment();
  }
  if (literal) {
    value = value.replace(/\n+/g, `$&${indent}`);
    return `${header}
${indent}${start}${value}${end}`;
  }
  value = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
  const body = foldFlowLines(`${start}${value}${end}`, indent, FOLD_BLOCK, getFoldOptions(ctx, true));
  return `${header}
${indent}${body}`;
}
function plainString(item, ctx, onComment, onChompKeep) {
  const { type, value } = item;
  const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
  if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
    return quotedString(value, ctx);
  }
  if (!value || /^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
    return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
  }
  if (!implicitKey && !inFlow && type !== Scalar.PLAIN && value.includes("\n")) {
    return blockString(item, ctx, onComment, onChompKeep);
  }
  if (containsDocumentMarker(value)) {
    if (indent === "") {
      ctx.forceBlockIndent = true;
      return blockString(item, ctx, onComment, onChompKeep);
    } else if (implicitKey && indent === indentStep) {
      return quotedString(value, ctx);
    }
  }
  const str = value.replace(/\n+/g, `$&
${indent}`);
  if (actualString) {
    const test = (tag) => {
      var _a;
      return tag.default && tag.tag !== "tag:yaml.org,2002:str" && ((_a = tag.test) == null ? void 0 : _a.test(str));
    };
    const { compat, tags } = ctx.doc.schema;
    if (tags.some(test) || (compat == null ? void 0 : compat.some(test)))
      return quotedString(value, ctx);
  }
  return implicitKey ? str : foldFlowLines(str, indent, FOLD_FLOW, getFoldOptions(ctx, false));
}
function stringifyString(item, ctx, onComment, onChompKeep) {
  const { implicitKey, inFlow } = ctx;
  const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
  let { type } = item;
  if (type !== Scalar.QUOTE_DOUBLE) {
    if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
      type = Scalar.QUOTE_DOUBLE;
  }
  const _stringify = (_type) => {
    switch (_type) {
      case Scalar.BLOCK_FOLDED:
      case Scalar.BLOCK_LITERAL:
        return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
      case Scalar.QUOTE_DOUBLE:
        return doubleQuotedString(ss.value, ctx);
      case Scalar.QUOTE_SINGLE:
        return singleQuotedString(ss.value, ctx);
      case Scalar.PLAIN:
        return plainString(ss, ctx, onComment, onChompKeep);
      default:
        return null;
    }
  };
  let res = _stringify(type);
  if (res === null) {
    const { defaultKeyType, defaultStringType } = ctx.options;
    const t = implicitKey && defaultKeyType || defaultStringType;
    res = _stringify(t);
    if (res === null)
      throw new Error(`Unsupported default string type ${t}`);
  }
  return res;
}
function createStringifyContext(doc, options) {
  const opt = Object.assign({
    blockQuote: true,
    commentString: stringifyComment,
    defaultKeyType: null,
    defaultStringType: "PLAIN",
    directives: null,
    doubleQuotedAsJSON: false,
    doubleQuotedMinMultiLineLength: 40,
    falseStr: "false",
    flowCollectionPadding: true,
    indentSeq: true,
    lineWidth: 80,
    minContentWidth: 20,
    nullStr: "null",
    simpleKeys: false,
    singleQuote: null,
    trueStr: "true",
    verifyAliasOrder: true
  }, doc.schema.toStringOptions, options);
  let inFlow;
  switch (opt.collectionStyle) {
    case "block":
      inFlow = false;
      break;
    case "flow":
      inFlow = true;
      break;
    default:
      inFlow = null;
  }
  return {
    anchors: /* @__PURE__ */ new Set(),
    doc,
    flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
    indent: "",
    indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
    inFlow,
    options: opt
  };
}
function getTagObject(tags, item) {
  var _a;
  if (item.tag) {
    const match = tags.filter((t) => t.tag === item.tag);
    if (match.length > 0)
      return match.find((t) => t.format === item.format) ?? match[0];
  }
  let tagObj = void 0;
  let obj;
  if (isScalar$1(item)) {
    obj = item.value;
    let match = tags.filter((t) => {
      var _a2;
      return (_a2 = t.identify) == null ? void 0 : _a2.call(t, obj);
    });
    if (match.length > 1) {
      const testMatch = match.filter((t) => t.test);
      if (testMatch.length > 0)
        match = testMatch;
    }
    tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
  } else {
    obj = item;
    tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
  }
  if (!tagObj) {
    const name = ((_a = obj == null ? void 0 : obj.constructor) == null ? void 0 : _a.name) ?? typeof obj;
    throw new Error(`Tag not resolved for ${name} value`);
  }
  return tagObj;
}
function stringifyProps(node, tagObj, { anchors, doc }) {
  if (!doc.directives)
    return "";
  const props = [];
  const anchor = (isScalar$1(node) || isCollection$1(node)) && node.anchor;
  if (anchor && anchorIsValid(anchor)) {
    anchors.add(anchor);
    props.push(`&${anchor}`);
  }
  const tag = node.tag ? node.tag : tagObj.default ? null : tagObj.tag;
  if (tag)
    props.push(doc.directives.tagString(tag));
  return props.join(" ");
}
function stringify$2(item, ctx, onComment, onChompKeep) {
  var _a;
  if (isPair(item))
    return item.toString(ctx, onComment, onChompKeep);
  if (isAlias(item)) {
    if (ctx.doc.directives)
      return item.toString(ctx);
    if ((_a = ctx.resolvedAliases) == null ? void 0 : _a.has(item)) {
      throw new TypeError(`Cannot stringify circular structure without alias nodes`);
    } else {
      if (ctx.resolvedAliases)
        ctx.resolvedAliases.add(item);
      else
        ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
      item = item.resolve(ctx.doc);
    }
  }
  let tagObj = void 0;
  const node = isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
  if (!tagObj)
    tagObj = getTagObject(ctx.doc.schema.tags, node);
  const props = stringifyProps(node, tagObj, ctx);
  if (props.length > 0)
    ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
  const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : isScalar$1(node) ? stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
  if (!props)
    return str;
  return isScalar$1(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
}
function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
  const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
  let keyComment = isNode(key) && key.comment || null;
  if (simpleKeys) {
    if (keyComment) {
      throw new Error("With simple keys, key nodes cannot have comments");
    }
    if (isCollection$1(key) || !isNode(key) && typeof key === "object") {
      const msg = "With simple keys, collection cannot be used as a key value";
      throw new Error(msg);
    }
  }
  let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || isCollection$1(key) || (isScalar$1(key) ? key.type === Scalar.BLOCK_FOLDED || key.type === Scalar.BLOCK_LITERAL : typeof key === "object"));
  ctx = Object.assign({}, ctx, {
    allNullValues: false,
    implicitKey: !explicitKey && (simpleKeys || !allNullValues),
    indent: indent + indentStep
  });
  let keyCommentDone = false;
  let chompKeep = false;
  let str = stringify$2(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
  if (!explicitKey && !ctx.inFlow && str.length > 1024) {
    if (simpleKeys)
      throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
    explicitKey = true;
  }
  if (ctx.inFlow) {
    if (allNullValues || value == null) {
      if (keyCommentDone && onComment)
        onComment();
      return str === "" ? "?" : explicitKey ? `? ${str}` : str;
    }
  } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
    str = `? ${str}`;
    if (keyComment && !keyCommentDone) {
      str += lineComment(str, ctx.indent, commentString(keyComment));
    } else if (chompKeep && onChompKeep)
      onChompKeep();
    return str;
  }
  if (keyCommentDone)
    keyComment = null;
  if (explicitKey) {
    if (keyComment)
      str += lineComment(str, ctx.indent, commentString(keyComment));
    str = `? ${str}
${indent}:`;
  } else {
    str = `${str}:`;
    if (keyComment)
      str += lineComment(str, ctx.indent, commentString(keyComment));
  }
  let vsb, vcb, valueComment;
  if (isNode(value)) {
    vsb = !!value.spaceBefore;
    vcb = value.commentBefore;
    valueComment = value.comment;
  } else {
    vsb = false;
    vcb = null;
    valueComment = null;
    if (value && typeof value === "object")
      value = doc.createNode(value);
  }
  ctx.implicitKey = false;
  if (!explicitKey && !keyComment && isScalar$1(value))
    ctx.indentAtStart = str.length + 1;
  chompKeep = false;
  if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && isSeq(value) && !value.flow && !value.tag && !value.anchor) {
    ctx.indent = ctx.indent.substring(2);
  }
  let valueCommentDone = false;
  const valueStr = stringify$2(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
  let ws = " ";
  if (keyComment || vsb || vcb) {
    ws = vsb ? "\n" : "";
    if (vcb) {
      const cs = commentString(vcb);
      ws += `
${indentComment(cs, ctx.indent)}`;
    }
    if (valueStr === "" && !ctx.inFlow) {
      if (ws === "\n")
        ws = "\n\n";
    } else {
      ws += `
${ctx.indent}`;
    }
  } else if (!explicitKey && isCollection$1(value)) {
    const vs0 = valueStr[0];
    const nl0 = valueStr.indexOf("\n");
    const hasNewline = nl0 !== -1;
    const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
    if (hasNewline || !flow) {
      let hasPropsLine = false;
      if (hasNewline && (vs0 === "&" || vs0 === "!")) {
        let sp0 = valueStr.indexOf(" ");
        if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
          sp0 = valueStr.indexOf(" ", sp0 + 1);
        }
        if (sp0 === -1 || nl0 < sp0)
          hasPropsLine = true;
      }
      if (!hasPropsLine)
        ws = `
${ctx.indent}`;
    }
  } else if (valueStr === "" || valueStr[0] === "\n") {
    ws = "";
  }
  str += ws + valueStr;
  if (ctx.inFlow) {
    if (valueCommentDone && onComment)
      onComment();
  } else if (valueComment && !valueCommentDone) {
    str += lineComment(str, ctx.indent, commentString(valueComment));
  } else if (chompKeep && onChompKeep) {
    onChompKeep();
  }
  return str;
}
function warn(logLevel, warning) {
  if (logLevel === "debug" || logLevel === "warn") {
    if (typeof process !== "undefined" && process.emitWarning)
      process.emitWarning(warning);
    else
      console.warn(warning);
  }
}
const MERGE_KEY = "<<";
const merge = {
  identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
  default: "key",
  tag: "tag:yaml.org,2002:merge",
  test: /^<<$/,
  resolve: () => Object.assign(new Scalar(Symbol(MERGE_KEY)), {
    addToJSMap: addMergeToJSMap
  }),
  stringify: () => MERGE_KEY
};
const isMergeKey = (ctx, key) => (merge.identify(key) || isScalar$1(key) && (!key.type || key.type === Scalar.PLAIN) && merge.identify(key.value)) && (ctx == null ? void 0 : ctx.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default));
function addMergeToJSMap(ctx, map2, value) {
  value = ctx && isAlias(value) ? value.resolve(ctx.doc) : value;
  if (isSeq(value))
    for (const it of value.items)
      mergeValue(ctx, map2, it);
  else if (Array.isArray(value))
    for (const it of value)
      mergeValue(ctx, map2, it);
  else
    mergeValue(ctx, map2, value);
}
function mergeValue(ctx, map2, value) {
  const source = ctx && isAlias(value) ? value.resolve(ctx.doc) : value;
  if (!isMap(source))
    throw new Error("Merge sources must be maps or map aliases");
  const srcMap = source.toJSON(null, ctx, Map);
  for (const [key, value2] of srcMap) {
    if (map2 instanceof Map) {
      if (!map2.has(key))
        map2.set(key, value2);
    } else if (map2 instanceof Set) {
      map2.add(key);
    } else if (!Object.prototype.hasOwnProperty.call(map2, key)) {
      Object.defineProperty(map2, key, {
        value: value2,
        writable: true,
        enumerable: true,
        configurable: true
      });
    }
  }
  return map2;
}
function addPairToJSMap(ctx, map2, { key, value }) {
  if (isNode(key) && key.addToJSMap)
    key.addToJSMap(ctx, map2, value);
  else if (isMergeKey(ctx, key))
    addMergeToJSMap(ctx, map2, value);
  else {
    const jsKey = toJS(key, "", ctx);
    if (map2 instanceof Map) {
      map2.set(jsKey, toJS(value, jsKey, ctx));
    } else if (map2 instanceof Set) {
      map2.add(jsKey);
    } else {
      const stringKey = stringifyKey(key, jsKey, ctx);
      const jsValue = toJS(value, stringKey, ctx);
      if (stringKey in map2)
        Object.defineProperty(map2, stringKey, {
          value: jsValue,
          writable: true,
          enumerable: true,
          configurable: true
        });
      else
        map2[stringKey] = jsValue;
    }
  }
  return map2;
}
function stringifyKey(key, jsKey, ctx) {
  if (jsKey === null)
    return "";
  if (typeof jsKey !== "object")
    return String(jsKey);
  if (isNode(key) && (ctx == null ? void 0 : ctx.doc)) {
    const strCtx = createStringifyContext(ctx.doc, {});
    strCtx.anchors = /* @__PURE__ */ new Set();
    for (const node of ctx.anchors.keys())
      strCtx.anchors.add(node.anchor);
    strCtx.inFlow = true;
    strCtx.inStringifyKey = true;
    const strKey = key.toString(strCtx);
    if (!ctx.mapKeyWarned) {
      let jsonStr = JSON.stringify(strKey);
      if (jsonStr.length > 40)
        jsonStr = jsonStr.substring(0, 36) + '..."';
      warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
      ctx.mapKeyWarned = true;
    }
    return strKey;
  }
  return JSON.stringify(jsKey);
}
function createPair(key, value, ctx) {
  const k = createNode(key, void 0, ctx);
  const v = createNode(value, void 0, ctx);
  return new Pair(k, v);
}
class Pair {
  constructor(key, value = null) {
    Object.defineProperty(this, NODE_TYPE, { value: PAIR });
    this.key = key;
    this.value = value;
  }
  clone(schema2) {
    let { key, value } = this;
    if (isNode(key))
      key = key.clone(schema2);
    if (isNode(value))
      value = value.clone(schema2);
    return new Pair(key, value);
  }
  toJSON(_, ctx) {
    const pair = (ctx == null ? void 0 : ctx.mapAsMap) ? /* @__PURE__ */ new Map() : {};
    return addPairToJSMap(ctx, pair, this);
  }
  toString(ctx, onComment, onChompKeep) {
    return (ctx == null ? void 0 : ctx.doc) ? stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
  }
}
function stringifyCollection(collection, ctx, options) {
  const flow = ctx.inFlow ?? collection.flow;
  const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
  return stringify2(collection, ctx, options);
}
function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
  const { indent, options: { commentString } } = ctx;
  const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
  let chompKeep = false;
  const lines = [];
  for (let i = 0; i < items.length; ++i) {
    const item = items[i];
    let comment2 = null;
    if (isNode(item)) {
      if (!chompKeep && item.spaceBefore)
        lines.push("");
      addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
      if (item.comment)
        comment2 = item.comment;
    } else if (isPair(item)) {
      const ik = isNode(item.key) ? item.key : null;
      if (ik) {
        if (!chompKeep && ik.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
      }
    }
    chompKeep = false;
    let str2 = stringify$2(item, itemCtx, () => comment2 = null, () => chompKeep = true);
    if (comment2)
      str2 += lineComment(str2, itemIndent, commentString(comment2));
    if (chompKeep && comment2)
      chompKeep = false;
    lines.push(blockItemPrefix + str2);
  }
  let str;
  if (lines.length === 0) {
    str = flowChars.start + flowChars.end;
  } else {
    str = lines[0];
    for (let i = 1; i < lines.length; ++i) {
      const line = lines[i];
      str += line ? `
${indent}${line}` : "\n";
    }
  }
  if (comment) {
    str += "\n" + indentComment(commentString(comment), indent);
    if (onComment)
      onComment();
  } else if (chompKeep && onChompKeep)
    onChompKeep();
  return str;
}
function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
  const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
  itemIndent += indentStep;
  const itemCtx = Object.assign({}, ctx, {
    indent: itemIndent,
    inFlow: true,
    type: null
  });
  let reqNewline = false;
  let linesAtValue = 0;
  const lines = [];
  for (let i = 0; i < items.length; ++i) {
    const item = items[i];
    let comment = null;
    if (isNode(item)) {
      if (item.spaceBefore)
        lines.push("");
      addCommentBefore(ctx, lines, item.commentBefore, false);
      if (item.comment)
        comment = item.comment;
    } else if (isPair(item)) {
      const ik = isNode(item.key) ? item.key : null;
      if (ik) {
        if (ik.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, ik.commentBefore, false);
        if (ik.comment)
          reqNewline = true;
      }
      const iv = isNode(item.value) ? item.value : null;
      if (iv) {
        if (iv.comment)
          comment = iv.comment;
        if (iv.commentBefore)
          reqNewline = true;
      } else if (item.value == null && (ik == null ? void 0 : ik.comment)) {
        comment = ik.comment;
      }
    }
    if (comment)
      reqNewline = true;
    let str = stringify$2(item, itemCtx, () => comment = null);
    if (i < items.length - 1)
      str += ",";
    if (comment)
      str += lineComment(str, itemIndent, commentString(comment));
    if (!reqNewline && (lines.length > linesAtValue || str.includes("\n")))
      reqNewline = true;
    lines.push(str);
    linesAtValue = lines.length;
  }
  const { start, end } = flowChars;
  if (lines.length === 0) {
    return start + end;
  } else {
    if (!reqNewline) {
      const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
      reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
    }
    if (reqNewline) {
      let str = start;
      for (const line of lines)
        str += line ? `
${indentStep}${indent}${line}` : "\n";
      return `${str}
${indent}${end}`;
    } else {
      return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
    }
  }
}
function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
  if (comment && chompKeep)
    comment = comment.replace(/^\n+/, "");
  if (comment) {
    const ic = indentComment(commentString(comment), indent);
    lines.push(ic.trimStart());
  }
}
function findPair(items, key) {
  const k = isScalar$1(key) ? key.value : key;
  for (const it of items) {
    if (isPair(it)) {
      if (it.key === key || it.key === k)
        return it;
      if (isScalar$1(it.key) && it.key.value === k)
        return it;
    }
  }
  return void 0;
}
class YAMLMap extends Collection {
  static get tagName() {
    return "tag:yaml.org,2002:map";
  }
  constructor(schema2) {
    super(MAP, schema2);
    this.items = [];
  }
  /**
   * A generic collection parsing method that can be extended
   * to other node classes that inherit from YAMLMap
   */
  static from(schema2, obj, ctx) {
    const { keepUndefined, replacer } = ctx;
    const map2 = new this(schema2);
    const add = (key, value) => {
      if (typeof replacer === "function")
        value = replacer.call(obj, key, value);
      else if (Array.isArray(replacer) && !replacer.includes(key))
        return;
      if (value !== void 0 || keepUndefined)
        map2.items.push(createPair(key, value, ctx));
    };
    if (obj instanceof Map) {
      for (const [key, value] of obj)
        add(key, value);
    } else if (obj && typeof obj === "object") {
      for (const key of Object.keys(obj))
        add(key, obj[key]);
    }
    if (typeof schema2.sortMapEntries === "function") {
      map2.items.sort(schema2.sortMapEntries);
    }
    return map2;
  }
  /**
   * Adds a value to the collection.
   *
   * @param overwrite - If not set `true`, using a key that is already in the
   *   collection will throw. Otherwise, overwrites the previous value.
   */
  add(pair, overwrite) {
    var _a;
    let _pair;
    if (isPair(pair))
      _pair = pair;
    else if (!pair || typeof pair !== "object" || !("key" in pair)) {
      _pair = new Pair(pair, pair == null ? void 0 : pair.value);
    } else
      _pair = new Pair(pair.key, pair.value);
    const prev = findPair(this.items, _pair.key);
    const sortEntries = (_a = this.schema) == null ? void 0 : _a.sortMapEntries;
    if (prev) {
      if (!overwrite)
        throw new Error(`Key ${_pair.key} already set`);
      if (isScalar$1(prev.value) && isScalarValue(_pair.value))
        prev.value.value = _pair.value;
      else
        prev.value = _pair.value;
    } else if (sortEntries) {
      const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
      if (i === -1)
        this.items.push(_pair);
      else
        this.items.splice(i, 0, _pair);
    } else {
      this.items.push(_pair);
    }
  }
  delete(key) {
    const it = findPair(this.items, key);
    if (!it)
      return false;
    const del = this.items.splice(this.items.indexOf(it), 1);
    return del.length > 0;
  }
  get(key, keepScalar) {
    const it = findPair(this.items, key);
    const node = it == null ? void 0 : it.value;
    return (!keepScalar && isScalar$1(node) ? node.value : node) ?? void 0;
  }
  has(key) {
    return !!findPair(this.items, key);
  }
  set(key, value) {
    this.add(new Pair(key, value), true);
  }
  /**
   * @param ctx - Conversion context, originally set in Document#toJS()
   * @param {Class} Type - If set, forces the returned collection type
   * @returns Instance of Type, Map, or Object
   */
  toJSON(_, ctx, Type) {
    const map2 = Type ? new Type() : (ctx == null ? void 0 : ctx.mapAsMap) ? /* @__PURE__ */ new Map() : {};
    if (ctx == null ? void 0 : ctx.onCreate)
      ctx.onCreate(map2);
    for (const item of this.items)
      addPairToJSMap(ctx, map2, item);
    return map2;
  }
  toString(ctx, onComment, onChompKeep) {
    if (!ctx)
      return JSON.stringify(this);
    for (const item of this.items) {
      if (!isPair(item))
        throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
    }
    if (!ctx.allNullValues && this.hasAllNullValues(false))
      ctx = Object.assign({}, ctx, { allNullValues: true });
    return stringifyCollection(this, ctx, {
      blockItemPrefix: "",
      flowChars: { start: "{", end: "}" },
      itemIndent: ctx.indent || "",
      onChompKeep,
      onComment
    });
  }
}
const map = {
  collection: "map",
  default: true,
  nodeClass: YAMLMap,
  tag: "tag:yaml.org,2002:map",
  resolve(map2, onError) {
    if (!isMap(map2))
      onError("Expected a mapping for this tag");
    return map2;
  },
  createNode: (schema2, obj, ctx) => YAMLMap.from(schema2, obj, ctx)
};
class YAMLSeq extends Collection {
  static get tagName() {
    return "tag:yaml.org,2002:seq";
  }
  constructor(schema2) {
    super(SEQ, schema2);
    this.items = [];
  }
  add(value) {
    this.items.push(value);
  }
  /**
   * Removes a value from the collection.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   *
   * @returns `true` if the item was found and removed.
   */
  delete(key) {
    const idx = asItemIndex(key);
    if (typeof idx !== "number")
      return false;
    const del = this.items.splice(idx, 1);
    return del.length > 0;
  }
  get(key, keepScalar) {
    const idx = asItemIndex(key);
    if (typeof idx !== "number")
      return void 0;
    const it = this.items[idx];
    return !keepScalar && isScalar$1(it) ? it.value : it;
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   */
  has(key) {
    const idx = asItemIndex(key);
    return typeof idx === "number" && idx < this.items.length;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   *
   * If `key` does not contain a representation of an integer, this will throw.
   * It may be wrapped in a `Scalar`.
   */
  set(key, value) {
    const idx = asItemIndex(key);
    if (typeof idx !== "number")
      throw new Error(`Expected a valid index, not ${key}.`);
    const prev = this.items[idx];
    if (isScalar$1(prev) && isScalarValue(value))
      prev.value = value;
    else
      this.items[idx] = value;
  }
  toJSON(_, ctx) {
    const seq2 = [];
    if (ctx == null ? void 0 : ctx.onCreate)
      ctx.onCreate(seq2);
    let i = 0;
    for (const item of this.items)
      seq2.push(toJS(item, String(i++), ctx));
    return seq2;
  }
  toString(ctx, onComment, onChompKeep) {
    if (!ctx)
      return JSON.stringify(this);
    return stringifyCollection(this, ctx, {
      blockItemPrefix: "- ",
      flowChars: { start: "[", end: "]" },
      itemIndent: (ctx.indent || "") + "  ",
      onChompKeep,
      onComment
    });
  }
  static from(schema2, obj, ctx) {
    const { replacer } = ctx;
    const seq2 = new this(schema2);
    if (obj && Symbol.iterator in Object(obj)) {
      let i = 0;
      for (let it of obj) {
        if (typeof replacer === "function") {
          const key = obj instanceof Set ? it : String(i++);
          it = replacer.call(obj, key, it);
        }
        seq2.items.push(createNode(it, void 0, ctx));
      }
    }
    return seq2;
  }
}
function asItemIndex(key) {
  let idx = isScalar$1(key) ? key.value : key;
  if (idx && typeof idx === "string")
    idx = Number(idx);
  return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
}
const seq = {
  collection: "seq",
  default: true,
  nodeClass: YAMLSeq,
  tag: "tag:yaml.org,2002:seq",
  resolve(seq2, onError) {
    if (!isSeq(seq2))
      onError("Expected a sequence for this tag");
    return seq2;
  },
  createNode: (schema2, obj, ctx) => YAMLSeq.from(schema2, obj, ctx)
};
const string = {
  identify: (value) => typeof value === "string",
  default: true,
  tag: "tag:yaml.org,2002:str",
  resolve: (str) => str,
  stringify(item, ctx, onComment, onChompKeep) {
    ctx = Object.assign({ actualString: true }, ctx);
    return stringifyString(item, ctx, onComment, onChompKeep);
  }
};
const nullTag = {
  identify: (value) => value == null,
  createNode: () => new Scalar(null),
  default: true,
  tag: "tag:yaml.org,2002:null",
  test: /^(?:~|[Nn]ull|NULL)?$/,
  resolve: () => new Scalar(null),
  stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
};
const boolTag = {
  identify: (value) => typeof value === "boolean",
  default: true,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
  resolve: (str) => new Scalar(str[0] === "t" || str[0] === "T"),
  stringify({ source, value }, ctx) {
    if (source && boolTag.test.test(source)) {
      const sv = source[0] === "t" || source[0] === "T";
      if (value === sv)
        return source;
    }
    return value ? ctx.options.trueStr : ctx.options.falseStr;
  }
};
function stringifyNumber({ format, minFractionDigits, tag, value }) {
  if (typeof value === "bigint")
    return String(value);
  const num = typeof value === "number" ? value : Number(value);
  if (!isFinite(num))
    return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
  let n = JSON.stringify(value);
  if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^\d/.test(n)) {
    let i = n.indexOf(".");
    if (i < 0) {
      i = n.length;
      n += ".";
    }
    let d = minFractionDigits - (n.length - i - 1);
    while (d-- > 0)
      n += "0";
  }
  return n;
}
const floatNaN$1 = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
  resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: stringifyNumber
};
const floatExp$1 = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
  resolve: (str) => parseFloat(str),
  stringify(node) {
    const num = Number(node.value);
    return isFinite(num) ? num.toExponential() : stringifyNumber(node);
  }
};
const float$1 = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
  resolve(str) {
    const node = new Scalar(parseFloat(str));
    const dot = str.indexOf(".");
    if (dot !== -1 && str[str.length - 1] === "0")
      node.minFractionDigits = str.length - dot - 1;
    return node;
  },
  stringify: stringifyNumber
};
const intIdentify$2 = (value) => typeof value === "bigint" || Number.isInteger(value);
const intResolve$1 = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
function intStringify$1(node, radix, prefix) {
  const { value } = node;
  if (intIdentify$2(value) && value >= 0)
    return prefix + value.toString(radix);
  return stringifyNumber(node);
}
const intOct$1 = {
  identify: (value) => intIdentify$2(value) && value >= 0,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^0o[0-7]+$/,
  resolve: (str, _onError, opt) => intResolve$1(str, 2, 8, opt),
  stringify: (node) => intStringify$1(node, 8, "0o")
};
const int$1 = {
  identify: intIdentify$2,
  default: true,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9]+$/,
  resolve: (str, _onError, opt) => intResolve$1(str, 0, 10, opt),
  stringify: stringifyNumber
};
const intHex$1 = {
  identify: (value) => intIdentify$2(value) && value >= 0,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^0x[0-9a-fA-F]+$/,
  resolve: (str, _onError, opt) => intResolve$1(str, 2, 16, opt),
  stringify: (node) => intStringify$1(node, 16, "0x")
};
const schema$2 = [
  map,
  seq,
  string,
  nullTag,
  boolTag,
  intOct$1,
  int$1,
  intHex$1,
  floatNaN$1,
  floatExp$1,
  float$1
];
function intIdentify$1(value) {
  return typeof value === "bigint" || Number.isInteger(value);
}
const stringifyJSON = ({ value }) => JSON.stringify(value);
const jsonScalars = [
  {
    identify: (value) => typeof value === "string",
    default: true,
    tag: "tag:yaml.org,2002:str",
    resolve: (str) => str,
    stringify: stringifyJSON
  },
  {
    identify: (value) => value == null,
    createNode: () => new Scalar(null),
    default: true,
    tag: "tag:yaml.org,2002:null",
    test: /^null$/,
    resolve: () => null,
    stringify: stringifyJSON
  },
  {
    identify: (value) => typeof value === "boolean",
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^true|false$/,
    resolve: (str) => str === "true",
    stringify: stringifyJSON
  },
  {
    identify: intIdentify$1,
    default: true,
    tag: "tag:yaml.org,2002:int",
    test: /^-?(?:0|[1-9][0-9]*)$/,
    resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
    stringify: ({ value }) => intIdentify$1(value) ? value.toString() : JSON.stringify(value)
  },
  {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
    resolve: (str) => parseFloat(str),
    stringify: stringifyJSON
  }
];
const jsonError = {
  default: true,
  tag: "",
  test: /^/,
  resolve(str, onError) {
    onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
    return str;
  }
};
const schema$1 = [map, seq].concat(jsonScalars, jsonError);
const binary = {
  identify: (value) => value instanceof Uint8Array,
  // Buffer inherits from Uint8Array
  default: false,
  tag: "tag:yaml.org,2002:binary",
  /**
   * Returns a Buffer in node and an Uint8Array in browsers
   *
   * To use the resulting buffer as an image, you'll want to do something like:
   *
   *   const blob = new Blob([buffer], { type: 'image/jpeg' })
   *   document.querySelector('#photo').src = URL.createObjectURL(blob)
   */
  resolve(src, onError) {
    if (typeof Buffer === "function") {
      return Buffer.from(src, "base64");
    } else if (typeof atob === "function") {
      const str = atob(src.replace(/[\n\r]/g, ""));
      const buffer = new Uint8Array(str.length);
      for (let i = 0; i < str.length; ++i)
        buffer[i] = str.charCodeAt(i);
      return buffer;
    } else {
      onError("This environment does not support reading binary tags; either Buffer or atob is required");
      return src;
    }
  },
  stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
    const buf = value;
    let str;
    if (typeof Buffer === "function") {
      str = buf instanceof Buffer ? buf.toString("base64") : Buffer.from(buf.buffer).toString("base64");
    } else if (typeof btoa === "function") {
      let s = "";
      for (let i = 0; i < buf.length; ++i)
        s += String.fromCharCode(buf[i]);
      str = btoa(s);
    } else {
      throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
    }
    if (!type)
      type = Scalar.BLOCK_LITERAL;
    if (type !== Scalar.QUOTE_DOUBLE) {
      const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
      const n = Math.ceil(str.length / lineWidth);
      const lines = new Array(n);
      for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
        lines[i] = str.substr(o, lineWidth);
      }
      str = lines.join(type === Scalar.BLOCK_LITERAL ? "\n" : " ");
    }
    return stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
  }
};
function resolvePairs(seq2, onError) {
  if (isSeq(seq2)) {
    for (let i = 0; i < seq2.items.length; ++i) {
      let item = seq2.items[i];
      if (isPair(item))
        continue;
      else if (isMap(item)) {
        if (item.items.length > 1)
          onError("Each pair must have its own sequence indicator");
        const pair = item.items[0] || new Pair(new Scalar(null));
        if (item.commentBefore)
          pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
        if (item.comment) {
          const cn = pair.value ?? pair.key;
          cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
        }
        item = pair;
      }
      seq2.items[i] = isPair(item) ? item : new Pair(item);
    }
  } else
    onError("Expected a sequence for this tag");
  return seq2;
}
function createPairs(schema2, iterable, ctx) {
  const { replacer } = ctx;
  const pairs2 = new YAMLSeq(schema2);
  pairs2.tag = "tag:yaml.org,2002:pairs";
  let i = 0;
  if (iterable && Symbol.iterator in Object(iterable))
    for (let it of iterable) {
      if (typeof replacer === "function")
        it = replacer.call(iterable, String(i++), it);
      let key, value;
      if (Array.isArray(it)) {
        if (it.length === 2) {
          key = it[0];
          value = it[1];
        } else
          throw new TypeError(`Expected [key, value] tuple: ${it}`);
      } else if (it && it instanceof Object) {
        const keys = Object.keys(it);
        if (keys.length === 1) {
          key = keys[0];
          value = it[key];
        } else {
          throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
        }
      } else {
        key = it;
      }
      pairs2.items.push(createPair(key, value, ctx));
    }
  return pairs2;
}
const pairs = {
  collection: "seq",
  default: false,
  tag: "tag:yaml.org,2002:pairs",
  resolve: resolvePairs,
  createNode: createPairs
};
class YAMLOMap extends YAMLSeq {
  constructor() {
    super();
    this.add = YAMLMap.prototype.add.bind(this);
    this.delete = YAMLMap.prototype.delete.bind(this);
    this.get = YAMLMap.prototype.get.bind(this);
    this.has = YAMLMap.prototype.has.bind(this);
    this.set = YAMLMap.prototype.set.bind(this);
    this.tag = YAMLOMap.tag;
  }
  /**
   * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
   * but TypeScript won't allow widening the signature of a child method.
   */
  toJSON(_, ctx) {
    if (!ctx)
      return super.toJSON(_);
    const map2 = /* @__PURE__ */ new Map();
    if (ctx == null ? void 0 : ctx.onCreate)
      ctx.onCreate(map2);
    for (const pair of this.items) {
      let key, value;
      if (isPair(pair)) {
        key = toJS(pair.key, "", ctx);
        value = toJS(pair.value, key, ctx);
      } else {
        key = toJS(pair, "", ctx);
      }
      if (map2.has(key))
        throw new Error("Ordered maps must not include duplicate keys");
      map2.set(key, value);
    }
    return map2;
  }
  static from(schema2, iterable, ctx) {
    const pairs2 = createPairs(schema2, iterable, ctx);
    const omap2 = new this();
    omap2.items = pairs2.items;
    return omap2;
  }
}
YAMLOMap.tag = "tag:yaml.org,2002:omap";
const omap = {
  collection: "seq",
  identify: (value) => value instanceof Map,
  nodeClass: YAMLOMap,
  default: false,
  tag: "tag:yaml.org,2002:omap",
  resolve(seq2, onError) {
    const pairs2 = resolvePairs(seq2, onError);
    const seenKeys = [];
    for (const { key } of pairs2.items) {
      if (isScalar$1(key)) {
        if (seenKeys.includes(key.value)) {
          onError(`Ordered maps must not include duplicate keys: ${key.value}`);
        } else {
          seenKeys.push(key.value);
        }
      }
    }
    return Object.assign(new YAMLOMap(), pairs2);
  },
  createNode: (schema2, iterable, ctx) => YAMLOMap.from(schema2, iterable, ctx)
};
function boolStringify({ value, source }, ctx) {
  const boolObj = value ? trueTag : falseTag;
  if (source && boolObj.test.test(source))
    return source;
  return value ? ctx.options.trueStr : ctx.options.falseStr;
}
const trueTag = {
  identify: (value) => value === true,
  default: true,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
  resolve: () => new Scalar(true),
  stringify: boolStringify
};
const falseTag = {
  identify: (value) => value === false,
  default: true,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
  resolve: () => new Scalar(false),
  stringify: boolStringify
};
const floatNaN = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
  resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: stringifyNumber
};
const floatExp = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
  resolve: (str) => parseFloat(str.replace(/_/g, "")),
  stringify(node) {
    const num = Number(node.value);
    return isFinite(num) ? num.toExponential() : stringifyNumber(node);
  }
};
const float = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
  resolve(str) {
    const node = new Scalar(parseFloat(str.replace(/_/g, "")));
    const dot = str.indexOf(".");
    if (dot !== -1) {
      const f = str.substring(dot + 1).replace(/_/g, "");
      if (f[f.length - 1] === "0")
        node.minFractionDigits = f.length;
    }
    return node;
  },
  stringify: stringifyNumber
};
const intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
function intResolve(str, offset, radix, { intAsBigInt }) {
  const sign = str[0];
  if (sign === "-" || sign === "+")
    offset += 1;
  str = str.substring(offset).replace(/_/g, "");
  if (intAsBigInt) {
    switch (radix) {
      case 2:
        str = `0b${str}`;
        break;
      case 8:
        str = `0o${str}`;
        break;
      case 16:
        str = `0x${str}`;
        break;
    }
    const n2 = BigInt(str);
    return sign === "-" ? BigInt(-1) * n2 : n2;
  }
  const n = parseInt(str, radix);
  return sign === "-" ? -1 * n : n;
}
function intStringify(node, radix, prefix) {
  const { value } = node;
  if (intIdentify(value)) {
    const str = value.toString(radix);
    return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
  }
  return stringifyNumber(node);
}
const intBin = {
  identify: intIdentify,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "BIN",
  test: /^[-+]?0b[0-1_]+$/,
  resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
  stringify: (node) => intStringify(node, 2, "0b")
};
const intOct = {
  identify: intIdentify,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^[-+]?0[0-7_]+$/,
  resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
  stringify: (node) => intStringify(node, 8, "0")
};
const int = {
  identify: intIdentify,
  default: true,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9][0-9_]*$/,
  resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
  stringify: stringifyNumber
};
const intHex = {
  identify: intIdentify,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^[-+]?0x[0-9a-fA-F_]+$/,
  resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
  stringify: (node) => intStringify(node, 16, "0x")
};
class YAMLSet extends YAMLMap {
  constructor(schema2) {
    super(schema2);
    this.tag = YAMLSet.tag;
  }
  add(key) {
    let pair;
    if (isPair(key))
      pair = key;
    else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
      pair = new Pair(key.key, null);
    else
      pair = new Pair(key, null);
    const prev = findPair(this.items, pair.key);
    if (!prev)
      this.items.push(pair);
  }
  /**
   * If `keepPair` is `true`, returns the Pair matching `key`.
   * Otherwise, returns the value of that Pair's key.
   */
  get(key, keepPair) {
    const pair = findPair(this.items, key);
    return !keepPair && isPair(pair) ? isScalar$1(pair.key) ? pair.key.value : pair.key : pair;
  }
  set(key, value) {
    if (typeof value !== "boolean")
      throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
    const prev = findPair(this.items, key);
    if (prev && !value) {
      this.items.splice(this.items.indexOf(prev), 1);
    } else if (!prev && value) {
      this.items.push(new Pair(key));
    }
  }
  toJSON(_, ctx) {
    return super.toJSON(_, ctx, Set);
  }
  toString(ctx, onComment, onChompKeep) {
    if (!ctx)
      return JSON.stringify(this);
    if (this.hasAllNullValues(true))
      return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
    else
      throw new Error("Set items must all have null values");
  }
  static from(schema2, iterable, ctx) {
    const { replacer } = ctx;
    const set2 = new this(schema2);
    if (iterable && Symbol.iterator in Object(iterable))
      for (let value of iterable) {
        if (typeof replacer === "function")
          value = replacer.call(iterable, value, value);
        set2.items.push(createPair(value, null, ctx));
      }
    return set2;
  }
}
YAMLSet.tag = "tag:yaml.org,2002:set";
const set = {
  collection: "map",
  identify: (value) => value instanceof Set,
  nodeClass: YAMLSet,
  default: false,
  tag: "tag:yaml.org,2002:set",
  createNode: (schema2, iterable, ctx) => YAMLSet.from(schema2, iterable, ctx),
  resolve(map2, onError) {
    if (isMap(map2)) {
      if (map2.hasAllNullValues(true))
        return Object.assign(new YAMLSet(), map2);
      else
        onError("Set items must all have null values");
    } else
      onError("Expected a mapping for this tag");
    return map2;
  }
};
function parseSexagesimal(str, asBigInt) {
  const sign = str[0];
  const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
  const num = (n) => asBigInt ? BigInt(n) : Number(n);
  const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num(60) + num(p), num(0));
  return sign === "-" ? num(-1) * res : res;
}
function stringifySexagesimal(node) {
  let { value } = node;
  let num = (n) => n;
  if (typeof value === "bigint")
    num = (n) => BigInt(n);
  else if (isNaN(value) || !isFinite(value))
    return stringifyNumber(node);
  let sign = "";
  if (value < 0) {
    sign = "-";
    value *= num(-1);
  }
  const _60 = num(60);
  const parts = [value % _60];
  if (value < 60) {
    parts.unshift(0);
  } else {
    value = (value - parts[0]) / _60;
    parts.unshift(value % _60);
    if (value >= 60) {
      value = (value - parts[0]) / _60;
      parts.unshift(value);
    }
  }
  return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
}
const intTime = {
  identify: (value) => typeof value === "bigint" || Number.isInteger(value),
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
  resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
  stringify: stringifySexagesimal
};
const floatTime = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
  resolve: (str) => parseSexagesimal(str, false),
  stringify: stringifySexagesimal
};
const timestamp = {
  identify: (value) => value instanceof Date,
  default: true,
  tag: "tag:yaml.org,2002:timestamp",
  // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
  // may be omitted altogether, resulting in a date format. In such a case, the time part is
  // assumed to be 00:00:00Z (start of day, UTC).
  test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
  resolve(str) {
    const match = str.match(timestamp.test);
    if (!match)
      throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
    const [, year, month, day, hour, minute, second] = match.map(Number);
    const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
    let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
    const tz = match[8];
    if (tz && tz !== "Z") {
      let d = parseSexagesimal(tz, false);
      if (Math.abs(d) < 30)
        d *= 60;
      date -= 6e4 * d;
    }
    return new Date(date);
  },
  stringify: ({ value }) => value.toISOString().replace(/((T00:00)?:00)?\.000Z$/, "")
};
const schema = [
  map,
  seq,
  string,
  nullTag,
  trueTag,
  falseTag,
  intBin,
  intOct,
  int,
  intHex,
  floatNaN,
  floatExp,
  float,
  binary,
  merge,
  omap,
  pairs,
  set,
  intTime,
  floatTime,
  timestamp
];
const schemas = /* @__PURE__ */ new Map([
  ["core", schema$2],
  ["failsafe", [map, seq, string]],
  ["json", schema$1],
  ["yaml11", schema],
  ["yaml-1.1", schema]
]);
const tagsByName = {
  binary,
  bool: boolTag,
  float: float$1,
  floatExp: floatExp$1,
  floatNaN: floatNaN$1,
  floatTime,
  int: int$1,
  intHex: intHex$1,
  intOct: intOct$1,
  intTime,
  map,
  merge,
  null: nullTag,
  omap,
  pairs,
  seq,
  set,
  timestamp
};
const coreKnownTags = {
  "tag:yaml.org,2002:binary": binary,
  "tag:yaml.org,2002:merge": merge,
  "tag:yaml.org,2002:omap": omap,
  "tag:yaml.org,2002:pairs": pairs,
  "tag:yaml.org,2002:set": set,
  "tag:yaml.org,2002:timestamp": timestamp
};
function getTags(customTags, schemaName, addMergeTag) {
  const schemaTags = schemas.get(schemaName);
  if (schemaTags && !customTags) {
    return addMergeTag && !schemaTags.includes(merge) ? schemaTags.concat(merge) : schemaTags.slice();
  }
  let tags = schemaTags;
  if (!tags) {
    if (Array.isArray(customTags))
      tags = [];
    else {
      const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
      throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
    }
  }
  if (Array.isArray(customTags)) {
    for (const tag of customTags)
      tags = tags.concat(tag);
  } else if (typeof customTags === "function") {
    tags = customTags(tags.slice());
  }
  if (addMergeTag)
    tags = tags.concat(merge);
  return tags.reduce((tags2, tag) => {
    const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
    if (!tagObj) {
      const tagName = JSON.stringify(tag);
      const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
      throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
    }
    if (!tags2.includes(tagObj))
      tags2.push(tagObj);
    return tags2;
  }, []);
}
const sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
class Schema {
  constructor({ compat, customTags, merge: merge2, resolveKnownTags, schema: schema2, sortMapEntries, toStringDefaults }) {
    this.compat = Array.isArray(compat) ? getTags(compat, "compat") : compat ? getTags(null, compat) : null;
    this.name = typeof schema2 === "string" && schema2 || "core";
    this.knownTags = resolveKnownTags ? coreKnownTags : {};
    this.tags = getTags(customTags, this.name, merge2);
    this.toStringOptions = toStringDefaults ?? null;
    Object.defineProperty(this, MAP, { value: map });
    Object.defineProperty(this, SCALAR$1, { value: string });
    Object.defineProperty(this, SEQ, { value: seq });
    this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
  }
  clone() {
    const copy2 = Object.create(Schema.prototype, Object.getOwnPropertyDescriptors(this));
    copy2.tags = this.tags.slice();
    return copy2;
  }
}
function stringifyDocument(doc, options) {
  var _a;
  const lines = [];
  let hasDirectives = options.directives === true;
  if (options.directives !== false && doc.directives) {
    const dir = doc.directives.toString(doc);
    if (dir) {
      lines.push(dir);
      hasDirectives = true;
    } else if (doc.directives.docStart)
      hasDirectives = true;
  }
  if (hasDirectives)
    lines.push("---");
  const ctx = createStringifyContext(doc, options);
  const { commentString } = ctx.options;
  if (doc.commentBefore) {
    if (lines.length !== 1)
      lines.unshift("");
    const cs = commentString(doc.commentBefore);
    lines.unshift(indentComment(cs, ""));
  }
  let chompKeep = false;
  let contentComment = null;
  if (doc.contents) {
    if (isNode(doc.contents)) {
      if (doc.contents.spaceBefore && hasDirectives)
        lines.push("");
      if (doc.contents.commentBefore) {
        const cs = commentString(doc.contents.commentBefore);
        lines.push(indentComment(cs, ""));
      }
      ctx.forceBlockIndent = !!doc.comment;
      contentComment = doc.contents.comment;
    }
    const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
    let body = stringify$2(doc.contents, ctx, () => contentComment = null, onChompKeep);
    if (contentComment)
      body += lineComment(body, "", commentString(contentComment));
    if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
      lines[lines.length - 1] = `--- ${body}`;
    } else
      lines.push(body);
  } else {
    lines.push(stringify$2(doc.contents, ctx));
  }
  if ((_a = doc.directives) == null ? void 0 : _a.docEnd) {
    if (doc.comment) {
      const cs = commentString(doc.comment);
      if (cs.includes("\n")) {
        lines.push("...");
        lines.push(indentComment(cs, ""));
      } else {
        lines.push(`... ${cs}`);
      }
    } else {
      lines.push("...");
    }
  } else {
    let dc = doc.comment;
    if (dc && chompKeep)
      dc = dc.replace(/^\n+/, "");
    if (dc) {
      if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
        lines.push("");
      lines.push(indentComment(commentString(dc), ""));
    }
  }
  return lines.join("\n") + "\n";
}
class Document {
  constructor(value, replacer, options) {
    this.commentBefore = null;
    this.comment = null;
    this.errors = [];
    this.warnings = [];
    Object.defineProperty(this, NODE_TYPE, { value: DOC });
    let _replacer = null;
    if (typeof replacer === "function" || Array.isArray(replacer)) {
      _replacer = replacer;
    } else if (options === void 0 && replacer) {
      options = replacer;
      replacer = void 0;
    }
    const opt = Object.assign({
      intAsBigInt: false,
      keepSourceTokens: false,
      logLevel: "warn",
      prettyErrors: true,
      strict: true,
      stringKeys: false,
      uniqueKeys: true,
      version: "1.2"
    }, options);
    this.options = opt;
    let { version } = opt;
    if (options == null ? void 0 : options._directives) {
      this.directives = options._directives.atDocument();
      if (this.directives.yaml.explicit)
        version = this.directives.yaml.version;
    } else
      this.directives = new Directives({ version });
    this.setSchema(version, options);
    this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
  }
  /**
   * Create a deep copy of this Document and its contents.
   *
   * Custom Node values that inherit from `Object` still refer to their original instances.
   */
  clone() {
    const copy2 = Object.create(Document.prototype, {
      [NODE_TYPE]: { value: DOC }
    });
    copy2.commentBefore = this.commentBefore;
    copy2.comment = this.comment;
    copy2.errors = this.errors.slice();
    copy2.warnings = this.warnings.slice();
    copy2.options = Object.assign({}, this.options);
    if (this.directives)
      copy2.directives = this.directives.clone();
    copy2.schema = this.schema.clone();
    copy2.contents = isNode(this.contents) ? this.contents.clone(copy2.schema) : this.contents;
    if (this.range)
      copy2.range = this.range.slice();
    return copy2;
  }
  /** Adds a value to the document. */
  add(value) {
    if (assertCollection(this.contents))
      this.contents.add(value);
  }
  /** Adds a value to the document. */
  addIn(path, value) {
    if (assertCollection(this.contents))
      this.contents.addIn(path, value);
  }
  /**
   * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
   *
   * If `node` already has an anchor, `name` is ignored.
   * Otherwise, the `node.anchor` value will be set to `name`,
   * or if an anchor with that name is already present in the document,
   * `name` will be used as a prefix for a new unique anchor.
   * If `name` is undefined, the generated anchor will use 'a' as a prefix.
   */
  createAlias(node, name) {
    if (!node.anchor) {
      const prev = anchorNames(this);
      node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      !name || prev.has(name) ? findNewAnchor(name || "a", prev) : name;
    }
    return new Alias(node.anchor);
  }
  createNode(value, replacer, options) {
    let _replacer = void 0;
    if (typeof replacer === "function") {
      value = replacer.call({ "": value }, "", value);
      _replacer = replacer;
    } else if (Array.isArray(replacer)) {
      const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
      const asStr = replacer.filter(keyToStr).map(String);
      if (asStr.length > 0)
        replacer = replacer.concat(asStr);
      _replacer = replacer;
    } else if (options === void 0 && replacer) {
      options = replacer;
      replacer = void 0;
    }
    const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
    const { onAnchor, setAnchors, sourceObjects } = createNodeAnchors(
      this,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      anchorPrefix || "a"
    );
    const ctx = {
      aliasDuplicateObjects: aliasDuplicateObjects ?? true,
      keepUndefined: keepUndefined ?? false,
      onAnchor,
      onTagObj,
      replacer: _replacer,
      schema: this.schema,
      sourceObjects
    };
    const node = createNode(value, tag, ctx);
    if (flow && isCollection$1(node))
      node.flow = true;
    setAnchors();
    return node;
  }
  /**
   * Convert a key and a value into a `Pair` using the current schema,
   * recursively wrapping all values as `Scalar` or `Collection` nodes.
   */
  createPair(key, value, options = {}) {
    const k = this.createNode(key, null, options);
    const v = this.createNode(value, null, options);
    return new Pair(k, v);
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  delete(key) {
    return assertCollection(this.contents) ? this.contents.delete(key) : false;
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(path) {
    if (isEmptyPath(path)) {
      if (this.contents == null)
        return false;
      this.contents = null;
      return true;
    }
    return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  get(key, keepScalar) {
    return isCollection$1(this.contents) ? this.contents.get(key, keepScalar) : void 0;
  }
  /**
   * Returns item at `path`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(path, keepScalar) {
    if (isEmptyPath(path))
      return !keepScalar && isScalar$1(this.contents) ? this.contents.value : this.contents;
    return isCollection$1(this.contents) ? this.contents.getIn(path, keepScalar) : void 0;
  }
  /**
   * Checks if the document includes a value with the key `key`.
   */
  has(key) {
    return isCollection$1(this.contents) ? this.contents.has(key) : false;
  }
  /**
   * Checks if the document includes a value at `path`.
   */
  hasIn(path) {
    if (isEmptyPath(path))
      return this.contents !== void 0;
    return isCollection$1(this.contents) ? this.contents.hasIn(path) : false;
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  set(key, value) {
    if (this.contents == null) {
      this.contents = collectionFromPath(this.schema, [key], value);
    } else if (assertCollection(this.contents)) {
      this.contents.set(key, value);
    }
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(path, value) {
    if (isEmptyPath(path)) {
      this.contents = value;
    } else if (this.contents == null) {
      this.contents = collectionFromPath(this.schema, Array.from(path), value);
    } else if (assertCollection(this.contents)) {
      this.contents.setIn(path, value);
    }
  }
  /**
   * Change the YAML version and schema used by the document.
   * A `null` version disables support for directives, explicit tags, anchors, and aliases.
   * It also requires the `schema` option to be given as a `Schema` instance value.
   *
   * Overrides all previously set schema options.
   */
  setSchema(version, options = {}) {
    if (typeof version === "number")
      version = String(version);
    let opt;
    switch (version) {
      case "1.1":
        if (this.directives)
          this.directives.yaml.version = "1.1";
        else
          this.directives = new Directives({ version: "1.1" });
        opt = { resolveKnownTags: false, schema: "yaml-1.1" };
        break;
      case "1.2":
      case "next":
        if (this.directives)
          this.directives.yaml.version = version;
        else
          this.directives = new Directives({ version });
        opt = { resolveKnownTags: true, schema: "core" };
        break;
      case null:
        if (this.directives)
          delete this.directives;
        opt = null;
        break;
      default: {
        const sv = JSON.stringify(version);
        throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
      }
    }
    if (options.schema instanceof Object)
      this.schema = options.schema;
    else if (opt)
      this.schema = new Schema(Object.assign(opt, options));
    else
      throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
  }
  // json & jsonArg are only used from toJSON()
  toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
    const ctx = {
      anchors: /* @__PURE__ */ new Map(),
      doc: this,
      keep: !json,
      mapAsMap: mapAsMap === true,
      mapKeyWarned: false,
      maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
    };
    const res = toJS(this.contents, jsonArg ?? "", ctx);
    if (typeof onAnchor === "function")
      for (const { count, res: res2 } of ctx.anchors.values())
        onAnchor(res2, count);
    return typeof reviver === "function" ? applyReviver(reviver, { "": res }, "", res) : res;
  }
  /**
   * A JSON representation of the document `contents`.
   *
   * @param jsonArg Used by `JSON.stringify` to indicate the array index or
   *   property name.
   */
  toJSON(jsonArg, onAnchor) {
    return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
  }
  /** A YAML representation of the document. */
  toString(options = {}) {
    if (this.errors.length > 0)
      throw new Error("Document with errors cannot be stringified");
    if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
      const s = JSON.stringify(options.indent);
      throw new Error(`"indent" option must be a positive integer, not ${s}`);
    }
    return stringifyDocument(this, options);
  }
}
function assertCollection(contents) {
  if (isCollection$1(contents))
    return true;
  throw new Error("Expected a YAML collection as document contents");
}
class YAMLError extends Error {
  constructor(name, pos, code, message) {
    super();
    this.name = name;
    this.code = code;
    this.message = message;
    this.pos = pos;
  }
}
class YAMLParseError extends YAMLError {
  constructor(pos, code, message) {
    super("YAMLParseError", pos, code, message);
  }
}
class YAMLWarning extends YAMLError {
  constructor(pos, code, message) {
    super("YAMLWarning", pos, code, message);
  }
}
const prettifyError = (src, lc) => (error) => {
  if (error.pos[0] === -1)
    return;
  error.linePos = error.pos.map((pos) => lc.linePos(pos));
  const { line, col } = error.linePos[0];
  error.message += ` at line ${line}, column ${col}`;
  let ci = col - 1;
  let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
  if (ci >= 60 && lineStr.length > 80) {
    const trimStart = Math.min(ci - 39, lineStr.length - 79);
    lineStr = "…" + lineStr.substring(trimStart);
    ci -= trimStart - 1;
  }
  if (lineStr.length > 80)
    lineStr = lineStr.substring(0, 79) + "…";
  if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
    let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
    if (prev.length > 80)
      prev = prev.substring(0, 79) + "…\n";
    lineStr = prev + lineStr;
  }
  if (/[^ ]/.test(lineStr)) {
    let count = 1;
    const end = error.linePos[1];
    if (end && end.line === line && end.col > col) {
      count = Math.max(1, Math.min(end.col - col, 80 - ci));
    }
    const pointer = " ".repeat(ci) + "^".repeat(count);
    error.message += `:

${lineStr}
${pointer}
`;
  }
};
function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
  let spaceBefore = false;
  let atNewline = startOnNewline;
  let hasSpace = startOnNewline;
  let comment = "";
  let commentSep = "";
  let hasNewline = false;
  let reqSpace = false;
  let tab = null;
  let anchor = null;
  let tag = null;
  let newlineAfterProp = null;
  let comma = null;
  let found = null;
  let start = null;
  for (const token of tokens) {
    if (reqSpace) {
      if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
        onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      reqSpace = false;
    }
    if (tab) {
      if (atNewline && token.type !== "comment" && token.type !== "newline") {
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      }
      tab = null;
    }
    switch (token.type) {
      case "space":
        if (!flow && (indicator !== "doc-start" || (next == null ? void 0 : next.type) !== "flow-collection") && token.source.includes("	")) {
          tab = token;
        }
        hasSpace = true;
        break;
      case "comment": {
        if (!hasSpace)
          onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
        const cb = token.source.substring(1) || " ";
        if (!comment)
          comment = cb;
        else
          comment += commentSep + cb;
        commentSep = "";
        atNewline = false;
        break;
      }
      case "newline":
        if (atNewline) {
          if (comment)
            comment += token.source;
          else
            spaceBefore = true;
        } else
          commentSep += token.source;
        atNewline = true;
        hasNewline = true;
        if (anchor || tag)
          newlineAfterProp = token;
        hasSpace = true;
        break;
      case "anchor":
        if (anchor)
          onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
        if (token.source.endsWith(":"))
          onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
        anchor = token;
        if (start === null)
          start = token.offset;
        atNewline = false;
        hasSpace = false;
        reqSpace = true;
        break;
      case "tag": {
        if (tag)
          onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
        tag = token;
        if (start === null)
          start = token.offset;
        atNewline = false;
        hasSpace = false;
        reqSpace = true;
        break;
      }
      case indicator:
        if (anchor || tag)
          onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
        if (found)
          onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
        found = token;
        atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
        hasSpace = false;
        break;
      case "comma":
        if (flow) {
          if (comma)
            onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
          comma = token;
          atNewline = false;
          hasSpace = false;
          break;
        }
      // else fallthrough
      default:
        onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
        atNewline = false;
        hasSpace = false;
    }
  }
  const last = tokens[tokens.length - 1];
  const end = last ? last.offset + last.source.length : offset;
  if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
    onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
  }
  if (tab && (atNewline && tab.indent <= parentIndent || (next == null ? void 0 : next.type) === "block-map" || (next == null ? void 0 : next.type) === "block-seq"))
    onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
  return {
    comma,
    found,
    spaceBefore,
    comment,
    hasNewline,
    anchor,
    tag,
    newlineAfterProp,
    end,
    start: start ?? end
  };
}
function containsNewline(key) {
  if (!key)
    return null;
  switch (key.type) {
    case "alias":
    case "scalar":
    case "double-quoted-scalar":
    case "single-quoted-scalar":
      if (key.source.includes("\n"))
        return true;
      if (key.end) {
        for (const st of key.end)
          if (st.type === "newline")
            return true;
      }
      return false;
    case "flow-collection":
      for (const it of key.items) {
        for (const st of it.start)
          if (st.type === "newline")
            return true;
        if (it.sep) {
          for (const st of it.sep)
            if (st.type === "newline")
              return true;
        }
        if (containsNewline(it.key) || containsNewline(it.value))
          return true;
      }
      return false;
    default:
      return true;
  }
}
function flowIndentCheck(indent, fc, onError) {
  if ((fc == null ? void 0 : fc.type) === "flow-collection") {
    const end = fc.end[0];
    if (end.indent === indent && (end.source === "]" || end.source === "}") && containsNewline(fc)) {
      const msg = "Flow end indicator should be more indented than parent";
      onError(end, "BAD_INDENT", msg, true);
    }
  }
}
function mapIncludes(ctx, items, search) {
  const { uniqueKeys } = ctx.options;
  if (uniqueKeys === false)
    return false;
  const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || isScalar$1(a) && isScalar$1(b) && a.value === b.value;
  return items.some((pair) => isEqual(pair.key, search));
}
const startColMsg = "All mapping items must start at the same column";
function resolveBlockMap({ composeNode: composeNode2, composeEmptyNode: composeEmptyNode2 }, ctx, bm, onError, tag) {
  var _a;
  const NodeClass = (tag == null ? void 0 : tag.nodeClass) ?? YAMLMap;
  const map2 = new NodeClass(ctx.schema);
  if (ctx.atRoot)
    ctx.atRoot = false;
  let offset = bm.offset;
  let commentEnd = null;
  for (const collItem of bm.items) {
    const { start, key, sep, value } = collItem;
    const keyProps = resolveProps(start, {
      indicator: "explicit-key-ind",
      next: key ?? (sep == null ? void 0 : sep[0]),
      offset,
      onError,
      parentIndent: bm.indent,
      startOnNewline: true
    });
    const implicitKey = !keyProps.found;
    if (implicitKey) {
      if (key) {
        if (key.type === "block-seq")
          onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
        else if ("indent" in key && key.indent !== bm.indent)
          onError(offset, "BAD_INDENT", startColMsg);
      }
      if (!keyProps.anchor && !keyProps.tag && !sep) {
        commentEnd = keyProps.end;
        if (keyProps.comment) {
          if (map2.comment)
            map2.comment += "\n" + keyProps.comment;
          else
            map2.comment = keyProps.comment;
        }
        continue;
      }
      if (keyProps.newlineAfterProp || containsNewline(key)) {
        onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
      }
    } else if (((_a = keyProps.found) == null ? void 0 : _a.indent) !== bm.indent) {
      onError(offset, "BAD_INDENT", startColMsg);
    }
    ctx.atKey = true;
    const keyStart = keyProps.end;
    const keyNode = key ? composeNode2(ctx, key, keyProps, onError) : composeEmptyNode2(ctx, keyStart, start, null, keyProps, onError);
    if (ctx.schema.compat)
      flowIndentCheck(bm.indent, key, onError);
    ctx.atKey = false;
    if (mapIncludes(ctx, map2.items, keyNode))
      onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
    const valueProps = resolveProps(sep ?? [], {
      indicator: "map-value-ind",
      next: value,
      offset: keyNode.range[2],
      onError,
      parentIndent: bm.indent,
      startOnNewline: !key || key.type === "block-scalar"
    });
    offset = valueProps.end;
    if (valueProps.found) {
      if (implicitKey) {
        if ((value == null ? void 0 : value.type) === "block-map" && !valueProps.hasNewline)
          onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
        if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
          onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
      }
      const valueNode = value ? composeNode2(ctx, value, valueProps, onError) : composeEmptyNode2(ctx, offset, sep, null, valueProps, onError);
      if (ctx.schema.compat)
        flowIndentCheck(bm.indent, value, onError);
      offset = valueNode.range[2];
      const pair = new Pair(keyNode, valueNode);
      if (ctx.options.keepSourceTokens)
        pair.srcToken = collItem;
      map2.items.push(pair);
    } else {
      if (implicitKey)
        onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
      if (valueProps.comment) {
        if (keyNode.comment)
          keyNode.comment += "\n" + valueProps.comment;
        else
          keyNode.comment = valueProps.comment;
      }
      const pair = new Pair(keyNode);
      if (ctx.options.keepSourceTokens)
        pair.srcToken = collItem;
      map2.items.push(pair);
    }
  }
  if (commentEnd && commentEnd < offset)
    onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
  map2.range = [bm.offset, offset, commentEnd ?? offset];
  return map2;
}
function resolveBlockSeq({ composeNode: composeNode2, composeEmptyNode: composeEmptyNode2 }, ctx, bs, onError, tag) {
  const NodeClass = (tag == null ? void 0 : tag.nodeClass) ?? YAMLSeq;
  const seq2 = new NodeClass(ctx.schema);
  if (ctx.atRoot)
    ctx.atRoot = false;
  if (ctx.atKey)
    ctx.atKey = false;
  let offset = bs.offset;
  let commentEnd = null;
  for (const { start, value } of bs.items) {
    const props = resolveProps(start, {
      indicator: "seq-item-ind",
      next: value,
      offset,
      onError,
      parentIndent: bs.indent,
      startOnNewline: true
    });
    if (!props.found) {
      if (props.anchor || props.tag || value) {
        if (value && value.type === "block-seq")
          onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
        else
          onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
      } else {
        commentEnd = props.end;
        if (props.comment)
          seq2.comment = props.comment;
        continue;
      }
    }
    const node = value ? composeNode2(ctx, value, props, onError) : composeEmptyNode2(ctx, props.end, start, null, props, onError);
    if (ctx.schema.compat)
      flowIndentCheck(bs.indent, value, onError);
    offset = node.range[2];
    seq2.items.push(node);
  }
  seq2.range = [bs.offset, offset, commentEnd ?? offset];
  return seq2;
}
function resolveEnd(end, offset, reqSpace, onError) {
  let comment = "";
  if (end) {
    let hasSpace = false;
    let sep = "";
    for (const token of end) {
      const { source, type } = token;
      switch (type) {
        case "space":
          hasSpace = true;
          break;
        case "comment": {
          if (reqSpace && !hasSpace)
            onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const cb = source.substring(1) || " ";
          if (!comment)
            comment = cb;
          else
            comment += sep + cb;
          sep = "";
          break;
        }
        case "newline":
          if (comment)
            sep += source;
          hasSpace = true;
          break;
        default:
          onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
      }
      offset += source.length;
    }
  }
  return { comment, offset };
}
const blockMsg = "Block collections are not allowed within flow collections";
const isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
function resolveFlowCollection({ composeNode: composeNode2, composeEmptyNode: composeEmptyNode2 }, ctx, fc, onError, tag) {
  const isMap2 = fc.start.source === "{";
  const fcName = isMap2 ? "flow map" : "flow sequence";
  const NodeClass = (tag == null ? void 0 : tag.nodeClass) ?? (isMap2 ? YAMLMap : YAMLSeq);
  const coll = new NodeClass(ctx.schema);
  coll.flow = true;
  const atRoot = ctx.atRoot;
  if (atRoot)
    ctx.atRoot = false;
  if (ctx.atKey)
    ctx.atKey = false;
  let offset = fc.offset + fc.start.source.length;
  for (let i = 0; i < fc.items.length; ++i) {
    const collItem = fc.items[i];
    const { start, key, sep, value } = collItem;
    const props = resolveProps(start, {
      flow: fcName,
      indicator: "explicit-key-ind",
      next: key ?? (sep == null ? void 0 : sep[0]),
      offset,
      onError,
      parentIndent: fc.indent,
      startOnNewline: false
    });
    if (!props.found) {
      if (!props.anchor && !props.tag && !sep && !value) {
        if (i === 0 && props.comma)
          onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        else if (i < fc.items.length - 1)
          onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
        if (props.comment) {
          if (coll.comment)
            coll.comment += "\n" + props.comment;
          else
            coll.comment = props.comment;
        }
        offset = props.end;
        continue;
      }
      if (!isMap2 && ctx.options.strict && containsNewline(key))
        onError(
          key,
          // checked by containsNewline()
          "MULTILINE_IMPLICIT_KEY",
          "Implicit keys of flow sequence pairs need to be on a single line"
        );
    }
    if (i === 0) {
      if (props.comma)
        onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
    } else {
      if (!props.comma)
        onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
      if (props.comment) {
        let prevItemComment = "";
        loop: for (const st of start) {
          switch (st.type) {
            case "comma":
            case "space":
              break;
            case "comment":
              prevItemComment = st.source.substring(1);
              break loop;
            default:
              break loop;
          }
        }
        if (prevItemComment) {
          let prev = coll.items[coll.items.length - 1];
          if (isPair(prev))
            prev = prev.value ?? prev.key;
          if (prev.comment)
            prev.comment += "\n" + prevItemComment;
          else
            prev.comment = prevItemComment;
          props.comment = props.comment.substring(prevItemComment.length + 1);
        }
      }
    }
    if (!isMap2 && !sep && !props.found) {
      const valueNode = value ? composeNode2(ctx, value, props, onError) : composeEmptyNode2(ctx, props.end, sep, null, props, onError);
      coll.items.push(valueNode);
      offset = valueNode.range[2];
      if (isBlock(value))
        onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
    } else {
      ctx.atKey = true;
      const keyStart = props.end;
      const keyNode = key ? composeNode2(ctx, key, props, onError) : composeEmptyNode2(ctx, keyStart, start, null, props, onError);
      if (isBlock(key))
        onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
      ctx.atKey = false;
      const valueProps = resolveProps(sep ?? [], {
        flow: fcName,
        indicator: "map-value-ind",
        next: value,
        offset: keyNode.range[2],
        onError,
        parentIndent: fc.indent,
        startOnNewline: false
      });
      if (valueProps.found) {
        if (!isMap2 && !props.found && ctx.options.strict) {
          if (sep)
            for (const st of sep) {
              if (st === valueProps.found)
                break;
              if (st.type === "newline") {
                onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                break;
              }
            }
          if (props.start < valueProps.found.offset - 1024)
            onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
        }
      } else if (value) {
        if ("source" in value && value.source && value.source[0] === ":")
          onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
        else
          onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
      }
      const valueNode = value ? composeNode2(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode2(ctx, valueProps.end, sep, null, valueProps, onError) : null;
      if (valueNode) {
        if (isBlock(value))
          onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
      } else if (valueProps.comment) {
        if (keyNode.comment)
          keyNode.comment += "\n" + valueProps.comment;
        else
          keyNode.comment = valueProps.comment;
      }
      const pair = new Pair(keyNode, valueNode);
      if (ctx.options.keepSourceTokens)
        pair.srcToken = collItem;
      if (isMap2) {
        const map2 = coll;
        if (mapIncludes(ctx, map2.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        map2.items.push(pair);
      } else {
        const map2 = new YAMLMap(ctx.schema);
        map2.flow = true;
        map2.items.push(pair);
        const endRange = (valueNode ?? keyNode).range;
        map2.range = [keyNode.range[0], endRange[1], endRange[2]];
        coll.items.push(map2);
      }
      offset = valueNode ? valueNode.range[2] : valueProps.end;
    }
  }
  const expectedEnd = isMap2 ? "}" : "]";
  const [ce, ...ee] = fc.end;
  let cePos = offset;
  if (ce && ce.source === expectedEnd)
    cePos = ce.offset + ce.source.length;
  else {
    const name = fcName[0].toUpperCase() + fcName.substring(1);
    const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
    onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
    if (ce && ce.source.length !== 1)
      ee.unshift(ce);
  }
  if (ee.length > 0) {
    const end = resolveEnd(ee, cePos, ctx.options.strict, onError);
    if (end.comment) {
      if (coll.comment)
        coll.comment += "\n" + end.comment;
      else
        coll.comment = end.comment;
    }
    coll.range = [fc.offset, cePos, end.offset];
  } else {
    coll.range = [fc.offset, cePos, cePos];
  }
  return coll;
}
function resolveCollection(CN2, ctx, token, onError, tagName, tag) {
  const coll = token.type === "block-map" ? resolveBlockMap(CN2, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq(CN2, ctx, token, onError, tag) : resolveFlowCollection(CN2, ctx, token, onError, tag);
  const Coll = coll.constructor;
  if (tagName === "!" || tagName === Coll.tagName) {
    coll.tag = Coll.tagName;
    return coll;
  }
  if (tagName)
    coll.tag = tagName;
  return coll;
}
function composeCollection(CN2, ctx, token, props, onError) {
  var _a;
  const tagToken = props.tag;
  const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
  if (token.type === "block-seq") {
    const { anchor, newlineAfterProp: nl } = props;
    const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
    if (lastProp && (!nl || nl.offset < lastProp.offset)) {
      const message = "Missing newline after block sequence props";
      onError(lastProp, "MISSING_CHAR", message);
    }
  }
  const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
  if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.tagName && expType === "seq") {
    return resolveCollection(CN2, ctx, token, onError, tagName);
  }
  let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
  if (!tag) {
    const kt = ctx.schema.knownTags[tagName];
    if (kt && kt.collection === expType) {
      ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
      tag = kt;
    } else {
      if (kt == null ? void 0 : kt.collection) {
        onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection}`, true);
      } else {
        onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
      }
      return resolveCollection(CN2, ctx, token, onError, tagName);
    }
  }
  const coll = resolveCollection(CN2, ctx, token, onError, tagName, tag);
  const res = ((_a = tag.resolve) == null ? void 0 : _a.call(tag, coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options)) ?? coll;
  const node = isNode(res) ? res : new Scalar(res);
  node.range = coll.range;
  node.tag = tagName;
  if (tag == null ? void 0 : tag.format)
    node.format = tag.format;
  return node;
}
function resolveBlockScalar(ctx, scalar, onError) {
  const start = scalar.offset;
  const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
  if (!header)
    return { value: "", type: null, comment: "", range: [start, start, start] };
  const type = header.mode === ">" ? Scalar.BLOCK_FOLDED : Scalar.BLOCK_LITERAL;
  const lines = scalar.source ? splitLines(scalar.source) : [];
  let chompStart = lines.length;
  for (let i = lines.length - 1; i >= 0; --i) {
    const content = lines[i][1];
    if (content === "" || content === "\r")
      chompStart = i;
    else
      break;
  }
  if (chompStart === 0) {
    const value2 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
    let end2 = start + header.length;
    if (scalar.source)
      end2 += scalar.source.length;
    return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
  }
  let trimIndent = scalar.indent + header.indent;
  let offset = scalar.offset + header.length;
  let contentStart = 0;
  for (let i = 0; i < chompStart; ++i) {
    const [indent, content] = lines[i];
    if (content === "" || content === "\r") {
      if (header.indent === 0 && indent.length > trimIndent)
        trimIndent = indent.length;
    } else {
      if (indent.length < trimIndent) {
        const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
        onError(offset + indent.length, "MISSING_CHAR", message);
      }
      if (header.indent === 0)
        trimIndent = indent.length;
      contentStart = i;
      if (trimIndent === 0 && !ctx.atRoot) {
        const message = "Block scalar values in collections must be indented";
        onError(offset, "BAD_INDENT", message);
      }
      break;
    }
    offset += indent.length + content.length + 1;
  }
  for (let i = lines.length - 1; i >= chompStart; --i) {
    if (lines[i][0].length > trimIndent)
      chompStart = i + 1;
  }
  let value = "";
  let sep = "";
  let prevMoreIndented = false;
  for (let i = 0; i < contentStart; ++i)
    value += lines[i][0].slice(trimIndent) + "\n";
  for (let i = contentStart; i < chompStart; ++i) {
    let [indent, content] = lines[i];
    offset += indent.length + content.length + 1;
    const crlf = content[content.length - 1] === "\r";
    if (crlf)
      content = content.slice(0, -1);
    if (content && indent.length < trimIndent) {
      const src = header.indent ? "explicit indentation indicator" : "first line";
      const message = `Block scalar lines must not be less indented than their ${src}`;
      onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
      indent = "";
    }
    if (type === Scalar.BLOCK_LITERAL) {
      value += sep + indent.slice(trimIndent) + content;
      sep = "\n";
    } else if (indent.length > trimIndent || content[0] === "	") {
      if (sep === " ")
        sep = "\n";
      else if (!prevMoreIndented && sep === "\n")
        sep = "\n\n";
      value += sep + indent.slice(trimIndent) + content;
      sep = "\n";
      prevMoreIndented = true;
    } else if (content === "") {
      if (sep === "\n")
        value += "\n";
      else
        sep = "\n";
    } else {
      value += sep + content;
      sep = " ";
      prevMoreIndented = false;
    }
  }
  switch (header.chomp) {
    case "-":
      break;
    case "+":
      for (let i = chompStart; i < lines.length; ++i)
        value += "\n" + lines[i][0].slice(trimIndent);
      if (value[value.length - 1] !== "\n")
        value += "\n";
      break;
    default:
      value += "\n";
  }
  const end = start + header.length + scalar.source.length;
  return { value, type, comment: header.comment, range: [start, end, end] };
}
function parseBlockScalarHeader({ offset, props }, strict, onError) {
  if (props[0].type !== "block-scalar-header") {
    onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
    return null;
  }
  const { source } = props[0];
  const mode = source[0];
  let indent = 0;
  let chomp = "";
  let error = -1;
  for (let i = 1; i < source.length; ++i) {
    const ch = source[i];
    if (!chomp && (ch === "-" || ch === "+"))
      chomp = ch;
    else {
      const n = Number(ch);
      if (!indent && n)
        indent = n;
      else if (error === -1)
        error = offset + i;
    }
  }
  if (error !== -1)
    onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
  let hasSpace = false;
  let comment = "";
  let length = source.length;
  for (let i = 1; i < props.length; ++i) {
    const token = props[i];
    switch (token.type) {
      case "space":
        hasSpace = true;
      // fallthrough
      case "newline":
        length += token.source.length;
        break;
      case "comment":
        if (strict && !hasSpace) {
          const message = "Comments must be separated from other tokens by white space characters";
          onError(token, "MISSING_CHAR", message);
        }
        length += token.source.length;
        comment = token.source.substring(1);
        break;
      case "error":
        onError(token, "UNEXPECTED_TOKEN", token.message);
        length += token.source.length;
        break;
      /* istanbul ignore next should not happen */
      default: {
        const message = `Unexpected token in block scalar header: ${token.type}`;
        onError(token, "UNEXPECTED_TOKEN", message);
        const ts = token.source;
        if (ts && typeof ts === "string")
          length += ts.length;
      }
    }
  }
  return { mode, indent, chomp, comment, length };
}
function splitLines(source) {
  const split = source.split(/\n( *)/);
  const first = split[0];
  const m = first.match(/^( *)/);
  const line0 = (m == null ? void 0 : m[1]) ? [m[1], first.slice(m[1].length)] : ["", first];
  const lines = [line0];
  for (let i = 1; i < split.length; i += 2)
    lines.push([split[i], split[i + 1]]);
  return lines;
}
function resolveFlowScalar(scalar, strict, onError) {
  const { offset, type, source, end } = scalar;
  let _type;
  let value;
  const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
  switch (type) {
    case "scalar":
      _type = Scalar.PLAIN;
      value = plainValue(source, _onError);
      break;
    case "single-quoted-scalar":
      _type = Scalar.QUOTE_SINGLE;
      value = singleQuotedValue(source, _onError);
      break;
    case "double-quoted-scalar":
      _type = Scalar.QUOTE_DOUBLE;
      value = doubleQuotedValue(source, _onError);
      break;
    /* istanbul ignore next should not happen */
    default:
      onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
      return {
        value: "",
        type: null,
        comment: "",
        range: [offset, offset + source.length, offset + source.length]
      };
  }
  const valueEnd = offset + source.length;
  const re = resolveEnd(end, valueEnd, strict, onError);
  return {
    value,
    type: _type,
    comment: re.comment,
    range: [offset, valueEnd, re.offset]
  };
}
function plainValue(source, onError) {
  let badChar = "";
  switch (source[0]) {
    /* istanbul ignore next should not happen */
    case "	":
      badChar = "a tab character";
      break;
    case ",":
      badChar = "flow indicator character ,";
      break;
    case "%":
      badChar = "directive indicator character %";
      break;
    case "|":
    case ">": {
      badChar = `block scalar indicator ${source[0]}`;
      break;
    }
    case "@":
    case "`": {
      badChar = `reserved character ${source[0]}`;
      break;
    }
  }
  if (badChar)
    onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
  return foldLines(source);
}
function singleQuotedValue(source, onError) {
  if (source[source.length - 1] !== "'" || source.length === 1)
    onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
  return foldLines(source.slice(1, -1)).replace(/''/g, "'");
}
function foldLines(source) {
  let first, line;
  try {
    first = new RegExp("(.*?)(?<![ 	])[ 	]*\r?\n", "sy");
    line = new RegExp("[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?\n", "sy");
  } catch {
    first = /(.*?)[ \t]*\r?\n/sy;
    line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
  }
  let match = first.exec(source);
  if (!match)
    return source;
  let res = match[1];
  let sep = " ";
  let pos = first.lastIndex;
  line.lastIndex = pos;
  while (match = line.exec(source)) {
    if (match[1] === "") {
      if (sep === "\n")
        res += sep;
      else
        sep = "\n";
    } else {
      res += sep + match[1];
      sep = " ";
    }
    pos = line.lastIndex;
  }
  const last = /[ \t]*(.*)/sy;
  last.lastIndex = pos;
  match = last.exec(source);
  return res + sep + ((match == null ? void 0 : match[1]) ?? "");
}
function doubleQuotedValue(source, onError) {
  let res = "";
  for (let i = 1; i < source.length - 1; ++i) {
    const ch = source[i];
    if (ch === "\r" && source[i + 1] === "\n")
      continue;
    if (ch === "\n") {
      const { fold, offset } = foldNewline(source, i);
      res += fold;
      i = offset;
    } else if (ch === "\\") {
      let next = source[++i];
      const cc = escapeCodes[next];
      if (cc)
        res += cc;
      else if (next === "\n") {
        next = source[i + 1];
        while (next === " " || next === "	")
          next = source[++i + 1];
      } else if (next === "\r" && source[i + 1] === "\n") {
        next = source[++i + 1];
        while (next === " " || next === "	")
          next = source[++i + 1];
      } else if (next === "x" || next === "u" || next === "U") {
        const length = { x: 2, u: 4, U: 8 }[next];
        res += parseCharCode(source, i + 1, length, onError);
        i += length;
      } else {
        const raw = source.substr(i - 1, 2);
        onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        res += raw;
      }
    } else if (ch === " " || ch === "	") {
      const wsStart = i;
      let next = source[i + 1];
      while (next === " " || next === "	")
        next = source[++i + 1];
      if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n"))
        res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
    } else {
      res += ch;
    }
  }
  if (source[source.length - 1] !== '"' || source.length === 1)
    onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
  return res;
}
function foldNewline(source, offset) {
  let fold = "";
  let ch = source[offset + 1];
  while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
    if (ch === "\r" && source[offset + 2] !== "\n")
      break;
    if (ch === "\n")
      fold += "\n";
    offset += 1;
    ch = source[offset + 1];
  }
  if (!fold)
    fold = " ";
  return { fold, offset };
}
const escapeCodes = {
  "0": "\0",
  // null character
  a: "\x07",
  // bell character
  b: "\b",
  // backspace
  e: "\x1B",
  // escape character
  f: "\f",
  // form feed
  n: "\n",
  // line feed
  r: "\r",
  // carriage return
  t: "	",
  // horizontal tab
  v: "\v",
  // vertical tab
  N: "",
  // Unicode next line
  _: " ",
  // Unicode non-breaking space
  L: "\u2028",
  // Unicode line separator
  P: "\u2029",
  // Unicode paragraph separator
  " ": " ",
  '"': '"',
  "/": "/",
  "\\": "\\",
  "	": "	"
};
function parseCharCode(source, offset, length, onError) {
  const cc = source.substr(offset, length);
  const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
  const code = ok ? parseInt(cc, 16) : NaN;
  if (isNaN(code)) {
    const raw = source.substr(offset - 2, length + 2);
    onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
    return raw;
  }
  return String.fromCodePoint(code);
}
function composeScalar(ctx, token, tagToken, onError) {
  const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar(ctx, token, onError) : resolveFlowScalar(token, ctx.options.strict, onError);
  const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
  let tag;
  if (ctx.options.stringKeys && ctx.atKey) {
    tag = ctx.schema[SCALAR$1];
  } else if (tagName)
    tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
  else if (token.type === "scalar")
    tag = findScalarTagByTest(ctx, value, token, onError);
  else
    tag = ctx.schema[SCALAR$1];
  let scalar;
  try {
    const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
    scalar = isScalar$1(res) ? res : new Scalar(res);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
    scalar = new Scalar(value);
  }
  scalar.range = range;
  scalar.source = value;
  if (type)
    scalar.type = type;
  if (tagName)
    scalar.tag = tagName;
  if (tag.format)
    scalar.format = tag.format;
  if (comment)
    scalar.comment = comment;
  return scalar;
}
function findScalarTagByName(schema2, value, tagName, tagToken, onError) {
  var _a;
  if (tagName === "!")
    return schema2[SCALAR$1];
  const matchWithTest = [];
  for (const tag of schema2.tags) {
    if (!tag.collection && tag.tag === tagName) {
      if (tag.default && tag.test)
        matchWithTest.push(tag);
      else
        return tag;
    }
  }
  for (const tag of matchWithTest)
    if ((_a = tag.test) == null ? void 0 : _a.test(value))
      return tag;
  const kt = schema2.knownTags[tagName];
  if (kt && !kt.collection) {
    schema2.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
    return kt;
  }
  onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
  return schema2[SCALAR$1];
}
function findScalarTagByTest({ atKey, directives, schema: schema2 }, value, token, onError) {
  const tag = schema2.tags.find((tag2) => {
    var _a;
    return (tag2.default === true || atKey && tag2.default === "key") && ((_a = tag2.test) == null ? void 0 : _a.test(value));
  }) || schema2[SCALAR$1];
  if (schema2.compat) {
    const compat = schema2.compat.find((tag2) => {
      var _a;
      return tag2.default && ((_a = tag2.test) == null ? void 0 : _a.test(value));
    }) ?? schema2[SCALAR$1];
    if (tag.tag !== compat.tag) {
      const ts = directives.tagString(tag.tag);
      const cs = directives.tagString(compat.tag);
      const msg = `Value may be parsed as either ${ts} or ${cs}`;
      onError(token, "TAG_RESOLVE_FAILED", msg, true);
    }
  }
  return tag;
}
function emptyScalarPosition(offset, before, pos) {
  if (before) {
    if (pos === null)
      pos = before.length;
    for (let i = pos - 1; i >= 0; --i) {
      let st = before[i];
      switch (st.type) {
        case "space":
        case "comment":
        case "newline":
          offset -= st.source.length;
          continue;
      }
      st = before[++i];
      while ((st == null ? void 0 : st.type) === "space") {
        offset += st.source.length;
        st = before[++i];
      }
      break;
    }
  }
  return offset;
}
const CN = { composeNode, composeEmptyNode };
function composeNode(ctx, token, props, onError) {
  const atKey = ctx.atKey;
  const { spaceBefore, comment, anchor, tag } = props;
  let node;
  let isSrcToken = true;
  switch (token.type) {
    case "alias":
      node = composeAlias(ctx, token, onError);
      if (anchor || tag)
        onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
      break;
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "block-scalar":
      node = composeScalar(ctx, token, tag, onError);
      if (anchor)
        node.anchor = anchor.source.substring(1);
      break;
    case "block-map":
    case "block-seq":
    case "flow-collection":
      node = composeCollection(CN, ctx, token, props, onError);
      if (anchor)
        node.anchor = anchor.source.substring(1);
      break;
    default: {
      const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
      onError(token, "UNEXPECTED_TOKEN", message);
      node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError);
      isSrcToken = false;
    }
  }
  if (anchor && node.anchor === "")
    onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
  if (atKey && ctx.options.stringKeys && (!isScalar$1(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
    const msg = "With stringKeys, all keys must be strings";
    onError(tag ?? token, "NON_STRING_KEY", msg);
  }
  if (spaceBefore)
    node.spaceBefore = true;
  if (comment) {
    if (token.type === "scalar" && token.source === "")
      node.comment = comment;
    else
      node.commentBefore = comment;
  }
  if (ctx.options.keepSourceTokens && isSrcToken)
    node.srcToken = token;
  return node;
}
function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
  const token = {
    type: "scalar",
    offset: emptyScalarPosition(offset, before, pos),
    indent: -1,
    source: ""
  };
  const node = composeScalar(ctx, token, tag, onError);
  if (anchor) {
    node.anchor = anchor.source.substring(1);
    if (node.anchor === "")
      onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
  }
  if (spaceBefore)
    node.spaceBefore = true;
  if (comment) {
    node.comment = comment;
    node.range[2] = end;
  }
  return node;
}
function composeAlias({ options }, { offset, source, end }, onError) {
  const alias = new Alias(source.substring(1));
  if (alias.source === "")
    onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
  if (alias.source.endsWith(":"))
    onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
  const valueEnd = offset + source.length;
  const re = resolveEnd(end, valueEnd, options.strict, onError);
  alias.range = [offset, valueEnd, re.offset];
  if (re.comment)
    alias.comment = re.comment;
  return alias;
}
function composeDoc(options, directives, { offset, start, value, end }, onError) {
  const opts = Object.assign({ _directives: directives }, options);
  const doc = new Document(void 0, opts);
  const ctx = {
    atKey: false,
    atRoot: true,
    directives: doc.directives,
    options: doc.options,
    schema: doc.schema
  };
  const props = resolveProps(start, {
    indicator: "doc-start",
    next: value ?? (end == null ? void 0 : end[0]),
    offset,
    onError,
    parentIndent: 0,
    startOnNewline: true
  });
  if (props.found) {
    doc.directives.docStart = true;
    if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
      onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
  }
  doc.contents = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
  const contentEnd = doc.contents.range[2];
  const re = resolveEnd(end, contentEnd, false, onError);
  if (re.comment)
    doc.comment = re.comment;
  doc.range = [offset, contentEnd, re.offset];
  return doc;
}
function getErrorPos(src) {
  if (typeof src === "number")
    return [src, src + 1];
  if (Array.isArray(src))
    return src.length === 2 ? src : [src[0], src[1]];
  const { offset, source } = src;
  return [offset, offset + (typeof source === "string" ? source.length : 1)];
}
function parsePrelude(prelude) {
  var _a;
  let comment = "";
  let atComment = false;
  let afterEmptyLine = false;
  for (let i = 0; i < prelude.length; ++i) {
    const source = prelude[i];
    switch (source[0]) {
      case "#":
        comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
        atComment = true;
        afterEmptyLine = false;
        break;
      case "%":
        if (((_a = prelude[i + 1]) == null ? void 0 : _a[0]) !== "#")
          i += 1;
        atComment = false;
        break;
      default:
        if (!atComment)
          afterEmptyLine = true;
        atComment = false;
    }
  }
  return { comment, afterEmptyLine };
}
class Composer {
  constructor(options = {}) {
    this.doc = null;
    this.atDirectives = false;
    this.prelude = [];
    this.errors = [];
    this.warnings = [];
    this.onError = (source, code, message, warning) => {
      const pos = getErrorPos(source);
      if (warning)
        this.warnings.push(new YAMLWarning(pos, code, message));
      else
        this.errors.push(new YAMLParseError(pos, code, message));
    };
    this.directives = new Directives({ version: options.version || "1.2" });
    this.options = options;
  }
  decorate(doc, afterDoc) {
    const { comment, afterEmptyLine } = parsePrelude(this.prelude);
    if (comment) {
      const dc = doc.contents;
      if (afterDoc) {
        doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
      } else if (afterEmptyLine || doc.directives.docStart || !dc) {
        doc.commentBefore = comment;
      } else if (isCollection$1(dc) && !dc.flow && dc.items.length > 0) {
        let it = dc.items[0];
        if (isPair(it))
          it = it.key;
        const cb = it.commentBefore;
        it.commentBefore = cb ? `${comment}
${cb}` : comment;
      } else {
        const cb = dc.commentBefore;
        dc.commentBefore = cb ? `${comment}
${cb}` : comment;
      }
    }
    if (afterDoc) {
      Array.prototype.push.apply(doc.errors, this.errors);
      Array.prototype.push.apply(doc.warnings, this.warnings);
    } else {
      doc.errors = this.errors;
      doc.warnings = this.warnings;
    }
    this.prelude = [];
    this.errors = [];
    this.warnings = [];
  }
  /**
   * Current stream status information.
   *
   * Mostly useful at the end of input for an empty stream.
   */
  streamInfo() {
    return {
      comment: parsePrelude(this.prelude).comment,
      directives: this.directives,
      errors: this.errors,
      warnings: this.warnings
    };
  }
  /**
   * Compose tokens into documents.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *compose(tokens, forceDoc = false, endOffset = -1) {
    for (const token of tokens)
      yield* this.next(token);
    yield* this.end(forceDoc, endOffset);
  }
  /** Advance the composer by one CST token. */
  *next(token) {
    switch (token.type) {
      case "directive":
        this.directives.add(token.source, (offset, message, warning) => {
          const pos = getErrorPos(token);
          pos[0] += offset;
          this.onError(pos, "BAD_DIRECTIVE", message, warning);
        });
        this.prelude.push(token.source);
        this.atDirectives = true;
        break;
      case "document": {
        const doc = composeDoc(this.options, this.directives, token, this.onError);
        if (this.atDirectives && !doc.directives.docStart)
          this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
        this.decorate(doc, false);
        if (this.doc)
          yield this.doc;
        this.doc = doc;
        this.atDirectives = false;
        break;
      }
      case "byte-order-mark":
      case "space":
        break;
      case "comment":
      case "newline":
        this.prelude.push(token.source);
        break;
      case "error": {
        const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
        const error = new YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
        if (this.atDirectives || !this.doc)
          this.errors.push(error);
        else
          this.doc.errors.push(error);
        break;
      }
      case "doc-end": {
        if (!this.doc) {
          const msg = "Unexpected doc-end without preceding document";
          this.errors.push(new YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
          break;
        }
        this.doc.directives.docEnd = true;
        const end = resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
        this.decorate(this.doc, true);
        if (end.comment) {
          const dc = this.doc.comment;
          this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
        }
        this.doc.range[2] = end.offset;
        break;
      }
      default:
        this.errors.push(new YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
    }
  }
  /**
   * Call at end of input to yield any remaining document.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *end(forceDoc = false, endOffset = -1) {
    if (this.doc) {
      this.decorate(this.doc, true);
      yield this.doc;
      this.doc = null;
    } else if (forceDoc) {
      const opts = Object.assign({ _directives: this.directives }, this.options);
      const doc = new Document(void 0, opts);
      if (this.atDirectives)
        this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
      doc.range = [0, endOffset, endOffset];
      this.decorate(doc, false);
      yield doc;
    }
  }
}
function resolveAsScalar(token, strict = true, onError) {
  if (token) {
    const _onError = (pos, code, message) => {
      const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
      if (onError)
        onError(offset, code, message);
      else
        throw new YAMLParseError([offset, offset + 1], code, message);
    };
    switch (token.type) {
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return resolveFlowScalar(token, strict, _onError);
      case "block-scalar":
        return resolveBlockScalar({ options: { strict } }, token, _onError);
    }
  }
  return null;
}
function createScalarToken(value, context) {
  const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
  const source = stringifyString({ type, value }, {
    implicitKey,
    indent: indent > 0 ? " ".repeat(indent) : "",
    inFlow,
    options: { blockQuote: true, lineWidth: -1 }
  });
  const end = context.end ?? [
    { type: "newline", offset: -1, indent, source: "\n" }
  ];
  switch (source[0]) {
    case "|":
    case ">": {
      const he = source.indexOf("\n");
      const head = source.substring(0, he);
      const body = source.substring(he + 1) + "\n";
      const props = [
        { type: "block-scalar-header", offset, indent, source: head }
      ];
      if (!addEndtoBlockProps(props, end))
        props.push({ type: "newline", offset: -1, indent, source: "\n" });
      return { type: "block-scalar", offset, indent, props, source: body };
    }
    case '"':
      return { type: "double-quoted-scalar", offset, indent, source, end };
    case "'":
      return { type: "single-quoted-scalar", offset, indent, source, end };
    default:
      return { type: "scalar", offset, indent, source, end };
  }
}
function setScalarValue(token, value, context = {}) {
  let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
  let indent = "indent" in token ? token.indent : null;
  if (afterKey && typeof indent === "number")
    indent += 2;
  if (!type)
    switch (token.type) {
      case "single-quoted-scalar":
        type = "QUOTE_SINGLE";
        break;
      case "double-quoted-scalar":
        type = "QUOTE_DOUBLE";
        break;
      case "block-scalar": {
        const header = token.props[0];
        if (header.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
        break;
      }
      default:
        type = "PLAIN";
    }
  const source = stringifyString({ type, value }, {
    implicitKey: implicitKey || indent === null,
    indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
    inFlow,
    options: { blockQuote: true, lineWidth: -1 }
  });
  switch (source[0]) {
    case "|":
    case ">":
      setBlockScalarValue(token, source);
      break;
    case '"':
      setFlowScalarValue(token, source, "double-quoted-scalar");
      break;
    case "'":
      setFlowScalarValue(token, source, "single-quoted-scalar");
      break;
    default:
      setFlowScalarValue(token, source, "scalar");
  }
}
function setBlockScalarValue(token, source) {
  const he = source.indexOf("\n");
  const head = source.substring(0, he);
  const body = source.substring(he + 1) + "\n";
  if (token.type === "block-scalar") {
    const header = token.props[0];
    if (header.type !== "block-scalar-header")
      throw new Error("Invalid block scalar header");
    header.source = head;
    token.source = body;
  } else {
    const { offset } = token;
    const indent = "indent" in token ? token.indent : -1;
    const props = [
      { type: "block-scalar-header", offset, indent, source: head }
    ];
    if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
      props.push({ type: "newline", offset: -1, indent, source: "\n" });
    for (const key of Object.keys(token))
      if (key !== "type" && key !== "offset")
        delete token[key];
    Object.assign(token, { type: "block-scalar", indent, props, source: body });
  }
}
function addEndtoBlockProps(props, end) {
  if (end)
    for (const st of end)
      switch (st.type) {
        case "space":
        case "comment":
          props.push(st);
          break;
        case "newline":
          props.push(st);
          return true;
      }
  return false;
}
function setFlowScalarValue(token, source, type) {
  switch (token.type) {
    case "scalar":
    case "double-quoted-scalar":
    case "single-quoted-scalar":
      token.type = type;
      token.source = source;
      break;
    case "block-scalar": {
      const end = token.props.slice(1);
      let oa = source.length;
      if (token.props[0].type === "block-scalar-header")
        oa -= token.props[0].source.length;
      for (const tok of end)
        tok.offset += oa;
      delete token.props;
      Object.assign(token, { type, source, end });
      break;
    }
    case "block-map":
    case "block-seq": {
      const offset = token.offset + source.length;
      const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
      delete token.items;
      Object.assign(token, { type, source, end: [nl] });
      break;
    }
    default: {
      const indent = "indent" in token ? token.indent : -1;
      const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
      for (const key of Object.keys(token))
        if (key !== "type" && key !== "offset")
          delete token[key];
      Object.assign(token, { type, indent, source, end });
    }
  }
}
const stringify$1 = (cst2) => "type" in cst2 ? stringifyToken(cst2) : stringifyItem(cst2);
function stringifyToken(token) {
  switch (token.type) {
    case "block-scalar": {
      let res = "";
      for (const tok of token.props)
        res += stringifyToken(tok);
      return res + token.source;
    }
    case "block-map":
    case "block-seq": {
      let res = "";
      for (const item of token.items)
        res += stringifyItem(item);
      return res;
    }
    case "flow-collection": {
      let res = token.start.source;
      for (const item of token.items)
        res += stringifyItem(item);
      for (const st of token.end)
        res += st.source;
      return res;
    }
    case "document": {
      let res = stringifyItem(token);
      if (token.end)
        for (const st of token.end)
          res += st.source;
      return res;
    }
    default: {
      let res = token.source;
      if ("end" in token && token.end)
        for (const st of token.end)
          res += st.source;
      return res;
    }
  }
}
function stringifyItem({ start, key, sep, value }) {
  let res = "";
  for (const st of start)
    res += st.source;
  if (key)
    res += stringifyToken(key);
  if (sep)
    for (const st of sep)
      res += st.source;
  if (value)
    res += stringifyToken(value);
  return res;
}
const BREAK = Symbol("break visit");
const SKIP = Symbol("skip children");
const REMOVE = Symbol("remove item");
function visit(cst2, visitor) {
  if ("type" in cst2 && cst2.type === "document")
    cst2 = { start: cst2.start, value: cst2.value };
  _visit(Object.freeze([]), cst2, visitor);
}
visit.BREAK = BREAK;
visit.SKIP = SKIP;
visit.REMOVE = REMOVE;
visit.itemAtPath = (cst2, path) => {
  let item = cst2;
  for (const [field, index] of path) {
    const tok = item == null ? void 0 : item[field];
    if (tok && "items" in tok) {
      item = tok.items[index];
    } else
      return void 0;
  }
  return item;
};
visit.parentCollection = (cst2, path) => {
  const parent = visit.itemAtPath(cst2, path.slice(0, -1));
  const field = path[path.length - 1][0];
  const coll = parent == null ? void 0 : parent[field];
  if (coll && "items" in coll)
    return coll;
  throw new Error("Parent collection not found");
};
function _visit(path, item, visitor) {
  let ctrl = visitor(item, path);
  if (typeof ctrl === "symbol")
    return ctrl;
  for (const field of ["key", "value"]) {
    const token = item[field];
    if (token && "items" in token) {
      for (let i = 0; i < token.items.length; ++i) {
        const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
        if (typeof ci === "number")
          i = ci - 1;
        else if (ci === BREAK)
          return BREAK;
        else if (ci === REMOVE) {
          token.items.splice(i, 1);
          i -= 1;
        }
      }
      if (typeof ctrl === "function" && field === "key")
        ctrl = ctrl(item, path);
    }
  }
  return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
}
const BOM = "\uFEFF";
const DOCUMENT = "";
const FLOW_END = "";
const SCALAR = "";
const isCollection = (token) => !!token && "items" in token;
const isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
function prettyToken(token) {
  switch (token) {
    case BOM:
      return "<BOM>";
    case DOCUMENT:
      return "<DOC>";
    case FLOW_END:
      return "<FLOW_END>";
    case SCALAR:
      return "<SCALAR>";
    default:
      return JSON.stringify(token);
  }
}
function tokenType(source) {
  switch (source) {
    case BOM:
      return "byte-order-mark";
    case DOCUMENT:
      return "doc-mode";
    case FLOW_END:
      return "flow-error-end";
    case SCALAR:
      return "scalar";
    case "---":
      return "doc-start";
    case "...":
      return "doc-end";
    case "":
    case "\n":
    case "\r\n":
      return "newline";
    case "-":
      return "seq-item-ind";
    case "?":
      return "explicit-key-ind";
    case ":":
      return "map-value-ind";
    case "{":
      return "flow-map-start";
    case "}":
      return "flow-map-end";
    case "[":
      return "flow-seq-start";
    case "]":
      return "flow-seq-end";
    case ",":
      return "comma";
  }
  switch (source[0]) {
    case " ":
    case "	":
      return "space";
    case "#":
      return "comment";
    case "%":
      return "directive-line";
    case "*":
      return "alias";
    case "&":
      return "anchor";
    case "!":
      return "tag";
    case "'":
      return "single-quoted-scalar";
    case '"':
      return "double-quoted-scalar";
    case "|":
    case ">":
      return "block-scalar-header";
  }
  return null;
}
const cst = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BOM,
  DOCUMENT,
  FLOW_END,
  SCALAR,
  createScalarToken,
  isCollection,
  isScalar,
  prettyToken,
  resolveAsScalar,
  setScalarValue,
  stringify: stringify$1,
  tokenType,
  visit
}, Symbol.toStringTag, { value: "Module" }));
function isEmpty(ch) {
  switch (ch) {
    case void 0:
    case " ":
    case "\n":
    case "\r":
    case "	":
      return true;
    default:
      return false;
  }
}
const hexDigits = new Set("0123456789ABCDEFabcdef");
const tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
const flowIndicatorChars = new Set(",[]{}");
const invalidAnchorChars = new Set(" ,[]{}\n\r	");
const isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
class Lexer {
  constructor() {
    this.atEnd = false;
    this.blockScalarIndent = -1;
    this.blockScalarKeep = false;
    this.buffer = "";
    this.flowKey = false;
    this.flowLevel = 0;
    this.indentNext = 0;
    this.indentValue = 0;
    this.lineEndPos = null;
    this.next = null;
    this.pos = 0;
  }
  /**
   * Generate YAML tokens from the `source` string. If `incomplete`,
   * a part of the last line may be left as a buffer for the next call.
   *
   * @returns A generator of lexical tokens
   */
  *lex(source, incomplete = false) {
    if (source) {
      if (typeof source !== "string")
        throw TypeError("source is not a string");
      this.buffer = this.buffer ? this.buffer + source : source;
      this.lineEndPos = null;
    }
    this.atEnd = !incomplete;
    let next = this.next ?? "stream";
    while (next && (incomplete || this.hasChars(1)))
      next = yield* this.parseNext(next);
  }
  atLineEnd() {
    let i = this.pos;
    let ch = this.buffer[i];
    while (ch === " " || ch === "	")
      ch = this.buffer[++i];
    if (!ch || ch === "#" || ch === "\n")
      return true;
    if (ch === "\r")
      return this.buffer[i + 1] === "\n";
    return false;
  }
  charAt(n) {
    return this.buffer[this.pos + n];
  }
  continueScalar(offset) {
    let ch = this.buffer[offset];
    if (this.indentNext > 0) {
      let indent = 0;
      while (ch === " ")
        ch = this.buffer[++indent + offset];
      if (ch === "\r") {
        const next = this.buffer[indent + offset + 1];
        if (next === "\n" || !next && !this.atEnd)
          return offset + indent + 1;
      }
      return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
    }
    if (ch === "-" || ch === ".") {
      const dt = this.buffer.substr(offset, 3);
      if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
        return -1;
    }
    return offset;
  }
  getLine() {
    let end = this.lineEndPos;
    if (typeof end !== "number" || end !== -1 && end < this.pos) {
      end = this.buffer.indexOf("\n", this.pos);
      this.lineEndPos = end;
    }
    if (end === -1)
      return this.atEnd ? this.buffer.substring(this.pos) : null;
    if (this.buffer[end - 1] === "\r")
      end -= 1;
    return this.buffer.substring(this.pos, end);
  }
  hasChars(n) {
    return this.pos + n <= this.buffer.length;
  }
  setNext(state) {
    this.buffer = this.buffer.substring(this.pos);
    this.pos = 0;
    this.lineEndPos = null;
    this.next = state;
    return null;
  }
  peek(n) {
    return this.buffer.substr(this.pos, n);
  }
  *parseNext(next) {
    switch (next) {
      case "stream":
        return yield* this.parseStream();
      case "line-start":
        return yield* this.parseLineStart();
      case "block-start":
        return yield* this.parseBlockStart();
      case "doc":
        return yield* this.parseDocument();
      case "flow":
        return yield* this.parseFlowCollection();
      case "quoted-scalar":
        return yield* this.parseQuotedScalar();
      case "block-scalar":
        return yield* this.parseBlockScalar();
      case "plain-scalar":
        return yield* this.parsePlainScalar();
    }
  }
  *parseStream() {
    let line = this.getLine();
    if (line === null)
      return this.setNext("stream");
    if (line[0] === BOM) {
      yield* this.pushCount(1);
      line = line.substring(1);
    }
    if (line[0] === "%") {
      let dirEnd = line.length;
      let cs = line.indexOf("#");
      while (cs !== -1) {
        const ch = line[cs - 1];
        if (ch === " " || ch === "	") {
          dirEnd = cs - 1;
          break;
        } else {
          cs = line.indexOf("#", cs + 1);
        }
      }
      while (true) {
        const ch = line[dirEnd - 1];
        if (ch === " " || ch === "	")
          dirEnd -= 1;
        else
          break;
      }
      const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
      yield* this.pushCount(line.length - n);
      this.pushNewline();
      return "stream";
    }
    if (this.atLineEnd()) {
      const sp = yield* this.pushSpaces(true);
      yield* this.pushCount(line.length - sp);
      yield* this.pushNewline();
      return "stream";
    }
    yield DOCUMENT;
    return yield* this.parseLineStart();
  }
  *parseLineStart() {
    const ch = this.charAt(0);
    if (!ch && !this.atEnd)
      return this.setNext("line-start");
    if (ch === "-" || ch === ".") {
      if (!this.atEnd && !this.hasChars(4))
        return this.setNext("line-start");
      const s = this.peek(3);
      if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
        yield* this.pushCount(3);
        this.indentValue = 0;
        this.indentNext = 0;
        return s === "---" ? "doc" : "stream";
      }
    }
    this.indentValue = yield* this.pushSpaces(false);
    if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
      this.indentNext = this.indentValue;
    return yield* this.parseBlockStart();
  }
  *parseBlockStart() {
    const [ch0, ch1] = this.peek(2);
    if (!ch1 && !this.atEnd)
      return this.setNext("block-start");
    if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
      const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
      this.indentNext = this.indentValue + 1;
      this.indentValue += n;
      return yield* this.parseBlockStart();
    }
    return "doc";
  }
  *parseDocument() {
    yield* this.pushSpaces(true);
    const line = this.getLine();
    if (line === null)
      return this.setNext("doc");
    let n = yield* this.pushIndicators();
    switch (line[n]) {
      case "#":
        yield* this.pushCount(line.length - n);
      // fallthrough
      case void 0:
        yield* this.pushNewline();
        return yield* this.parseLineStart();
      case "{":
      case "[":
        yield* this.pushCount(1);
        this.flowKey = false;
        this.flowLevel = 1;
        return "flow";
      case "}":
      case "]":
        yield* this.pushCount(1);
        return "doc";
      case "*":
        yield* this.pushUntil(isNotAnchorChar);
        return "doc";
      case '"':
      case "'":
        return yield* this.parseQuotedScalar();
      case "|":
      case ">":
        n += yield* this.parseBlockScalarHeader();
        n += yield* this.pushSpaces(true);
        yield* this.pushCount(line.length - n);
        yield* this.pushNewline();
        return yield* this.parseBlockScalar();
      default:
        return yield* this.parsePlainScalar();
    }
  }
  *parseFlowCollection() {
    let nl, sp;
    let indent = -1;
    do {
      nl = yield* this.pushNewline();
      if (nl > 0) {
        sp = yield* this.pushSpaces(false);
        this.indentValue = indent = sp;
      } else {
        sp = 0;
      }
      sp += yield* this.pushSpaces(true);
    } while (nl + sp > 0);
    const line = this.getLine();
    if (line === null)
      return this.setNext("flow");
    if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
      const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
      if (!atFlowEndMarker) {
        this.flowLevel = 0;
        yield FLOW_END;
        return yield* this.parseLineStart();
      }
    }
    let n = 0;
    while (line[n] === ",") {
      n += yield* this.pushCount(1);
      n += yield* this.pushSpaces(true);
      this.flowKey = false;
    }
    n += yield* this.pushIndicators();
    switch (line[n]) {
      case void 0:
        return "flow";
      case "#":
        yield* this.pushCount(line.length - n);
        return "flow";
      case "{":
      case "[":
        yield* this.pushCount(1);
        this.flowKey = false;
        this.flowLevel += 1;
        return "flow";
      case "}":
      case "]":
        yield* this.pushCount(1);
        this.flowKey = true;
        this.flowLevel -= 1;
        return this.flowLevel ? "flow" : "doc";
      case "*":
        yield* this.pushUntil(isNotAnchorChar);
        return "flow";
      case '"':
      case "'":
        this.flowKey = true;
        return yield* this.parseQuotedScalar();
      case ":": {
        const next = this.charAt(1);
        if (this.flowKey || isEmpty(next) || next === ",") {
          this.flowKey = false;
          yield* this.pushCount(1);
          yield* this.pushSpaces(true);
          return "flow";
        }
      }
      // fallthrough
      default:
        this.flowKey = false;
        return yield* this.parsePlainScalar();
    }
  }
  *parseQuotedScalar() {
    const quote = this.charAt(0);
    let end = this.buffer.indexOf(quote, this.pos + 1);
    if (quote === "'") {
      while (end !== -1 && this.buffer[end + 1] === "'")
        end = this.buffer.indexOf("'", end + 2);
    } else {
      while (end !== -1) {
        let n = 0;
        while (this.buffer[end - 1 - n] === "\\")
          n += 1;
        if (n % 2 === 0)
          break;
        end = this.buffer.indexOf('"', end + 1);
      }
    }
    const qb = this.buffer.substring(0, end);
    let nl = qb.indexOf("\n", this.pos);
    if (nl !== -1) {
      while (nl !== -1) {
        const cs = this.continueScalar(nl + 1);
        if (cs === -1)
          break;
        nl = qb.indexOf("\n", cs);
      }
      if (nl !== -1) {
        end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
      }
    }
    if (end === -1) {
      if (!this.atEnd)
        return this.setNext("quoted-scalar");
      end = this.buffer.length;
    }
    yield* this.pushToIndex(end + 1, false);
    return this.flowLevel ? "flow" : "doc";
  }
  *parseBlockScalarHeader() {
    this.blockScalarIndent = -1;
    this.blockScalarKeep = false;
    let i = this.pos;
    while (true) {
      const ch = this.buffer[++i];
      if (ch === "+")
        this.blockScalarKeep = true;
      else if (ch > "0" && ch <= "9")
        this.blockScalarIndent = Number(ch) - 1;
      else if (ch !== "-")
        break;
    }
    return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
  }
  *parseBlockScalar() {
    let nl = this.pos - 1;
    let indent = 0;
    let ch;
    loop: for (let i2 = this.pos; ch = this.buffer[i2]; ++i2) {
      switch (ch) {
        case " ":
          indent += 1;
          break;
        case "\n":
          nl = i2;
          indent = 0;
          break;
        case "\r": {
          const next = this.buffer[i2 + 1];
          if (!next && !this.atEnd)
            return this.setNext("block-scalar");
          if (next === "\n")
            break;
        }
        // fallthrough
        default:
          break loop;
      }
    }
    if (!ch && !this.atEnd)
      return this.setNext("block-scalar");
    if (indent >= this.indentNext) {
      if (this.blockScalarIndent === -1)
        this.indentNext = indent;
      else {
        this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
      }
      do {
        const cs = this.continueScalar(nl + 1);
        if (cs === -1)
          break;
        nl = this.buffer.indexOf("\n", cs);
      } while (nl !== -1);
      if (nl === -1) {
        if (!this.atEnd)
          return this.setNext("block-scalar");
        nl = this.buffer.length;
      }
    }
    let i = nl + 1;
    ch = this.buffer[i];
    while (ch === " ")
      ch = this.buffer[++i];
    if (ch === "	") {
      while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
        ch = this.buffer[++i];
      nl = i - 1;
    } else if (!this.blockScalarKeep) {
      do {
        let i2 = nl - 1;
        let ch2 = this.buffer[i2];
        if (ch2 === "\r")
          ch2 = this.buffer[--i2];
        const lastChar = i2;
        while (ch2 === " ")
          ch2 = this.buffer[--i2];
        if (ch2 === "\n" && i2 >= this.pos && i2 + 1 + indent > lastChar)
          nl = i2;
        else
          break;
      } while (true);
    }
    yield SCALAR;
    yield* this.pushToIndex(nl + 1, true);
    return yield* this.parseLineStart();
  }
  *parsePlainScalar() {
    const inFlow = this.flowLevel > 0;
    let end = this.pos - 1;
    let i = this.pos - 1;
    let ch;
    while (ch = this.buffer[++i]) {
      if (ch === ":") {
        const next = this.buffer[i + 1];
        if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
          break;
        end = i;
      } else if (isEmpty(ch)) {
        let next = this.buffer[i + 1];
        if (ch === "\r") {
          if (next === "\n") {
            i += 1;
            ch = "\n";
            next = this.buffer[i + 1];
          } else
            end = i;
        }
        if (next === "#" || inFlow && flowIndicatorChars.has(next))
          break;
        if (ch === "\n") {
          const cs = this.continueScalar(i + 1);
          if (cs === -1)
            break;
          i = Math.max(i, cs - 2);
        }
      } else {
        if (inFlow && flowIndicatorChars.has(ch))
          break;
        end = i;
      }
    }
    if (!ch && !this.atEnd)
      return this.setNext("plain-scalar");
    yield SCALAR;
    yield* this.pushToIndex(end + 1, true);
    return inFlow ? "flow" : "doc";
  }
  *pushCount(n) {
    if (n > 0) {
      yield this.buffer.substr(this.pos, n);
      this.pos += n;
      return n;
    }
    return 0;
  }
  *pushToIndex(i, allowEmpty) {
    const s = this.buffer.slice(this.pos, i);
    if (s) {
      yield s;
      this.pos += s.length;
      return s.length;
    } else if (allowEmpty)
      yield "";
    return 0;
  }
  *pushIndicators() {
    switch (this.charAt(0)) {
      case "!":
        return (yield* this.pushTag()) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
      case "&":
        return (yield* this.pushUntil(isNotAnchorChar)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
      case "-":
      // this is an error
      case "?":
      // this is an error outside flow collections
      case ":": {
        const inFlow = this.flowLevel > 0;
        const ch1 = this.charAt(1);
        if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
          if (!inFlow)
            this.indentNext = this.indentValue + 1;
          else if (this.flowKey)
            this.flowKey = false;
          return (yield* this.pushCount(1)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
        }
      }
    }
    return 0;
  }
  *pushTag() {
    if (this.charAt(1) === "<") {
      let i = this.pos + 2;
      let ch = this.buffer[i];
      while (!isEmpty(ch) && ch !== ">")
        ch = this.buffer[++i];
      return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
    } else {
      let i = this.pos + 1;
      let ch = this.buffer[i];
      while (ch) {
        if (tagChars.has(ch))
          ch = this.buffer[++i];
        else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
          ch = this.buffer[i += 3];
        } else
          break;
      }
      return yield* this.pushToIndex(i, false);
    }
  }
  *pushNewline() {
    const ch = this.buffer[this.pos];
    if (ch === "\n")
      return yield* this.pushCount(1);
    else if (ch === "\r" && this.charAt(1) === "\n")
      return yield* this.pushCount(2);
    else
      return 0;
  }
  *pushSpaces(allowTabs) {
    let i = this.pos - 1;
    let ch;
    do {
      ch = this.buffer[++i];
    } while (ch === " " || allowTabs && ch === "	");
    const n = i - this.pos;
    if (n > 0) {
      yield this.buffer.substr(this.pos, n);
      this.pos = i;
    }
    return n;
  }
  *pushUntil(test) {
    let i = this.pos;
    let ch = this.buffer[i];
    while (!test(ch))
      ch = this.buffer[++i];
    return yield* this.pushToIndex(i, false);
  }
}
class LineCounter {
  constructor() {
    this.lineStarts = [];
    this.addNewLine = (offset) => this.lineStarts.push(offset);
    this.linePos = (offset) => {
      let low = 0;
      let high = this.lineStarts.length;
      while (low < high) {
        const mid = low + high >> 1;
        if (this.lineStarts[mid] < offset)
          low = mid + 1;
        else
          high = mid;
      }
      if (this.lineStarts[low] === offset)
        return { line: low + 1, col: 1 };
      if (low === 0)
        return { line: 0, col: offset };
      const start = this.lineStarts[low - 1];
      return { line: low, col: offset - start + 1 };
    };
  }
}
function includesToken(list, type) {
  for (let i = 0; i < list.length; ++i)
    if (list[i].type === type)
      return true;
  return false;
}
function findNonEmptyIndex(list) {
  for (let i = 0; i < list.length; ++i) {
    switch (list[i].type) {
      case "space":
      case "comment":
      case "newline":
        break;
      default:
        return i;
    }
  }
  return -1;
}
function isFlowToken(token) {
  switch (token == null ? void 0 : token.type) {
    case "alias":
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "flow-collection":
      return true;
    default:
      return false;
  }
}
function getPrevProps(parent) {
  switch (parent.type) {
    case "document":
      return parent.start;
    case "block-map": {
      const it = parent.items[parent.items.length - 1];
      return it.sep ?? it.start;
    }
    case "block-seq":
      return parent.items[parent.items.length - 1].start;
    /* istanbul ignore next should not happen */
    default:
      return [];
  }
}
function getFirstKeyStartProps(prev) {
  var _a;
  if (prev.length === 0)
    return [];
  let i = prev.length;
  loop: while (--i >= 0) {
    switch (prev[i].type) {
      case "doc-start":
      case "explicit-key-ind":
      case "map-value-ind":
      case "seq-item-ind":
      case "newline":
        break loop;
    }
  }
  while (((_a = prev[++i]) == null ? void 0 : _a.type) === "space") {
  }
  return prev.splice(i, prev.length);
}
function fixFlowSeqItems(fc) {
  if (fc.start.type === "flow-seq-start") {
    for (const it of fc.items) {
      if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
        if (it.key)
          it.value = it.key;
        delete it.key;
        if (isFlowToken(it.value)) {
          if (it.value.end)
            Array.prototype.push.apply(it.value.end, it.sep);
          else
            it.value.end = it.sep;
        } else
          Array.prototype.push.apply(it.start, it.sep);
        delete it.sep;
      }
    }
  }
}
class Parser {
  /**
   * @param onNewLine - If defined, called separately with the start position of
   *   each new line (in `parse()`, including the start of input).
   */
  constructor(onNewLine) {
    this.atNewLine = true;
    this.atScalar = false;
    this.indent = 0;
    this.offset = 0;
    this.onKeyLine = false;
    this.stack = [];
    this.source = "";
    this.type = "";
    this.lexer = new Lexer();
    this.onNewLine = onNewLine;
  }
  /**
   * Parse `source` as a YAML stream.
   * If `incomplete`, a part of the last line may be left as a buffer for the next call.
   *
   * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
   *
   * @returns A generator of tokens representing each directive, document, and other structure.
   */
  *parse(source, incomplete = false) {
    if (this.onNewLine && this.offset === 0)
      this.onNewLine(0);
    for (const lexeme of this.lexer.lex(source, incomplete))
      yield* this.next(lexeme);
    if (!incomplete)
      yield* this.end();
  }
  /**
   * Advance the parser by the `source` of one lexical token.
   */
  *next(source) {
    this.source = source;
    if (this.atScalar) {
      this.atScalar = false;
      yield* this.step();
      this.offset += source.length;
      return;
    }
    const type = tokenType(source);
    if (!type) {
      const message = `Not a YAML token: ${source}`;
      yield* this.pop({ type: "error", offset: this.offset, message, source });
      this.offset += source.length;
    } else if (type === "scalar") {
      this.atNewLine = false;
      this.atScalar = true;
      this.type = "scalar";
    } else {
      this.type = type;
      yield* this.step();
      switch (type) {
        case "newline":
          this.atNewLine = true;
          this.indent = 0;
          if (this.onNewLine)
            this.onNewLine(this.offset + source.length);
          break;
        case "space":
          if (this.atNewLine && source[0] === " ")
            this.indent += source.length;
          break;
        case "explicit-key-ind":
        case "map-value-ind":
        case "seq-item-ind":
          if (this.atNewLine)
            this.indent += source.length;
          break;
        case "doc-mode":
        case "flow-error-end":
          return;
        default:
          this.atNewLine = false;
      }
      this.offset += source.length;
    }
  }
  /** Call at end of input to push out any remaining constructions */
  *end() {
    while (this.stack.length > 0)
      yield* this.pop();
  }
  get sourceToken() {
    const st = {
      type: this.type,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
    return st;
  }
  *step() {
    const top = this.peek(1);
    if (this.type === "doc-end" && (!top || top.type !== "doc-end")) {
      while (this.stack.length > 0)
        yield* this.pop();
      this.stack.push({
        type: "doc-end",
        offset: this.offset,
        source: this.source
      });
      return;
    }
    if (!top)
      return yield* this.stream();
    switch (top.type) {
      case "document":
        return yield* this.document(top);
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return yield* this.scalar(top);
      case "block-scalar":
        return yield* this.blockScalar(top);
      case "block-map":
        return yield* this.blockMap(top);
      case "block-seq":
        return yield* this.blockSequence(top);
      case "flow-collection":
        return yield* this.flowCollection(top);
      case "doc-end":
        return yield* this.documentEnd(top);
    }
    yield* this.pop();
  }
  peek(n) {
    return this.stack[this.stack.length - n];
  }
  *pop(error) {
    const token = error ?? this.stack.pop();
    if (!token) {
      const message = "Tried to pop an empty stack";
      yield { type: "error", offset: this.offset, source: "", message };
    } else if (this.stack.length === 0) {
      yield token;
    } else {
      const top = this.peek(1);
      if (token.type === "block-scalar") {
        token.indent = "indent" in top ? top.indent : 0;
      } else if (token.type === "flow-collection" && top.type === "document") {
        token.indent = 0;
      }
      if (token.type === "flow-collection")
        fixFlowSeqItems(token);
      switch (top.type) {
        case "document":
          top.value = token;
          break;
        case "block-scalar":
          top.props.push(token);
          break;
        case "block-map": {
          const it = top.items[top.items.length - 1];
          if (it.value) {
            top.items.push({ start: [], key: token, sep: [] });
            this.onKeyLine = true;
            return;
          } else if (it.sep) {
            it.value = token;
          } else {
            Object.assign(it, { key: token, sep: [] });
            this.onKeyLine = !it.explicitKey;
            return;
          }
          break;
        }
        case "block-seq": {
          const it = top.items[top.items.length - 1];
          if (it.value)
            top.items.push({ start: [], value: token });
          else
            it.value = token;
          break;
        }
        case "flow-collection": {
          const it = top.items[top.items.length - 1];
          if (!it || it.value)
            top.items.push({ start: [], key: token, sep: [] });
          else if (it.sep)
            it.value = token;
          else
            Object.assign(it, { key: token, sep: [] });
          return;
        }
        /* istanbul ignore next should not happen */
        default:
          yield* this.pop();
          yield* this.pop(token);
      }
      if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
        const last = token.items[token.items.length - 1];
        if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
          if (top.type === "document")
            top.end = last.start;
          else
            top.items.push({ start: last.start });
          token.items.splice(-1, 1);
        }
      }
    }
  }
  *stream() {
    switch (this.type) {
      case "directive-line":
        yield { type: "directive", offset: this.offset, source: this.source };
        return;
      case "byte-order-mark":
      case "space":
      case "comment":
      case "newline":
        yield this.sourceToken;
        return;
      case "doc-mode":
      case "doc-start": {
        const doc = {
          type: "document",
          offset: this.offset,
          start: []
        };
        if (this.type === "doc-start")
          doc.start.push(this.sourceToken);
        this.stack.push(doc);
        return;
      }
    }
    yield {
      type: "error",
      offset: this.offset,
      message: `Unexpected ${this.type} token in YAML stream`,
      source: this.source
    };
  }
  *document(doc) {
    if (doc.value)
      return yield* this.lineEnd(doc);
    switch (this.type) {
      case "doc-start": {
        if (findNonEmptyIndex(doc.start) !== -1) {
          yield* this.pop();
          yield* this.step();
        } else
          doc.start.push(this.sourceToken);
        return;
      }
      case "anchor":
      case "tag":
      case "space":
      case "comment":
      case "newline":
        doc.start.push(this.sourceToken);
        return;
    }
    const bv = this.startBlockValue(doc);
    if (bv)
      this.stack.push(bv);
    else {
      yield {
        type: "error",
        offset: this.offset,
        message: `Unexpected ${this.type} token in YAML document`,
        source: this.source
      };
    }
  }
  *scalar(scalar) {
    if (this.type === "map-value-ind") {
      const prev = getPrevProps(this.peek(2));
      const start = getFirstKeyStartProps(prev);
      let sep;
      if (scalar.end) {
        sep = scalar.end;
        sep.push(this.sourceToken);
        delete scalar.end;
      } else
        sep = [this.sourceToken];
      const map2 = {
        type: "block-map",
        offset: scalar.offset,
        indent: scalar.indent,
        items: [{ start, key: scalar, sep }]
      };
      this.onKeyLine = true;
      this.stack[this.stack.length - 1] = map2;
    } else
      yield* this.lineEnd(scalar);
  }
  *blockScalar(scalar) {
    switch (this.type) {
      case "space":
      case "comment":
      case "newline":
        scalar.props.push(this.sourceToken);
        return;
      case "scalar":
        scalar.source = this.source;
        this.atNewLine = true;
        this.indent = 0;
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        yield* this.pop();
        break;
      /* istanbul ignore next should not happen */
      default:
        yield* this.pop();
        yield* this.step();
    }
  }
  *blockMap(map2) {
    var _a;
    const it = map2.items[map2.items.length - 1];
    switch (this.type) {
      case "newline":
        this.onKeyLine = false;
        if (it.value) {
          const end = "end" in it.value ? it.value.end : void 0;
          const last = Array.isArray(end) ? end[end.length - 1] : void 0;
          if ((last == null ? void 0 : last.type) === "comment")
            end == null ? void 0 : end.push(this.sourceToken);
          else
            map2.items.push({ start: [this.sourceToken] });
        } else if (it.sep) {
          it.sep.push(this.sourceToken);
        } else {
          it.start.push(this.sourceToken);
        }
        return;
      case "space":
      case "comment":
        if (it.value) {
          map2.items.push({ start: [this.sourceToken] });
        } else if (it.sep) {
          it.sep.push(this.sourceToken);
        } else {
          if (this.atIndentedComment(it.start, map2.indent)) {
            const prev = map2.items[map2.items.length - 2];
            const end = (_a = prev == null ? void 0 : prev.value) == null ? void 0 : _a.end;
            if (Array.isArray(end)) {
              Array.prototype.push.apply(end, it.start);
              end.push(this.sourceToken);
              map2.items.pop();
              return;
            }
          }
          it.start.push(this.sourceToken);
        }
        return;
    }
    if (this.indent >= map2.indent) {
      const atMapIndent = !this.onKeyLine && this.indent === map2.indent;
      const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
      let start = [];
      if (atNextItem && it.sep && !it.value) {
        const nl = [];
        for (let i = 0; i < it.sep.length; ++i) {
          const st = it.sep[i];
          switch (st.type) {
            case "newline":
              nl.push(i);
              break;
            case "space":
              break;
            case "comment":
              if (st.indent > map2.indent)
                nl.length = 0;
              break;
            default:
              nl.length = 0;
          }
        }
        if (nl.length >= 2)
          start = it.sep.splice(nl[1]);
      }
      switch (this.type) {
        case "anchor":
        case "tag":
          if (atNextItem || it.value) {
            start.push(this.sourceToken);
            map2.items.push({ start });
            this.onKeyLine = true;
          } else if (it.sep) {
            it.sep.push(this.sourceToken);
          } else {
            it.start.push(this.sourceToken);
          }
          return;
        case "explicit-key-ind":
          if (!it.sep && !it.explicitKey) {
            it.start.push(this.sourceToken);
            it.explicitKey = true;
          } else if (atNextItem || it.value) {
            start.push(this.sourceToken);
            map2.items.push({ start, explicitKey: true });
          } else {
            this.stack.push({
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken], explicitKey: true }]
            });
          }
          this.onKeyLine = true;
          return;
        case "map-value-ind":
          if (it.explicitKey) {
            if (!it.sep) {
              if (includesToken(it.start, "newline")) {
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              } else {
                const start2 = getFirstKeyStartProps(it.start);
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                });
              }
            } else if (it.value) {
              map2.items.push({ start: [], key: null, sep: [this.sourceToken] });
            } else if (includesToken(it.sep, "map-value-ind")) {
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start, key: null, sep: [this.sourceToken] }]
              });
            } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
              const start2 = getFirstKeyStartProps(it.start);
              const key = it.key;
              const sep = it.sep;
              sep.push(this.sourceToken);
              delete it.key;
              delete it.sep;
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: start2, key, sep }]
              });
            } else if (start.length > 0) {
              it.sep = it.sep.concat(start, this.sourceToken);
            } else {
              it.sep.push(this.sourceToken);
            }
          } else {
            if (!it.sep) {
              Object.assign(it, { key: null, sep: [this.sourceToken] });
            } else if (it.value || atNextItem) {
              map2.items.push({ start, key: null, sep: [this.sourceToken] });
            } else if (includesToken(it.sep, "map-value-ind")) {
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: [], key: null, sep: [this.sourceToken] }]
              });
            } else {
              it.sep.push(this.sourceToken);
            }
          }
          this.onKeyLine = true;
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const fs = this.flowScalar(this.type);
          if (atNextItem || it.value) {
            map2.items.push({ start, key: fs, sep: [] });
            this.onKeyLine = true;
          } else if (it.sep) {
            this.stack.push(fs);
          } else {
            Object.assign(it, { key: fs, sep: [] });
            this.onKeyLine = true;
          }
          return;
        }
        default: {
          const bv = this.startBlockValue(map2);
          if (bv) {
            if (atMapIndent && bv.type !== "block-seq") {
              map2.items.push({ start });
            }
            this.stack.push(bv);
            return;
          }
        }
      }
    }
    yield* this.pop();
    yield* this.step();
  }
  *blockSequence(seq2) {
    var _a;
    const it = seq2.items[seq2.items.length - 1];
    switch (this.type) {
      case "newline":
        if (it.value) {
          const end = "end" in it.value ? it.value.end : void 0;
          const last = Array.isArray(end) ? end[end.length - 1] : void 0;
          if ((last == null ? void 0 : last.type) === "comment")
            end == null ? void 0 : end.push(this.sourceToken);
          else
            seq2.items.push({ start: [this.sourceToken] });
        } else
          it.start.push(this.sourceToken);
        return;
      case "space":
      case "comment":
        if (it.value)
          seq2.items.push({ start: [this.sourceToken] });
        else {
          if (this.atIndentedComment(it.start, seq2.indent)) {
            const prev = seq2.items[seq2.items.length - 2];
            const end = (_a = prev == null ? void 0 : prev.value) == null ? void 0 : _a.end;
            if (Array.isArray(end)) {
              Array.prototype.push.apply(end, it.start);
              end.push(this.sourceToken);
              seq2.items.pop();
              return;
            }
          }
          it.start.push(this.sourceToken);
        }
        return;
      case "anchor":
      case "tag":
        if (it.value || this.indent <= seq2.indent)
          break;
        it.start.push(this.sourceToken);
        return;
      case "seq-item-ind":
        if (this.indent !== seq2.indent)
          break;
        if (it.value || includesToken(it.start, "seq-item-ind"))
          seq2.items.push({ start: [this.sourceToken] });
        else
          it.start.push(this.sourceToken);
        return;
    }
    if (this.indent > seq2.indent) {
      const bv = this.startBlockValue(seq2);
      if (bv) {
        this.stack.push(bv);
        return;
      }
    }
    yield* this.pop();
    yield* this.step();
  }
  *flowCollection(fc) {
    const it = fc.items[fc.items.length - 1];
    if (this.type === "flow-error-end") {
      let top;
      do {
        yield* this.pop();
        top = this.peek(1);
      } while (top && top.type === "flow-collection");
    } else if (fc.end.length === 0) {
      switch (this.type) {
        case "comma":
        case "explicit-key-ind":
          if (!it || it.sep)
            fc.items.push({ start: [this.sourceToken] });
          else
            it.start.push(this.sourceToken);
          return;
        case "map-value-ind":
          if (!it || it.value)
            fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
          else if (it.sep)
            it.sep.push(this.sourceToken);
          else
            Object.assign(it, { key: null, sep: [this.sourceToken] });
          return;
        case "space":
        case "comment":
        case "newline":
        case "anchor":
        case "tag":
          if (!it || it.value)
            fc.items.push({ start: [this.sourceToken] });
          else if (it.sep)
            it.sep.push(this.sourceToken);
          else
            it.start.push(this.sourceToken);
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const fs = this.flowScalar(this.type);
          if (!it || it.value)
            fc.items.push({ start: [], key: fs, sep: [] });
          else if (it.sep)
            this.stack.push(fs);
          else
            Object.assign(it, { key: fs, sep: [] });
          return;
        }
        case "flow-map-end":
        case "flow-seq-end":
          fc.end.push(this.sourceToken);
          return;
      }
      const bv = this.startBlockValue(fc);
      if (bv)
        this.stack.push(bv);
      else {
        yield* this.pop();
        yield* this.step();
      }
    } else {
      const parent = this.peek(2);
      if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
        yield* this.pop();
        yield* this.step();
      } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
        const prev = getPrevProps(parent);
        const start = getFirstKeyStartProps(prev);
        fixFlowSeqItems(fc);
        const sep = fc.end.splice(1, fc.end.length);
        sep.push(this.sourceToken);
        const map2 = {
          type: "block-map",
          offset: fc.offset,
          indent: fc.indent,
          items: [{ start, key: fc, sep }]
        };
        this.onKeyLine = true;
        this.stack[this.stack.length - 1] = map2;
      } else {
        yield* this.lineEnd(fc);
      }
    }
  }
  flowScalar(type) {
    if (this.onNewLine) {
      let nl = this.source.indexOf("\n") + 1;
      while (nl !== 0) {
        this.onNewLine(this.offset + nl);
        nl = this.source.indexOf("\n", nl) + 1;
      }
    }
    return {
      type,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
  }
  startBlockValue(parent) {
    switch (this.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return this.flowScalar(this.type);
      case "block-scalar-header":
        return {
          type: "block-scalar",
          offset: this.offset,
          indent: this.indent,
          props: [this.sourceToken],
          source: ""
        };
      case "flow-map-start":
      case "flow-seq-start":
        return {
          type: "flow-collection",
          offset: this.offset,
          indent: this.indent,
          start: this.sourceToken,
          items: [],
          end: []
        };
      case "seq-item-ind":
        return {
          type: "block-seq",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: [this.sourceToken] }]
        };
      case "explicit-key-ind": {
        this.onKeyLine = true;
        const prev = getPrevProps(parent);
        const start = getFirstKeyStartProps(prev);
        start.push(this.sourceToken);
        return {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start, explicitKey: true }]
        };
      }
      case "map-value-ind": {
        this.onKeyLine = true;
        const prev = getPrevProps(parent);
        const start = getFirstKeyStartProps(prev);
        return {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start, key: null, sep: [this.sourceToken] }]
        };
      }
    }
    return null;
  }
  atIndentedComment(start, indent) {
    if (this.type !== "comment")
      return false;
    if (this.indent <= indent)
      return false;
    return start.every((st) => st.type === "newline" || st.type === "space");
  }
  *documentEnd(docEnd) {
    if (this.type !== "doc-mode") {
      if (docEnd.end)
        docEnd.end.push(this.sourceToken);
      else
        docEnd.end = [this.sourceToken];
      if (this.type === "newline")
        yield* this.pop();
    }
  }
  *lineEnd(token) {
    switch (this.type) {
      case "comma":
      case "doc-start":
      case "doc-end":
      case "flow-seq-end":
      case "flow-map-end":
      case "map-value-ind":
        yield* this.pop();
        yield* this.step();
        break;
      case "newline":
        this.onKeyLine = false;
      // fallthrough
      case "space":
      case "comment":
      default:
        if (token.end)
          token.end.push(this.sourceToken);
        else
          token.end = [this.sourceToken];
        if (this.type === "newline")
          yield* this.pop();
    }
  }
}
function parseOptions(options) {
  const prettyErrors = options.prettyErrors !== false;
  const lineCounter = options.lineCounter || prettyErrors && new LineCounter() || null;
  return { lineCounter, prettyErrors };
}
function parseAllDocuments(source, options = {}) {
  const { lineCounter, prettyErrors } = parseOptions(options);
  const parser = new Parser(lineCounter == null ? void 0 : lineCounter.addNewLine);
  const composer = new Composer(options);
  const docs = Array.from(composer.compose(parser.parse(source)));
  if (prettyErrors && lineCounter)
    for (const doc of docs) {
      doc.errors.forEach(prettifyError(source, lineCounter));
      doc.warnings.forEach(prettifyError(source, lineCounter));
    }
  if (docs.length > 0)
    return docs;
  return Object.assign([], { empty: true }, composer.streamInfo());
}
function parseDocument(source, options = {}) {
  const { lineCounter, prettyErrors } = parseOptions(options);
  const parser = new Parser(lineCounter == null ? void 0 : lineCounter.addNewLine);
  const composer = new Composer(options);
  let doc = null;
  for (const _doc of composer.compose(parser.parse(source), true, source.length)) {
    if (!doc)
      doc = _doc;
    else if (doc.options.logLevel !== "silent") {
      doc.errors.push(new YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
      break;
    }
  }
  if (prettyErrors && lineCounter) {
    doc.errors.forEach(prettifyError(source, lineCounter));
    doc.warnings.forEach(prettifyError(source, lineCounter));
  }
  return doc;
}
function parse(src, reviver, options) {
  let _reviver = void 0;
  if (typeof reviver === "function") {
    _reviver = reviver;
  } else if (options === void 0 && reviver && typeof reviver === "object") {
    options = reviver;
  }
  const doc = parseDocument(src, options);
  if (!doc)
    return null;
  doc.warnings.forEach((warning) => warn(doc.options.logLevel, warning));
  if (doc.errors.length > 0) {
    if (doc.options.logLevel !== "silent")
      throw doc.errors[0];
    else
      doc.errors = [];
  }
  return doc.toJS(Object.assign({ reviver: _reviver }, options));
}
function stringify(value, replacer, options) {
  let _replacer = null;
  if (typeof replacer === "function" || Array.isArray(replacer)) {
    _replacer = replacer;
  } else if (options === void 0 && replacer) {
    options = replacer;
  }
  if (typeof options === "string")
    options = options.length;
  if (typeof options === "number") {
    const indent = Math.round(options);
    options = indent < 1 ? void 0 : indent > 8 ? { indent: 8 } : { indent };
  }
  if (value === void 0) {
    const { keepUndefined } = options ?? replacer ?? {};
    if (!keepUndefined)
      return void 0;
  }
  if (isDocument(value) && !_replacer)
    return value.toString(options);
  return new Document(value, _replacer, options).toString(options);
}
const YAML = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Alias,
  CST: cst,
  Composer,
  Document,
  Lexer,
  LineCounter,
  Pair,
  Parser,
  Scalar,
  Schema,
  YAMLError,
  YAMLMap,
  YAMLParseError,
  YAMLSeq,
  YAMLWarning,
  isAlias,
  isCollection: isCollection$1,
  isDocument,
  isMap,
  isNode,
  isPair,
  isScalar: isScalar$1,
  isSeq,
  parse,
  parseAllDocuments,
  parseDocument,
  stringify,
  visit: visit$1,
  visitAsync
}, Symbol.toStringTag, { value: "Module" }));
function parseAriaSnapshot(yaml, text, options = {}) {
  var _a;
  const lineCounter = new yaml.LineCounter();
  const parseOptions2 = {
    keepSourceTokens: true,
    lineCounter,
    ...options
  };
  const yamlDoc = yaml.parseDocument(text, parseOptions2);
  const errors = [];
  const convertRange = (range) => {
    return [lineCounter.linePos(range[0]), lineCounter.linePos(range[1])];
  };
  const addError = (error) => {
    errors.push({
      message: error.message,
      range: [lineCounter.linePos(error.pos[0]), lineCounter.linePos(error.pos[1])]
    });
  };
  const convertSeq = (container, seq2) => {
    for (const item of seq2.items) {
      const itemIsString = item instanceof yaml.Scalar && typeof item.value === "string";
      if (itemIsString) {
        const childNode = KeyParser.parse(item, parseOptions2, errors);
        if (childNode) {
          container.children = container.children || [];
          container.children.push(childNode);
        }
        continue;
      }
      const itemIsMap = item instanceof yaml.YAMLMap;
      if (itemIsMap) {
        convertMap(container, item);
        continue;
      }
      errors.push({
        message: "Sequence items should be strings or maps",
        range: convertRange(item.range || seq2.range)
      });
    }
  };
  const convertMap = (container, map2) => {
    for (const entry of map2.items) {
      container.children = container.children || [];
      const keyIsString = entry.key instanceof yaml.Scalar && typeof entry.key.value === "string";
      if (!keyIsString) {
        errors.push({
          message: "Only string keys are supported",
          range: convertRange(entry.key.range || map2.range)
        });
        continue;
      }
      const key = entry.key;
      const value = entry.value;
      if (key.value === "text") {
        const valueIsString = value instanceof yaml.Scalar && typeof value.value === "string";
        if (!valueIsString) {
          errors.push({
            message: "Text value should be a string",
            range: convertRange(entry.value.range || map2.range)
          });
          continue;
        }
        container.children.push({
          kind: "text",
          text: valueOrRegex(value.value)
        });
        continue;
      }
      if (key.value === "/children") {
        const valueIsString = value instanceof yaml.Scalar && typeof value.value === "string";
        if (!valueIsString || value.value !== "contain" && value.value !== "equal" && value.value !== "deep-equal") {
          errors.push({
            message: 'Strict value should be "contain", "equal" or "deep-equal"',
            range: convertRange(entry.value.range || map2.range)
          });
          continue;
        }
        container.containerMode = value.value;
        continue;
      }
      if (key.value.startsWith("/")) {
        const valueIsString = value instanceof yaml.Scalar && typeof value.value === "string";
        if (!valueIsString) {
          errors.push({
            message: "Property value should be a string",
            range: convertRange(entry.value.range || map2.range)
          });
          continue;
        }
        container.props = container.props ?? {};
        container.props[key.value.slice(1)] = valueOrRegex(value.value);
        continue;
      }
      const childNode = KeyParser.parse(key, parseOptions2, errors);
      if (!childNode)
        continue;
      const valueIsScalar = value instanceof yaml.Scalar;
      if (valueIsScalar) {
        const type = typeof value.value;
        if (type !== "string" && type !== "number" && type !== "boolean") {
          errors.push({
            message: "Node value should be a string or a sequence",
            range: convertRange(entry.value.range || map2.range)
          });
          continue;
        }
        container.children.push({
          ...childNode,
          children: [{
            kind: "text",
            text: valueOrRegex(String(value.value))
          }]
        });
        continue;
      }
      const valueIsSequence = value instanceof yaml.YAMLSeq;
      if (valueIsSequence) {
        container.children.push(childNode);
        convertSeq(childNode, value);
        continue;
      }
      errors.push({
        message: "Map values should be strings or sequences",
        range: convertRange(entry.value.range || map2.range)
      });
    }
  };
  const fragment = { kind: "role", role: "fragment" };
  yamlDoc.errors.forEach(addError);
  if (errors.length)
    return { errors, fragment };
  if (!(yamlDoc.contents instanceof yaml.YAMLSeq)) {
    errors.push({
      message: 'Aria snapshot must be a YAML sequence, elements starting with " -"',
      range: yamlDoc.contents ? convertRange(yamlDoc.contents.range) : [{ line: 0, col: 0 }, { line: 0, col: 0 }]
    });
  }
  if (errors.length)
    return { errors, fragment };
  convertSeq(fragment, yamlDoc.contents);
  if (errors.length)
    return { errors, fragment: emptyFragment };
  if (((_a = fragment.children) == null ? void 0 : _a.length) === 1)
    return { fragment: fragment.children[0], errors };
  return { fragment, errors };
}
const emptyFragment = { kind: "role", role: "fragment" };
function normalizeWhitespace(text) {
  return text.replace(/[\u200b\u00ad]/g, "").replace(/[\r\n\s\t]+/g, " ").trim();
}
function valueOrRegex(value) {
  return value.startsWith("/") && value.endsWith("/") && value.length > 1 ? { pattern: value.slice(1, -1) } : normalizeWhitespace(value);
}
class KeyParser {
  static parse(text, options, errors) {
    try {
      return new KeyParser(text.value)._parse();
    } catch (e) {
      if (e instanceof ParserError) {
        const message = options.prettyErrors === false ? e.message : e.message + ":\n\n" + text.value + "\n" + " ".repeat(e.pos) + "^\n";
        errors.push({
          message,
          range: [options.lineCounter.linePos(text.range[0]), options.lineCounter.linePos(text.range[0] + e.pos)]
        });
        return null;
      }
      throw e;
    }
  }
  constructor(input) {
    this._input = input;
    this._pos = 0;
    this._length = input.length;
  }
  _peek() {
    return this._input[this._pos] || "";
  }
  _next() {
    if (this._pos < this._length)
      return this._input[this._pos++];
    return null;
  }
  _eof() {
    return this._pos >= this._length;
  }
  _isWhitespace() {
    return !this._eof() && /\s/.test(this._peek());
  }
  _skipWhitespace() {
    while (this._isWhitespace())
      this._pos++;
  }
  _readIdentifier(type) {
    if (this._eof())
      this._throwError(`Unexpected end of input when expecting ${type}`);
    const start = this._pos;
    while (!this._eof() && /[a-zA-Z]/.test(this._peek()))
      this._pos++;
    return this._input.slice(start, this._pos);
  }
  _readString() {
    let result = "";
    let escaped = false;
    while (!this._eof()) {
      const ch = this._next();
      if (escaped) {
        result += ch;
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        return result;
      } else {
        result += ch;
      }
    }
    this._throwError("Unterminated string");
  }
  _throwError(message, offset = 0) {
    throw new ParserError(message, offset || this._pos);
  }
  _readRegex() {
    let result = "";
    let escaped = false;
    let insideClass = false;
    while (!this._eof()) {
      const ch = this._next();
      if (escaped) {
        result += ch;
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
        result += ch;
      } else if (ch === "/" && !insideClass) {
        return { pattern: result };
      } else if (ch === "[") {
        insideClass = true;
        result += ch;
      } else if (ch === "]" && insideClass) {
        result += ch;
        insideClass = false;
      } else {
        result += ch;
      }
    }
    this._throwError("Unterminated regex");
  }
  _readStringOrRegex() {
    const ch = this._peek();
    if (ch === '"') {
      this._next();
      return normalizeWhitespace(this._readString());
    }
    if (ch === "/") {
      this._next();
      return this._readRegex();
    }
    return null;
  }
  _readAttributes(result) {
    let errorPos = this._pos;
    while (true) {
      this._skipWhitespace();
      if (this._peek() === "[") {
        this._next();
        this._skipWhitespace();
        errorPos = this._pos;
        const flagName = this._readIdentifier("attribute");
        this._skipWhitespace();
        let flagValue = "";
        if (this._peek() === "=") {
          this._next();
          this._skipWhitespace();
          errorPos = this._pos;
          while (this._peek() !== "]" && !this._isWhitespace() && !this._eof())
            flagValue += this._next();
        }
        this._skipWhitespace();
        if (this._peek() !== "]")
          this._throwError("Expected ]");
        this._next();
        this._applyAttribute(result, flagName, flagValue || "true", errorPos);
      } else {
        break;
      }
    }
  }
  _parse() {
    this._skipWhitespace();
    const role = this._readIdentifier("role");
    this._skipWhitespace();
    const name = this._readStringOrRegex() || "";
    const result = { kind: "role", role, name };
    this._readAttributes(result);
    this._skipWhitespace();
    if (!this._eof())
      this._throwError("Unexpected input");
    return result;
  }
  _applyAttribute(node, key, value, errorPos) {
    if (key === "checked") {
      this._assert(value === "true" || value === "false" || value === "mixed", 'Value of "checked" attribute must be a boolean or "mixed"', errorPos);
      node.checked = value === "true" ? true : value === "false" ? false : "mixed";
      return;
    }
    if (key === "disabled") {
      this._assert(value === "true" || value === "false", 'Value of "disabled" attribute must be a boolean', errorPos);
      node.disabled = value === "true";
      return;
    }
    if (key === "expanded") {
      this._assert(value === "true" || value === "false", 'Value of "expanded" attribute must be a boolean', errorPos);
      node.expanded = value === "true";
      return;
    }
    if (key === "level") {
      this._assert(!isNaN(Number(value)), 'Value of "level" attribute must be a number', errorPos);
      node.level = Number(value);
      return;
    }
    if (key === "pressed") {
      this._assert(value === "true" || value === "false" || value === "mixed", 'Value of "pressed" attribute must be a boolean or "mixed"', errorPos);
      node.pressed = value === "true" ? true : value === "false" ? false : "mixed";
      return;
    }
    if (key === "selected") {
      this._assert(value === "true" || value === "false", 'Value of "selected" attribute must be a boolean', errorPos);
      node.selected = value === "true";
      return;
    }
    this._assert(false, `Unsupported attribute [${key}]`, errorPos);
  }
  _assert(value, message, valuePos) {
    if (!value)
      this._throwError(message || "Assertion error", valuePos);
  }
}
class ParserError extends Error {
  constructor(message, pos) {
    super(message);
    this.pos = pos;
  }
}
const Recorder = ({
  sources,
  paused,
  log,
  mode,
  onEditedCode,
  onCursorActivity
}) => {
  var _a;
  const [selectedFileId, setSelectedFileId] = reactExports.useState();
  const [runningFileId, setRunningFileId2] = reactExports.useState();
  const [selectedTab, setSelectedTab] = useSetting("recorderPropertiesTab", "log");
  const [ariaSnapshot, setAriaSnapshot] = reactExports.useState();
  const [ariaSnapshotErrors, setAriaSnapshotErrors] = reactExports.useState();
  const [selectorFocusOnChange, setSelectorFocusOnChange] = reactExports.useState(true);
  const fileId = selectedFileId || runningFileId || ((_a = sources[0]) == null ? void 0 : _a.id);
  const source = reactExports.useMemo(() => {
    if (fileId) {
      const source2 = sources.find((s) => s.id === fileId);
      if (source2)
        return source2;
    }
    return emptySource();
  }, [sources, fileId]);
  const [locator, setLocator] = reactExports.useState("");
  window.playwrightElementPicked = (elementInfo, userGesture) => {
    const language = source.language;
    setLocator(asLocator(language, elementInfo.selector));
    setAriaSnapshot(elementInfo.ariaSnapshot);
    setAriaSnapshotErrors([]);
    setSelectorFocusOnChange(userGesture);
    if (userGesture && selectedTab !== "locator" && selectedTab !== "aria")
      setSelectedTab("locator");
    if (mode === "inspecting" && selectedTab === "aria") ;
    else {
      const isRecording = ["recording", "assertingText", "assertingVisibility", "assertingValue", "assertingSnapshot"].includes(mode);
      window.dispatch({ event: "setMode", params: { mode: isRecording ? "recording" : "standby" } }).catch(() => {
      });
    }
  };
  window.playwrightSetRunningFile = setRunningFileId2;
  const messagesEndRef = reactExports.useRef(null);
  reactExports.useLayoutEffect(() => {
    var _a2;
    (_a2 = messagesEndRef.current) == null ? void 0 : _a2.scrollIntoView({ block: "center", inline: "nearest" });
  }, [messagesEndRef]);
  reactExports.useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "F8":
          event.preventDefault();
          if (paused)
            window.dispatch({ event: "resume" });
          else
            window.dispatch({ event: "pause" });
          break;
        case "F10":
          event.preventDefault();
          if (paused)
            window.dispatch({ event: "step" });
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [paused]);
  const onEditorChange = reactExports.useCallback((selector) => {
    if (mode === "none" || mode === "inspecting")
      window.dispatch({ event: "setMode", params: { mode: "standby" } });
    setLocator(selector);
    window.dispatch({ event: "highlightRequested", params: { selector } });
  }, [mode]);
  const onAriaEditorChange = reactExports.useCallback((ariaSnapshot2) => {
    if (mode === "none" || mode === "inspecting")
      window.dispatch({ event: "setMode", params: { mode: "standby" } });
    const { fragment, errors } = parseAriaSnapshot(YAML, ariaSnapshot2, { prettyErrors: false });
    const highlights = errors.map((error) => {
      const highlight = {
        message: error.message,
        line: error.range[1].line,
        column: error.range[1].col,
        type: "subtle-error"
      };
      return highlight;
    });
    setAriaSnapshotErrors(highlights);
    setAriaSnapshot(ariaSnapshot2);
    if (!errors.length)
      window.dispatch({ event: "highlightRequested", params: { ariaTemplate: fragment } });
  }, [mode]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recorder", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Toolbar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "circle-large-filled", title: "Record", toggled: mode === "recording" || mode === "recording-inspecting" || mode === "assertingText" || mode === "assertingVisibility", onClick: () => {
        window.dispatch({ event: "setMode", params: { mode: mode === "none" || mode === "standby" || mode === "inspecting" ? "recording" : "standby" } });
      }, children: "Record" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarSeparator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "inspect", title: "Pick locator", toggled: mode === "inspecting" || mode === "recording-inspecting", onClick: () => {
        const newMode = {
          "inspecting": "standby",
          "none": "inspecting",
          "standby": "inspecting",
          "recording": "recording-inspecting",
          "recording-inspecting": "recording",
          "assertingText": "recording-inspecting",
          "assertingVisibility": "recording-inspecting",
          "assertingValue": "recording-inspecting",
          "assertingSnapshot": "recording-inspecting"
        }[mode];
        window.dispatch({ event: "setMode", params: { mode: newMode } }).catch(() => {
        });
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "eye", title: "Assert visibility", toggled: mode === "assertingVisibility", disabled: mode === "none" || mode === "standby" || mode === "inspecting", onClick: () => {
        window.dispatch({ event: "setMode", params: { mode: mode === "assertingVisibility" ? "recording" : "assertingVisibility" } });
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "whole-word", title: "Assert text", toggled: mode === "assertingText", disabled: mode === "none" || mode === "standby" || mode === "inspecting", onClick: () => {
        window.dispatch({ event: "setMode", params: { mode: mode === "assertingText" ? "recording" : "assertingText" } });
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "symbol-constant", title: "Assert value", toggled: mode === "assertingValue", disabled: mode === "none" || mode === "standby" || mode === "inspecting", onClick: () => {
        window.dispatch({ event: "setMode", params: { mode: mode === "assertingValue" ? "recording" : "assertingValue" } });
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "gist", title: "Assert snapshot", toggled: mode === "assertingSnapshot", disabled: mode === "none" || mode === "standby" || mode === "inspecting", onClick: () => {
        window.dispatch({ event: "setMode", params: { mode: mode === "assertingSnapshot" ? "recording" : "assertingSnapshot" } });
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarSeparator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "files", title: "Copy", disabled: !source || !source.text, onClick: () => {
        copy(source.text);
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "debug-continue", title: "Resume (F8)", ariaLabel: "Resume", disabled: !paused, onClick: () => {
        window.dispatch({ event: "resume" });
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "debug-pause", title: "Pause (F8)", ariaLabel: "Pause", disabled: paused, onClick: () => {
        window.dispatch({ event: "pause" });
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "debug-step-over", title: "Step over (F10)", ariaLabel: "Step over", disabled: !paused, onClick: () => {
        window.dispatch({ event: "step" });
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: "auto" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Target:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SourceChooser, { fileId, sources, setFileId: (fileId2) => {
        setSelectedFileId(fileId2);
        window.dispatch({ event: "fileChanged", params: { file: fileId2 } });
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "clear-all", title: "Clear", disabled: !source || !source.text, onClick: () => {
        window.dispatch({ event: "clear" });
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "color-mode", title: "Toggle color mode", toggled: false, onClick: () => toggleTheme() })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SplitView,
      {
        sidebarSize: 200,
        main: /* @__PURE__ */ jsxRuntimeExports.jsx(CodeMirrorWrapper, { text: source.text, language: source.language, highlight: source.highlight, revealLine: source.revealLine, readOnly: source.id !== "playwright-test", onChange: onEditedCode, onCursorActivity, lineNumbers: true }),
        sidebar: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabbedPane,
          {
            rightToolbar: selectedTab === "locator" || selectedTab === "aria" ? [/* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "files", title: "Copy", onClick: () => copy((selectedTab === "locator" ? locator : ariaSnapshot) || "") }, 1)] : [],
            tabs: [
              {
                id: "locator",
                title: "Locator",
                render: () => /* @__PURE__ */ jsxRuntimeExports.jsx(CodeMirrorWrapper, { text: locator, placeholder: "Type locator to inspect", language: source.language, focusOnChange: selectorFocusOnChange, onChange: onEditorChange, wrapLines: true })
              },
              {
                id: "log",
                title: "Log",
                render: () => /* @__PURE__ */ jsxRuntimeExports.jsx(CallLogView, { language: source.language, log: Array.from(log.values()) })
              },
              {
                id: "aria",
                title: "Aria",
                render: () => /* @__PURE__ */ jsxRuntimeExports.jsx(CodeMirrorWrapper, { text: ariaSnapshot || "", placeholder: "Type aria template to match", language: "yaml", onChange: onAriaEditorChange, highlight: ariaSnapshotErrors, wrapLines: true })
              }
            ],
            selectedTab,
            setSelectedTab
          }
        )
      }
    )
  ] });
};
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
function __spreadArray(to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
    to[j] = from[i];
  return to;
}
var hexGen = function(len) {
  if (len === void 0) {
    len = 12;
  }
  var maxlen = 8;
  var min = Math.pow(16, Math.min(len, maxlen) - 1);
  var max = Math.pow(16, Math.min(len, maxlen)) - 1;
  var n = Math.floor(Math.random() * (max - min + 1)) + min;
  var r = n.toString(16);
  while (r.length < len) {
    r = r + hexGen(len - maxlen);
  }
  return r;
};
var DEFAULT_SCOPE = "stack";
var SCOPE_KEY = "factoryStack";
if (typeof window !== "undefined") {
  if (!window[SCOPE_KEY]) {
    window[SCOPE_KEY] = {};
  }
}
var registerContainer = function(scope, ref) {
  window[SCOPE_KEY][scope] = ref;
  return ref;
};
var unregisterContainer = function(scope) {
  delete window[SCOPE_KEY][scope];
};
var getContainer = function(scope) {
  return window[SCOPE_KEY][scope || DEFAULT_SCOPE];
};
var InstanceContainer = function(props, ref) {
  var _a = (props || {}).scope, scope = _a === void 0 ? DEFAULT_SCOPE : _a;
  var propsRef = reactExports.useRef(props);
  var _b = reactExports.useState({}), instances = _b[0], setInstances = _b[1];
  var _c = reactExports.useState([]), hashStack = _c[0], setHashStack = _c[1];
  var resolve = reactExports.useCallback(function(hash, v) {
    var _a2;
    return (_a2 = instances === null || instances === void 0 ? void 0 : instances[hash]) === null || _a2 === void 0 ? void 0 : _a2.resolve(v);
  }, [instances]);
  var resolveAll = reactExports.useCallback(function(v) {
    return Object.values(instances).forEach(function(i) {
      return i.resolve(v);
    });
  }, [instances]);
  var reject = reactExports.useCallback(function(hash, r) {
    var _a2;
    return (_a2 = instances === null || instances === void 0 ? void 0 : instances[hash]) === null || _a2 === void 0 ? void 0 : _a2.reject(r);
  }, [instances]);
  var rejectAll = reactExports.useCallback(function(r) {
    return Object.values(instances).forEach(function(i) {
      return i.reject(r);
    });
  }, [instances]);
  var hasInstance = reactExports.useCallback(function(hash) {
    return !!hashStack.find(function(id) {
      return id === hash;
    });
  }, [hashStack]);
  var getInstance = reactExports.useCallback(function(hash) {
    return instances === null || instances === void 0 ? void 0 : instances[hash];
  }, [
    instances
  ]);
  var remove = function(hash, options) {
    var _a2;
    setHashStack(function(stack) {
      return stack.filter(function(s) {
        return s !== hash;
      });
    });
    setTimeout(function() {
      setInstances(function(instances2) {
        var _a3 = instances2, _b2 = hash;
        _a3[_b2];
        var omitHash = __rest(_a3, [typeof _b2 === "symbol" ? _b2 : _b2 + ""]);
        return omitHash;
      });
    }, options === null || options === void 0 ? void 0 : options.exitTimeout);
    (_a2 = props.onRemove) === null || _a2 === void 0 ? void 0 : _a2.call(props, hash);
  };
  var create2 = function(Component, options, instanceProps) {
    if (options === void 0) {
      options = {};
    }
    return new Promise(function(res, rej) {
      var hash = (instanceProps === null || instanceProps === void 0 ? void 0 : instanceProps.instanceId) || hexGen();
      var _a2 = propsRef.current, enterTimeout = _a2.enterTimeout, exitTimeout = _a2.exitTimeout, isAppendIntances = _a2.isAppendIntances, onResolve = _a2.onResolve, onReject = _a2.onReject;
      var instanceOptions = __assign({
        enterTimeout,
        exitTimeout,
        instanceId: hash
      }, options);
      var instance = __assign({ Component, props: __assign(__assign({}, options), instanceProps), resolve: function(v) {
        removeRef.current(hash, instanceOptions);
        res(v);
        onResolve === null || onResolve === void 0 ? void 0 : onResolve(v, hash);
      }, reject: function(r) {
        removeRef.current(hash, instanceOptions);
        rej(r);
        onReject === null || onReject === void 0 ? void 0 : onReject(r, hash);
      } }, instanceOptions);
      setInstances(function(instances2) {
        var _a3, _b2;
        return isAppendIntances ? __assign(__assign({}, instances2), (_a3 = {}, _a3[hash] = instance, _a3)) : __assign((_b2 = {}, _b2[hash] = instance, _b2), instances2);
      });
      setTimeout(function() {
        var _a3, _b2;
        setHashStack(function(stack) {
          return __spreadArray(__spreadArray([], stack), [hash]);
        });
        (_b2 = (_a3 = propsRef.current).onOpen) === null || _b2 === void 0 ? void 0 : _b2.call(_a3, hash, instance);
      }, instanceOptions.enterTimeout);
    });
  };
  var removeRef = reactExports.useRef(remove);
  var createRef = reactExports.useRef(create2);
  reactExports.useEffect(function() {
    propsRef.current = props;
    removeRef.current = remove;
    createRef.current = create2;
  });
  reactExports.useImperativeHandle(ref, function() {
    return {
      create: createRef.current,
      resolve,
      reject,
      resolveAll,
      rejectAll,
      hasInstance,
      getInstance
    };
  });
  reactExports.useEffect(function() {
    registerContainer(scope, {
      create: createRef.current,
      resolve,
      reject,
      resolveAll,
      rejectAll,
      hasInstance,
      getInstance
    });
    return function() {
      return unregisterContainer(scope);
    };
  }, [scope]);
  var mapKeys = reactExports.useMemo(function() {
    var keys = Object.keys(instances);
    return keys.map(function(key) {
      var _a2 = instances[key], Component = _a2.Component, props2 = _a2.props, resolve2 = _a2.resolve, reject2 = _a2.reject;
      var isOpen = !!hashStack.find(function(h) {
        return h === key;
      });
      return React.createElement(Component, __assign({}, props2, {
        key,
        isOpen,
        onReject: reject2,
        onResolve: resolve2,
        /** @deprecated **/
        close: resolve2,
        /** @deprecated **/
        open: isOpen
      }));
    });
  }, [instances, hashStack]);
  return React.createElement(React.Fragment, null, mapKeys);
};
var Container = reactExports.forwardRef(InstanceContainer);
Container.defaultProps = {
  exitTimeout: 500,
  enterTimeout: 50
};
var create = function(Component, options) {
  return function(props) {
    return getContainer(void 0).create(Component, options, props);
  };
};
const SaveCodeForm = ({ suggestedFilename, onSubmit }) => {
  const [filename, setFilename] = React.useState(suggestedFilename ?? "");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { id: "save-form", onSubmit: () => onSubmit({ filename }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "filename", children: "File Name:" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "text",
        id: "filename",
        name: "filename",
        placeholder: "Enter file name",
        required: true,
        value: filename,
        onChange: (e) => setFilename(e.target.value)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { id: "submit", type: "submit", disabled: !filename, children: "Save" })
  ] });
};
class RealDataIntegration {
  constructor() {
    __publicField(this, "activeExecutions", /* @__PURE__ */ new Map());
    __publicField(this, "isListening", false);
    this.setupEventListeners();
  }
  /**
   * Set up event listeners for test execution
   */
  setupEventListeners() {
    if (typeof window !== "undefined") {
      window.addEventListener("testExecutionStarted", this.handleTestStart);
      window.addEventListener("testExecutionCompleted", this.handleTestComplete);
      window.addEventListener("locatorFailed", this.handleLocatorFailure);
      window.addEventListener("locatorHealed", this.handleLocatorHealed);
    }
  }
  /**
   * Start listening for real test data
   */
  startListening() {
    this.isListening = true;
    console.log("Real data integration started");
  }
  /**
   * Stop listening for real test data
   */
  stopListening() {
    this.isListening = false;
    console.log("Real data integration stopped");
  }
  /**
   * Handle test execution start
   */
  handleTestStart(event) {
    const customEvent = event;
    if (!this.isListening) return;
    const { testExecution } = customEvent.detail;
    this.activeExecutions.set(testExecution.id, testExecution);
  }
  /**
   * Handle test execution completion
   */
  handleTestComplete(event) {
    const customEvent = event;
    if (!this.isListening) return;
    const { testExecution } = customEvent.detail;
    const execution = this.activeExecutions.get(testExecution.id);
    if (execution) {
      execution.status = testExecution.status;
      execution.endTime = testExecution.endTime;
      execution.logs = testExecution.logs;
      if (execution.failures && execution.failures.length > 0) {
        this.processFailures(execution);
      }
    }
  }
  /**
   * Handle locator failure
   */
  handleLocatorFailure(event) {
    const customEvent = event;
    if (!this.isListening) return;
    const { testId, step, locator, error, element } = customEvent.detail;
    const execution = this.activeExecutions.get(testId);
    if (execution) {
      const failure = {
        id: `failure-${Date.now()}`,
        step,
        locator,
        error,
        timestamp: /* @__PURE__ */ new Date(),
        element
      };
      if (!execution.failures) {
        execution.failures = [];
      }
      execution.failures.push(failure);
      this.attemptAutoHealing(execution, failure);
    }
  }
  /**
   * Handle locator healing
   */
  handleLocatorHealed(event) {
    const customEvent = event;
    if (!this.isListening) return;
    const { testId, failureId, healedLocator, success } = customEvent.detail;
    const execution = this.activeExecutions.get(testId);
    if (execution && execution.failures) {
      const failure = execution.failures.find((f) => f.id === failureId);
      if (failure) {
        failure.healed = success;
        failure.healedLocator = healedLocator;
        this.recordHealingResult(failure, success);
      }
    }
  }
  /**
   * Attempt auto-healing for a failure
   */
  async attemptAutoHealing(execution, failure) {
    if (!failure.element) return;
    try {
      const config = aiSelfHealingService.getConfig();
      if (config.enabled) {
        const aiResult = await aiSelfHealingService.autoHealLocator(
          failure.locator,
          failure.element,
          {
            url: `test-${execution.scriptId}`,
            failureReason: failure.error
          }
        );
        if (aiResult.autoApplied) {
          failure.healed = true;
          failure.healedLocator = aiResult.healedLocator;
          this.emitEvent("locatorHealed", {
            testId: execution.id,
            failureId: failure.id,
            healedLocator: aiResult.healedLocator,
            success: true
          });
          return;
        }
      }
      const traditionalResult = await selfHealingService.autoHealLocator(
        failure.locator,
        failure.element,
        {
          url: `test-${execution.scriptId}`,
          failureReason: failure.error
        }
      );
      if (traditionalResult.healedLocator) {
        failure.healed = true;
        failure.healedLocator = traditionalResult.healedLocator;
        this.emitEvent("locatorHealed", {
          testId: execution.id,
          failureId: failure.id,
          healedLocator: traditionalResult.healedLocator,
          success: true
        });
      }
    } catch (error) {
      console.error("Auto-healing failed:", error);
      this.recordHealingResult(failure, false);
    }
  }
  /**
   * Process all failures in a test execution
   */
  async processFailures(execution) {
    if (!execution.failures) return;
    for (const failure of execution.failures) {
      if (!failure.healed) {
        await this.attemptAutoHealing(execution, failure);
      }
    }
  }
  /**
   * Record healing result in both services
   */
  async recordHealingResult(failure, success) {
    try {
      await aiSelfHealingService.recordHealingResult(
        `failure-${failure.id}`,
        success,
        success ? void 0 : failure.error
      );
      await selfHealingService.recordHealingResult(
        `failure-${failure.id}`,
        success,
        failure.error
      );
    } catch (error) {
      console.error("Failed to record healing result:", error);
    }
  }
  /**
   * Get real healing statistics
   */
  async getRealHealingStatistics() {
    let totalTests = 0;
    let totalFailures = 0;
    let totalHealings = 0;
    let aiHealings = 0;
    let traditionalHealings = 0;
    const recentFailures = [];
    for (const execution of this.activeExecutions.values()) {
      totalTests++;
      if (execution.failures) {
        totalFailures += execution.failures.length;
        for (const failure of execution.failures) {
          if (failure.healed) {
            totalHealings++;
            if (failure.healedLocator && failure.healedLocator.includes("data-testid")) {
              aiHealings++;
            } else {
              traditionalHealings++;
            }
          } else {
            if (Date.now() - failure.timestamp.getTime() < 24 * 60 * 60 * 1e3) {
              recentFailures.push(failure);
            }
          }
        }
      }
    }
    const aiStats = await aiSelfHealingService.getHealingStatistics();
    const traditionalStats = await selfHealingService.getStatistics();
    return {
      totalTests,
      totalFailures,
      totalHealings,
      successRate: totalFailures > 0 ? totalHealings / totalFailures : 0,
      aiHealings: aiHealings + aiStats.totalHealings,
      traditionalHealings: traditionalHealings + traditionalStats.total,
      recentFailures: recentFailures.slice(0, 10)
      // Last 10 failures
    };
  }
  /**
   * Get real healing history
   */
  async getRealHealingHistory() {
    var _a, _b;
    const history = [];
    for (const execution of this.activeExecutions.values()) {
      if (execution.failures) {
        for (const failure of execution.failures) {
          history.push({
            id: `healing-${failure.id}`,
            testId: execution.id,
            scriptId: execution.scriptId,
            originalLocator: failure.locator,
            healedLocator: failure.healedLocator,
            success: failure.healed || false,
            timestamp: failure.timestamp,
            failureReason: failure.error,
            elementType: ((_a = failure.element) == null ? void 0 : _a.tagName.toLowerCase()) || "unknown",
            aiEnhanced: ((_b = failure.healedLocator) == null ? void 0 : _b.includes("data-testid")) || false
          });
        }
      }
    }
    return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  /**
   * Simulate test execution with failures for demonstration
   */
  async simulateTestExecution(scriptId, withFailures = true) {
    var _a;
    const testId = `test-${Date.now()}`;
    const execution = {
      id: testId,
      scriptId,
      status: "running",
      startTime: /* @__PURE__ */ new Date(),
      logs: ["Test started"],
      failures: []
    };
    this.activeExecutions.set(testId, execution);
    this.emitEvent("testExecutionStarted", { testExecution: execution });
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    if (withFailures) {
      const failure = {
        id: `failure-${Date.now()}`,
        step: 1,
        locator: "#dynamic-element-12345",
        error: "Element not found",
        timestamp: /* @__PURE__ */ new Date()
      };
      (_a = execution.failures) == null ? void 0 : _a.push(failure);
      execution.logs.push(`Step 1 failed: ${failure.error}`);
      this.emitEvent("locatorFailed", {
        testId,
        step: failure.step,
        locator: failure.locator,
        error: failure.error
      });
      await new Promise((resolve) => setTimeout(resolve, 1e3));
    }
    execution.status = "passed";
    execution.endTime = /* @__PURE__ */ new Date();
    execution.logs.push("Test completed");
    this.emitEvent("testExecutionCompleted", { testExecution: execution });
  }
  /**
   * Emit custom event
   */
  emitEvent(eventName, detail) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
  }
  /**
   * Clear old test executions
   */
  clearOldExecutions(olderThanDays = 7) {
    const cutoffDate = /* @__PURE__ */ new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    for (const [id, execution] of this.activeExecutions.entries()) {
      if (execution.startTime < cutoffDate) {
        this.activeExecutions.delete(id);
      }
    }
  }
}
const realDataIntegration = new RealDataIntegration();
const SelfHealingManager = ({ onSuggestionApproved, onClose }) => {
  const [suggestions, setSuggestions] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [statistics, setStatistics] = reactExports.useState(null);
  reactExports.useEffect(() => {
    loadSuggestions();
    realDataIntegration.startListening();
    setTimeout(() => {
      realDataIntegration.simulateTestExecution("demo-script-1", true);
    }, 2e3);
    return () => {
      realDataIntegration.stopListening();
    };
  }, []);
  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const realStats = await realDataIntegration.getRealHealingStatistics();
      const traditionalStats = await selfHealingService.getStatistics();
      const healingSuggestions = await selfHealingService.getSuggestions();
      const combinedStats = {
        total: realStats.totalTests + traditionalStats.total,
        pending: healingSuggestions.filter((s) => s.status === "pending").length,
        approved: healingSuggestions.filter((s) => s.status === "approved").length,
        rejected: healingSuggestions.filter((s) => s.status === "rejected").length,
        averageConfidence: traditionalStats.averageConfidence,
        aiEnhancedCount: realStats.aiHealings,
        aiSuccessRate: realStats.successRate,
        visualSimilarityAvg: traditionalStats.visualSimilarityAvg
      };
      setSuggestions(healingSuggestions);
      setStatistics(combinedStats);
    } catch (error) {
      console.error("Error loading suggestions:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleApprove = async (id) => {
    try {
      setLoading(true);
      const success = await selfHealingService.approveSuggestion(id);
      if (success) {
        setSuggestions(
          (prev) => prev.map((s) => s.id === id ? { ...s, status: "approved" } : s)
        );
        const suggestion = suggestions.find((s) => s.id === id);
        if (suggestion && onSuggestionApproved) {
          onSuggestionApproved(suggestion);
        }
      }
    } catch (error) {
      console.error("Error approving suggestion:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleReject = async (id) => {
    try {
      setLoading(true);
      const success = await selfHealingService.rejectSuggestion(id);
      if (success) {
        setSuggestions(
          (prev) => prev.map((s) => s.id === id ? { ...s, status: "rejected" } : s)
        );
      }
    } catch (error) {
      console.error("Error rejecting suggestion:", error);
    } finally {
      setLoading(false);
    }
  };
  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const approvedSuggestions = suggestions.filter((s) => s.status === "approved");
  const rejectedSuggestions = suggestions.filter((s) => s.status === "rejected");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "self-healing-manager", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "healing-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Self-Healing Suggestions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "8px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: loadSuggestions, disabled: loading, children: loading ? "Refreshing..." : "Refresh" }),
        onClose && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, children: "Close" })
      ] })
    ] }),
    pendingSuggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "suggestions-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { children: [
        "Pending (",
        pendingSuggestions.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "suggestions-list", children: pendingSuggestions.map((suggestion) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "suggestion-item pending", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "suggestion-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "locator-pair", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "broken-locator", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Broken:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: suggestion.brokenLocator })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "valid-locator", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Valid:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: suggestion.validLocator })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "confidence", children: [
            "Confidence: ",
            Math.round(suggestion.confidence * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "suggestion-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleApprove(suggestion.id),
              disabled: loading,
              className: "approve-btn",
              children: "Approve"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleReject(suggestion.id),
              disabled: loading,
              className: "reject-btn",
              children: "Reject"
            }
          )
        ] })
      ] }, suggestion.id)) })
    ] }),
    approvedSuggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "suggestions-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { children: [
        "Approved (",
        approvedSuggestions.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "suggestions-list", children: approvedSuggestions.map((suggestion) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "suggestion-item approved", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "suggestion-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "locator-pair", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "broken-locator", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Broken:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: suggestion.brokenLocator })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "valid-locator", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Valid:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: suggestion.validLocator })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "confidence", children: [
            "Confidence: ",
            Math.round(suggestion.confidence * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-badge approved", children: "Approved" })
      ] }, suggestion.id)) })
    ] }),
    rejectedSuggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "suggestions-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { children: [
        "Rejected (",
        rejectedSuggestions.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "suggestions-list", children: rejectedSuggestions.map((suggestion) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "suggestion-item rejected", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "suggestion-content", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "locator-pair", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "broken-locator", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Broken:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: suggestion.brokenLocator })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "valid-locator", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Valid:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: suggestion.validLocator })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "confidence", children: [
            "Confidence: ",
            Math.round(suggestion.confidence * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "status-badge rejected", children: "Rejected" })
      ] }, suggestion.id)) })
    ] }),
    suggestions.length === 0 && !loading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No self-healing suggestions found." })
  ] });
};
const SelfHealingUI = ({ onClose }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SelfHealingManager, { onClose });
};
const AISelfHealingUI = ({ onClose }) => {
  const [activeTab, setActiveTab] = reactExports.useState("dashboard");
  const [statistics, setStatistics] = reactExports.useState(null);
  const [history, setHistory] = reactExports.useState([]);
  const [config, setConfig] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [selectedRecord, setSelectedRecord] = reactExports.useState(null);
  const [showDetails, setShowDetails] = reactExports.useState(false);
  const [trainingData, setTrainingData] = reactExports.useState([]);
  const [isTraining, setIsTraining] = reactExports.useState(false);
  reactExports.useEffect(() => {
    loadData();
    realDataIntegration.startListening();
    setTimeout(() => {
      realDataIntegration.simulateTestExecution("demo-script-1", true);
    }, 2e3);
    setTimeout(() => {
      realDataIntegration.simulateTestExecution("demo-script-2", true);
    }, 5e3);
    return () => {
      realDataIntegration.stopListening();
    };
  }, []);
  const loadData = async () => {
    setIsLoading(true);
    try {
      const realStats = await realDataIntegration.getRealHealingStatistics();
      const aiStats = await aiSelfHealingService.getHealingStatistics();
      const realHistory = await realDataIntegration.getRealHealingHistory();
      const currentConfig = await aiSelfHealingService.getConfig();
      const combinedStats = {
        totalHealings: realStats.totalHealings + aiStats.totalHealings,
        successRate: realStats.successRate || aiStats.successRate,
        autoHealRate: aiStats.autoHealRate,
        rollbackRate: aiStats.rollbackRate,
        averageConfidence: aiStats.averageConfidence,
        topStrategies: aiStats.topStrategies
      };
      setStatistics(combinedStats);
      setHistory(await loadHealingHistory());
      setConfig(currentConfig);
    } catch (error) {
      console.error("Failed to load AI self-healing data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const loadHealingHistory = async () => {
    try {
      const realHistory = await realDataIntegration.getRealHealingHistory();
      return realHistory.map((record) => ({
        id: record.id,
        originalLocator: record.originalLocator,
        healedLocator: record.healedLocator || "",
        success: record.success,
        confidence: 0.8,
        // Default confidence
        timestamp: record.timestamp,
        context: {
          url: `test-${record.scriptId}`,
          elementType: record.elementType,
          failureReason: record.failureReason
        }
      }));
    } catch (error) {
      console.error("Failed to load healing history:", error);
      return [];
    }
  };
  const handleConfigUpdate = async (newConfig) => {
    try {
      aiSelfHealingService.updateConfig(newConfig);
      setConfig({ ...config, ...newConfig });
    } catch (error) {
      console.error("Failed to update config:", error);
    }
  };
  const handleTrainModel = async () => {
    setIsTraining(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      await loadData();
    } catch (error) {
      console.error("Failed to train model:", error);
    } finally {
      setIsTraining(false);
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "20px", textAlign: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spinner" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Loading AI Self-Healing..." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "var(--vscode-sideBar-background)",
    color: "var(--vscode-sideBar-foreground)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      padding: "15px",
      borderBottom: "1px solid var(--vscode-panel-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "18px" }, children: "🤖" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { margin: 0, fontSize: "14px", fontWeight: "600" }, children: "AI Self-Healing" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onClose,
          style: {
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "var(--vscode-sideBar-foreground)",
            padding: "0",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          },
          children: "×"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      display: "flex",
      borderBottom: "1px solid var(--vscode-panel-border)",
      background: "var(--vscode-editor-background)"
    }, children: [
      { id: "dashboard", label: "Dashboard", icon: "📊" },
      { id: "history", label: "History", icon: "📜" },
      { id: "config", label: "Config", icon: "⚙️" },
      { id: "training", label: "Training", icon: "🧠" }
    ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setActiveTab(tab.id),
        style: {
          flex: 1,
          padding: "10px",
          border: "none",
          background: activeTab === tab.id ? "var(--vscode-tab-activeBackground)" : "transparent",
          color: activeTab === tab.id ? "var(--vscode-tab-activeForeground)" : "var(--vscode-tab-inactiveForeground)",
          cursor: "pointer",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tab.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tab.label })
        ]
      },
      tab.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, overflow: "auto", padding: "15px" }, children: [
      activeTab === "dashboard" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        DashboardTab,
        {
          statistics,
          onRefresh: loadData
        }
      ),
      activeTab === "history" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        HistoryTab,
        {
          history,
          selectedRecord,
          onSelectRecord: setSelectedRecord,
          showDetails,
          onToggleDetails: () => setShowDetails(!showDetails)
        }
      ),
      activeTab === "config" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ConfigTab,
        {
          config,
          onUpdate: handleConfigUpdate
        }
      ),
      activeTab === "training" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        TrainingTab,
        {
          trainingData,
          isTraining,
          onTrain: handleTrainModel
        }
      )
    ] })
  ] });
};
const DashboardTab = ({ statistics, onRefresh }) => {
  if (!statistics) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "No statistics available" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: { margin: 0, fontSize: "14px" }, children: "Performance Overview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onRefresh,
          style: {
            padding: "5px 10px",
            border: "1px solid var(--vscode-button-border)",
            background: "var(--vscode-button-background)",
            color: "var(--vscode-button-foreground)",
            cursor: "pointer",
            fontSize: "11px",
            borderRadius: "3px"
          },
          children: "Refresh"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "15px",
      marginBottom: "20px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          label: "Total Healings",
          value: statistics.totalHealings.toString(),
          icon: "🔧"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          label: "Success Rate",
          value: `${(statistics.successRate * 100).toFixed(1)}%`,
          icon: "✅",
          color: statistics.successRate >= 0.8 ? "#28a745" : "#ffc107"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          label: "Auto-Heal Rate",
          value: `${(statistics.autoHealRate * 100).toFixed(1)}%`,
          icon: "🤖",
          color: statistics.autoHealRate >= 0.7 ? "#28a745" : "#ffc107"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          label: "Avg Confidence",
          value: `${(statistics.averageConfidence * 100).toFixed(1)}%`,
          icon: "📊",
          color: statistics.averageConfidence >= 0.8 ? "#28a745" : "#ffc107"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { style: { margin: "0 0 10px 0", fontSize: "13px" }, children: "Top Healing Strategies" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        background: "var(--vscode-editor-background)",
        border: "1px solid var(--vscode-panel-border)",
        borderRadius: "4px",
        padding: "10px"
      }, children: statistics.topStrategies.map((strategy, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 0",
            borderBottom: index < statistics.topStrategies.length - 1 ? "1px solid var(--vscode-panel-border)" : "none"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                background: "var(--vscode-badge-background)",
                color: "var(--vscode-badge-foreground)",
                padding: "2px 6px",
                borderRadius: "3px",
                fontSize: "10px",
                fontWeight: "bold"
              }, children: [
                "#",
                index + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "12px", textTransform: "capitalize" }, children: strategy.strategy })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "11px", color: "var(--vscode-descriptionForeground)" }, children: [
                strategy.count,
                " uses"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
                fontSize: "11px",
                color: strategy.successRate >= 0.8 ? "#28a745" : "#ffc107",
                fontWeight: "bold"
              }, children: [
                (strategy.successRate * 100).toFixed(1),
                "%"
              ] })
            ] })
          ]
        },
        strategy.strategy
      )) })
    ] })
  ] });
};
const HistoryTab = ({ history, selectedRecord, onSelectRecord, showDetails, onToggleDetails }) => {
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };
  const getStatusIcon = (record) => {
    if (record.success === null) return "⏳";
    if (record.success) return "✅";
    if (record.rollback) return "🔄";
    return "❌";
  };
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "#28a745";
    if (confidence >= 0.6) return "#ffc107";
    return "#dc3545";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "15px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: { margin: 0, fontSize: "14px" }, children: "Healing History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onToggleDetails,
          style: {
            padding: "5px 10px",
            border: "1px solid var(--vscode-button-border)",
            background: showDetails ? "var(--vscode-button-secondaryBackground)" : "var(--vscode-button-background)",
            color: "var(--vscode-button-foreground)",
            cursor: "pointer",
            fontSize: "11px",
            borderRadius: "3px"
          },
          children: [
            showDetails ? "Hide" : "Show",
            " Details"
          ]
        }
      )
    ] }),
    history.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      textAlign: "center",
      padding: "40px 20px",
      color: "var(--vscode-descriptionForeground)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "24px", marginBottom: "10px" }, children: "📭" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: "12px" }, children: "No healing history yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "5px 0 0 0", fontSize: "11px" }, children: "Healing attempts will appear here" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      background: "var(--vscode-editor-background)",
      border: "1px solid var(--vscode-panel-border)",
      borderRadius: "4px",
      maxHeight: "400px",
      overflow: "auto"
    }, children: history.map((record) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onClick: () => onSelectRecord(record),
        style: {
          padding: "12px",
          borderBottom: "1px solid var(--vscode-panel-border)",
          cursor: "pointer",
          background: (selectedRecord == null ? void 0 : selectedRecord.id) === record.id ? "var(--vscode-list-activeSelectionBackground)" : "transparent",
          transition: "background 0.2s"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "8px"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "16px" }, children: getStatusIcon(record) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "12px", fontWeight: "500" }, children: record.context.elementType }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                  fontSize: "10px",
                  color: "var(--vscode-descriptionForeground)",
                  marginTop: "2px"
                }, children: formatDate(record.timestamp) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              fontSize: "11px",
              color: getConfidenceColor(record.confidence),
              fontWeight: "bold",
              textAlign: "right"
            }, children: [
              (record.confidence * 100).toFixed(0),
              "%"
            ] })
          ] }),
          showDetails && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            fontSize: "10px",
            color: "var(--vscode-descriptionForeground)",
            marginTop: "8px",
            paddingTop: "8px",
            borderTop: "1px solid var(--vscode-panel-border)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "4px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Original:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { style: {
                background: "var(--vscode-textBlockQuote-background)",
                padding: "2px 4px",
                borderRadius: "2px",
                fontSize: "9px",
                marginLeft: "4px",
                wordBreak: "break-all"
              }, children: record.originalLocator })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "4px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Healed:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { style: {
                background: "var(--vscode-textBlockQuote-background)",
                padding: "2px 4px",
                borderRadius: "2px",
                fontSize: "9px",
                marginLeft: "4px",
                wordBreak: "break-all"
              }, children: record.healedLocator })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "4px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Reason:" }),
              " ",
              record.context.failureReason
            ] }),
            record.rollback && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { color: "#dc3545" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Rolled back:" }),
              " ",
              record.rollback.reason,
              "(",
              formatDate(record.rollback.timestamp),
              ")"
            ] })
          ] })
        ]
      },
      record.id
    )) })
  ] });
};
const ConfigTab = ({ config, onUpdate }) => {
  if (!config) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Loading configuration..." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: { margin: "0 0 15px 0", fontSize: "14px" }, children: "AI Configuration" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "15px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ConfigToggle,
        {
          label: "Enable AI Self-Healing",
          description: "Allow AI to automatically heal failed locators",
          enabled: config.enabled,
          onToggle: (enabled) => onUpdate({ enabled })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ConfigSlider,
        {
          label: "Confidence Threshold",
          description: "Minimum confidence required for auto-healing",
          value: config.confidenceThreshold,
          min: 0.5,
          max: 1,
          step: 0.05,
          onChange: (confidenceThreshold) => onUpdate({ confidenceThreshold }),
          formatValue: (v) => `${(v * 100).toFixed(0)}%`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ConfigSlider,
        {
          label: "Max Retries",
          description: "Maximum number of healing attempts",
          value: config.maxRetries,
          min: 1,
          max: 5,
          step: 1,
          onChange: (maxRetries) => onUpdate({ maxRetries })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ConfigSlider,
        {
          label: "Rollback After Failures",
          description: "Auto-rollback after N consecutive failures",
          value: config.rollbackAfterFailures,
          min: 2,
          max: 10,
          step: 1,
          onChange: (rollbackAfterFailures) => onUpdate({ rollbackAfterFailures })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ConfigToggle,
        {
          label: "Require User Approval",
          description: "Always ask for user approval before applying healing",
          enabled: config.requireUserApproval,
          onToggle: (requireUserApproval) => onUpdate({ requireUserApproval })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ConfigToggle,
        {
          label: "Auto-approve High Confidence",
          description: "Automatically apply healing when confidence is very high",
          enabled: config.autoApproveHighConfidence,
          onToggle: (autoApproveHighConfidence) => onUpdate({ autoApproveHighConfidence }),
          disabled: config.requireUserApproval
        }
      )
    ] })
  ] });
};
const TrainingTab = ({ trainingData, isTraining, onTrain }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { style: { margin: "0 0 15px 0", fontSize: "14px" }, children: "ML Model Training" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      background: "var(--vscode-editor-background)",
      border: "1px solid var(--vscode-panel-border)",
      borderRadius: "4px",
      padding: "15px",
      marginBottom: "15px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { style: { margin: "0 0 10px 0", fontSize: "12px" }, children: "Model Information" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "11px", color: "var(--vscode-descriptionForeground)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "5px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Model Type:" }),
          " Simple Neural Network"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "5px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Features:" }),
          " 24 locator characteristics"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "5px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Training Samples:" }),
          " ",
          trainingData.length
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Last Trained:" }),
          " Never"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      background: "var(--vscode-textBlockQuote-background)",
      border: "1px solid var(--vscode-textBlockQuote-border)",
      borderRadius: "4px",
      padding: "15px",
      marginBottom: "15px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { style: { margin: "0 0 10px 0", fontSize: "12px" }, children: "How It Works" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "11px", lineHeight: "1.4" }, children: "The AI model learns from past healing attempts to predict which locators are most likely to succeed. It considers factors like:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { style: {
        margin: "10px 0 0 0",
        paddingLeft: "20px",
        fontSize: "11px",
        lineHeight: "1.4"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Element type and attributes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Text content and structure" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Position in DOM hierarchy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Visual properties" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Historical success patterns" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: onTrain,
        disabled: isTraining || trainingData.length < 10,
        style: {
          width: "100%",
          padding: "12px",
          border: "none",
          borderRadius: "4px",
          background: isTraining || trainingData.length < 10 ? "var(--vscode-button-secondaryBackground)" : "var(--vscode-button-background)",
          color: "var(--vscode-button-foreground)",
          cursor: isTraining || trainingData.length < 10 ? "not-allowed" : "pointer",
          fontSize: "12px",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px"
        },
        children: isTraining ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spinner", style: { width: "12px", height: "12px" } }),
          "Training Model..."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "🧠 Train Model" })
      }
    ),
    trainingData.length < 10 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      fontSize: "10px",
      color: "var(--vscode-descriptionForeground)",
      textAlign: "center",
      marginTop: "8px"
    }, children: "Need at least 10 healing attempts to train the model" })
  ] });
};
const MetricCard = ({ label, value, icon, color }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    background: "var(--vscode-editor-background)",
    border: "1px solid var(--vscode-panel-border)",
    borderRadius: "4px",
    padding: "12px",
    textAlign: "center"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "20px", marginBottom: "5px" }, children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      fontSize: "16px",
      fontWeight: "bold",
      color: color || "var(--vscode-foreground)",
      marginBottom: "5px"
    }, children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      fontSize: "10px",
      color: "var(--vscode-descriptionForeground)"
    }, children: label })
  ] });
};
const ConfigToggle = ({ label, description, enabled, onToggle, disabled }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "5px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: {
        fontSize: "12px",
        fontWeight: "500",
        color: disabled ? "var(--vscode-disabledForeground)" : "var(--vscode-foreground)"
      }, children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => onToggle(!enabled),
          disabled,
          style: {
            width: "40px",
            height: "20px",
            borderRadius: "10px",
            border: "none",
            background: enabled ? "var(--vscode-button-background)" : "var(--vscode-button-secondaryBackground)",
            position: "relative",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "background 0.2s"
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            position: "absolute",
            top: "2px",
            left: enabled ? "20px" : "2px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: "var(--vscode-button-foreground)",
            transition: "left 0.2s"
          } })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      fontSize: "10px",
      color: "var(--vscode-descriptionForeground)",
      paddingLeft: "0"
    }, children: description })
  ] });
};
const ConfigSlider = ({ label, description, value, min, max, step, onChange, formatValue }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "5px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "12px", fontWeight: "500" }, children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
        fontSize: "11px",
        color: "var(--vscode-foreground)",
        fontWeight: "bold"
      }, children: formatValue ? formatValue(value) : value })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "range",
        min,
        max,
        step,
        value,
        onChange: (e) => onChange(parseFloat(e.target.value)),
        style: {
          width: "100%",
          marginBottom: "5px"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      fontSize: "10px",
      color: "var(--vscode-descriptionForeground)"
    }, children: description })
  ] });
};
class DDTService {
  constructor() {
    __publicField(this, "dataFiles", /* @__PURE__ */ new Map());
    __publicField(this, "dataRows", /* @__PURE__ */ new Map());
  }
  /**
   * Parse a CSV string
   */
  parseCSV(text) {
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    if (lines.length === 0) {
      return { data: [], columns: [] };
    }
    const headers = lines[0].split(",").map((header) => header.trim().replace(/^"(.*)"$/, "$1"));
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((value) => value.trim().replace(/^"(.*)"$/, "$1"));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      data.push(row);
    }
    return { data, columns: headers };
  }
  /**
   * Parse a JSON string
   */
  parseJSON(text) {
    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) {
        throw new Error("JSON must be an array of objects");
      }
      if (data.length === 0) {
        return { data: [], columns: [] };
      }
      const columns = Object.keys(data[0]);
      return { data, columns };
    } catch (error) {
      throw new Error(`JSON parsing error: ${error.message}`);
    }
  }
  /**
   * Upload and parse a CSV file
   */
  async uploadCSV(fileName, fileContent) {
    try {
      const { data: rows, columns } = this.parseCSV(fileContent);
      const fileId = Math.random().toString(36).substr(2, 9);
      const testDataFile = {
        id: fileId,
        name: fileName.replace(/\.csv$/i, ""),
        fileName,
        fileType: "csv",
        fileSize: fileContent.length,
        createdAt: /* @__PURE__ */ new Date(),
        rowCount: rows.length,
        columnNames: columns
      };
      this.dataFiles.set(fileId, testDataFile);
      const rowsToCreate = rows.map((row, index) => ({
        rowNumber: index + 1,
        data: row
      }));
      this.dataRows.set(fileId, rowsToCreate);
      await chrome.storage.local.set({
        [`ddt_file_${fileId}`]: testDataFile,
        [`ddt_rows_${fileId}`]: rowsToCreate
      });
      return testDataFile;
    } catch (error) {
      console.error("Error uploading CSV:", error);
      throw error;
    }
  }
  /**
   * Upload and parse a JSON file
   */
  async uploadJSON(fileName, fileContent) {
    try {
      const { data: rows, columns } = this.parseJSON(fileContent);
      const fileId = Math.random().toString(36).substr(2, 9);
      const testDataFile = {
        id: fileId,
        name: fileName.replace(/\.json$/i, ""),
        fileName,
        fileType: "json",
        fileSize: fileContent.length,
        createdAt: /* @__PURE__ */ new Date(),
        rowCount: rows.length,
        columnNames: columns
      };
      this.dataFiles.set(fileId, testDataFile);
      const rowsToCreate = rows.map((row, index) => ({
        rowNumber: index + 1,
        data: row
      }));
      this.dataRows.set(fileId, rowsToCreate);
      await chrome.storage.local.set({
        [`ddt_file_${fileId}`]: testDataFile,
        [`ddt_rows_${fileId}`]: rowsToCreate
      });
      return testDataFile;
    } catch (error) {
      console.error("Error uploading JSON:", error);
      throw error;
    }
  }
  /**
   * Get all data files
   */
  async getDataFiles() {
    try {
      const storageData = await chrome.storage.local.get(null);
      const keys = Object.keys(storageData).filter((key) => key.startsWith("ddt_file_"));
      const files = [];
      for (const key of keys) {
        const result = await chrome.storage.local.get([key]);
        if (result[key]) {
          files.push(result[key]);
        }
      }
      return files;
    } catch (error) {
      console.error("Error getting data files:", error);
      return Array.from(this.dataFiles.values());
    }
  }
  /**
   * Get a specific data file with its rows
   */
  async getDataFile(fileId) {
    try {
      const fileResult = await chrome.storage.local.get([`ddt_file_${fileId}`]);
      const rowsResult = await chrome.storage.local.get([`ddt_rows_${fileId}`]);
      const file = fileResult[`ddt_file_${fileId}`];
      const rows = rowsResult[`ddt_rows_${fileId}`];
      if (file && rows) {
        return { file, rows };
      }
      const inMemoryFile = this.dataFiles.get(fileId);
      const inMemoryRows = this.dataRows.get(fileId);
      if (inMemoryFile && inMemoryRows) {
        return { file: inMemoryFile, rows: inMemoryRows };
      }
      return null;
    } catch (error) {
      console.error("Error getting data file:", error);
      return null;
    }
  }
  /**
   * Delete a data file
   */
  async deleteDataFile(fileId) {
    try {
      await chrome.storage.local.remove([`ddt_file_${fileId}`, `ddt_rows_${fileId}`]);
      this.dataFiles.delete(fileId);
      this.dataRows.delete(fileId);
      return true;
    } catch (error) {
      console.error("Error deleting data file:", error);
      return false;
    }
  }
  /**
   * Bind variables to test data
   * Used during test execution to replace ${variable} with actual data
   */
  substituteVariables(template, data) {
    let result = template;
    Object.keys(data).forEach((key) => {
      const regex = new RegExp(`\\$\\{${key}\\}`, "g");
      result = result.replace(regex, String(data[key] || ""));
    });
    return result;
  }
  /**
   * Execute test with data-driven approach
   * Returns all rows for iteration
   */
  async prepareDataDrivenExecution(fileId) {
    try {
      const result = await this.getDataFile(fileId);
      if (!result) {
        throw new Error("Data file not found");
      }
      const { file, rows } = result;
      return {
        fileInfo: file,
        iterations: rows.map((r) => ({
          iteration: r.rowNumber,
          variables: r.data
        }))
      };
    } catch (error) {
      console.error("Error preparing DDT execution:", error);
      throw error;
    }
  }
}
const ddtService = new DDTService();
const DDTManager = ({ onFileSelected }) => {
  const [files, setFiles] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [selectedFile, setSelectedFile] = reactExports.useState("");
  const fileInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    loadFiles();
  }, []);
  const loadFiles = async () => {
    setLoading(true);
    try {
      const dataFiles = await ddtService.getDataFiles();
      setFiles(dataFiles);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleFileUpload = async (event) => {
    var _a;
    const file = (_a = event.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    try {
      setLoading(true);
      const content = await file.text();
      let testDataFile;
      if (file.name.endsWith(".csv")) {
        testDataFile = await ddtService.uploadCSV(file.name, content);
      } else if (file.name.endsWith(".json")) {
        testDataFile = await ddtService.uploadJSON(file.name, content);
      } else {
        throw new Error("Unsupported file type. Please upload CSV or JSON files.");
      }
      setFiles((prev) => [...prev, testDataFile]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Error uploading file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleFileDelete = async (fileId) => {
    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }
    try {
      setLoading(true);
      const success = await ddtService.deleteDataFile(fileId);
      if (success) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        if (selectedFile === fileId) {
          setSelectedFile("");
        }
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert(`Error deleting file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleFileSelect = (fileId) => {
    setSelectedFile(fileId);
    if (onFileSelected) {
      onFileSelected(fileId);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ddt-manager", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ddt-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Data Files" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "file",
          ref: fileInputRef,
          accept: ".csv,.json",
          onChange: handleFileUpload,
          disabled: loading,
          style: { display: "none" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            var _a;
            return (_a = fileInputRef.current) == null ? void 0 : _a.click();
          },
          disabled: loading,
          children: loading ? "Uploading..." : "Upload File"
        }
      )
    ] }),
    files.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No data files uploaded yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ddt-files", children: files.map((file) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `ddt-file ${selectedFile === file.id ? "selected" : ""}`,
        onClick: () => handleFileSelect(file.id),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "file-info", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "file-name", children: file.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "file-meta", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "file-type", children: file.fileType.toUpperCase() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "row-count", children: [
                file.rowCount,
                " rows"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "column-count", children: [
                file.columnNames.length,
                " columns"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "delete-btn",
              onClick: (e) => {
                e.stopPropagation();
                handleFileDelete(file.id);
              },
              disabled: loading,
              children: "×"
            }
          )
        ]
      },
      file.id
    )) })
  ] });
};
class DebuggerService {
  constructor() {
    __publicField(this, "breakpoints", /* @__PURE__ */ new Map());
    __publicField(this, "executionContext", null);
    __publicField(this, "isPaused", false);
    __publicField(this, "pauseCallback", null);
  }
  /**
   * Add a breakpoint to a file
   */
  async addBreakpoint(fileId, line, condition) {
    const breakpoint = {
      id: Math.random().toString(36).substr(2, 9),
      line,
      enabled: true,
      condition
    };
    const fileBreakpoints = this.breakpoints.get(fileId) || [];
    fileBreakpoints.push(breakpoint);
    this.breakpoints.set(fileId, fileBreakpoints);
    await this.saveBreakpoints(fileId);
    return breakpoint;
  }
  /**
   * Remove a breakpoint
   */
  async removeBreakpoint(fileId, breakpointId) {
    const fileBreakpoints = this.breakpoints.get(fileId) || [];
    const updatedBreakpoints = fileBreakpoints.filter((bp) => bp.id !== breakpointId);
    this.breakpoints.set(fileId, updatedBreakpoints);
    await this.saveBreakpoints(fileId);
  }
  /**
   * Toggle breakpoint enabled state
   */
  async toggleBreakpoint(fileId, breakpointId) {
    const fileBreakpoints = this.breakpoints.get(fileId) || [];
    const breakpoint = fileBreakpoints.find((bp) => bp.id === breakpointId);
    if (breakpoint) {
      breakpoint.enabled = !breakpoint.enabled;
      this.breakpoints.set(fileId, fileBreakpoints);
      await this.saveBreakpoints(fileId);
    }
  }
  /**
   * Get breakpoints for a file
   */
  async getBreakpoints(fileId) {
    try {
      const result = await chrome.storage.local.get([`breakpoints_${fileId}`]);
      if (result[`breakpoints_${fileId}`]) {
        return result[`breakpoints_${fileId}`];
      }
    } catch (error) {
      console.error("Error loading breakpoints:", error);
    }
    return this.breakpoints.get(fileId) || [];
  }
  /**
   * Save breakpoints to storage
   */
  async saveBreakpoints(fileId) {
    try {
      const fileBreakpoints = this.breakpoints.get(fileId) || [];
      await chrome.storage.local.set({
        [`breakpoints_${fileId}`]: fileBreakpoints
      });
    } catch (error) {
      console.error("Error saving breakpoints:", error);
    }
  }
  /**
   * Check if there's a breakpoint at the specified line
   */
  async hasBreakpointAtLine(fileId, line) {
    const breakpoints = await this.getBreakpoints(fileId);
    return breakpoints.some((bp) => bp.line === line && bp.enabled);
  }
  /**
   * Pause execution at a breakpoint
   */
  async pauseAtBreakpoint(fileId, line) {
    const variables = [
      { name: "url", value: "https://example.com", type: "string" },
      { name: "title", value: "Example Page", type: "string" },
      { name: "elements", value: "15", type: "number" }
    ];
    this.executionContext = {
      variables,
      currentLine: line,
      status: "paused"
    };
    this.isPaused = true;
    if (this.pauseCallback) {
      this.pauseCallback();
    }
    return new Promise((resolve) => {
      const checkResume = () => {
        if (!this.isPaused) {
          resolve();
        } else {
          setTimeout(checkResume, 100);
        }
      };
      checkResume();
    });
  }
  /**
   * Resume execution
   */
  resume() {
    this.isPaused = false;
    this.executionContext = null;
  }
  /**
   * Step over to next line
   */
  stepOver() {
    this.resume();
  }
  /**
   * Step into function
   */
  stepInto() {
    this.resume();
  }
  /**
   * Step out of function
   */
  stepOut() {
    this.resume();
  }
  /**
   * Get current execution context
   */
  getExecutionContext() {
    return this.executionContext;
  }
  /**
   * Set pause callback
   */
  setPauseCallback(callback) {
    this.pauseCallback = callback;
  }
  /**
   * Evaluate expression in current context
   */
  async evaluateExpression(expression) {
    return `Evaluated: ${expression}`;
  }
}
const debuggerService = new DebuggerService();
const DebuggerPanel = ({ fileId, currentLine, onLineClick, onClose }) => {
  const [executionContext, setExecutionContext] = reactExports.useState(null);
  const [isPaused, setIsPaused] = reactExports.useState(false);
  const [expression, setExpression] = reactExports.useState("");
  const [evalResult, setEvalResult] = reactExports.useState("");
  reactExports.useEffect(() => {
    debuggerService.setPauseCallback(() => {
      const context = debuggerService.getExecutionContext();
      setExecutionContext(context);
      setIsPaused((context == null ? void 0 : context.status) === "paused");
    });
  }, []);
  const handleResume = () => {
    debuggerService.resume();
    setExecutionContext(null);
    setIsPaused(false);
  };
  const handleStepOver = () => {
    debuggerService.stepOver();
    setExecutionContext(null);
    setIsPaused(false);
  };
  const handleStepInto = () => {
    debuggerService.stepInto();
    setExecutionContext(null);
    setIsPaused(false);
  };
  const handleStepOut = () => {
    debuggerService.stepOut();
    setExecutionContext(null);
    setIsPaused(false);
  };
  const handleEvaluate = async () => {
    if (expression.trim()) {
      try {
        const result = await debuggerService.evaluateExpression(expression);
        setEvalResult(result);
      } catch (error) {
        setEvalResult(`Error: ${error.message}`);
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "debugger-panel", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "debugger-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Debugger" }),
      isPaused && executionContext && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "current-line", children: [
        "Paused at line ",
        executionContext.currentLine
      ] }),
      onClose && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, style: { marginLeft: "auto" }, children: "Close" })
    ] }),
    isPaused && executionContext ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "debugger-content", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "debugger-controls", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleResume, children: "Resume (F8)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleStepOver, children: "Step Over (F10)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleStepInto, children: "Step Into (F11)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleStepOut, children: "Step Out (Shift+F11)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "variables-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Variables" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "variables-list", children: executionContext.variables.map((variable) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "variable-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "variable-name", children: [
            variable.name,
            ":"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "variable-value", children: variable.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "variable-type", children: [
            "(",
            variable.type,
            ")"
          ] })
        ] }, variable.name)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "eval-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Evaluate Expression" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "eval-input", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: expression,
              onChange: (e) => setExpression(e.target.value),
              placeholder: "Enter expression to evaluate",
              onKeyDown: (e) => {
                if (e.key === "Enter") {
                  handleEvaluate();
                }
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleEvaluate, children: "Evaluate" })
        ] }),
        evalResult && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "eval-result", children: /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { children: evalResult }) })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "debugger-info", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Execution is running normally." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Click on line numbers in the editor to add breakpoints." })
    ] })
  ] });
};
const DebuggerUI = ({ onClose }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DebuggerPanel, { onClose });
};
const API_BASE_URL = "http://localhost:3000/api";
class ApiService {
  constructor(config) {
    __publicField(this, "config");
    __publicField(this, "tokens", null);
    __publicField(this, "messageHandlers", /* @__PURE__ */ new Map());
    this.config = {
      baseUrl: (config == null ? void 0 : config.baseUrl) || API_BASE_URL
    };
  }
  /**
   * Set authentication tokens
   */
  setTokens(accessToken, refreshToken) {
    this.tokens = { accessToken, refreshToken };
    chrome.storage.local.set({
      auth_tokens: { accessToken, refreshToken }
    }).catch(() => {
    });
  }
  /**
   * Load tokens from storage
   */
  async loadTokens() {
    try {
      const result = await chrome.storage.local.get(["auth_tokens"]);
      if (result.auth_tokens && result.auth_tokens.accessToken && result.auth_tokens.refreshToken) {
        this.tokens = result.auth_tokens;
      } else {
        this.tokens = null;
      }
    } catch (error) {
      console.error("Error loading tokens:", error);
      this.tokens = null;
    }
  }
  /**
   * Clear authentication tokens
   */
  clearTokens() {
    this.tokens = null;
    chrome.storage.local.remove(["auth_tokens"]).catch(() => {
    });
  }
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.tokens !== null && !!this.tokens.accessToken;
  }
  /**
   * Make an API request
   */
  async request(endpoint, options = {}) {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${this.config.baseUrl}${normalizedEndpoint}`;
    const headers = new Headers(options.headers || {});
    if (this.tokens && this.tokens.accessToken) {
      headers.set("Authorization", `Bearer ${this.tokens.accessToken}`);
    }
    headers.set("Content-Type", "application/json");
    const config = {
      ...options,
      headers
    };
    console.log("API Request:", { method: options.method || "GET", url, headers: Object.fromEntries(headers) });
    const response = await fetch(url, config);
    if (!response.ok) {
      if (response.status === 401) {
        this.clearTokens();
        throw new Error("Unauthorized");
      }
      let errorText;
      try {
        errorText = await response.text();
      } catch (textError) {
        errorText = response.statusText;
      }
      console.error("API Request Failed:", {
        url,
        method: options.method || "GET",
        status: response.status,
        statusText: response.statusText,
        errorText,
        headers: Object.fromEntries(response.headers)
      });
      throw new Error(`API request failed: ${errorText}`);
    }
    return response.json();
  }
  /**
   * User registration
   */
  async register(email, password, name) {
    const response = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name })
    });
    if (!response || !response.accessToken || !response.refreshToken) {
      throw new Error("Invalid registration response");
    }
    this.setTokens(response.accessToken, response.refreshToken);
    return response;
  }
  /**
   * User login
   */
  async login(email, password) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (!response || !response.accessToken || !response.refreshToken) {
      throw new Error("Invalid login response");
    }
    this.setTokens(response.accessToken, response.refreshToken);
    return response;
  }
  /**
   * Refresh access token
   */
  async refreshToken() {
    if (!this.tokens || !this.tokens.refreshToken) {
      throw new Error("No refresh token available");
    }
    const response = await this.request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: this.tokens.refreshToken })
    });
    if (!response || !response.accessToken) {
      throw new Error("Invalid refresh token response");
    }
    this.setTokens(response.accessToken, this.tokens.refreshToken);
    return { accessToken: response.accessToken, refreshToken: this.tokens.refreshToken };
  }
  /**
   * User logout
   */
  async logout() {
    if (this.tokens) {
      try {
        await this.request("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken: this.tokens.refreshToken })
        });
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
    this.clearTokens();
  }
  /**
   * Get user profile
   */
  async getProfile() {
    return this.request("/users/profile");
  }
  /**
   * Get all scripts
   */
  async getScripts() {
    const response = await this.request("/scripts");
    return response.data || [];
  }
  /**
   * Get a specific script
   */
  async getScript(id) {
    const response = await this.request(`/scripts/${id}`);
    return response.data;
  }
  /**
   * Create a new script
   */
  async createScript(name, code, language, description) {
    const response = await this.request("/scripts", {
      method: "POST",
      body: JSON.stringify({ name, code, language, description })
    });
    return response.data;
  }
  /**
   * Update a script
   */
  async updateScript(id, name, code, language, description) {
    const response = await this.request(`/scripts/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, code, language, description })
    });
    return response.data;
  }
  /**
   * Delete a script
   */
  async deleteScript(id) {
    await this.request(`/scripts/${id}`, {
      method: "DELETE"
    });
  }
  /**
   * Start a new test run
   */
  async startTestRun(scriptId, dataFileId, environment, browser) {
    const response = await this.request("/test-runs/start", {
      method: "POST",
      body: JSON.stringify({ scriptId, dataFileId, environment, browser })
    });
    return response.data;
  }
  /**
   * Stop a test run
   */
  async stopTestRun(testRunId) {
    const response = await this.request(`/test-runs/${testRunId}/stop`, {
      method: "POST"
    });
    return response.data;
  }
  /**
   * Update test run with status and steps
   */
  async updateTestRun(testRunId, data) {
    const response = await this.request(`/test-runs/${testRunId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
    return response.data;
  }
  /**
   * Get all test runs
   */
  async getTestRuns() {
    const response = await this.request("/test-runs");
    return response.data || [];
  }
  /**
   * Get a specific test run
   */
  async getTestRun(id) {
    const response = await this.request(`/test-runs/${id}`);
    return response.data;
  }
  /**
   * Get active test runs
   */
  async getActiveTestRuns() {
    const response = await this.request("/test-runs/active");
    return response.data || [];
  }
  /**
   * Connect to WebSocket
   */
  // Deleted:connectWebSocket(): void {
  // Deleted:  if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
  // Deleted:    return;
  // Deleted:  }
  // Deleted:
  // Deleted:  this.websocket = new WebSocket(this.config.wsUrl);
  // Deleted:
  // Deleted:  this.websocket.onopen = () => {
  // Deleted:    console.log('WebSocket connected');
  // Deleted:    if (this.tokens && this.tokens.accessToken) {
  // Deleted:      this.sendMessage('auth', { token: this.tokens.accessToken });
  // Deleted:    }
  // Deleted:  };
  // Deleted:
  // Deleted:  this.websocket.onmessage = (event) => {
  // Deleted:    try {
  // Deleted:      const message = JSON.parse(event.data);
  // Deleted:      const handler = this.messageHandlers.get(message.type);
  // Deleted:      if (handler) {
  // Deleted:        handler(message.data);
  // Deleted:      }
  // Deleted:    } catch (error) {
  // Deleted:      console.error('Error parsing WebSocket message:', error);
  // Deleted:    }
  // Deleted:  };
  // Deleted:
  // Deleted:  this.websocket.onclose = () => {
  // Deleted:    console.log('WebSocket disconnected');
  // Deleted:  };
  // Deleted:
  // Deleted:  this.websocket.onerror = (error) => {
  // Deleted:    console.error('WebSocket error:', error);
  // Deleted:  };
  // Deleted:}
  /**
   * Send message through WebSocket
   */
  // Deleted:sendMessage(type: string, data: any): void {
  // Deleted:  if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
  // Deleted:    this.websocket.send(JSON.stringify({ type, data }));
  // Deleted:  }
  // Deleted:}
  /**
   * Add message handler (no-op without WebSocket)
   */
  addMessageHandler(type, handler) {
    this.messageHandlers.set(type, handler);
  }
  /**
   * Remove message handler (no-op without WebSocket)
   */
  removeMessageHandler(type) {
    this.messageHandlers.delete(type);
  }
  /**
   * Disconnect WebSocket (no-op)
   */
  disconnect() {
  }
}
const apiService = new ApiService();
class TestExecutor {
  constructor() {
    __publicField(this, "activeRuns", /* @__PURE__ */ new Map());
    __publicField(this, "progressCallbacks", /* @__PURE__ */ new Map());
    __publicField(this, "logCallbacks", /* @__PURE__ */ new Map());
  }
  /**
   * Execute a test script
   */
  async executeTest(scriptId) {
    const testRun = {
      id: Math.random().toString(36).substr(2, 9),
      scriptId,
      status: "pending",
      startTime: /* @__PURE__ */ new Date(),
      logs: []
    };
    this.activeRuns.set(testRun.id, testRun);
    try {
      this.notifyProgress(testRun.id, {
        status: "starting",
        message: "Starting test execution..."
      });
      const backendTestRun = await apiService.startTestRun(scriptId);
      testRun.id = backendTestRun.id;
      testRun.status = "running";
      this.activeRuns.set(testRun.id, testRun);
      this.dispatchTestStarted(testRun);
      this.addLog(testRun.id, `Test execution started for script: ${scriptId}`);
      this.notifyProgress(testRun.id, {
        status: "running",
        message: "Test is running..."
      });
      this.pollTestRunStatus(testRun.id);
      return testRun;
    } catch (error) {
      console.error("Error executing test:", error);
      testRun.status = "failed";
      testRun.endTime = /* @__PURE__ */ new Date();
      this.activeRuns.set(testRun.id, testRun);
      this.notifyProgress(testRun.id, {
        status: "failed",
        error: (error == null ? void 0 : error.message) || "Failed to start test execution"
      });
      throw error;
    }
  }
  /**
   * Execute a test with data-driven approach
   */
  async executeDataDrivenTest(scriptId, dataFileId) {
    const testRun = {
      id: Math.random().toString(36).substr(2, 9),
      scriptId,
      status: "pending",
      startTime: /* @__PURE__ */ new Date(),
      logs: []
    };
    this.activeRuns.set(testRun.id, testRun);
    try {
      this.notifyProgress(testRun.id, {
        status: "starting",
        message: "Starting data-driven test execution..."
      });
      const backendTestRun = await apiService.startTestRun(scriptId, dataFileId);
      testRun.id = backendTestRun.id;
      testRun.status = "running";
      this.activeRuns.set(testRun.id, testRun);
      this.dispatchTestStarted(testRun);
      this.addLog(testRun.id, `Data-driven test execution started for script: ${scriptId}`);
      this.addLog(testRun.id, `Using data file: ${dataFileId}`);
      this.notifyProgress(testRun.id, {
        status: "running",
        message: "Data-driven test is running..."
      });
      this.pollTestRunStatus(testRun.id);
      return testRun;
    } catch (error) {
      console.error("Error executing data-driven test:", error);
      testRun.status = "failed";
      testRun.endTime = /* @__PURE__ */ new Date();
      this.activeRuns.set(testRun.id, testRun);
      this.notifyProgress(testRun.id, {
        status: "failed",
        error: (error == null ? void 0 : error.message) || "Failed to start data-driven test execution"
      });
      throw error;
    }
  }
  /**
   * Get test run status
   */
  getTestRun(testRunId) {
    return this.activeRuns.get(testRunId);
  }
  /**
   * Dispatch test started event
   */
  dispatchTestStarted(testRun) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("testExecutionStarted", {
        detail: { testExecution: testRun }
      }));
    }
  }
  /**
   * Dispatch test completed event
   */
  dispatchTestCompleted(testRun) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("testExecutionCompleted", {
        detail: { testExecution: testRun }
      }));
    }
  }
  /**
   * Poll test run status from backend
   */
  async pollTestRunStatus(testRunId) {
    const pollInterval = 2e3;
    const maxPolls = 150;
    let pollCount = 0;
    const poll = async () => {
      try {
        const testRun = this.activeRuns.get(testRunId);
        if (!testRun) return;
        const backendTestRun = await apiService.getTestRun(testRunId);
        if (backendTestRun.errorMsg) {
          this.addLog(testRunId, `Error: ${backendTestRun.errorMsg}`);
        }
        if (backendTestRun.status === "completed" || backendTestRun.status === "passed") {
          testRun.status = "passed";
          testRun.endTime = /* @__PURE__ */ new Date();
          this.activeRuns.set(testRunId, testRun);
          this.addLog(testRunId, "Test execution completed successfully");
          this.notifyProgress(testRunId, {
            status: "completed",
            message: "Test execution completed successfully"
          });
          this.dispatchTestCompleted(testRun);
          return;
        }
        if (backendTestRun.status === "failed" || backendTestRun.status === "error") {
          testRun.status = "failed";
          testRun.endTime = /* @__PURE__ */ new Date();
          this.activeRuns.set(testRunId, testRun);
          if (backendTestRun.errorMsg && backendTestRun.errorMsg.includes("locator")) {
            this.dispatchLocatorFailure(testRunId, backendTestRun.errorMsg);
          }
          this.notifyProgress(testRunId, {
            status: "failed",
            error: backendTestRun.errorMsg || "Test execution failed"
          });
          this.dispatchTestCompleted(testRun);
          return;
        }
        if (pollCount < maxPolls && (backendTestRun.status === "running" || backendTestRun.status === "queued")) {
          pollCount++;
          setTimeout(poll, pollInterval);
        } else if (pollCount >= maxPolls) {
          testRun.status = "failed";
          testRun.endTime = /* @__PURE__ */ new Date();
          this.activeRuns.set(testRunId, testRun);
          this.notifyProgress(testRunId, {
            status: "failed",
            error: "Test execution timeout"
          });
        }
      } catch (error) {
        console.error("Error polling test run status:", error);
        const testRun = this.activeRuns.get(testRunId);
        if (testRun) {
          testRun.status = "failed";
          testRun.endTime = /* @__PURE__ */ new Date();
          this.activeRuns.set(testRunId, testRun);
          this.notifyProgress(testRunId, {
            status: "failed",
            error: "Failed to get test status"
          });
        }
      }
    };
    setTimeout(poll, pollInterval);
  }
  /**
   * Add log to test run
   */
  addLog(testRunId, log) {
    const testRun = this.activeRuns.get(testRunId);
    if (testRun) {
      testRun.logs.push(log);
      const logCallback = this.logCallbacks.get(testRunId);
      if (logCallback) {
        logCallback(log);
      }
    }
  }
  /**
   * Cancel a test run
   */
  async cancelTestRun(testRunId) {
    const testRun = this.activeRuns.get(testRunId);
    if (!testRun) {
      throw new Error("Test run not found");
    }
    try {
      await apiService.stopTestRun(testRunId);
      testRun.status = "failed";
      testRun.endTime = /* @__PURE__ */ new Date();
      this.activeRuns.set(testRunId, testRun);
      this.addLog(testRunId, "Test execution cancelled by user");
      this.notifyProgress(testRunId, {
        status: "failed",
        message: "Test execution cancelled"
      });
    } catch (error) {
      console.error("Error cancelling test run:", error);
      throw error;
    }
  }
  /**
   * Add progress callback
   */
  addProgressCallback(testRunId, callback) {
    this.progressCallbacks.set(testRunId, callback);
  }
  /**
   * Remove progress callback
   */
  removeProgressCallback(testRunId) {
    this.progressCallbacks.delete(testRunId);
  }
  /**
   * Add log callback
   */
  addLogCallback(testRunId, callback) {
    this.logCallbacks.set(testRunId, callback);
  }
  /**
   * Remove log callback
   */
  removeLogCallback(testRunId) {
    this.logCallbacks.delete(testRunId);
  }
  /**
   * Notify progress callback
   */
  notifyProgress(testRunId, progress) {
    const callback = this.progressCallbacks.get(testRunId);
    if (callback) {
      callback(progress);
    }
  }
  /**
   * Dispatch locator failure event for self-healing
   */
  dispatchLocatorFailure(testRunId, errorMsg) {
    if (typeof window === "undefined") return;
    const locatorMatch = errorMsg.match(/locator[:\s]+['"](.*?)['"]/i) || errorMsg.match(/selector[:\s]+['"](.*?)['"]/i) || errorMsg.match(/element[:\s]+['"](.*?)['"]/i);
    const locator = locatorMatch ? locatorMatch[1] : "unknown";
    window.dispatchEvent(new CustomEvent("locatorFailed", {
      detail: {
        testId: testRunId,
        step: 0,
        locator,
        error: errorMsg
      }
    }));
  }
  /**
   * Get execution history
   */
  getExecutionHistory() {
    return Array.from(this.activeRuns.values());
  }
}
const testExecutor = new TestExecutor();
const TestExecutorPanel = ({ scriptId, onDataDrivenExecution, onClose }) => {
  const [testRuns, setTestRuns] = reactExports.useState([]);
  const [selectedDataFile, setSelectedDataFile] = reactExports.useState("");
  const [dataFiles, setDataFiles] = reactExports.useState([]);
  const [isExecuting, setIsExecuting] = reactExports.useState(false);
  const [progress, setProgress] = reactExports.useState(null);
  const [logs, setLogs] = reactExports.useState([]);
  const [activeTestRunId, setActiveTestRunId] = reactExports.useState(null);
  const [savedScripts, setSavedScripts] = reactExports.useState([]);
  const [selectedScript, setSelectedScript] = reactExports.useState(null);
  const [showScriptLibrary, setShowScriptLibrary] = reactExports.useState(false);
  const [isLoadingScripts, setIsLoadingScripts] = reactExports.useState(false);
  const [scriptError, setScriptError] = reactExports.useState("");
  const loadSavedScripts = reactExports.useCallback(async () => {
    setIsLoadingScripts(true);
    setScriptError("");
    try {
      console.log("Loading saved scripts from API...");
      const scripts = await apiService.getScripts();
      console.log("Scripts loaded:", scripts.length);
      setSavedScripts(scripts);
      if (scripts.length === 0) {
        setScriptError('No scripts found. Save a script using "Save DB" button.');
      }
    } catch (error) {
      console.error("Error loading scripts:", error);
      setScriptError((error == null ? void 0 : error.message) || "Failed to load saved scripts. Make sure you are logged in.");
    } finally {
      setIsLoadingScripts(false);
    }
  }, []);
  reactExports.useEffect(() => {
    const loadData = async () => {
      await loaddataFiles();
      await loadSavedScripts();
    };
    loadData();
    realDataIntegration.startListening();
    console.log("✅ Self-healing integration started");
    return () => {
      realDataIntegration.stopListening();
      console.log("🛑 Self-healing integration stopped");
    };
  }, [loadSavedScripts]);
  const loaddataFiles = async () => {
    try {
      const files = await ddtService.getDataFiles();
      setDataFiles(files);
    } catch (error) {
    }
  };
  const handleScriptSelect = async (script) => {
    setSelectedScript(script);
    setShowScriptLibrary(false);
  };
  const handleExecuteSavedScript = async () => {
    if (!selectedScript)
      return;
    if (isExecuting)
      return;
    setIsExecuting(true);
    setProgress(null);
    setLogs([]);
    try {
      const testRun = await testExecutor.executeTest(selectedScript.id);
      setActiveTestRunId(testRun.id);
      testExecutor.addProgressCallback(testRun.id, (progress2) => {
        setProgress(progress2);
      });
      testExecutor.addLogCallback(testRun.id, (log) => {
        setLogs((prev) => [...prev, log]);
      });
      setTestRuns((prev) => [testRun, ...prev]);
    } catch (error) {
      setProgress({
        status: "failed",
        error: (error == null ? void 0 : error.message) || "Execution failed"
      });
    } finally {
      setIsExecuting(false);
    }
  };
  const handleExecute = async () => {
    if (isExecuting || !scriptId)
      return;
    setIsExecuting(true);
    setProgress(null);
    setLogs([]);
    try {
      const testRun = await testExecutor.executeTest(scriptId);
      setActiveTestRunId(testRun.id);
      testExecutor.addProgressCallback(testRun.id, (progress2) => {
        setProgress(progress2);
      });
      testExecutor.addLogCallback(testRun.id, (log) => {
        setLogs((prev) => [...prev, log]);
      });
      setTestRuns((prev) => [testRun, ...prev]);
    } catch (error) {
      setProgress({
        status: "failed",
        error: (error == null ? void 0 : error.message) || "Execution failed"
      });
    } finally {
      setIsExecuting(false);
    }
  };
  const handleDataDrivenExecute = async () => {
    if (isExecuting || !selectedDataFile || !scriptId)
      return;
    setIsExecuting(true);
    setProgress(null);
    setLogs([]);
    try {
      const testRun = await testExecutor.executeDataDrivenTest(scriptId, selectedDataFile);
      setActiveTestRunId(testRun.id);
      testExecutor.addProgressCallback(testRun.id, (progress2) => {
        setProgress(progress2);
      });
      testExecutor.addLogCallback(testRun.id, (log) => {
        setLogs((prev) => [...prev, log]);
      });
      setTestRuns((prev) => [testRun, ...prev]);
      if (onDataDrivenExecution)
        onDataDrivenExecution(testRun.id);
    } catch (error) {
      setProgress({
        status: "failed",
        error: (error == null ? void 0 : error.message) || "Execution failed"
      });
    } finally {
      setIsExecuting(false);
    }
  };
  const handleCancel = async () => {
    if (!activeTestRunId)
      return;
    try {
      await testExecutor.cancelTestRun(activeTestRunId);
    } catch (error) {
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "passed":
        return "green";
      case "failed":
        return "red";
      case "running":
        return "blue";
      default:
        return "gray";
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "test-executor-panel", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "executor-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Test Execution" }),
      onClose && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, style: { marginLeft: "auto" }, children: "Close" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "execution-controls", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "saved-scripts-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setShowScriptLibrary(true);
              loadSavedScripts();
            },
            className: "script-library-btn",
            disabled: isExecuting,
            children: [
              "📚 Script Library (",
              savedScripts.length,
              ")"
            ]
          }
        ),
        selectedScript && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "selected-script-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "script-name", children: [
            "✅ ",
            selectedScript.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "script-language", children: [
            "(",
            selectedScript.language,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleExecuteSavedScript,
              disabled: isExecuting,
              className: "execute-btn",
              children: isExecuting ? "Executing..." : "▶️ Run Selected"
            }
          )
        ] })
      ] }),
      showScriptLibrary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "script-library-modal", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Saved Scripts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowScriptLibrary(false), children: "✕" })
        ] }),
        scriptError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-message", children: scriptError }),
        isLoadingScripts ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading", children: "Loading scripts..." }) : savedScripts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No saved scripts found." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Save your recorded scripts using the API service." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "scripts-list", children: savedScripts.map((script) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `script-item ${(selectedScript == null ? void 0 : selectedScript.id) === script.id ? "selected" : ""}`,
            onClick: () => handleScriptSelect(script),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "script-header", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "script-name", children: script.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "script-language", children: script.language })
              ] }),
              script.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "script-description", children: script.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "script-meta", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Created: ",
                  new Date(script.createdAt).toLocaleDateString()
                ] }),
                script.project && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Project: ",
                  script.project.name
                ] })
              ] })
            ]
          },
          script.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: loadSavedScripts, disabled: isLoadingScripts, children: "🔄 Refresh" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divider", children: "OR" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleExecute,
          disabled: isExecuting || !scriptId,
          className: "execute-btn",
          title: "Execute the currently recorded script",
          children: isExecuting ? "Executing..." : "▶️ Execute Current Script"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "data-driven-controls", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: selectedDataFile,
            onChange: (e) => setSelectedDataFile(e.target.value),
            disabled: isExecuting,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select data file for DDT" }),
              dataFiles.map((file) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: file.id, children: [
                file.name,
                " (",
                file.rowCount,
                " rows)"
              ] }, file.id))
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleDataDrivenExecute,
            disabled: isExecuting || !selectedDataFile,
            className: "ddt-execute-btn",
            children: isExecuting ? "Executing..." : "Execute with Data"
          }
        )
      ] }),
      activeTestRunId && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleCancel,
          disabled: !isExecuting,
          className: "cancel-btn",
          children: "Cancel"
        }
      )
    ] }),
    progress && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "execution-progress", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-status", children: [
        "Status: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: progress.status === "completed" ? "green" : progress.status === "failed" ? "red" : "blue" }, children: progress.status })
      ] }),
      progress.message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-message", children: progress.message }),
      progress.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-error", children: [
        "Error: ",
        progress.error
      ] })
    ] }),
    logs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "execution-logs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Execution Logs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "logs-container", children: logs.map((log, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "log-entry", children: log }, index)) })
    ] }),
    testRuns.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "execution-history", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Execution History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "history-list", children: testRuns.map((run) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "run-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "run-id", children: [
            "#",
            run.id.substring(0, 6)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "run-status", style: { color: getStatusColor(run.status) }, children: run.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "run-time", children: run.startTime.toLocaleTimeString() })
        ] }),
        run.logs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "run-logs-preview", children: run.logs.slice(-2).join("\n") })
      ] }, run.id)) })
    ] })
  ] });
};
const TestExecutorUI = ({ onClose, script, scriptName }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TestExecutorPanel, { scriptId: scriptName || "current", onClose });
};
const ApiTestingUI = ({ onClose }) => {
  const [activeTab, setActiveTab] = reactExports.useState("recorder");
  const [capturedRequests, setCapturedRequests] = reactExports.useState([]);
  const [testCases, setTestCases] = reactExports.useState([]);
  const [selectedRequest, setSelectedRequest] = reactExports.useState(null);
  const [selectedTestCase, setSelectedTestCase] = reactExports.useState(null);
  const [isRecording, setIsRecording] = reactExports.useState(false);
  const [mocks, setMocks] = reactExports.useState([]);
  const [benchmarks, setBenchmarks] = reactExports.useState([]);
  const [showNewTest, setShowNewTest] = reactExports.useState(false);
  const [showNewMock, setShowNewMock] = reactExports.useState(false);
  const [showNewBenchmark, setShowNewBenchmark] = reactExports.useState(false);
  reactExports.useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      if (isRecording) {
        loadData();
      }
    }, 1e3);
    return () => clearInterval(interval);
  }, [isRecording]);
  const loadData = () => {
    setCapturedRequests(apiTestingService.getCapturedRequests());
    setTestCases(apiTestingService.getTestCases());
    setMocks(apiTestingService.getMocks());
    setBenchmarks(apiTestingService.getBenchmarks());
  };
  const handleStartRecording = () => {
    apiTestingService.clearCapturedRequests();
    setCapturedRequests([]);
    setIsRecording(true);
    chrome.runtime.sendMessage({ type: "startApiRecording" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Runtime error:", chrome.runtime.lastError);
        const errorMsg = chrome.runtime.lastError.message || "";
        let userMessage = "❌ Failed to start recording: " + errorMsg;
        if (errorMsg.includes("already attached") || errorMsg.includes("Another debugger")) {
          userMessage = "❌ Another debugger is already attached\n\nSolutions:\n1. Close Chrome DevTools (F12) on the target tab\n2. Close any other debugging tools\n3. Refresh the page and try again\n4. Restart Chrome if issue persists";
        } else {
          userMessage += "\n\nTips:\n- Make sure Playwright is attached to a tab\n- Try refreshing the target page\n- Check browser console for details";
        }
        alert(userMessage);
        setIsRecording(false);
      } else if (!(response == null ? void 0 : response.success)) {
        console.error("Recording failed:", response == null ? void 0 : response.error);
        let userMessage = "❌ Failed to start recording";
        if (response == null ? void 0 : response.error) {
          userMessage += ": " + response.error;
          if (response.error.includes("already attached") || response.error.includes("Another debugger")) {
            userMessage = "❌ Cannot attach debugger\n\nAnother debugger is already connected to this tab.\n\nPlease:\n✓ Close Chrome DevTools (press F12 to toggle)\n✓ Close any other debugging/inspection tools\n✓ Refresh the page\n✓ Try recording again";
          }
        }
        alert(userMessage);
        setIsRecording(false);
      } else {
        console.log("✅ API Recording started successfully");
      }
    });
  };
  const handleStopRecording = () => {
    chrome.runtime.sendMessage({ type: "stopApiRecording" }, () => {
      setIsRecording(false);
      loadData();
    });
  };
  const handleCreateTestFromRequest = (requestId) => {
    const name = prompt("Enter test case name:");
    if (!name) return;
    const testCase = apiTestingService.createTestCaseFromRequest(requestId, name);
    if (testCase) {
      loadData();
      setActiveTab("tests");
      alert("Test case created successfully!");
    } else {
      alert("Failed to create test case. Request not found.");
    }
  };
  const handleExecuteTest = async (testId) => {
    try {
      await apiTestingService.executeTestCase(testId);
      loadData();
      alert("Test executed successfully!");
    } catch (error) {
      alert(`Test execution failed: ${(error == null ? void 0 : error.message) || error}`);
    }
  };
  const handleDeleteTest = (testId) => {
    if (confirm("Are you sure you want to delete this test case?")) {
      apiTestingService.deleteTestCase(testId);
      loadData();
    }
  };
  const handleToggleMock = (mockId) => {
    const mock = mocks.find((m) => m.id === mockId);
    if (mock) {
      apiTestingService.updateMock(mockId, { enabled: !mock.enabled });
      loadData();
    }
  };
  const handleRunBenchmark = async (benchmarkId) => {
    try {
      await apiTestingService.runBenchmark(benchmarkId, 10);
      loadData();
    } catch (error) {
      alert(`Benchmark failed: ${error}`);
    }
  };
  const addDemoData = () => {
    const demoRequest = {
      id: `demo-req-${Date.now()}`,
      method: "GET",
      url: "https://jsonplaceholder.typicode.com/posts/1",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      timestamp: Date.now()
    };
    const demoResponse = {
      id: `demo-resp-${Date.now()}`,
      requestId: demoRequest.id,
      status: 200,
      statusText: "OK",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        userId: 1,
        id: 1,
        title: "Demo Post",
        body: "This is a demo response"
      }, null, 2),
      responseTime: 125,
      timestamp: Date.now()
    };
    apiTestingService.captureRequest(demoRequest);
    apiTestingService.captureResponse(demoResponse);
    loadData();
    alert("Demo data added! Switch to Recorder tab to see it.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "api-testing-panel", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "api-testing-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "🔌 API Testing Suite" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "10px", alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "demo-button", onClick: addDemoData, title: "Add sample data for testing", children: "+ Demo Data" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-button", onClick: onClose, children: "✕" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "api-testing-tabs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: activeTab === "recorder" ? "active" : "",
          onClick: () => setActiveTab("recorder"),
          children: "📡 Recorder"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: activeTab === "tests" ? "active" : "",
          onClick: () => setActiveTab("tests"),
          children: [
            "✅ Tests (",
            testCases.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: activeTab === "mocks" ? "active" : "",
          onClick: () => setActiveTab("mocks"),
          children: [
            "🎭 Mocks (",
            mocks.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: activeTab === "benchmark" ? "active" : "",
          onClick: () => setActiveTab("benchmark"),
          children: "⚡ Benchmark"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: activeTab === "contracts" ? "active" : "",
          onClick: () => setActiveTab("contracts"),
          children: "📋 Contracts"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "api-testing-content", children: [
      activeTab === "recorder" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        RecorderTab,
        {
          isRecording,
          capturedRequests,
          selectedRequest,
          onStartRecording: handleStartRecording,
          onStopRecording: handleStopRecording,
          onSelectRequest: setSelectedRequest,
          onCreateTest: handleCreateTestFromRequest
        }
      ),
      activeTab === "tests" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        TestsTab,
        {
          testCases,
          selectedTestCase,
          onSelectTestCase: setSelectedTestCase,
          onExecuteTest: handleExecuteTest,
          onDeleteTest: handleDeleteTest,
          onNewTest: () => setShowNewTest(true)
        }
      ),
      activeTab === "mocks" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MocksTab,
        {
          mocks,
          onToggleMock: handleToggleMock,
          onNewMock: () => setShowNewMock(true)
        }
      ),
      activeTab === "benchmark" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        BenchmarkTab,
        {
          benchmarks,
          onRunBenchmark: handleRunBenchmark,
          onNewBenchmark: () => setShowNewBenchmark(true)
        }
      ),
      activeTab === "contracts" && /* @__PURE__ */ jsxRuntimeExports.jsx(ContractsTab, {})
    ] })
  ] });
};
const RecorderTab = ({ isRecording, capturedRequests, selectedRequest, onStartRecording, onStopRecording, onSelectRequest, onCreateTest }) => {
  const selected = capturedRequests.find((r) => r.request.id === selectedRequest);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recorder-tab", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recorder-controls", children: [
      !isRecording ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "primary-button", onClick: onStartRecording, children: "▶️ Start Recording" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "danger-button", onClick: onStopRecording, children: "⏹️ Stop Recording" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "recording-status", children: isRecording ? "🔴 Recording..." : "⚫ Not Recording" }),
      isRecording && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "recording-hint", style: { fontSize: "11px", opacity: 0.7, marginLeft: "10px" }, children: "💡 Browse your app to capture API calls" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "captured-requests", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { children: [
        "Captured Requests (",
        capturedRequests.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "request-list", children: [
        capturedRequests.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "empty-state", style: { padding: "30px 20px" }, children: isRecording ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "🔍 Listening for API requests..." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "12px", opacity: 0.7 }, children: "Navigate your app to capture network traffic" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "📡 No requests captured yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "12px", opacity: 0.7 }, children: 'Click "Start Recording" and browse your app' })
        ] }) }),
        capturedRequests.map(({ request, response }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `request-item ${selectedRequest === request.id ? "selected" : ""}`,
            onClick: () => onSelectRequest(request.id),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "request-method-badge", "data-method": request.method, children: request.method }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "request-url", children: request.url }),
              response && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `status-badge status-${Math.floor(response.status / 100)}xx`, children: response.status }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "create-test-button",
                  onClick: (e) => {
                    e.stopPropagation();
                    onCreateTest(request.id);
                  },
                  children: "+ Test"
                }
              )
            ]
          },
          request.id
        ))
      ] })
    ] }),
    selected && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "request-details", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Request Details" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Request" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "URL:" }),
          " ",
          selected.request.url
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Method:" }),
          " ",
          selected.request.method
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Headers:" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { children: JSON.stringify(selected.request.headers, null, 2) }),
        selected.request.body && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Body:" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { children: selected.request.body })
        ] })
      ] }),
      selected.response && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "detail-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Response" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Status:" }),
          " ",
          selected.response.status,
          " ",
          selected.response.statusText
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Response Time:" }),
          " ",
          selected.response.responseTime,
          "ms"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Headers:" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { children: JSON.stringify(selected.response.headers, null, 2) }),
        selected.response.body && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Body:" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "response-body", children: selected.response.body })
        ] })
      ] })
    ] })
  ] });
};
const TestsTab = ({ testCases, selectedTestCase, onSelectTestCase, onExecuteTest, onDeleteTest, onNewTest }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tests-tab", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tests-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "API Test Cases" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "primary-button", onClick: onNewTest, children: "+ New Test" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "test-list", children: testCases.map((test) => {
      const allPassed = test.assertions.every((a) => a.passed);
      const hasFailed = test.assertions.some((a) => a.passed === false);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `test-item ${(selectedTestCase == null ? void 0 : selectedTestCase.id) === test.id ? "selected" : ""}`,
          onClick: () => onSelectTestCase(test),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "test-info", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "test-name", children: test.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "test-meta", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "request-method-badge", "data-method": test.request.method, children: test.request.method }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "test-url", children: test.request.url })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "test-actions", children: [
              test.response && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `test-status ${allPassed ? "passed" : hasFailed ? "failed" : "pending"}`, children: allPassed ? "✅" : hasFailed ? "❌" : "⏳" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                e.stopPropagation();
                onExecuteTest(test.id);
              }, children: "▶️ Run" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                e.stopPropagation();
                onDeleteTest(test.id);
              }, children: "🗑️" })
            ] })
          ]
        },
        test.id
      );
    }) }),
    selectedTestCase && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "test-details", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: selectedTestCase.name }),
      selectedTestCase.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: selectedTestCase.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "assertions-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { children: [
          "Assertions (",
          selectedTestCase.assertions.length,
          ")"
        ] }),
        selectedTestCase.assertions.map((assertion) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `assertion-item ${assertion.passed ? "passed" : "failed"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "assertion-icon", children: assertion.passed ? "✅" : assertion.passed === false ? "❌" : "⏳" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "assertion-details", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "assertion-type", children: assertion.type }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "assertion-message", children: assertion.message }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "assertion-values", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Expected: ",
                JSON.stringify(assertion.expected)
              ] }),
              assertion.actual !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Actual: ",
                JSON.stringify(assertion.actual)
              ] })
            ] })
          ] })
        ] }, assertion.id))
      ] }),
      selectedTestCase.response && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "response-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Last Response" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Status:" }),
          " ",
          selectedTestCase.response.status
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Time:" }),
          " ",
          selectedTestCase.response.responseTime,
          "ms"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "response-body", children: selectedTestCase.response.body })
      ] })
    ] })
  ] });
};
const MocksTab = ({ mocks, onToggleMock, onNewMock }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mocks-tab", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mocks-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "API Mocks" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "primary-button", onClick: onNewMock, children: "+ New Mock" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mock-list", children: mocks.map((mock) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mock-item ${mock.enabled ? "enabled" : "disabled"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mock-info", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mock-name", children: mock.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mock-pattern", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "request-method-badge", "data-method": mock.method, children: mock.method }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: mock.pattern })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mock-response", children: [
          "Status: ",
          mock.response.status,
          mock.response.delay && ` | Delay: ${mock.response.delay}ms`
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mock-actions", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "toggle-switch", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            checked: mock.enabled,
            onChange: () => onToggleMock(mock.id)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "slider" })
      ] }) })
    ] }, mock.id)) }),
    mocks.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No mocks configured" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Create a mock to intercept and stub API responses" })
    ] })
  ] });
};
const BenchmarkTab = ({ benchmarks, onRunBenchmark, onNewBenchmark }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "benchmark-tab", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "benchmark-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Performance Benchmarks" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "primary-button", onClick: onNewBenchmark, children: "+ New Benchmark" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "benchmark-list", children: benchmarks.map((benchmark) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "benchmark-item", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "benchmark-info", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "benchmark-name", children: benchmark.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "benchmark-endpoint", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "request-method-badge", "data-method": benchmark.method, children: benchmark.method }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: benchmark.endpoint })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "benchmark-target", children: [
          "Target: ",
          benchmark.targetResponseTime,
          "ms"
        ] }),
        benchmark.avgResponseTime !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "benchmark-stats", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Avg:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: benchmark.avgResponseTime <= benchmark.targetResponseTime ? "good" : "bad", children: [
              benchmark.avgResponseTime.toFixed(2),
              "ms"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "P50:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              benchmark.p50,
              "ms"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "P95:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              benchmark.p95,
              "ms"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "P99:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              benchmark.p99,
              "ms"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Min:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              benchmark.minResponseTime,
              "ms"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Max:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              benchmark.maxResponseTime,
              "ms"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "benchmark-actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onRunBenchmark(benchmark.id), children: "▶️ Run" }) })
    ] }, benchmark.id)) }),
    benchmarks.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No benchmarks configured" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Create a benchmark to measure API performance" })
    ] })
  ] });
};
const ContractsTab = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "contracts-tab", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "contracts-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Contract Testing" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "primary-button", children: "+ New Contract" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "empty-state", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Contract testing coming soon" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Define and validate API contracts between providers and consumers" })
    ] })
  ] });
};
function setElementPicked(elementInfo, userGesture) {
  window.playwrightElementPicked(elementInfo, userGesture);
}
function setRunningFileId(fileId) {
  window.playwrightSetRunningFile(fileId);
}
function download(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}
function generateDatetimeSuffix() {
  return (/* @__PURE__ */ new Date()).toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
}
const codegenFilenames = {
  "javascript": "example.js",
  "playwright-test": "example.spec.ts",
  "java-junit": "TestExample.java",
  "java": "Example.java",
  "python-pytest": "test_example.py",
  "python": "example.py",
  "python-async": "example.py",
  "csharp-mstest": "Tests.cs",
  "csharp-nunit": "Tests.cs",
  "csharp": "Example.cs"
};
const CrxRecorder = ({}) => {
  const [settings2, setSettings] = reactExports.useState(defaultSettings);
  const [sources, setSources] = reactExports.useState([]);
  const [paused, setPaused] = reactExports.useState(false);
  const [log, setLog] = reactExports.useState(/* @__PURE__ */ new Map());
  const [mode, setMode] = reactExports.useState("none");
  const [selectedFileId, setSelectedFileId] = reactExports.useState(defaultSettings.targetLanguage);
  const [showSelfHealing, setShowSelfHealing] = reactExports.useState(false);
  const [showAISelfHealing, setShowAISelfHealing] = reactExports.useState(false);
  const [showDDT, setShowDDT] = reactExports.useState(false);
  const [showDebugger, setShowDebugger] = reactExports.useState(false);
  const [showTestExecutor, setShowTestExecutor] = reactExports.useState(false);
  const [showApiTesting, setShowApiTesting] = reactExports.useState(false);
  const [showSaveModal, setShowSaveModal] = reactExports.useState(false);
  const [scriptName, setScriptName] = reactExports.useState("");
  const [scriptDescription, setScriptDescription] = reactExports.useState("");
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [saveError, setSaveError] = reactExports.useState("");
  const [saveSuccess, setSaveSuccess] = reactExports.useState(false);
  const [isAuthenticated, setIsAuthenticated] = reactExports.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = reactExports.useState(true);
  const [showLoginForm, setShowLoginForm] = reactExports.useState(false);
  const [loginEmail, setLoginEmail] = reactExports.useState("");
  const [loginPassword, setLoginPassword] = reactExports.useState("");
  const [isLoggingIn, setIsLoggingIn] = reactExports.useState(false);
  const [loginError, setLoginError] = reactExports.useState("");
  const [userEmail, setUserEmail] = reactExports.useState("");
  const [showRegisterForm, setShowRegisterForm] = reactExports.useState(false);
  const [registerEmail, setRegisterEmail] = reactExports.useState("");
  const [registerPassword, setRegisterPassword] = reactExports.useState("");
  const [registerName, setRegisterName] = reactExports.useState("");
  const [isRegistering, setIsRegistering] = reactExports.useState(false);
  const [registerError, setRegisterError] = reactExports.useState("");
  reactExports.useEffect(() => {
    const checkAuthentication = async () => {
      try {
        await apiService.loadTokens();
        const profile = await apiService.getProfile();
        setIsAuthenticated(true);
        setUserEmail(profile.email);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuthentication();
  }, []);
  reactExports.useEffect(() => {
    const port = chrome.runtime.connect({ name: "recorder" });
    const onMessage = (msg) => {
      if (!("type" in msg) || msg.type !== "recorder")
        return;
      switch (msg.method) {
        case "setPaused":
          setPaused(msg.paused);
          break;
        case "setMode":
          setMode(msg.mode);
          break;
        case "setSources":
          setSources(msg.sources);
          break;
        case "resetCallLogs":
          setLog(/* @__PURE__ */ new Map());
          break;
        case "updateCallLogs":
          setLog((log2) => {
            const newLog = new Map(log2);
            for (const callLog of msg.callLogs) {
              callLog.reveal = !log2.has(callLog.id);
              newLog.set(callLog.id, callLog);
            }
            return newLog;
          });
          break;
        case "setRunningFile":
          setRunningFileId(msg.file);
          break;
        case "elementPicked":
          setElementPicked(msg.elementInfo, msg.userGesture);
          break;
      }
    };
    port.onMessage.addListener(onMessage);
    window.dispatch = async (data) => {
      port.postMessage({ type: "recorderEvent", ...data });
      if (data.event === "fileChanged")
        setSelectedFileId(data.params.file);
    };
    loadSettings().then((settings22) => {
      setSettings(settings22);
      setSelectedFileId(settings22.targetLanguage);
    }).catch(() => {
    });
    addSettingsChangedListener(setSettings);
    return () => {
      removeSettingsChangedListener(setSettings);
      port.disconnect();
    };
  }, []);
  const source = reactExports.useMemo(() => sources.find((s) => s.id === selectedFileId), [sources, selectedFileId]);
  const requestStorageState = reactExports.useCallback(() => {
    if (!settings2.experimental)
      return;
    chrome.runtime.sendMessage({ event: "storageStateRequested" }).then((storageState) => {
      const fileSuffix = generateDatetimeSuffix();
      download(`storageState-${fileSuffix}.json`, JSON.stringify(storageState, null, 2));
    });
  }, [settings2]);
  const showPreferences = reactExports.useCallback(() => {
    const modal = create(
      ({ isOpen, onResolve }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { title: "Preferences", isOpen, onClose: onResolve, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PreferencesForm, {}) })
    );
    modal().catch(() => {
    });
  }, []);
  const saveCode = reactExports.useCallback(() => {
    if (!settings2.experimental)
      return;
    const modal = create(({ isOpen, onResolve, onReject }) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { title: "Save code", isOpen, onClose: onReject, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SaveCodeForm, { onSubmit: onResolve, suggestedFilename: codegenFilenames[selectedFileId] }) });
    });
    modal().then(({ filename }) => {
      const code = source == null ? void 0 : source.text;
      if (!code)
        return;
      download(filename, code);
    }).catch(() => {
    });
  }, [settings2, source, selectedFileId]);
  const saveToDatabase = reactExports.useCallback(async () => {
    if (!(source == null ? void 0 : source.text)) {
      setSaveError("No code to save");
      return;
    }
    setShowSaveModal(true);
    setSaveError("");
    setSaveSuccess(false);
  }, [source]);
  const handleSaveToDatabase = reactExports.useCallback(async (e) => {
    e.preventDefault();
    if (!scriptName.trim()) {
      setSaveError("Script name is required");
      return;
    }
    if (!(source == null ? void 0 : source.text)) {
      setSaveError("No code to save");
      return;
    }
    setIsSaving(true);
    setSaveError("");
    try {
      await apiService.createScript(
        scriptName.trim(),
        source.text,
        selectedFileId,
        scriptDescription.trim() || void 0
      );
      setSaveSuccess(true);
      setTimeout(() => {
        setShowSaveModal(false);
        setScriptName("");
        setScriptDescription("");
        setSaveSuccess(false);
      }, 1500);
    } catch (error) {
      setSaveError((error == null ? void 0 : error.message) || "Failed to save script");
    } finally {
      setIsSaving(false);
    }
  }, [scriptName, scriptDescription, source, selectedFileId]);
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");
    try {
      const response = await apiService.login(loginEmail, loginPassword);
      setIsAuthenticated(true);
      setUserEmail(response.user.email);
      setShowLoginForm(false);
      setLoginEmail("");
      setLoginPassword("");
    } catch (error) {
      setLoginError((error == null ? void 0 : error.message) || "Login failed. Please check your credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegisterError("");
    try {
      const result = await apiService.register(registerEmail, registerPassword, registerName);
      setIsAuthenticated(true);
      setUserEmail(result.user.email);
      setShowRegisterForm(false);
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterName("");
    } catch (error) {
      setRegisterError((error == null ? void 0 : error.message) || "Sign up failed. Please check your details.");
    } finally {
      setIsRegistering(false);
    }
  };
  const toggleSelfHealing = reactExports.useCallback(() => {
    setShowSelfHealing((prev) => !prev);
  }, []);
  const toggleAISelfHealing = reactExports.useCallback(() => {
    setShowAISelfHealing((prev) => !prev);
  }, []);
  const toggleDDT = reactExports.useCallback(() => {
    setShowDDT((prev) => !prev);
  }, []);
  const toggleDebugger = reactExports.useCallback(() => {
    setShowDebugger((prev) => !prev);
  }, []);
  const toggleTestExecutor = reactExports.useCallback(() => {
    setShowTestExecutor((prev) => !prev);
  }, []);
  const toggleApiTesting = reactExports.useCallback(() => {
    setShowApiTesting((prev) => !prev);
  }, []);
  reactExports.useEffect(() => {
    if (!settings2.experimental)
      return;
    const keydownHandler = (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveCode();
      }
    };
    window.addEventListener("keydown", keydownHandler);
    return () => {
      window.removeEventListener("keydown", keydownHandler);
    };
  }, [selectedFileId, settings2, saveCode]);
  const dispatchEditedCode = reactExports.useCallback((code) => {
    window.dispatch({ event: "codeChanged", params: { code } });
  }, []);
  const dispatchCursorActivity = reactExports.useCallback((position) => {
    window.dispatch({ event: "cursorActivity", params: { position } });
  }, []);
  if (isCheckingAuth) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "auth-loading", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-loading-content", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spinner" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Loading..." })
    ] }) });
  }
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "auth-container", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-box", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Playwright CRX" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: showRegisterForm ? "Create an account to continue" : "Please login to continue" })
      ] }),
      showRegisterForm ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleRegister, className: "auth-form", children: [
        registerError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "auth-error", children: registerError }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: registerName,
              onChange: (e) => setRegisterName(e.target.value),
              placeholder: "Your name",
              required: true,
              disabled: isRegistering
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              value: registerEmail,
              onChange: (e) => setRegisterEmail(e.target.value),
              placeholder: "you@example.com",
              required: true,
              disabled: isRegistering
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "password",
              value: registerPassword,
              onChange: (e) => setRegisterPassword(e.target.value),
              placeholder: "Enter password",
              required: true,
              disabled: isRegistering
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "auth-button", disabled: isRegistering, children: isRegistering ? "Signing up..." : "Sign Up" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "auth-hint", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", onClick: (e) => {
          e.preventDefault();
          setShowRegisterForm(false);
        }, children: "Already have an account? Log in" }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLogin, className: "auth-form", children: [
        loginError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "auth-error", children: loginError }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              value: loginEmail,
              onChange: (e) => setLoginEmail(e.target.value),
              placeholder: "demo@example.com",
              required: true,
              disabled: isLoggingIn
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "password",
              value: loginPassword,
              onChange: (e) => setLoginPassword(e.target.value),
              placeholder: "Enter password",
              required: true,
              disabled: isLoggingIn
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "auth-button", disabled: isLoggingIn, children: isLoggingIn ? "Logging in..." : "Login" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-hint", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Demo credentials:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "auth-demo", children: "demo@example.com / demo123" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", onClick: (e) => {
            e.preventDefault();
            setShowRegisterForm(true);
          }, children: "Create account" })
        ] })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Container, {}),
    showSaveModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "auth-container", style: { zIndex: 9999 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-box", style: { maxWidth: "500px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Save Script to Database" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowSaveModal(false),
            style: { position: "absolute", right: "20px", top: "20px", background: "none", border: "none", fontSize: "24px", cursor: "pointer" },
            children: "×"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSaveToDatabase, className: "auth-form", children: [
        saveError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "auth-error", children: saveError }),
        saveSuccess && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "auth-success", style: { background: "#d4edda", color: "#155724", padding: "12px", borderRadius: "4px", marginBottom: "15px" }, children: "✓ Script saved successfully!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Script Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: scriptName,
              onChange: (e) => setScriptName(e.target.value),
              placeholder: "My Test Script",
              required: true,
              disabled: isSaving || saveSuccess
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Description (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: scriptDescription,
              onChange: (e) => setScriptDescription(e.target.value),
              placeholder: "Describe what this script does...",
              rows: 3,
              disabled: isSaving || saveSuccess,
              style: { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Language" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: selectedFileId,
              disabled: true,
              style: { background: "#f0f0f0" }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "10px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "auth-button",
              disabled: isSaving || saveSuccess,
              style: { flex: 1 },
              children: isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save to Database"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowSaveModal(false),
              disabled: isSaving,
              style: { flex: 1, background: "#6c757d" },
              className: "auth-button",
              children: "Cancel"
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "recorder", children: [
      settings2.experimental && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Toolbar, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "save", title: "Save to File", disabled: false, onClick: saveCode, children: "Save File" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "cloud-upload", title: "Save to Database", disabled: false, onClick: saveToDatabase, children: "Save DB" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarSeparator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "debug-console", title: "Test Executor", disabled: false, onClick: toggleTestExecutor, children: "Execute" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "debug-alt", title: "Debugger", disabled: false, onClick: toggleDebugger, children: "Debug" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "plug", title: "API Testing", disabled: false, onClick: toggleApiTesting, children: "API" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "sparkle", title: "Self-Healing", disabled: false, onClick: toggleSelfHealing, children: "Heal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "brain", title: "AI Self-Healing", disabled: false, onClick: toggleAISelfHealing, children: "AI" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "database", title: "Data-Driven Testing", disabled: false, onClick: toggleDDT, children: "Data" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: "auto" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dropdown", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "tools", title: "Tools", disabled: false, onClick: () => {
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "dropdown-content right-align", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", onClick: requestStorageState, children: "Download storage state" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarSeparator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarButton, { icon: "settings-gear", title: "Preferences", onClick: showPreferences })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Recorder, { sources, paused, log, mode, onEditedCode: dispatchEditedCode, onCursorActivity: dispatchCursorActivity }),
      showSelfHealing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", top: 0, right: 0, width: "400px", height: "100%", background: "var(--vscode-sideBar-background)", borderLeft: "1px solid var(--vscode-panel-border)", zIndex: 1e3, overflow: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelfHealingUI, { onClose: toggleSelfHealing }) }),
      showAISelfHealing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", top: 0, right: 0, width: "550px", height: "100%", background: "var(--vscode-sideBar-background)", borderLeft: "1px solid var(--vscode-panel-border)", zIndex: 1e3, overflow: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AISelfHealingUI, { onClose: toggleAISelfHealing }) }),
      showDDT && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "absolute", top: 0, right: 0, width: "500px", height: "100%", background: "var(--vscode-sideBar-background)", borderLeft: "1px solid var(--vscode-panel-border)", zIndex: 1e3, overflow: "auto" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DDTManager, { onFileSelected: (fileId) => console.log("Selected file:", fileId) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleDDT, style: { position: "absolute", top: "10px", right: "10px" }, children: "Close" })
      ] }),
      showDebugger && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", bottom: 0, left: 0, right: 0, height: "300px", background: "var(--vscode-sideBar-background)", borderTop: "1px solid var(--vscode-panel-border)", zIndex: 1e3, overflow: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DebuggerUI, { onClose: toggleDebugger }) }),
      showTestExecutor && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", top: 0, right: 0, width: "450px", height: "100%", background: "var(--vscode-sideBar-background)", borderLeft: "1px solid var(--vscode-panel-border)", zIndex: 1e3, overflow: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TestExecutorUI, { onClose: toggleTestExecutor, script: (source == null ? void 0 : source.text) || "", scriptName: selectedFileId }) }),
      showApiTesting && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", top: 0, right: 0, width: "550px", height: "100%", background: "var(--vscode-sideBar-background)", borderLeft: "1px solid var(--vscode-panel-border)", zIndex: 1e3, overflow: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ApiTestingUI, { onClose: toggleApiTesting }) })
    ] })
  ] });
};
(async () => {
  applyTheme();
  clientExports.createRoot(document.querySelector("#root")).render(/* @__PURE__ */ jsxRuntimeExports.jsx(CrxRecorder, {}));
})();
//# sourceMappingURL=index.js.map
