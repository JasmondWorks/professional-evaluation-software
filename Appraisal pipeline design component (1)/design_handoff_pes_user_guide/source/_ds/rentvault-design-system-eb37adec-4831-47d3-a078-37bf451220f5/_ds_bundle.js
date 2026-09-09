/* @ds-bundle: {"format":3,"namespace":"RentVaultDesignSystem_eb37ad","components":[{"name":"AlertBanner","sourcePath":"components/core/AlertBanner.jsx"},{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Checkbox","sourcePath":"components/core/Checkbox.jsx"},{"name":"EmptyState","sourcePath":"components/core/EmptyState.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"ListRow","sourcePath":"components/core/ListRow.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"StatCard","sourcePath":"components/core/StatCard.jsx"},{"name":"Stepper","sourcePath":"components/core/Stepper.jsx"},{"name":"Switch","sourcePath":"components/core/Switch.jsx"},{"name":"Tabs","sourcePath":"components/core/Tabs.jsx"}],"sourceHashes":{"components/core/AlertBanner.jsx":"7c58a5bbde7c","components/core/Avatar.jsx":"67d68fabe4b2","components/core/Badge.jsx":"ab4f306fb674","components/core/Button.jsx":"b2deaf91a752","components/core/Card.jsx":"852f8466891e","components/core/Checkbox.jsx":"e6e85fdf2454","components/core/EmptyState.jsx":"fcb0ca8b0d96","components/core/IconButton.jsx":"324461061f0d","components/core/Input.jsx":"fae311ad03c5","components/core/ListRow.jsx":"05d5104d8950","components/core/Select.jsx":"874fffaeb936","components/core/StatCard.jsx":"3507b79584f5","components/core/Stepper.jsx":"8de63cd4e087","components/core/Switch.jsx":"73572d914280","components/core/Tabs.jsx":"04b4fe77917e","ui_kits/mobile/AgreementSign.jsx":"4a5fa576754e","ui_kits/mobile/BorrowerCatalogue.jsx":"86f09be7241a","ui_kits/mobile/BorrowerEmpty.jsx":"18925c0a79c0","ui_kits/mobile/BorrowerVerify.jsx":"9dfe92e63c42","ui_kits/mobile/CollateralRelease.jsx":"820bfe1d9f75","ui_kits/mobile/FundCollateral.jsx":"b04d8bc46226","ui_kits/mobile/FundedConfirmation.jsx":"0e53e924f986","ui_kits/mobile/MyRentals.jsx":"82135b900f0b","ui_kits/mobile/OverdueState.jsx":"3e529b0716ee","ui_kits/mobile/PickupSignOff.jsx":"37df8e1d6308","ui_kits/mobile/ReturnFlow.jsx":"2063c7621784","ui_kits/mobile/ScanLanding.jsx":"187a4a007280","ui_kits/mobile/kit-common.jsx":"5074631cd682","ui_kits/web/AgreementDetailScreen.jsx":"56f53d9ebe3d","ui_kits/web/AgreementQRScreen.jsx":"59508fdbffe7","ui_kits/web/ConfirmReturnModal.jsx":"8a13cd62bb73","ui_kits/web/DashboardScreen.jsx":"cabcada0b18c","ui_kits/web/ItemsEmptyScreen.jsx":"84d77f7eb1d9","ui_kits/web/LenderSections.jsx":"bef4bc4f7d6a","ui_kits/web/ListItemScreen.jsx":"7f9e0c3e0563","ui_kits/web/MyItems.jsx":"58e9eef87d92","ui_kits/web/NewAgreementScreen.jsx":"496489bdce2c","ui_kits/web/NotificationsScreen.jsx":"0bc33effa966","ui_kits/web/PenaltyScreen.jsx":"52be8a3bef63","ui_kits/web/RegisterScreen.jsx":"49cfef62b3d6","ui_kits/web/RequestsScreen.jsx":"c1980aa708c5","ui_kits/web/SeizureScreen.jsx":"36e651f55611","ui_kits/web/Sidebar.jsx":"c281db98e40e","ui_kits/web/SignInScreen.jsx":"d9185a86b3da","ui_kits/web/SplashScreen.jsx":"9e90daa5fb91","ui_kits/web/Topbar.jsx":"87b48b9c180b","ui_kits/web/VerifyScreen.jsx":"4f3fe1cf2527","ui_kits/web/kit-common.jsx":"44abd75496a4"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.RentVaultDesignSystem_eb37ad = window.RentVaultDesignSystem_eb37ad || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/AlertBanner.jsx
try { (() => {
/**
 * Alert banner. Semantic tint bg + 3px left accent, 10px radius, no border, no shadow.
 * Icon left (semantic) + content right. Same-hue text.
 */
function AlertBanner({
  variant = "brand",
  icon = null,
  title,
  children,
  style = {}
}) {
  const v = {
    success: {
      bg: "var(--success-50)",
      accent: "var(--success-600)",
      fg: "var(--success-900)"
    },
    warning: {
      bg: "var(--warning-50)",
      accent: "var(--warning-600)",
      fg: "var(--warning-900)"
    },
    danger: {
      bg: "var(--danger-50)",
      accent: "var(--danger-600)",
      fg: "var(--danger-900)"
    },
    brand: {
      bg: "var(--brand-50)",
      accent: "var(--brand-600)",
      fg: "var(--brand-900)"
    }
  }[variant];
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: "flex",
      gap: "12px",
      background: v.bg,
      borderLeft: `3px solid ${v.accent}`,
      borderRadius: "var(--radius-md)",
      padding: "14px 16px",
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: v.accent,
      display: "inline-flex",
      flex: "none",
      marginTop: "1px"
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      color: v.fg
    }
  }, title && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "13px",
      fontWeight: 600,
      lineHeight: 1.4
    }
  }, title), children && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "12px",
      fontWeight: 400,
      lineHeight: 1.5
    }
  }, children)));
}
Object.assign(__ds_scope, { AlertBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/AlertBanner.jsx", error: String((e && e.message) || e) }); }

// components/core/Avatar.jsx
try { (() => {
/**
 * Avatar. Initials on a brand tint, or an image. Circle.
 */
function Avatar({
  name = "",
  src = null,
  size = 40,
  style = {}
}) {
  const initials = name.split(" ").map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "9999px",
      background: "var(--brand-100)",
      color: "var(--brand-900)",
      fontSize: `${Math.round(size * 0.36)}px`,
      fontWeight: 600,
      overflow: "hidden",
      flex: "none",
      ...style
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
/**
 * Status / category badge. Pill radius, 11px 600, tint bg with same-hue 900 text.
 * Carries a shape cue (dot) so state never relies on color alone.
 */
function Badge({
  variant = "neutral",
  dot = true,
  children,
  style = {}
}) {
  const variants = {
    success: {
      bg: "var(--success-50)",
      fg: "var(--success-900)",
      dotc: "var(--success-600)"
    },
    warning: {
      bg: "var(--warning-50)",
      fg: "var(--warning-900)",
      dotc: "var(--warning-600)"
    },
    danger: {
      bg: "var(--danger-50)",
      fg: "var(--danger-900)",
      dotc: "var(--danger-600)"
    },
    brand: {
      bg: "var(--brand-50)",
      fg: "var(--brand-900)",
      dotc: "var(--brand-600)"
    },
    neutral: {
      bg: "var(--neutral-100)",
      fg: "var(--neutral-600, var(--neutral-500))",
      dotc: "var(--neutral-400)"
    }
  };
  const v = variants[variant] || variants.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 10px",
      borderRadius: "var(--radius-pill)",
      fontSize: "11px",
      fontWeight: 600,
      lineHeight: 1.4,
      background: v.bg,
      color: v.fg,
      ...style
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: "6px",
      height: "6px",
      borderRadius: "9999px",
      background: v.dotc,
      flex: "none"
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * RentVault Button. Outcome-named labels, 44px tall, 6px radius.
 * One primary button per screen.
 */
function Button({
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  fullWidth = false,
  leadingIcon = null,
  trailingIcon = null,
  children,
  style = {},
  ...rest
}) {
  const heights = {
    sm: 36,
    md: 44,
    lg: 48
  };
  const height = heights[size] || 44;
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    height: `${height}px`,
    padding: size === "sm" ? "0 12px" : "0 18px",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-sans)",
    fontSize: "14px",
    lineHeight: 1,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    width: fullWidth ? "100%" : "auto",
    transition: "background 150ms ease, color 150ms ease, box-shadow 150ms ease",
    whiteSpace: "nowrap"
  };
  const variants = {
    primary: {
      background: "var(--brand-600)",
      color: "var(--text-on-brand)",
      fontWeight: 600
    },
    secondary: {
      background: "var(--neutral-100)",
      color: "var(--neutral-900)",
      border: "1px solid var(--neutral-300)",
      fontWeight: 600
    },
    ghost: {
      background: "transparent",
      color: "var(--brand-600)",
      fontWeight: 600
    },
    destructive: {
      background: "transparent",
      color: "var(--danger-600)",
      fontWeight: 400
    }
  };
  const disabledStyle = disabled ? {
    background: "var(--neutral-200)",
    color: "var(--neutral-400)",
    border: "none"
  } : {};
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    "data-variant": variant,
    style: {
      ...base,
      ...variants[variant],
      ...disabledStyle,
      ...style
    }
  }, rest), leadingIcon, children, trailingIcon);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card surface. The shadow IS the card — white bg, shadow-2, 10px radius, no border.
 * Interactive cards lift to shadow-3 on hover.
 */
function Card({
  interactive = false,
  padding = 20,
  children,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      background: "var(--surface-card)",
      borderRadius: "var(--radius-md)",
      boxShadow: hover ? "var(--shadow-3)" : "var(--shadow-2)",
      padding: typeof padding === "number" ? `${padding}px` : padding,
      transition: "box-shadow 200ms ease",
      cursor: interactive ? "pointer" : "default",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Checkbox.jsx
try { (() => {
/**
 * Checkbox. 4px radius (xs), brand-600 when checked, with a check glyph cue.
 */
function Checkbox({
  checked,
  defaultChecked,
  disabled = false,
  label,
  onChange,
  id,
  style = {}
}) {
  const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const [internal, setInternal] = React.useState(defaultChecked || false);
  const isChecked = checked !== undefined ? checked : internal;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: "14px",
      color: "var(--neutral-900)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "18px",
      height: "18px",
      flex: "none",
      borderRadius: "var(--radius-xs)",
      background: isChecked ? "var(--brand-600)" : "var(--neutral-100)",
      border: isChecked ? "none" : "1px solid var(--neutral-300)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background 150ms ease, border 150ms ease"
    }
  }, isChecked && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }))), /*#__PURE__*/React.createElement("input", {
    id: fieldId,
    type: "checkbox",
    checked: isChecked,
    disabled: disabled,
    onChange: e => {
      onChange ? onChange(e) : setInternal(e.target.checked);
    },
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/core/EmptyState.jsx
try { (() => {
/**
 * Empty state. One icon (48px in a 72px neutral circle), one heading,
 * one body line, one CTA. Nothing else.
 */
function EmptyState({
  icon = null,
  title,
  description,
  action = null,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: "16px",
      padding: "48px 24px",
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      width: "72px",
      height: "72px",
      borderRadius: "9999px",
      background: "var(--neutral-100)",
      color: "var(--neutral-300)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      maxWidth: "320px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "18px",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.2px",
      color: "var(--neutral-900)"
    }
  }, title), description && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: 1.5,
      color: "var(--neutral-500)"
    }
  }, description)), action);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Icon-only button. Square, 44px tap target, neutral at rest, brand-50 on hover.
 * Always pass an aria-label.
 */
function IconButton({
  size = 44,
  variant = "ghost",
  disabled = false,
  children,
  style = {},
  ...rest
}) {
  const variants = {
    ghost: {
      background: "transparent",
      color: "var(--neutral-700)"
    },
    soft: {
      background: "var(--neutral-100)",
      color: "var(--neutral-900)"
    },
    brand: {
      background: "var(--brand-600)",
      color: "#fff"
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "var(--radius-sm)",
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background 150ms ease, color 150ms ease",
      ...(disabled ? {
        background: "var(--neutral-200)",
        color: "var(--neutral-400)"
      } : variants[variant]),
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Text input with label above (uppercase label role) and optional helper/error.
 * Label is always above the field — never floating or inside.
 */
function Input({
  label,
  id,
  type = "text",
  value,
  defaultValue,
  placeholder,
  helper,
  error,
  disabled = false,
  leadingIcon = null,
  style = {},
  ...rest
}) {
  const invalid = Boolean(error);
  const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontSize: "12px",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-700)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, leadingIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "12px",
      display: "inline-flex",
      color: "var(--neutral-400)",
      pointerEvents: "none"
    }
  }, leadingIcon), /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: type,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    "aria-invalid": invalid,
    style: {
      width: "100%",
      height: "44px",
      padding: leadingIcon ? "12px 16px 12px 40px" : "12px 16px",
      fontFamily: "var(--font-sans)",
      fontSize: "14px",
      fontWeight: 400,
      color: disabled ? "var(--neutral-400)" : "var(--neutral-900)",
      background: invalid ? "var(--danger-50)" : disabled ? "var(--neutral-100)" : "var(--neutral-100)",
      border: invalid ? "2px solid var(--danger-500)" : disabled ? "1px solid var(--neutral-200)" : "1px solid var(--neutral-300)",
      borderRadius: "var(--radius-sm)",
      outline: "none",
      boxSizing: "border-box",
      transition: "border 150ms ease, background 150ms ease, box-shadow 150ms ease"
    },
    onFocus: e => {
      if (invalid || disabled) return;
      e.target.style.border = "2px solid var(--brand-500)";
      e.target.style.background = "#fff";
      e.target.style.boxShadow = "var(--focus-shadow)";
    },
    onBlur: e => {
      if (invalid || disabled) return;
      e.target.style.border = "1px solid var(--neutral-300)";
      e.target.style.background = "var(--neutral-100)";
      e.target.style.boxShadow = "none";
    }
  }, rest))), (error || helper) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "12px",
      fontWeight: 400,
      lineHeight: 1.5,
      color: invalid ? "var(--danger-600)" : "var(--neutral-500)"
    }
  }, error || helper));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/ListRow.jsx
try { (() => {
/**
 * List row. No card, no group border — dividers between rows only.
 * Leading slot (avatar/icon), title + meta, trailing slot (badge/amount).
 */
function ListRow({
  leading = null,
  title,
  meta = null,
  trailing = null,
  divider = true,
  onClick,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      minHeight: "56px",
      padding: "16px 24px",
      borderBottom: divider ? "1px solid var(--neutral-200)" : "none",
      cursor: onClick ? "pointer" : "default",
      ...style
    }
  }, leading && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "none",
      display: "inline-flex"
    }
  }, leading), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "14px",
      fontWeight: 600,
      color: "var(--neutral-900)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, title), meta && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "12px",
      fontWeight: 400,
      color: "var(--neutral-500)"
    }
  }, meta)), trailing && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "none",
      display: "inline-flex",
      alignItems: "center"
    }
  }, trailing));
}
Object.assign(__ds_scope, { ListRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ListRow.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Native select styled to match RentVault inputs. Label above.
 */
function Select({
  label,
  id,
  value,
  defaultValue,
  disabled = false,
  options = [],
  children,
  style = {},
  ...rest
}) {
  const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontSize: "12px",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-700)"
    }
  }, label), /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    value: value,
    defaultValue: defaultValue,
    disabled: disabled,
    style: {
      width: "100%",
      height: "44px",
      padding: "0 40px 0 16px",
      fontFamily: "var(--font-sans)",
      fontSize: "14px",
      fontWeight: 400,
      color: disabled ? "var(--neutral-400)" : "var(--neutral-900)",
      background: "var(--neutral-100)",
      border: "1px solid var(--neutral-300)",
      borderRadius: "var(--radius-sm)",
      appearance: "none",
      backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2370748a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 14px center",
      cursor: disabled ? "not-allowed" : "pointer",
      outline: "none",
      boxSizing: "border-box"
    }
  }, rest), children || options.map(o => {
    const opt = typeof o === "string" ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/core/StatCard.jsx
try { (() => {
/**
 * StatCard. A label, a big tabular number, and an optional delta/sub line.
 * Used for vault balances and counts. Built on the card surface.
 */
function StatCard({
  label,
  value,
  sub = null,
  subVariant = "neutral",
  icon = null,
  accent = null,
  style = {}
}) {
  const subColors = {
    neutral: "var(--neutral-500)",
    success: "var(--success-600)",
    warning: "var(--warning-600)",
    danger: "var(--danger-600)"
  };
  const accentColors = {
    brand: "var(--brand-600)",
    success: "var(--success-600)",
    warning: "var(--warning-600)",
    danger: "var(--danger-600)"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-card)",
      borderRadius: "var(--radius-md)",
      boxShadow: accent ? `inset 0 2px 0 0 ${accentColors[accent] || accent}, var(--shadow-2)` : "var(--shadow-2)",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "12px",
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--neutral-400)",
      display: "inline-flex"
    }
  }, icon)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "28px",
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: "-0.5px",
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, value), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "12px",
      fontWeight: 400,
      color: subColors[subVariant]
    }
  }, sub));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Stepper.jsx
try { (() => {
/**
 * Horizontal stepper. Completed = filled brand check; active = brand outline dot;
 * inactive = neutral. Connector turns brand as steps complete.
 */
function Stepper({
  steps = [],
  current = 0,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      ...style
    }
  }, steps.map((label, i) => {
    const state = i < current ? "complete" : i === current ? "active" : "inactive";
    const isLast = i === steps.length - 1;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        flex: "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: "24px",
        height: "24px",
        borderRadius: "9999px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: state === "complete" ? "var(--brand-600)" : state === "active" ? "#fff" : "var(--neutral-200)",
        border: state === "active" ? "2px solid var(--brand-600)" : "none",
        boxSizing: "border-box"
      }
    }, state === "complete" && /*#__PURE__*/React.createElement("svg", {
      width: "13",
      height: "13",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "3",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20 6 9 17l-5-5"
    })), state === "active" && /*#__PURE__*/React.createElement("span", {
      style: {
        width: "8px",
        height: "8px",
        borderRadius: "9999px",
        background: "var(--brand-600)"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "14px",
        fontWeight: state === "inactive" ? 400 : 600,
        color: state === "inactive" ? "var(--neutral-400)" : "var(--neutral-900)",
        whiteSpace: "nowrap"
      }
    }, label)), !isLast && /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: "2px",
        marginTop: "11px",
        background: i < current ? "var(--brand-600)" : "var(--neutral-200)",
        minWidth: "32px"
      }
    }));
  }));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/core/Switch.jsx
try { (() => {
/**
 * Toggle switch. brand-600 track when on. 44px tap row.
 */
function Switch({
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  label,
  id,
  style = {}
}) {
  const [internal, setInternal] = React.useState(defaultChecked || false);
  const on = checked !== undefined ? checked : internal;
  const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "12px",
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: "14px",
      color: "var(--neutral-900)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "40px",
      height: "24px",
      flex: "none",
      borderRadius: "9999px",
      background: on ? "var(--brand-600)" : "var(--neutral-300)",
      padding: "2px",
      boxSizing: "border-box",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: on ? "flex-end" : "flex-start",
      transition: "background 150ms ease",
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "20px",
      height: "20px",
      borderRadius: "9999px",
      background: "#fff",
      boxShadow: "var(--shadow-1)"
    }
  })), /*#__PURE__*/React.createElement("input", {
    id: fieldId,
    type: "checkbox",
    role: "switch",
    checked: on,
    disabled: disabled,
    onChange: e => {
      onChange ? onChange(e) : setInternal(e.target.checked);
    },
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }), label);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Switch.jsx", error: String((e && e.message) || e) }); }

// components/core/Tabs.jsx
try { (() => {
/**
 * Underline tabs. Active = brand-600 label + 2px brand underline. Label role text.
 */
function Tabs({
  tabs = [],
  value,
  defaultValue,
  onChange,
  style = {}
}) {
  const [internal, setInternal] = React.useState(defaultValue || tabs[0] && (tabs[0].value || tabs[0]));
  const active = value !== undefined ? value : internal;
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: "flex",
      alignItems: "center",
      gap: "24px",
      borderBottom: "1px solid var(--neutral-200)",
      ...style
    }
  }, tabs.map(t => {
    const tab = typeof t === "string" ? {
      value: t,
      label: t
    } : t;
    const isActive = tab.value === active;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.value,
      role: "tab",
      "aria-selected": isActive,
      onClick: () => onChange ? onChange(tab.value) : setInternal(tab.value),
      style: {
        appearance: "none",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0 0 12px",
        marginBottom: "-1px",
        fontFamily: "var(--font-sans)",
        fontSize: "12px",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        fontWeight: isActive ? 600 : 400,
        color: isActive ? "var(--brand-600)" : "var(--neutral-500)",
        borderBottom: isActive ? "2px solid var(--brand-600)" : "2px solid transparent",
        transition: "color 150ms ease"
      }
    }, tab.label);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/AgreementSign.jsx
try { (() => {
// B-03 · Agreement review & sign. Full terms + conditions + consent checkbox.
function AgreementSign({
  onBack,
  onSign
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [agree, setAgree] = React.useState(false);
  const rows = [["Lender", RVB.lender], ["Item", "Canon EOS R6"], ["Serial number", RVB.serial], ["Rental start", RVB.start], ["Return date", RVB.returnBy], ["Daily rate", RVB.daily], ["Collateral", RVB.collateral], ["Penalty / late day", RVB.penalty]];
  const conditions = [["calendar", "Return by 22 Jun 2026 by 6:00 PM"], ["banknote", "Late return: ₦5,000/day auto-deducted from collateral"], ["shield-x", "Damage: up to 100% collateral forfeited"], ["check-circle", "Clean return: full collateral released within 48 hours"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement(MobileTopbar, {
    title: "Review agreement",
    onBack: onBack,
    step: "Step 2 of 3"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-400)"
    }
  }, "Rental agreement"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--neutral-400)",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      marginTop: 2
    }
  }, RVB.agreementId, " \xB7 RV-2026-08042"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--neutral-200)",
      margin: "16px 0"
    }
  }), /*#__PURE__*/React.createElement("div", null, rows.map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "10px 0",
      borderBottom: i < rows.length - 1 ? "1px solid var(--neutral-200)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)",
      whiteSpace: "nowrap"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums",
      textAlign: "right"
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--neutral-200)",
      margin: "16px 0"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-400)"
    }
  }, "Agreement conditions"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, conditions.map(([icon, text]) => /*#__PURE__*/React.createElement("div", {
    key: text,
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 16,
    color: "var(--neutral-700)",
    style: {
      marginTop: 2,
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--neutral-700)",
      lineHeight: 1.5
    }
  }, text))))), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
      marginTop: 24,
      cursor: "pointer",
      fontSize: 14,
      color: "var(--neutral-700)",
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => setAgree(v => !v),
    style: {
      width: 18,
      height: 18,
      flex: "none",
      marginTop: 1,
      borderRadius: 4,
      background: agree ? "var(--brand-600)" : "var(--neutral-100)",
      border: agree ? "none" : "1px solid var(--neutral-300)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, agree && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 12,
    color: "#fff",
    strokeWidth: 3
  })), "I have read and agree to these terms"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    disabled: !agree,
    onClick: onSign
  }, "Sign and proceed to payment \u2192")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontSize: 12,
      color: "var(--neutral-400)",
      textAlign: "center"
    }
  }, "Your agreement is securely recorded by RentVault.")));
}
Object.assign(window, {
  AgreementSign
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/AgreementSign.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/BorrowerCatalogue.jsx
try { (() => {
// B-00 · Borrower catalogue + rental request. Two steps: browse lender's items → request form → sent.
function BorrowerCatalogue({
  onBack,
  onSent
}) {
  const {
    Button,
    Badge
  } = window.RentVaultDesignSystem_eb37ad;
  const p = RVB.lenderProfile;
  const [step, setStep] = React.useState("browse"); // browse | request | sent
  const [qty, setQty] = React.useState({});
  const [expanded, setExpanded] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const [note, setNote] = React.useState("");
  const [start, setStart] = React.useState("");
  const [ret, setRet] = React.useState("");
  const items = RVB.catalogue;
  const filtered = items.filter(it => !query || (it.name + " " + it.category).toLowerCase().includes(query.toLowerCase()));
  const lines = items.filter(it => (qty[it.id] || 0) > 0).map(it => ({
    ...it,
    qty: qty[it.id]
  }));
  const unitCount = lines.reduce((s, l) => s + l.qty, 0);
  const totalCollateral = lines.reduce((s, l) => s + l.collateral * l.qty, 0);
  const totalDaily = lines.reduce((s, l) => s + l.rate * l.qty, 0);
  const setItemQty = (id, n, max) => setQty(q => ({
    ...q,
    [id]: Math.max(0, Math.min(max, n))
  }));

  // ── Sent confirmation ──
  if (step === "sent") {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--neutral-50)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 28,
        flex: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        background: "#fff",
        borderBottom: "1px solid var(--neutral-100)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "shield",
      size: 13,
      color: "var(--brand-600)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "-0.2px",
        color: "var(--neutral-900)"
      }
    }, "RentVault")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: "auto",
        padding: "64px 24px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 72,
        height: 72,
        borderRadius: 9999,
        background: "var(--success-50)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "send",
      size: 32,
      color: "var(--success-600)"
    })), /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: "20px 0 0",
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: "-0.3px",
        color: "var(--neutral-900)",
        textAlign: "center"
      }
    }, "Request sent"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "8px 0 0",
        fontSize: 14,
        color: "var(--neutral-500)",
        lineHeight: 1.6,
        textAlign: "center",
        maxWidth: 300
      }
    }, p.name, " will review your request for ", unitCount, " ", unitCount === 1 ? "item" : "items", ". You'll get a payment link to secure ", naira(totalCollateral), " once they accept."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 24,
        width: "100%",
        background: "#fff",
        boxShadow: "var(--shadow-1)",
        borderRadius: 12,
        padding: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "var(--neutral-500)"
      }
    }, "What happens next"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(StepRow, {
      icon: "clock"
    }, p.name, " reviews and accepts your request"), /*#__PURE__*/React.createElement(StepRow, {
      icon: "credit-card"
    }, "You pay the collateral via the payment link"), /*#__PURE__*/React.createElement(StepRow, {
      icon: "shield-check"
    }, "Collateral held in escrow \u2014 pick up your items"))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 24,
        width: "100%"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      fullWidth: true,
      onClick: onSent
    }, "Done"))));
  }

  // ── Request form (Step 2) ──
  if (step === "request") {
    const canSend = unitCount > 0 && start.trim() && ret.trim();
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--neutral-50)"
      }
    }, /*#__PURE__*/React.createElement(MobileTopbar, {
      title: "Your request",
      onBack: () => setStep("browse"),
      step: "2 of 2"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: "auto"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "24px 20px 120px",
        display: "flex",
        flexDirection: "column",
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fff",
        boxShadow: "var(--shadow-1)",
        borderRadius: 12,
        padding: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "var(--neutral-500)"
      }
    }, "Items requested"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, lines.map(l => /*#__PURE__*/React.createElement("div", {
      key: l.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 32,
        height: 32,
        flex: "none",
        borderRadius: 7,
        background: "var(--neutral-100)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: l.icon,
      size: 16,
      color: "var(--neutral-700)"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        fontSize: 13,
        color: "var(--neutral-900)"
      }
    }, l.name, l.qty > 1 ? " × " + l.qty : ""), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--neutral-900)",
        fontVariantNumeric: "tabular-nums"
      }
    }, naira(l.collateral * l.qty)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: mLabel
    }, "Pick-up date"), /*#__PURE__*/React.createElement("input", {
      style: mField,
      placeholder: "20 Jun 2026",
      value: start,
      onChange: e => setStart(e.target.value)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: mLabel
    }, "Return date"), /*#__PURE__*/React.createElement("input", {
      style: mField,
      placeholder: "27 Jun 2026",
      value: ret,
      onChange: e => setRet(e.target.value)
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: mLabel
    }, "Note to ", p.name.split(" ")[0], " ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 400,
        color: "var(--neutral-400)"
      }
    }, "(optional)")), /*#__PURE__*/React.createElement("textarea", {
      value: note,
      onChange: e => setNote(e.target.value),
      placeholder: "Let them know what you need the items for, pickup time, etc.",
      style: {
        ...mField,
        height: 88,
        paddingTop: 12,
        resize: "none",
        lineHeight: 1.5
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--success-50)",
        borderLeft: "3px solid var(--success-600)",
        borderRadius: 10,
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--success-900)"
      }
    }, "Refundable collateral"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        fontWeight: 600,
        color: "var(--success-900)",
        fontVariantNumeric: "tabular-nums"
      }
    }, naira(totalCollateral))), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "6px 0 0",
        fontSize: 12,
        color: "var(--success-600)",
        lineHeight: 1.5
      }
    }, "Held in escrow and returned in full when you bring the items back in good condition. Rental fee: ", naira(totalDaily), "/day.")))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: "none",
        borderTop: "1px solid var(--neutral-200)",
        background: "#fff",
        padding: 16
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      fullWidth: true,
      disabled: !canSend,
      onClick: () => setStep("sent")
    }, "Send request to ", p.name.split(" ")[0], " \u2192")));
  }

  // ── Browse (Step 1) ──
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement(MobileTopbar, {
    title: "Browse items",
    onBack: onBack,
    step: "1 of 2"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderBottom: "1px solid var(--neutral-200)",
      padding: "20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 52,
      height: 52,
      flex: "none",
      borderRadius: 9999,
      background: "var(--brand-50)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
      fontWeight: 600,
      color: "var(--brand-700)"
    }
  }, p.initials), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, p.name), p.verified && /*#__PURE__*/React.createElement(Icon, {
    name: "badge-check",
    size: 16,
    color: "var(--success-600)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 13,
    color: "var(--warning-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: "var(--neutral-700)"
    }
  }, p.rating), /*#__PURE__*/React.createElement("span", null, "\xB7 ", p.rentals, " rentals \xB7 since ", p.joined))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px 140px",
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 14,
      display: "inline-flex",
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16,
    color: "var(--neutral-400)"
  })), /*#__PURE__*/React.createElement("input", {
    value: query,
    onChange: e => setQuery(e.target.value),
    placeholder: "Search items...",
    style: {
      ...mField,
      paddingLeft: 40
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, filtered.map(it => {
    const n = qty[it.id] || 0;
    const open = expanded === it.id;
    const on = n > 0;
    return /*#__PURE__*/React.createElement("div", {
      key: it.id,
      style: {
        background: "#fff",
        borderRadius: 12,
        border: "1px solid " + (on ? "var(--brand-500)" : "var(--neutral-200)"),
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setExpanded(open ? null : it.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: 14,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 44,
        height: 44,
        flex: "none",
        borderRadius: 8,
        background: "var(--neutral-100)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: it.icon,
      size: 22,
      color: "var(--neutral-700)"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--neutral-900)"
      }
    }, it.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--neutral-500)"
      }
    }, naira(it.rate), "/day \xB7 ", it.available, " available")), /*#__PURE__*/React.createElement(Icon, {
      name: open ? "chevron-up" : "chevron-down",
      size: 18,
      color: "var(--neutral-400)"
    })), open && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 14px 14px"
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "0 0 12px",
        fontSize: 13,
        color: "var(--neutral-600)",
        lineHeight: 1.55
      }
    }, it.blurb), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 12px",
        background: "var(--neutral-50)",
        borderRadius: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--neutral-500)"
      }
    }, "Collateral ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: "var(--neutral-900)"
      }
    }, naira(it.collateral))), on ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setItemQty(it.id, n - 1, it.available),
      "aria-label": "Decrease",
      style: {
        width: 30,
        height: 30,
        borderRadius: 8,
        border: "1px solid var(--neutral-300)",
        background: "#fff",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "minus",
      size: 14,
      color: "var(--neutral-700)"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 16,
        textAlign: "center",
        fontSize: 14,
        fontWeight: 600,
        color: "var(--neutral-900)",
        fontVariantNumeric: "tabular-nums"
      }
    }, n), /*#__PURE__*/React.createElement("button", {
      onClick: () => setItemQty(it.id, n + 1, it.available),
      disabled: n >= it.available,
      "aria-label": "Increase",
      style: {
        width: 30,
        height: 30,
        borderRadius: 8,
        border: "1px solid var(--brand-500)",
        background: n >= it.available ? "var(--neutral-200)" : "var(--brand-600)",
        cursor: n >= it.available ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 14,
      color: "#fff"
    }))) : /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      onClick: () => setItemQty(it.id, 1, it.available)
    }, "Add to request"))));
  })))), unitCount > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none",
      borderTop: "1px solid var(--neutral-200)",
      background: "#fff",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--neutral-500)"
    }
  }, unitCount, " ", unitCount === 1 ? "item" : "items", " \xB7 collateral"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, naira(totalCollateral))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => setStep("request")
  }, "Review request \u2192")))));
}
Object.assign(window, {
  BorrowerCatalogue
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/BorrowerCatalogue.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/BorrowerEmpty.jsx
try { (() => {
// C-04 · Borrower — Empty state. Registered but no active agreements yet.
function BorrowerEmpty({
  onScan
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement(MobileTopbar, {
    title: "My rentals"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 72,
      height: 72,
      borderRadius: 9999,
      background: "var(--neutral-100)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "scan-line",
    size: 48,
    color: "var(--neutral-300)"
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "24px 0 0",
      fontSize: 18,
      fontWeight: 600,
      color: "var(--neutral-900)",
      textAlign: "center"
    }
  }, "Nothing rented yet"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0 0",
      fontSize: 14,
      color: "var(--neutral-500)",
      lineHeight: 1.6,
      textAlign: "center",
      maxWidth: 280
    }
  }, "Scan a lender's QR code to start a rental."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "scan-line",
      size: 16,
      color: "#fff"
    }),
    onClick: onScan
  }, "Scan QR code \u2192"))));
}
Object.assign(window, {
  BorrowerEmpty
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/BorrowerEmpty.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/BorrowerVerify.jsx
try { (() => {
// B-02 · Borrower identity verification. 3-step stepper, BVN/NIN, success auto-advance.
function BorrowerVerify({
  onBack,
  onVerified
}) {
  const {
    Button,
    Stepper,
    AlertBanner
  } = window.RentVaultDesignSystem_eb37ad;
  const [idType, setIdType] = React.useState("BVN");
  const [num, setNum] = React.useState("");
  const [verified, setVerified] = React.useState(false);
  React.useEffect(() => {
    if (verified) {
      const t = setTimeout(() => onVerified && onVerified(), 1500);
      return () => clearTimeout(t);
    }
  }, [verified]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement(MobileTopbar, {
    title: "Verify your identity",
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement(Stepper, {
    steps: ["Identity", "Review", "Payment"],
    current: 0
  }), verified ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement(AlertBanner, {
    variant: "success",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "check-circle",
      size: 20
    }),
    title: "Identity verified"
  }, "Linking to your RentVault account. Continuing\u2026")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 56,
      height: 56,
      borderRadius: 9999,
      background: "var(--brand-50)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 32,
    color: "var(--brand-600)"
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "16px 0 0",
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: "-0.2px",
      color: "var(--neutral-900)"
    }
  }, "One-time verification"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0 0",
      fontSize: 14,
      color: "var(--neutral-500)",
      lineHeight: 1.65
    }
  }, "Your identity is verified once and linked to your RentVault account. Future rentals skip this step.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: mLabel
  }, "Full name"), /*#__PURE__*/React.createElement("input", {
    style: mField,
    placeholder: "Tunde Bakare",
    defaultValue: "Tunde Bakare"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: mLabel
  }, "Phone number"), /*#__PURE__*/React.createElement("input", {
    style: {
      ...mField,
      color: "var(--neutral-400)"
    },
    defaultValue: "+234 803 555 0142"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: mLabel
  }, "ID type"), /*#__PURE__*/React.createElement(ChipGroup, {
    options: ["BVN", "NIN"],
    value: idType,
    onChange: setIdType
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: mLabel
  }, idType, " number"), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    maxLength: 11,
    value: num,
    onChange: e => setNum(e.target.value.replace(/\D/g, "")),
    placeholder: "00000000000",
    style: {
      ...mField,
      letterSpacing: "0.08em"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-400)",
      lineHeight: 1.5
    }
  }, "Verified via Dojah. Never stored in plain text."))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    onClick: () => setVerified(true)
  }, "Verify identity \u2192")))));
}
Object.assign(window, {
  BorrowerVerify
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/BorrowerVerify.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/CollateralRelease.jsx
try { (() => {
// B-08 · Borrower — Collateral release confirmation. 48h passed, no dispute, funds returned.
function CollateralRelease({
  onWithdraw,
  onKeep
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [wOpen, setWOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 28,
      flex: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      background: "#fff",
      borderBottom: "1px solid var(--neutral-100)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 13,
    color: "var(--brand-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "-0.2px",
      color: "var(--neutral-900)"
    }
  }, "RentVault")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "64px 24px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 72,
      height: 72,
      borderRadius: 9999,
      background: "var(--success-50)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "banknote",
    size: 36,
    color: "var(--success-600)"
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "20px 0 0",
      fontSize: 28,
      fontWeight: 600,
      letterSpacing: "-0.5px",
      color: "var(--neutral-900)",
      textAlign: "center",
      fontVariantNumeric: "tabular-nums"
    }
  }, RVB.collateral, " released"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontSize: 14,
      color: "var(--neutral-500)",
      lineHeight: 1.65,
      textAlign: "center",
      maxWidth: 320
    }
  }, "Your collateral has been returned to your RentVault balance. Withdraw to your bank account anytime."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      width: "100%",
      background: "var(--success-50)",
      borderLeft: "3px solid var(--success-600)",
      borderRadius: 10,
      padding: 14,
      display: "flex",
      gap: 8,
      alignItems: "flex-start",
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 20,
    color: "var(--success-600)",
    style: {
      flex: "none",
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--success-900)"
    }
  }, "Collateral released from escrow."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 11,
      color: "var(--success-600)"
    }
  }, "RV-2026-04358"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      width: "100%",
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 20,
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, "Your RentVault balance"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontSize: 28,
      fontWeight: 600,
      letterSpacing: "-0.5px",
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, RVB.collateral), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontSize: 12,
      color: "var(--success-600)"
    }
  }, "Available to withdraw"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    onClick: () => setWOpen(true)
  }, "Withdraw to bank \u2192"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    onClick: onKeep
  }, "Keep for next rental")))), wOpen && /*#__PURE__*/React.createElement(Sheet, {
    title: "Withdraw \u20A6200,000",
    onClose: () => setWOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      marginBottom: 20
    }
  }, [["To", "GTBank · ••• 8821"], ["Amount", RVB.collateral], ["Arrives", "Within 10 minutes"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--neutral-500)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, v)))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    onClick: () => {
      setWOpen(false);
      onWithdraw && onWithdraw();
    }
  }, "Confirm withdrawal \u2192")));
}
Object.assign(window, {
  CollateralRelease
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/CollateralRelease.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/FundCollateral.jsx
try { (() => {
// B-04 · Fund collateral (payment). Amount hero + Paystack methods + security note.
function FundCollateral({
  onBack,
  onPay
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [method, setMethod] = React.useState("card");
  function MethodCard({
    id,
    icon,
    label,
    right
  }) {
    const on = method === id;
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => setMethod(id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        borderRadius: 10,
        padding: on ? "14.5px" : "16px",
        background: on ? "var(--brand-50)" : "#fff",
        border: on ? "1.5px solid var(--brand-500)" : "none",
        boxShadow: on ? "none" : "var(--shadow-1)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 20,
      color: "var(--neutral-700)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        color: "var(--neutral-900)",
        flex: 1
      }
    }, label), right);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement(MobileTopbar, {
    title: "Fund collateral",
    onBack: onBack,
    step: "Step 3 of 3"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "40px 24px 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, "Collateral amount"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontSize: 28,
      fontWeight: 600,
      letterSpacing: "-0.5px",
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, RVB.collateral), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontSize: 14,
      color: "var(--success-600)"
    }
  }, "Fully refundable on clean return")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, "Pay with"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(MethodCard, {
    id: "card",
    icon: "credit-card",
    label: "Debit card or bank transfer",
    right: /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        color: "var(--brand-600)"
      }
    }, "Paystack")
  }), /*#__PURE__*/React.createElement(MethodCard, {
    id: "ussd",
    icon: "phone",
    label: "USSD (*737#, *901#, etc.)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      background: "var(--neutral-50)",
      borderRadius: 10,
      padding: 14,
      display: "flex",
      gap: 8,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: 16,
    color: "var(--neutral-400)",
    style: {
      marginTop: 1,
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)",
      lineHeight: 1.5
    }
  }, "Payment is processed by Paystack. Your card details are never stored by RentVault.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    onClick: onPay
  }, "Pay ", RVB.collateral, " \u2192")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontSize: 12,
      color: "var(--neutral-400)",
      textAlign: "center"
    }
  }, "Once confirmed, your collateral is held safely in escrow.")));
}
Object.assign(window, {
  FundCollateral
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/FundCollateral.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/FundedConfirmation.jsx
try { (() => {
// B-05 · Collateral funded confirmation. Full-screen success / receipt.
function FundedConfirmation({
  onViewAgreement,
  onSave
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [toast, setToast] = React.useState(null);
  const rows = [["Item", "Canon EOS R6"], ["Return by", RVB.returnByFull], ["Your collateral", RVB.collateral], ["Auto-release", "Within 48 hrs of clean return"], ["Agreement ID", RVB.agreementId]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 28,
      flex: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      background: "#fff",
      borderBottom: "1px solid var(--neutral-100)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 13,
    color: "var(--brand-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "-0.2px",
      color: "var(--neutral-900)"
    }
  }, "RentVault")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      flex: "none",
      background: "var(--brand-600)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "64px 24px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 72,
      height: 72,
      borderRadius: 9999,
      background: "var(--success-50)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 36,
    color: "var(--success-600)"
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "20px 0 0",
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)",
      textAlign: "center"
    }
  }, "Collateral locked. Agreement is live."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontSize: 14,
      color: "var(--neutral-500)",
      lineHeight: 1.65,
      textAlign: "center",
      maxWidth: 320
    }
  }, "Your \u20A6200,000 is secured in escrow. Return the Canon EOS R6 by 22 June 2026 in good condition to get it back automatically."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      width: "100%",
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      boxSizing: "border-box"
    }
  }, rows.map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)",
      whiteSpace: "nowrap"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: i === 2 ? 600 : 400,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums",
      fontFamily: k === "Agreement ID" ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "var(--font-sans)",
      textAlign: "right"
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StepRow, {
    icon: "package"
  }, "Pick up the item and confirm condition at handover"), /*#__PURE__*/React.createElement(StepRow, {
    icon: "calendar"
  }, "Return it by 22 June 2026 before 6:00 PM"), /*#__PURE__*/React.createElement(StepRow, {
    icon: "shield-check"
  }, "\u20A6200,000 automatically returned within 48 hours of clean return")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    onClick: onViewAgreement
  }, "View my agreement \u2192"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 16,
      color: "var(--neutral-900)"
    }),
    onClick: () => {
      onSave && onSave();
      setToast("Confirmation saved to your device");
    }
  }, "Save confirmation"))), toast && /*#__PURE__*/React.createElement(Toast, {
    message: toast,
    onDone: () => setToast(null)
  }));
}
Object.assign(window, {
  FundedConfirmation
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/FundedConfirmation.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/MyRentals.jsx
try { (() => {
// B-09 · Borrower — My rentals (populated). Account-light list home: active rentals
// up top (status-led), a quiet one-number summary, then past rentals. No metrics grid.
function MyRentals({
  onOpen,
  onScan
}) {
  const {
    Button,
    Badge
  } = window.RentVaultDesignSystem_eb37ad;

  // Sample borrower portfolio — independent of flow position so the screen always reads well.
  const active = [{
    id: "AG-3041",
    item: "Canon EOS R6",
    lender: "Emeka Okafor",
    icon: "camera",
    collateral: 200000,
    returnBy: "22 Jun 2026",
    daysLeft: 2
  }, {
    id: "AG-3052",
    item: "Shure SM7B mic kit",
    lender: "Bola Ahmed",
    icon: "music-2",
    collateral: 90000,
    returnBy: "26 Jun 2026",
    daysLeft: 1
  }];
  const past = [{
    id: "AG-2987",
    item: "Sony A7 III",
    lender: "Emeka Okafor",
    icon: "camera",
    refunded: 180000,
    on: "8 Jun 2026",
    outcome: "Returned",
    rated: 5
  }, {
    id: "AG-2904",
    item: "DJI Mavic 3 drone",
    lender: "Tunde Bakare",
    icon: "monitor",
    refunded: 320000,
    on: "24 May 2026",
    outcome: "Returned",
    rated: null
  }, {
    id: "AG-2861",
    item: "Yamaha keyboard",
    lender: "Bola Ahmed",
    icon: "music-2",
    refunded: 55000,
    on: "2 May 2026",
    outcome: "Penalty",
    penalty: 5000,
    rated: 4
  }];
  const heldTotal = active.reduce((s, a) => s + a.collateral, 0);

  // Countdown urgency → color (state, not decoration).
  const dueTone = d => d <= 0 ? "danger" : d <= 1 ? "warning" : "neutral";
  const dueLabel = d => d < 0 ? `${-d} ${-d === 1 ? "day" : "days"} overdue` : d === 0 ? "Due today" : d === 1 ? "Due tomorrow" : `${d} days left`;
  const tone = {
    neutral: "var(--neutral-500)",
    warning: "var(--warning-600)",
    danger: "var(--danger-600)"
  };
  const accent = {
    neutral: "var(--brand-500)",
    warning: "var(--warning-500)",
    danger: "var(--danger-500)"
  };
  const SectionLabel = ({
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, children);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement(MobileTopbar, {
    title: "My rentals"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderBottom: "1px solid var(--neutral-200)",
      padding: "20px 20px 22px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, "Collateral held in escrow"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      display: "flex",
      alignItems: "baseline",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28,
      fontWeight: 600,
      letterSpacing: "-0.5px",
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, naira(heldTotal)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--neutral-500)"
    }
  }, "across ", active.length, " active ", active.length === 1 ? "rental" : "rentals")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0 0",
      fontSize: 12,
      color: "var(--neutral-400)",
      lineHeight: 1.5
    }
  }, "Returned automatically within 48 hours of each clean return.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 20px 8px"
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Active")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 20px",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, active.map(a => {
    const t = dueTone(a.daysLeft);
    return /*#__PURE__*/React.createElement("button", {
      key: a.id,
      onClick: () => onOpen && onOpen(a),
      style: {
        position: "relative",
        textAlign: "left",
        width: "100%",
        background: "#fff",
        boxShadow: "var(--shadow-2)",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        padding: 0,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 2,
        background: accent[t]
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 44,
        height: 44,
        flex: "none",
        borderRadius: 8,
        background: "var(--neutral-100)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: a.icon,
      size: 22,
      color: "var(--neutral-700)"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 600,
        color: "var(--neutral-900)"
      }
    }, a.item), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--neutral-500)"
      }
    }, "from ", a.lender)), /*#__PURE__*/React.createElement(Badge, {
      variant: "success",
      dot: true
    }, "Active")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
        paddingTop: 14,
        borderTop: "1px solid var(--neutral-100)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--neutral-500)"
      }
    }, "Collateral held"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 17,
        fontWeight: 600,
        color: "var(--neutral-900)",
        fontVariantNumeric: "tabular-nums"
      }
    }, naira(a.collateral))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 13,
        fontWeight: 600,
        color: tone[t],
        fontVariantNumeric: "tabular-nums"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "clock",
      size: 14,
      color: tone[t]
    }), dueLabel(a.daysLeft)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--neutral-400)"
      }
    }, "Return by ", a.returnBy)))));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "28px 20px 8px"
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Past rentals")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, past.map(p => {
    const penalised = p.outcome === "Penalty";
    return /*#__PURE__*/React.createElement("button", {
      key: p.id,
      onClick: () => onOpen && onOpen(p),
      style: {
        textAlign: "left",
        width: "100%",
        background: "#fff",
        boxShadow: "var(--shadow-1)",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        padding: 14,
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 40,
        height: 40,
        flex: "none",
        borderRadius: 8,
        background: "var(--neutral-100)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: p.icon,
      size: 20,
      color: "var(--neutral-400)"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--neutral-900)"
      }
    }, p.item), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--neutral-500)",
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", null, p.on), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--neutral-300)"
      }
    }, "\xB7"), p.rated ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 3
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "star",
      size: 12,
      color: "var(--warning-500)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontVariantNumeric: "tabular-nums"
      }
    }, p.rated.toFixed(1))) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--brand-600)",
        fontWeight: 600
      }
    }, "Rate lender"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--neutral-900)",
        fontVariantNumeric: "tabular-nums"
      }
    }, naira(p.refunded)), /*#__PURE__*/React.createElement(Badge, {
      variant: penalised ? "danger" : "success",
      dot: true
    }, penalised ? "Penalty" : "Returned")));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none",
      borderTop: "1px solid var(--neutral-200)",
      background: "#fff",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "scan-line",
      size: 16,
      color: "#fff"
    }),
    onClick: onScan
  }, "Scan to rent again \u2192")));
}
Object.assign(window, {
  MyRentals
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/MyRentals.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/OverdueState.jsx
try { (() => {
// C-01 · Borrower — Overdue state. Penalty already deducted; remaining collateral + schedule.
function OverdueState({
  onReturn
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const schedule = [["Day 3 — 12:00 AM tonight", "₦5,000"], ["Day 4 — 12:00 AM tomorrow", "₦5,000"]];
  const deductedPct = 5; // ₦10,000 of ₦200,000

  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 28,
      flex: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      background: "#fff",
      borderBottom: "1px solid var(--neutral-100)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 13,
    color: "var(--brand-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "-0.2px",
      color: "var(--neutral-900)"
    }
  }, "RentVault")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      flex: "none",
      background: "var(--danger-50)",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "alert-triangle",
    size: 20,
    color: "var(--danger-600)",
    style: {
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--danger-900)"
    }
  }, "Your rental is overdue"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--danger-600)",
      fontVariantNumeric: "tabular-nums"
    }
  }, "2 days")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, "Collateral remaining"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontSize: 22,
      fontWeight: 600,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, "\u20A6190,000"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      height: 4,
      borderRadius: 9999,
      background: "var(--neutral-200)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${deductedPct}%`,
      height: "100%",
      background: "var(--danger-600)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontSize: 12,
      color: "var(--danger-600)"
    }
  }, "\u20A610,000 deducted across 2 days"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--neutral-200)",
      margin: "16px 0"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, "Next deductions"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, schedule.map(([d, amt], i) => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "12px 0",
      borderBottom: i < schedule.length - 1 ? "1px solid var(--neutral-200)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--neutral-900)"
    }
  }, d), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--danger-600)",
      fontVariantNumeric: "tabular-nums"
    }
  }, amt))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    onClick: onReturn
  }, "Return now to stop penalties \u2192")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontSize: 12,
      color: "var(--neutral-400)",
      textAlign: "center",
      lineHeight: 1.5
    }
  }, "Each additional day incurs \u20A65,000 until the item is returned or collateral reaches zero.")));
}
Object.assign(window, {
  OverdueState
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/OverdueState.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/PickupSignOff.jsx
try { (() => {
// B-06 · Borrower — Pickup condition sign-off. Confirm item condition at handover.
function PickupSignOff({
  onBack,
  onConfirmed
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [checks, setChecks] = React.useState([false, false, false, false]);
  const [confirmed, setConfirmed] = React.useState(false);
  const [zoom, setZoom] = React.useState(null);
  const items = ["Item matches the photos above", "No pre-existing damage I disagree with", "Accessories and components are complete", "I am taking possession of this item now"];
  const allChecked = checks.every(Boolean);
  const photos = ["Front / body", "Lens + mount", "Top dials", "Battery door"];
  function toggle(i) {
    setChecks(c => c.map((v, j) => j === i ? !v : v));
  }
  function PhotoTile({
    label,
    onClick,
    radius = 6
  }) {
    return /*#__PURE__*/React.createElement("button", {
      onClick: onClick,
      style: {
        position: "relative",
        border: "none",
        cursor: onClick ? "zoom-in" : "default",
        padding: 0,
        aspectRatio: "1 / 1",
        borderRadius: radius,
        overflow: "hidden",
        background: "repeating-linear-gradient(135deg, var(--neutral-100) 0 9px, var(--neutral-200) 9px 18px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        margin: 8,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 10,
        color: "var(--neutral-500)",
        background: "rgba(255,255,255,0.82)",
        padding: "2px 6px",
        borderRadius: 4
      }
    }, label));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      height: 56,
      flex: "none",
      background: "#fff",
      borderBottom: "1px solid var(--neutral-200)",
      display: "flex",
      alignItems: "center",
      padding: "0 16px",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    "aria-label": "Back",
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "inline-flex",
      padding: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 20,
    color: "var(--neutral-700)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      lineHeight: 1.25
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, "Pickup sign-off"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, RVB.item))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--brand-50)",
      borderLeft: "3px solid var(--brand-600)",
      borderRadius: 10,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--brand-900)",
      lineHeight: 1.55
    }
  }, "Both parties must confirm item condition now. This is your evidence if a dispute arises later.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: mLabel
  }, "Item condition at pickup"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, photos.map(p => /*#__PURE__*/React.createElement(PhotoTile, {
    key: p,
    label: p,
    onClick: () => setZoom(p)
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontSize: 12,
      color: "var(--neutral-400)"
    }
  }, "Photos uploaded by ", RVB.lender, " \xB7 19 Jun 2026")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: mLabel
  }, "Confirm you have inspected the item"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, items.map((label, i) => /*#__PURE__*/React.createElement("label", {
    key: i,
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
      cursor: "pointer",
      fontSize: 14,
      color: "var(--neutral-700)",
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => toggle(i),
    style: {
      width: 18,
      height: 18,
      flex: "none",
      marginTop: 1,
      borderRadius: 4,
      background: checks[i] ? "var(--brand-600)" : "var(--neutral-100)",
      border: checks[i] ? "none" : "1px solid var(--neutral-300)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, checks[i] && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 12,
    color: "#fff",
    strokeWidth: 3
  })), label)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, confirmed ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--success-50)",
      borderLeft: "3px solid var(--success-600)",
      borderRadius: 10,
      padding: 14,
      display: "flex",
      alignItems: "center",
      gap: 8,
      animation: "rvSlideUp 220ms ease-out"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 20,
    color: "var(--success-600)",
    style: {
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--success-900)"
    }
  }, "Pickup confirmed and recorded.")) : /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    disabled: !allChecked,
    onClick: () => setConfirmed(true)
  }, "Confirm pickup \u2192")), confirmed && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    onClick: onConfirmed
  }, "Continue to agreement \u2192"))), zoom && /*#__PURE__*/React.createElement("div", {
    onClick: () => setZoom(null),
    style: {
      position: "absolute",
      inset: 0,
      background: "rgba(18,19,24,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      zIndex: 20,
      cursor: "zoom-out"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 320,
      boxShadow: "var(--shadow-3)",
      borderRadius: 12,
      overflow: "hidden",
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "1 / 1",
      background: "repeating-linear-gradient(135deg, var(--neutral-100) 0 14px, var(--neutral-200) 14px 28px)",
      display: "flex",
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      margin: 12,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 12,
      color: "var(--neutral-500)",
      background: "rgba(255,255,255,0.85)",
      padding: "3px 8px",
      borderRadius: 4
    }
  }, zoom)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px",
      fontSize: 12,
      color: "var(--neutral-400)"
    }
  }, "Tap anywhere to close"))), /*#__PURE__*/React.createElement("style", null, `@keyframes rvSlideUp { from { transform: translateY(12px); } to { transform: translateY(0); } }`));
}
Object.assign(window, {
  PickupSignOff
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/PickupSignOff.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/ReturnFlow.jsx
try { (() => {
// B-07 · Borrower — Return flow. Upload return photos, compare, confirm and submit.
function ReturnFlow({
  onBack,
  onSubmit
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [photos, setPhotos] = React.useState(0);
  const [checks, setChecks] = React.useState([false, false, false]);
  const items = ["Item is in same condition as pickup", "All accessories are included", "I am returning this item to the lender now"];
  const enough = photos >= 2;
  const allChecked = checks.every(Boolean);
  const ready = enough && allChecked;
  function toggle(i) {
    setChecks(c => c.map((v, j) => j === i ? !v : v));
  }
  const stripe = (deg, a, b) => `repeating-linear-gradient(${deg}deg, var(--neutral-100) 0 ${a}px, var(--neutral-200) ${a}px ${b}px)`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement(MobileTopbar, {
    title: "Return item",
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--warning-50)",
      borderLeft: "3px solid var(--warning-600)",
      borderRadius: 10,
      padding: 14,
      display: "flex",
      gap: 12,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 20,
    color: "var(--warning-600)",
    style: {
      flex: "none",
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--warning-900)",
      lineHeight: 1.45
    }
  }, "Return due in 6 hours \u2014 today by 6:00 PM."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontSize: 12,
      color: "var(--warning-900)",
      opacity: 0.85
    }
  }, "Late returns incur \u20A65,000/day automatically."))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: mLabel
  }, "Upload return condition photos"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPhotos(n => Math.min(n + 1, 4)),
    style: {
      marginTop: 12,
      width: "100%",
      border: "1.5px dashed var(--neutral-300)",
      background: "#fff",
      borderRadius: 10,
      padding: "24px 16px",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 9999,
      background: "var(--brand-50)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "camera",
    size: 20,
    color: "var(--brand-600)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, photos === 0 ? "Add return photos" : "Add another photo"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: enough ? "var(--success-600)" : "var(--neutral-400)"
    }
  }, photos === 0 ? "Minimum 2 photos required" : `${photos} of min. 2 added${enough ? " ✓" : ""}`)), photos > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 8
    }
  }, Array.from({
    length: photos
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      aspectRatio: "1 / 1",
      borderRadius: 6,
      background: stripe(135, 7, 14)
    }
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontSize: 12,
      color: "var(--neutral-400)",
      lineHeight: 1.5
    }
  }, "Photos are recorded as evidence of return condition.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)",
      marginBottom: 8
    }
  }, "At pickup"), /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "1 / 1",
      borderRadius: 6,
      background: stripe(135, 9, 18)
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)",
      marginBottom: 8
    }
  }, "Now"), photos > 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "1 / 1",
      borderRadius: 6,
      background: stripe(135, 9, 18)
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "1 / 1",
      borderRadius: 6,
      border: "1.5px dashed var(--neutral-300)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 11,
      color: "var(--neutral-400)",
      textAlign: "center",
      padding: 8,
      boxSizing: "border-box"
    }
  }, "Upload to compare")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, items.map((label, i) => /*#__PURE__*/React.createElement("label", {
    key: i,
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
      cursor: "pointer",
      fontSize: 14,
      color: "var(--neutral-700)",
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => toggle(i),
    style: {
      width: 18,
      height: 18,
      flex: "none",
      marginTop: 1,
      borderRadius: 4,
      background: checks[i] ? "var(--brand-600)" : "var(--neutral-100)",
      border: checks[i] ? "none" : "1px solid var(--neutral-300)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, checks[i] && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 12,
    color: "#fff",
    strokeWidth: 3
  })), label))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    disabled: !ready,
    onClick: onSubmit
  }, "Send return for review \u2192")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontSize: 12,
      color: "var(--neutral-400)",
      textAlign: "center",
      lineHeight: 1.5
    }
  }, "The lender has 48 hours to review. If no dispute is filed, your ", RVB.collateral, " is released automatically.")));
}
Object.assign(window, {
  ReturnFlow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/ReturnFlow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/ScanLanding.jsx
try { (() => {
// B-01 · QR scan landing. First screen a borrower sees. No nav chrome.
function ScanLanding({
  onAccept,
  onQuestions
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const rows = [["Rental period", RVB.period], ["Daily rate", RVB.daily], ["Return date", RVB.returnBy], ["Collateral required", RVB.collateral]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      flex: "none",
      background: "var(--brand-600)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 16px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 20,
    color: "#fff"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "#fff"
    }
  }, "RentVault")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--brand-100)"
    }
  }, "Secured by Paystack escrow")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "32px 24px 24px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, "You've been invited to rent"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "8px 0 0",
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)"
    }
  }, RVB.item), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0",
      fontSize: 14,
      color: "var(--neutral-500)"
    }
  }, "from ", RVB.lender), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      background: "var(--neutral-50)",
      borderRadius: 10,
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, rows.map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)",
      whiteSpace: "nowrap"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums",
      whiteSpace: "nowrap"
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      background: "var(--brand-50)",
      borderLeft: "3px solid var(--brand-600)",
      borderRadius: 10,
      padding: 14,
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 20,
    color: "var(--brand-600)",
    style: {
      flex: "none",
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--brand-900)"
    }
  }, "\u20A6200,000 refundable collateral"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--brand-600)",
      lineHeight: 1.5
    }
  }, "Automatically returned to you if the item comes back on time and undamaged."))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    onClick: onAccept
  }, "Accept and verify identity \u2192")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontSize: 12,
      color: "var(--neutral-400)",
      textAlign: "center"
    }
  }, "You'll need your BVN or NIN. Takes under 2 minutes."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setHelpOpen(true),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--brand-600)"
    }
  }, "Questions about this rental? \u2192"))), helpOpen && /*#__PURE__*/React.createElement(Sheet, {
    title: "Questions about this rental?",
    onClose: () => setHelpOpen(false)
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 16px",
      fontSize: 14,
      color: "var(--neutral-500)",
      lineHeight: 1.6
    }
  }, "Get help before you accept. Your collateral is only charged after you verify and pay."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, [["message-circle", "Message " + RVB.lender, "Lender usually replies in ~10 min"], ["shield", "How does collateral work?", "Refundable, held in escrow"], ["life-buoy", "Contact RentVault support", "Available 24/7"]].map(([icon, label, sub]) => /*#__PURE__*/React.createElement("button", {
    key: label,
    onClick: () => {
      setHelpOpen(false);
      setToast("We'll connect you shortly");
    },
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
      textAlign: "left",
      cursor: "pointer",
      background: "var(--neutral-50)",
      border: "none",
      borderRadius: 10,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      flex: "none",
      borderRadius: 9999,
      background: "var(--brand-50)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18,
    color: "var(--brand-600)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 1,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, sub)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 16,
    color: "var(--neutral-400)"
  }))))), toast && /*#__PURE__*/React.createElement(Toast, {
    message: toast,
    onDone: () => setToast(null)
  }));
}
Object.assign(window, {
  ScanLanding
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/ScanLanding.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/kit-common.jsx
try { (() => {
// Shared helpers for the RentVault borrower (mobile) kit.
const {
  useState,
  useEffect,
  useRef
} = React;
function toPascal(s) {
  return s.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join("");
}

/** Lucide icon as a React component (1.5px stroke), built from icon node data. */
function Icon({
  name,
  size = 20,
  color = "currentColor",
  strokeWidth = 1.5,
  style = {}
}) {
  const nodes = window.lucide && window.lucide.icons && window.lucide.icons[toPascal(name)] || [];
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: "block",
      flex: "none",
      ...style
    }
  }, nodes.map((n, i) => React.createElement(n[0], {
    key: i,
    ...n[1]
  })));
}

// Borrower-side agreement (mirrors the lender's AG-3041).
const RVB = {
  item: "Canon EOS R6 Camera",
  lender: "Emeka Okafor",
  agreementId: "AG-3041",
  serial: "062041000537",
  period: "20–22 Jun 2026",
  start: "20 Jun 2026",
  daily: "₦5,000",
  returnBy: "22 Jun 2026",
  returnByFull: "22 Jun 2026, 6:00 PM",
  collateral: "₦200,000",
  penalty: "₦5,000 / day",
  // Lender catalogue the borrower can browse and request from.
  lenderProfile: {
    name: "Emeka Okafor",
    initials: "EO",
    rating: 4.9,
    rentals: 128,
    joined: "2024",
    verified: true
  },
  catalogue: [{
    id: "IT-1042",
    name: "Canon EOS R6",
    category: "Camera & Photo",
    icon: "camera",
    rate: 5000,
    collateral: 210000,
    available: 1,
    blurb: "Full-frame mirrorless body. 20MP, in-body stabilisation. Battery + 64GB card included."
  }, {
    id: "IT-1039",
    name: "Sony A7 III",
    category: "Camera & Photo",
    icon: "camera",
    rate: 4500,
    collateral: 180000,
    available: 2,
    blurb: "Reliable full-frame workhorse. Two bodies available, each with a kit lens."
  }, {
    id: "IT-1031",
    name: "Shure SM7B mic kit",
    category: "Audio",
    icon: "music-2",
    rate: 3000,
    collateral: 90000,
    available: 1,
    blurb: "Broadcast mic with arm and interface. Great for podcasts and voice-overs."
  }, {
    id: "IT-1024",
    name: "DJI Mavic 3 drone",
    category: "Electronics",
    icon: "monitor",
    rate: 8000,
    collateral: 320000,
    available: 1,
    blurb: "4/3 CMOS Hasselblad camera, 46-min flight time. Includes 3 batteries and case."
  }, {
    id: "IT-1018",
    name: "Yamaha keyboard",
    category: "Audio",
    icon: "music-2",
    rate: 2500,
    collateral: 60000,
    available: 3,
    blurb: "88-key weighted stage piano. Stand and sustain pedal included."
  }]
};

// Mobile field helpers
const mLabel = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--neutral-700)"
};
const mField = {
  width: "100%",
  height: 44,
  padding: "12px 16px",
  boxSizing: "border-box",
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  color: "var(--neutral-900)",
  background: "var(--neutral-100)",
  border: "1px solid var(--neutral-300)",
  borderRadius: 6,
  outline: "none"
};

// Full-width mobile topbar: back arrow + centered title + optional step label.
function MobileTopbar({
  title,
  onBack,
  step = null
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      flex: "none",
      background: "#fff",
      borderBottom: "1px solid var(--neutral-200)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 28,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderBottom: "1px solid var(--neutral-100)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 13,
    color: "var(--brand-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "-0.2px",
      color: "var(--neutral-900)"
    }
  }, "RentVault")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 52,
      display: "flex",
      alignItems: "center",
      padding: "0 16px",
      position: "relative"
    }
  }, onBack && /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    "aria-label": "Back",
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "inline-flex",
      padding: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 20,
    color: "var(--neutral-700)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, title), step && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, step)));
}

// Pill chip selector (BVN/NIN etc.)
function ChipGroup({
  options,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, options.map(o => {
    const on = o === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      onClick: () => onChange(o),
      style: {
        padding: "8px 16px",
        borderRadius: 9999,
        border: "none",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 600,
        background: on ? "var(--brand-600)" : "var(--neutral-100)",
        color: on ? "#fff" : "var(--neutral-700)"
      }
    }, o);
  }));
}

// Icon + text info row (used in "what happens next" sections).
function StepRow({
  icon,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      flex: "none",
      borderRadius: 9999,
      background: "var(--brand-50)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20,
    color: "var(--brand-600)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--neutral-700)",
      lineHeight: 1.5
    }
  }, children));
}

// Toast — absolute within the phone frame, auto-dismisses.
function Toast({
  message,
  icon = "check",
  onDone,
  duration = 1900
}) {
  useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), duration);
    return () => clearTimeout(t);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      bottom: 28,
      transform: "translateX(-50%)",
      zIndex: 80,
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "var(--neutral-900)",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: 9999,
      boxShadow: "var(--shadow-3)",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      whiteSpace: "nowrap",
      animation: "rvToastIn 200ms ease-out"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 16,
    color: "#fff"
  }), message, /*#__PURE__*/React.createElement("style", null, `@keyframes rvToastIn { from { transform: translate(-50%, 8px); } to { transform: translate(-50%, 0); } }`));
}

// Bottom sheet modal — slides up inside the phone frame. Tap scrim to close.
function Sheet({
  title,
  onClose,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "absolute",
      inset: 0,
      background: "rgba(18,19,24,0.45)",
      display: "flex",
      alignItems: "flex-end",
      zIndex: 70
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "100%",
      background: "#fff",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      boxSizing: "border-box",
      boxShadow: "var(--shadow-3)",
      animation: "rvSheetUp 260ms cubic-bezier(0.16,1,0.3,1)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 4,
      borderRadius: 9999,
      background: "var(--neutral-200)",
      margin: "0 auto 16px"
    }
  }), title && /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "0 0 12px",
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: "-0.2px",
      color: "var(--neutral-900)"
    }
  }, title), children, /*#__PURE__*/React.createElement("style", null, `@keyframes rvSheetUp { from { transform: translateY(12px); } to { transform: translateY(0); } }`)));
}

// ── Date/time + currency formatters (Nigerian conventions) ──────────────────
const RV_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const RV_MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const RV_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function rvAsDate(d) {
  return d instanceof Date ? d : new Date(d);
}
function fmtDate(d) {
  const x = rvAsDate(d);
  return `${x.getDate()} ${RV_MONTHS[x.getMonth()]} ${x.getFullYear()}`;
}
function fmtDateLong(d) {
  const x = rvAsDate(d);
  return `${RV_DAYS[x.getDay()]}, ${x.getDate()} ${RV_MONTHS_FULL[x.getMonth()]} ${x.getFullYear()}`;
}
function fmtTime(d) {
  const x = rvAsDate(d);
  let h = x.getHours();
  const m = String(x.getMinutes()).padStart(2, "0");
  const ap = h < 12 ? "AM" : "PM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}
function relTime(d) {
  const s = Math.floor((Date.now() - rvAsDate(d).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const dd = Math.floor(h / 24);
  if (dd === 1) return "Yesterday";
  if (dd < 7) return `${dd} days ago`;
  return fmtDate(d);
}
function naira(n) {
  return "\u20a6" + Number(n || 0).toLocaleString("en-NG");
}
// RentVault escrow reference ID — replaces tx hashes everywhere. Format RV-2026-NNNNN.
function rvRef(n) {
  return "RV-2026-" + String(n != null ? n : Math.floor(10000 + Math.random() * 89999)).padStart(5, "0");
}

// Semantic <time> element with a full date+time tooltip. format: date | long | time | rel
function DateText({
  value,
  format = "date",
  style = {}
}) {
  const map = {
    date: fmtDate,
    long: fmtDateLong,
    time: fmtTime,
    rel: relTime
  };
  const fn = map[format] || fmtDate;
  const x = rvAsDate(value);
  const iso = isNaN(x.getTime()) ? undefined : x.toISOString();
  const tip = isNaN(x.getTime()) ? undefined : fmtDateLong(x) + " \u00b7 " + fmtTime(x);
  return React.createElement("time", {
    dateTime: iso,
    title: tip,
    style: {
      fontVariantNumeric: "tabular-nums",
      ...style
    }
  }, fn(value));
}
Object.assign(window, {
  Icon,
  RVB,
  toPascal,
  MobileTopbar,
  ChipGroup,
  StepRow,
  mLabel,
  mField,
  Toast,
  Sheet,
  DateText,
  fmtDate,
  fmtDateLong,
  fmtTime,
  relTime,
  naira,
  rvRef
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/kit-common.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/AgreementDetailScreen.jsx
try { (() => {
// A-08 · Active agreement detail. Header card + escrow ledger + condition evidence.
function AgreementDetailScreen({
  onBack,
  agreement,
  onConfirmReturn,
  onRaiseDispute
}) {
  const {
    Button,
    Badge
  } = window.RentVaultDesignSystem_eb37ad;
  const a = agreement || {
    item: "Canon EOS R6",
    borrower: "Tunde Bakare",
    collateral: "₦200,000"
  };
  const [zoom, setZoom] = React.useState(null);
  const amount = Number(String(a.collateral).replace(/[^\d]/g, "")) || 0;
  const isOverdue = a.status === "overdue";
  const overdueDays = a.overdueDays || (isOverdue ? 1 : 0);
  const penaltyPerDay = 5000;
  const penaltyTotal = isOverdue ? overdueDays * penaltyPerDay : 0;
  const remaining = amount - penaltyTotal;
  const st = RV.statusMap[a.status] || RV.statusMap.active;
  const detail = [["Borrower", a.borrower], ["Return date", "22 Jun 2026"], ["Daily rate", "₦5,000"], ["Penalty / day", naira(penaltyPerDay)]];
  const ledger = [{
    event: "Collateral received",
    amount: "+" + naira(amount),
    positive: true,
    ref: "RV-2026-00440",
    time: "19 Jun 2026, 11:42 AM"
  }];
  if (penaltyTotal > 0) {
    ledger.push({
      event: "Late return penalty — Day " + overdueDays,
      amount: "−" + naira(penaltyTotal),
      positive: false,
      ref: "RV-2026-00441",
      time: "22 Jun 2026, 12:00 AM"
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement(FlowTopbar, {
    title: a.item,
    onBack: onBack,
    right: /*#__PURE__*/React.createElement(Badge, {
      variant: st.variant
    }, st.label)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 640,
      margin: "0 auto",
      padding: "24px 24px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "package",
    size: 20,
    color: "var(--neutral-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: "-0.2px",
      color: "var(--neutral-900)"
    }
  }, a.item)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, a.collateral), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--success-600)"
    }
  }, "held in escrow"))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--neutral-200)",
      margin: "16px 0"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, detail.map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--neutral-200)",
      margin: "16px 0"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 16,
    color: isOverdue ? "var(--danger-600)" : "var(--warning-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: isOverdue ? "var(--danger-900)" : "var(--warning-900)"
    }
  }, isOverdue ? overdueDays + (overdueDays === 1 ? " day overdue" : " days overdue") : "3 days remaining")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      height: 4,
      borderRadius: 9999,
      background: "var(--neutral-200)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: isOverdue ? "100%" : "57%",
      height: "100%",
      background: isOverdue ? "var(--danger-600)" : "var(--warning-600)"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)",
      whiteSpace: "nowrap"
    }
  }, "Escrow ledger"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--success-600)",
      fontVariantNumeric: "tabular-nums"
    }
  }, naira(remaining), " remaining")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, ledger.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: i < ledger.length - 1 ? "1px solid var(--neutral-200)" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--neutral-900)"
    }
  }, l.event), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--neutral-400)",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    }
  }, "ref: ", l.ref), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--neutral-400)"
    }
  }, l.time))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      fontVariantNumeric: "tabular-nums",
      color: l.positive ? "var(--success-600)" : "var(--danger-600)"
    }
  }, l.amount))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, "Condition evidence"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, "At pickup"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      flexWrap: "wrap"
    }
  }, [1, 2, 3].map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => setZoom(p),
    title: "View photo",
    style: {
      width: 60,
      height: 60,
      borderRadius: 6,
      border: "none",
      padding: 0,
      cursor: "zoom-in",
      background: "repeating-linear-gradient(135deg, var(--neutral-100) 0 7px, var(--neutral-200) 7px 14px)",
      display: "inline-flex",
      alignItems: "flex-end",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "maximize-2",
    size: 12,
    color: "var(--neutral-500)",
    style: {
      margin: 4
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, "At return"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 60,
      border: "1.5px dashed var(--neutral-300)",
      borderRadius: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-400)"
    }
  }, "Pending return"))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none",
      borderTop: "1px solid var(--neutral-200)",
      background: "#fff",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 640,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    style: {
      color: "var(--danger-600)"
    },
    onClick: onRaiseDispute
  }, "Raise dispute"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: onConfirmReturn
  }, "Confirm return"))), zoom !== null && /*#__PURE__*/React.createElement("div", {
    onClick: () => setZoom(null),
    style: {
      position: "fixed",
      inset: 0,
      background: "hsla(232,8%,12%,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
      zIndex: 100,
      cursor: "zoom-out"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "100%",
      maxWidth: 420,
      background: "#fff",
      borderRadius: 16,
      boxShadow: "var(--shadow-3)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "4 / 3",
      background: "repeating-linear-gradient(135deg, var(--neutral-100) 0 14px, var(--neutral-200) 14px 28px)",
      display: "flex",
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      margin: 14,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 12,
      color: "var(--neutral-500)",
      background: "rgba(255,255,255,0.85)",
      padding: "3px 8px",
      borderRadius: 4
    }
  }, "Pickup photo ", zoom, " of 3")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-400)",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    }
  }, "Recorded \xB7 RV-2026-04417"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setZoom(null),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 14,
      color: "var(--neutral-500)",
      fontFamily: "var(--font-sans)"
    }
  }, "Close")))));
}
Object.assign(window, {
  AgreementDetailScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/AgreementDetailScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/AgreementQRScreen.jsx
try { (() => {
// A-07 · Payment link awaiting borrower payment. Paystack link + QR + share/copy + status + next steps.
function FauxQR({
  size = 200,
  modules = 25,
  seed = 7
}) {
  // Deterministic pseudo-random module grid with 3 finder patterns (a mock QR).
  const cell = size / modules;
  let s = seed;
  const rand = () => {
    s = s * 1103515245 + 12345 & 0x7fffffff;
    return s / 0x7fffffff;
  };
  const isFinder = (r, c) => {
    const inBox = (br, bc) => r >= br && r < br + 7 && c >= bc && c < bc + 7;
    return inBox(0, 0) || inBox(0, modules - 7) || inBox(modules - 7, 0);
  };
  const rects = [];
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (isFinder(r, c)) continue;
      if (rand() > 0.55) rects.push(/*#__PURE__*/React.createElement("rect", {
        key: r + "-" + c,
        x: c * cell,
        y: r * cell,
        width: cell,
        height: cell,
        fill: "var(--neutral-900)"
      }));
    }
  }
  function Finder({
    x,
    y
  }) {
    return /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
      x: x,
      y: y,
      width: cell * 7,
      height: cell * 7,
      fill: "var(--neutral-900)"
    }), /*#__PURE__*/React.createElement("rect", {
      x: x + cell,
      y: y + cell,
      width: cell * 5,
      height: cell * 5,
      fill: "#fff"
    }), /*#__PURE__*/React.createElement("rect", {
      x: x + cell * 2,
      y: y + cell * 2,
      width: cell * 3,
      height: cell * 3,
      fill: "var(--neutral-900)"
    }));
  }
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: `0 0 ${size} ${size}`,
    role: "img",
    "aria-label": "QR code"
  }, /*#__PURE__*/React.createElement("rect", {
    width: size,
    height: size,
    fill: "#fff"
  }), rects, /*#__PURE__*/React.createElement(Finder, {
    x: 0,
    y: 0
  }), /*#__PURE__*/React.createElement(Finder, {
    x: (modules - 7) * cell,
    y: 0
  }), /*#__PURE__*/React.createElement(Finder, {
    x: 0,
    y: (modules - 7) * cell
  }));
}
function AgreementQRScreen({
  onBack,
  onDone,
  bundle
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [toast, setToast] = React.useState(null);
  const ref = "RV-2026-00441";
  const link = "rentvault.co/pay/" + ref;
  const lines = bundle && bundle.lines ? bundle.lines : null;
  const borrowerName = bundle && bundle.borrower ? bundle.borrower : "Tunde";
  const totalCollateral = bundle && bundle.totalCollateral != null ? bundle.totalCollateral : 200000;
  const firstName = String(borrowerName).split(" ")[0];
  const next = [{
    icon: "link",
    text: "Borrower opens the payment link on their phone"
  }, {
    icon: "user-check",
    text: "Borrower verifies identity with BVN or NIN"
  }, {
    icon: "credit-card",
    text: "Borrower pays via card, bank transfer, or USSD"
  }, {
    icon: "shield-check",
    text: "Collateral secured in escrow. Agreement goes live."
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement(FlowTopbar, {
    title: "Agreement created",
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 400,
      margin: "0 auto",
      padding: "40px 24px 48px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 48,
    color: "var(--success-600)"
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "16px 0 0",
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)",
      textAlign: "center"
    }
  }, "Agreement ready"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0 0",
      fontSize: 14,
      color: "var(--neutral-500)",
      lineHeight: 1.65,
      textAlign: "center",
      maxWidth: 320
    }
  }, "Send ", firstName, " the payment link below. Once they pay the ", naira(totalCollateral), " collateral via Paystack, the agreement activates automatically."), lines && lines.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      width: "100%",
      boxSizing: "border-box",
      background: "#fff",
      boxShadow: "var(--shadow-1)",
      borderRadius: 12,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, lines.map(l => /*#__PURE__*/React.createElement("div", {
    key: l.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 30,
      height: 30,
      flex: "none",
      borderRadius: 7,
      background: "var(--neutral-100)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: l.icon,
    size: 15,
    color: "var(--neutral-700)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      fontSize: 13,
      color: "var(--neutral-900)"
    }
  }, l.name, l.qty > 1 ? " \u00d7 " + l.qty : ""), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, naira(l.collateral * l.qty))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      paddingTop: 12,
      borderTop: "1px solid var(--neutral-200)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, "Total collateral"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, naira(totalCollateral)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      width: "100%",
      boxSizing: "border-box",
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 16,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "var(--neutral-50)",
      borderRadius: 10,
      padding: "14px 16px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "link",
    size: 16,
    color: "var(--neutral-400)",
    style: {
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, ref), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--neutral-400)",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, link))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(FauxQR, {
    size: 160
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 8,
      fontSize: 11,
      color: "var(--neutral-400)"
    }
  }, "Or scan to open on phone"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "share-2",
      size: 16,
      color: "var(--neutral-900)"
    }),
    onClick: async () => {
      const ok = await copyText("https://" + link);
      setToast(ok ? "Link copied — paste into WhatsApp" : link);
    }
  }, "Share via WhatsApp"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "copy",
      size: 16,
      color: "var(--neutral-900)"
    }),
    onClick: async () => {
      const ok = await copyText("https://" + link);
      setToast(ok ? "Payment link copied" : link);
    }
  }, "Copy link")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 16,
    color: "var(--neutral-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--neutral-500)"
    }
  }, "Awaiting borrower payment"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--warning-600)",
      fontVariantNumeric: "tabular-nums"
    }
  }, "\xB7 Link expires in 23:41")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-400)"
    }
  }, "What happens next"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, next.map((n, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      flex: "none",
      borderRadius: 9999,
      background: "var(--brand-50)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: n.icon,
    size: 20,
    color: "var(--brand-600)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--neutral-700)",
      lineHeight: 1.5
    }
  }, n.text))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    fullWidth: true,
    onClick: onDone
  }, "Back to dashboard")))), toast && /*#__PURE__*/React.createElement(Toast, {
    message: toast,
    onDone: () => setToast(null)
  }));
}
Object.assign(window, {
  AgreementQRScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/AgreementQRScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/ConfirmReturnModal.jsx
try { (() => {
// A-09 · Confirm return modal. Starts 48-hr dispute window.
function ConfirmReturnModal({
  onClose,
  onConfirm
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [cond, setCond] = React.useState(null); // good | damaged

  const summary = [["Borrower", "Tunde Bakare"], ["Item", "Canon EOS R6"], ["Collateral", "₦200,000"]];
  function OptionCard({
    id,
    label,
    variant
  }) {
    const on = cond === id;
    const sel = variant === "good" ? {
      bg: "var(--success-50)",
      border: "var(--success-600)"
    } : {
      bg: "var(--danger-50)",
      border: "var(--danger-600)"
    };
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => setCond(id),
      style: {
        flex: 1,
        textAlign: "left",
        cursor: "pointer",
        borderRadius: 10,
        padding: on ? "12.5px" : "14px",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.4,
        background: on ? sel.bg : "#fff",
        border: on ? `1.5px solid ${sel.border}` : "none",
        boxShadow: on ? "none" : "var(--shadow-2)",
        color: "var(--neutral-900)"
      }
    }, label);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "hsla(232,8%,12%,0.40)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 440,
      background: "#fff",
      borderRadius: 16,
      boxShadow: "var(--shadow-3)",
      padding: 28,
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 32,
    color: "var(--brand-600)"
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "16px 0 0",
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)",
      textAlign: "center"
    }
  }, "Confirm return?"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontSize: 14,
      color: "var(--neutral-500)",
      lineHeight: 1.65,
      textAlign: "center"
    }
  }, "Marking this item returned starts a 48-hour review window. If no dispute is filed, \u20A6200,000 is automatically released to Tunde's account."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      background: "var(--neutral-100)",
      borderRadius: 10,
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, summary.map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, v)))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "24px 0 8px",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, "Have you inspected the item?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(OptionCard, {
    id: "good",
    label: "Yes, returned in good condition",
    variant: "good"
  }), /*#__PURE__*/React.createElement(OptionCard, {
    id: "damaged",
    label: "No, item is damaged",
    variant: "damaged"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, cond === "damaged" ? /*#__PURE__*/React.createElement("button", {
    onClick: () => onConfirm && onConfirm("damaged"),
    style: {
      width: "100%",
      height: 44,
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      background: "var(--danger-600)",
      color: "#fff",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      fontWeight: 600
    }
  }, "File damage dispute \u2192") : /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    disabled: cond !== "good",
    onClick: () => onConfirm && onConfirm("good")
  }, "Start 48-hr release window \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--neutral-500)"
    }
  }, "Cancel"))));
}
Object.assign(window, {
  ConfirmReturnModal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/ConfirmReturnModal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/DashboardScreen.jsx
try { (() => {
// A-04 · Lender dashboard home. Stat row, overdue banner, active rentals + recent activity.
function DashboardScreen({
  onOpenAgreement,
  onListItem,
  onNewAgreement,
  onOpenPenalty,
  onOpenAgreements,
  onOpenChain
}) {
  const {
    StatCard,
    Card,
    Badge,
    Avatar,
    ListRow,
    AlertBanner,
    Button
  } = window.RentVaultDesignSystem_eb37ad;

  // Subtle hover-lift wrapper so stat cards read as clickable.
  function Clickable({
    onClick,
    children
  }) {
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClick,
      style: {
        cursor: "pointer",
        borderRadius: 12,
        transition: "transform 150ms ease, box-shadow 150ms ease"
      },
      onMouseEnter: e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--shadow-2)";
      },
      onMouseLeave: e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }
    }, children);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      display: "flex",
      flexDirection: "column",
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)"
    }
  }, "Overview"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 16,
      color: "var(--neutral-900)"
    }),
    onClick: onListItem
  }, "List an item"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "file-text",
      size: 16,
      color: "#fff"
    }),
    onClick: onNewAgreement
  }, "New agreement"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Clickable, {
    onClick: () => onOpenAgreements && onOpenAgreements("active")
  }, /*#__PURE__*/React.createElement(StatCard, {
    accent: "brand",
    label: "Active rentals",
    value: "3",
    sub: "\u2191 1 since last week",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "package",
      size: 22,
      color: "var(--neutral-200)"
    })
  })), /*#__PURE__*/React.createElement(Clickable, {
    onClick: () => onOpenAgreements && onOpenAgreements("active")
  }, /*#__PURE__*/React.createElement(StatCard, {
    accent: "success",
    label: "Collateral in escrow",
    value: "\u20A6420,000",
    sub: "Across 3 agreements",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "shield",
      size: 22,
      color: "var(--neutral-200)"
    })
  })), /*#__PURE__*/React.createElement(Clickable, {
    onClick: () => onOpenAgreements && onOpenAgreements("overdue")
  }, /*#__PURE__*/React.createElement(StatCard, {
    accent: "warning",
    label: "Overdue",
    value: "1",
    sub: "Action required",
    subVariant: "warning",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "clock",
      size: 22,
      color: "var(--neutral-200)"
    })
  })), /*#__PURE__*/React.createElement(Clickable, {
    onClick: () => onOpenChain && onOpenChain()
  }, /*#__PURE__*/React.createElement(StatCard, {
    accent: "danger",
    label: "Penalties this month",
    value: "\u20A618,000",
    sub: "2 penalty transfers",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "banknote",
      size: 22,
      color: "var(--neutral-200)"
    })
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      background: "var(--warning-50)",
      borderLeft: "3px solid var(--warning-600)",
      borderRadius: 10,
      padding: "14px 16px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "alert-triangle",
    size: 20,
    color: "var(--warning-600)",
    style: {
      marginTop: 1,
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--warning-900)"
    }
  }, "Overdue return"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--warning-900)",
      lineHeight: 1.5
    }
  }, "Tunde Bakare has not returned the Canon EOS R6 \u2014 2 days overdue. A penalty of \u20A610,000 was charged to their collateral.")), /*#__PURE__*/React.createElement("button", {
    onClick: () => onOpenAgreement && onOpenAgreement(RV.rentals[0]),
    style: {
      flex: "none",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--brand-600)"
    }
  }, "View agreement")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr",
      gap: 24,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: "-0.2px",
      color: "var(--neutral-900)"
    }
  }, "Active rentals"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onOpenAgreements && onOpenAgreements("all"),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--brand-600)"
    }
  }, "See all \u2192")), /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, RV.rentals.map((r, i) => {
    const s = RV.statusMap[r.status];
    return /*#__PURE__*/React.createElement(ListRow, {
      key: r.id,
      onClick: () => onOpenAgreement && onOpenAgreement(r),
      divider: i < RV.rentals.length - 1,
      leading: /*#__PURE__*/React.createElement("span", {
        style: {
          width: 40,
          height: 40,
          borderRadius: 9999,
          background: "var(--neutral-100)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center"
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: r.icon,
        size: 20,
        color: "var(--neutral-700)"
      })),
      title: r.item,
      meta: r.borrower,
      trailing: /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 14,
          fontWeight: 600,
          color: "var(--neutral-900)",
          fontVariantNumeric: "tabular-nums"
        }
      }, r.collateral), /*#__PURE__*/React.createElement(Badge, {
        variant: s.variant
      }, s.label))
    });
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: "-0.2px",
      color: "var(--neutral-900)"
    }
  }, "Recent activity"), /*#__PURE__*/React.createElement(Card, {
    padding: 20
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, RV.activity.slice(0, 5).map((a, i) => {
    const last = i === Math.min(5, RV.activity.length) - 1;
    const isPenalty = a.type === "Penalty charged";
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      onClick: isPenalty ? onOpenPenalty : undefined,
      style: {
        display: "flex",
        gap: 12,
        cursor: isPenalty ? "pointer" : "default"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 28,
        height: 28,
        borderRadius: 9999,
        background: "var(--brand-50)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: a.icon,
      size: 14,
      color: "var(--brand-600)"
    })), !last && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 2,
        flex: 1,
        minHeight: 24,
        background: "var(--neutral-200)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        paddingBottom: last ? 0 : 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "var(--neutral-900)"
      }
    }, a.type), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--neutral-700)",
        lineHeight: 1.5
      }
    }, a.desc), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--neutral-400)",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
      }
    }, a.ref), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--neutral-400)"
      }
    }, "\xB7 ", a.time))));
  }))))));
}
Object.assign(window, {
  DashboardScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/ItemsEmptyScreen.jsx
try { (() => {
// C-03 · Lender — Empty state. "My Items" with nothing listed yet.
function ItemsEmptyScreen({
  onListItem
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "40px 40px 0"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)"
    }
  }, "My Items")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 40
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 72,
      height: 72,
      borderRadius: 9999,
      background: "var(--neutral-100)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "package",
    size: 48,
    color: "var(--neutral-300)"
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "24px 0 0",
      fontSize: 18,
      fontWeight: 600,
      color: "var(--neutral-900)",
      textAlign: "center"
    }
  }, "No items listed yet"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0 0",
      fontSize: 14,
      color: "var(--neutral-500)",
      lineHeight: 1.6,
      textAlign: "center",
      maxWidth: 280
    }
  }, "List your first item and set up a rental in minutes."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    trailingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 16,
      color: "#fff"
    }),
    onClick: onListItem
  }, "List your first item"))));
}
Object.assign(window, {
  ItemsEmptyScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/ItemsEmptyScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/LenderSections.jsx
try { (() => {
// Lender section pages for the sidebar nav: Agreements, Borrowers, Activity, Settings.
// Each mirrors the dashboard's heading + DS-component conventions.

function PageHead({
  title,
  actions = null
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)"
    }
  }, title), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: 12
    }
  }, actions));
}

// ── Agreements ───────────────────────────────────────────────────────────────
function AgreementsScreen({
  onOpenAgreement,
  onNewAgreement,
  initialFilter
}) {
  const {
    Card,
    Badge,
    ListRow,
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [filter, setFilter] = React.useState(initialFilter || "all");
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 6;
  const tabs = [{
    id: "all",
    label: "All"
  }, {
    id: "active",
    label: "Active"
  }, {
    id: "overdue",
    label: "Overdue"
  }, {
    id: "pending",
    label: "Pending"
  }, {
    id: "returned",
    label: "Returned"
  }];
  React.useEffect(() => {
    setPage(1);
  }, [filter, query]);
  const matchFilter = r => filter === "all" || r.status === filter;
  const matchQuery = r => !query || (r.item + " " + r.id + " " + r.borrower).toLowerCase().includes(query.toLowerCase());
  const all = RV.rentals.filter(r => matchFilter(r) && matchQuery(r));
  const rows = all.slice((page - 1) * pageSize, page * pageSize);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      display: "flex",
      flexDirection: "column",
      gap: 24,
      maxWidth: 860,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: "Agreements",
    actions: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      leadingIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "file-text",
        size: 16,
        color: "#fff"
      }),
      onClick: onNewAgreement
    }, "New agreement")
  }), /*#__PURE__*/React.createElement(SearchInput, {
    value: query,
    onChange: setQuery,
    placeholder: "Search by item, borrower, or ID..."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, tabs.map(t => {
    const on = t.id === filter;
    const count = t.id === "all" ? RV.rentals.length : RV.rentals.filter(r => r.status === t.id).length;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => setFilter(t.id),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 32,
        padding: "0 14px",
        borderRadius: 9999,
        border: "1px solid " + (on ? "var(--brand-600)" : "var(--neutral-200)"),
        background: on ? "var(--brand-50)" : "#fff",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: on ? 600 : 400,
        color: on ? "var(--brand-700)" : "var(--neutral-700)"
      }
    }, t.label, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: on ? "var(--brand-600)" : "var(--neutral-400)",
        fontVariantNumeric: "tabular-nums"
      }
    }, count));
  })), /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, rows.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "48px 24px",
      textAlign: "center",
      fontSize: 14,
      color: "var(--neutral-400)"
    }
  }, "No agreements match.") : rows.map((r, i) => {
    const s = RV.statusMap[r.status];
    return /*#__PURE__*/React.createElement(ListRow, {
      key: r.id,
      onClick: () => onOpenAgreement && onOpenAgreement(r),
      divider: i < rows.length - 1,
      leading: /*#__PURE__*/React.createElement("span", {
        style: {
          width: 40,
          height: 40,
          borderRadius: 9999,
          background: "var(--neutral-100)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center"
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: r.icon,
        size: 20,
        color: "var(--neutral-700)"
      })),
      title: r.item,
      meta: r.id + " · " + r.borrower,
      trailing: /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 14,
          fontWeight: 600,
          color: "var(--neutral-900)",
          fontVariantNumeric: "tabular-nums"
        }
      }, r.collateral), /*#__PURE__*/React.createElement(Badge, {
        variant: s.variant
      }, s.label))
    });
  })), all.length > pageSize && /*#__PURE__*/React.createElement(Pagination, {
    page: page,
    pageSize: pageSize,
    total: all.length,
    onPage: setPage
  }));
}

// ── Borrowers ────────────────────────────────────────────────────────────────
function borrowerStats(b) {
  const active = b.rentals.filter(r => r.status === "active" || r.status === "overdue").length;
  const total = b.rentals.length + 3;
  const onTime = b.flagged ? 78 : 96;
  const trust = b.flagged ? 64 : 92;
  return {
    active,
    total,
    onTime,
    trust
  };
}
function BorrowerProfileModal({
  borrower,
  onClose,
  onOpenAgreement
}) {
  const {
    Button,
    Avatar,
    Badge
  } = window.RentVaultDesignSystem_eb37ad;
  const s = borrowerStats(borrower);
  const footer = /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onClose
  }, "Close"));
  return /*#__PURE__*/React.createElement(Modal, {
    title: "Borrower",
    onClose: onClose,
    footer: footer,
    width: 460
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: borrower.name,
    size: 52
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, borrower.name), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    variant: borrower.flagged ? "danger" : "success"
  }, borrower.flagged ? "Flagged" : "Good standing")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "var(--neutral-700)"
    }
  }, "Trust score"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, s.trust, "/100")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      borderRadius: 9999,
      background: "var(--neutral-200)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: s.trust + "%",
      height: "100%",
      background: borrower.flagged ? "var(--warning-600)" : "var(--success-600)"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 12
    }
  }, [["Active", s.active], ["Total rentals", s.total], ["On-time", s.onTime + "%"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      background: "var(--neutral-50)",
      borderRadius: 10,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--neutral-500)",
      marginTop: 2
    }
  }, k)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, "Agreements"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, borrower.rentals.map(r => {
    const st = RV.statusMap[r.status];
    return /*#__PURE__*/React.createElement("button", {
      key: r.id,
      onClick: () => onOpenAgreement && onOpenAgreement(r),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 10,
        border: "1px solid var(--neutral-200)",
        background: "#fff",
        cursor: "pointer",
        textAlign: "left"
      },
      onMouseEnter: e => e.currentTarget.style.background = "var(--neutral-50)",
      onMouseLeave: e => e.currentTarget.style.background = "#fff"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 32,
        height: 32,
        flex: "none",
        borderRadius: 8,
        background: "var(--neutral-100)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: r.icon,
      size: 16,
      color: "var(--neutral-700)"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: 14,
        fontWeight: 600,
        color: "var(--neutral-900)"
      }
    }, r.item), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: 12,
        color: "var(--neutral-400)"
      }
    }, r.id, " \xB7 ", r.collateral)), /*#__PURE__*/React.createElement(Badge, {
      variant: st.variant
    }, st.label));
  }))));
}
function BorrowersScreen({
  onOpenAgreement
}) {
  const {
    Card,
    Badge,
    ListRow,
    Avatar
  } = window.RentVaultDesignSystem_eb37ad;
  const byName = {};
  RV.rentals.forEach(r => {
    if (!byName[r.borrower]) byName[r.borrower] = {
      name: r.borrower,
      rentals: [],
      flagged: false
    };
    byName[r.borrower].rentals.push(r);
    if (r.status === "overdue") byName[r.borrower].flagged = true;
  });
  const all = Object.values(byName);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [profile, setProfile] = React.useState(null);
  const filtered = all.filter(b => {
    const okF = filter === "all" || (filter === "flagged" ? b.flagged : !b.flagged);
    const okQ = !query || b.name.toLowerCase().includes(query.toLowerCase());
    return okF && okQ;
  });
  const chips = [{
    id: "all",
    label: "All",
    count: all.length
  }, {
    id: "good",
    label: "Good standing",
    count: all.filter(b => !b.flagged).length
  }, {
    id: "flagged",
    label: "Flagged",
    count: all.filter(b => b.flagged).length
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      display: "flex",
      flexDirection: "column",
      gap: 24,
      maxWidth: 760
    }
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: "Borrowers"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(SearchInput, {
    value: query,
    onChange: setQuery,
    placeholder: "Search borrowers...",
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement(FilterChips, {
    options: chips,
    value: filter,
    onChange: setFilter
  }))), /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "48px 24px",
      textAlign: "center",
      fontSize: 14,
      color: "var(--neutral-400)"
    }
  }, "No borrowers found.") : filtered.map((b, i) => /*#__PURE__*/React.createElement(ListRow, {
    key: b.name,
    onClick: () => setProfile(b),
    divider: i < filtered.length - 1,
    leading: /*#__PURE__*/React.createElement(Avatar, {
      name: b.name,
      size: 40
    }),
    title: b.name,
    meta: b.rentals.length + (b.rentals.length === 1 ? " agreement" : " agreements"),
    trailing: /*#__PURE__*/React.createElement(Badge, {
      variant: b.flagged ? "danger" : "success"
    }, b.flagged ? "Flagged" : "Good standing")
  }))), profile && /*#__PURE__*/React.createElement(BorrowerProfileModal, {
    borrower: profile,
    onClose: () => setProfile(null),
    onOpenAgreement: r => {
      setProfile(null);
      onOpenAgreement && onOpenAgreement(r);
    }
  }));
}

// ── Activity ────────────────────────────────────────────────────────────────────
function ActivityDetailModal({
  event,
  onClose,
  onOpenAgreement
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const rental = event.agreementId ? RV.rentals.find(r => r.id === event.agreementId) : null;
  const meta = {
    display: "flex",
    gap: 8,
    alignItems: "center"
  };
  const footer = /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onClose
  }, "Close"), rental && /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => onOpenAgreement && onOpenAgreement(rental)
  }, "View agreement \u2192"));
  return /*#__PURE__*/React.createElement(Modal, {
    title: "Activity detail",
    onClose: onClose,
    footer: footer,
    width: 440
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 44,
      flex: "none",
      borderRadius: 9999,
      background: "var(--brand-50)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: event.icon,
    size: 22,
    color: "var(--brand-600)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 16,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, event.type), event.amount && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      fontVariantNumeric: "tabular-nums",
      color: event.amount.charAt(0) === "−" ? "var(--neutral-700)" : "var(--success-600)"
    }
  }, event.amount)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "6px 0 0",
      fontSize: 14,
      color: "var(--neutral-700)",
      lineHeight: 1.55
    }
  }, event.desc), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: meta
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 14,
    color: "var(--neutral-400)"
  }), /*#__PURE__*/React.createElement(DateText, {
    value: event.when,
    format: "long",
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-300)"
    }
  }, "\xB7"), /*#__PURE__*/React.createElement(DateText, {
    value: event.when,
    format: "time",
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  })), event.agreementId && /*#__PURE__*/React.createElement("div", {
    style: meta
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-text",
    size: 14,
    color: "var(--neutral-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, "Agreement ", event.agreementId)), /*#__PURE__*/React.createElement("div", {
    style: meta
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "receipt",
    size: 14,
    color: "var(--neutral-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    }
  }, event.ref))))));
}
function ChainLogScreen({
  onOpenPenalty,
  onOpenAgreement
}) {
  const {
    Card
  } = window.RentVaultDesignSystem_eb37ad;
  const [filter, setFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState(null);
  const pageSize = 6;
  React.useEffect(() => {
    setPage(1);
  }, [filter]);
  const match = a => filter === "all" ? true : a.cat === filter;
  const filtered = RV.activity.filter(match);
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const c = id => id === "all" ? RV.activity.length : RV.activity.filter(a => a.cat === id).length;
  const chips = [{
    id: "all",
    label: "All",
    count: c("all")
  }, {
    id: "collateral",
    label: "Collateral",
    count: c("collateral")
  }, {
    id: "penalty",
    label: "Penalties",
    count: c("penalty")
  }, {
    id: "return",
    label: "Returns",
    count: c("return")
  }, {
    id: "agreement",
    label: "Agreements",
    count: c("agreement")
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      display: "flex",
      flexDirection: "column",
      gap: 24,
      maxWidth: 760
    }
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: "Activity"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      alignSelf: "flex-start",
      padding: "6px 12px",
      borderRadius: 9999,
      background: "var(--success-50)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 14,
    color: "var(--success-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "var(--success-900)"
    }
  }, "Paystack escrow \xB7 every event has a RentVault reference")), /*#__PURE__*/React.createElement(FilterChips, {
    options: chips,
    value: filter,
    onChange: setFilter
  }), /*#__PURE__*/React.createElement(Card, {
    padding: 24
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, pageItems.map((a, i) => {
    const last = i === pageItems.length - 1;
    return /*#__PURE__*/React.createElement("div", {
      key: a.ref,
      onClick: () => setSelected(a),
      style: {
        display: "flex",
        gap: 12,
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 28,
        height: 28,
        borderRadius: 9999,
        background: "var(--brand-50)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: a.icon,
      size: 14,
      color: "var(--brand-600)"
    })), !last && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 2,
        flex: 1,
        minHeight: 24,
        background: "var(--neutral-200)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flex: 1,
        gap: 12,
        paddingBottom: last ? 0 : 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "var(--neutral-900)"
      }
    }, a.type), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--neutral-700)",
        lineHeight: 1.5
      }
    }, a.desc), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--neutral-400)",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
      }
    }, a.ref), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--neutral-400)"
      }
    }, "\xB7 ", /*#__PURE__*/React.createElement(DateText, {
      value: a.when,
      format: "rel"
    })))), a.amount && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        flex: "none",
        fontVariantNumeric: "tabular-nums",
        color: a.amount.charAt(0) === "−" ? "var(--neutral-500)" : "var(--success-600)"
      }
    }, a.amount)));
  }))), filtered.length > pageSize && /*#__PURE__*/React.createElement(Pagination, {
    page: page,
    pageSize: pageSize,
    total: filtered.length,
    onPage: setPage
  }), selected && /*#__PURE__*/React.createElement(ActivityDetailModal, {
    event: selected,
    onClose: () => setSelected(null),
    onOpenAgreement: r => {
      setSelected(null);
      onOpenAgreement && onOpenAgreement(r);
    }
  }));
}

// ── Settings ─────────────────────────────────────────────────────────────────
const NG_BANKS = ["Access Bank", "GTBank", "Zenith Bank", "UBA", "First Bank", "Kuda", "Opay", "Stanbic IBTC", "Fidelity Bank", "Union Bank"];
const stngField = {
  width: "100%",
  height: 44,
  padding: "12px 16px",
  boxSizing: "border-box",
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  color: "var(--neutral-900)",
  background: "var(--neutral-100)",
  border: "1px solid var(--neutral-300)",
  borderRadius: 6,
  outline: "none"
};
const stngLabel = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--neutral-700)"
};
const maskAcct = n => "•••• " + String(n).slice(-4);
function EditProfileModal({
  name,
  email,
  onClose,
  onSave
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [n, setN] = React.useState(name);
  const [e, setE] = React.useState(email);
  const footer = /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    disabled: !n.trim() || !e.trim(),
    onClick: () => onSave(n.trim(), e.trim())
  }, "Save changes"));
  return /*#__PURE__*/React.createElement(Modal, {
    title: "Edit profile",
    onClose: onClose,
    footer: footer,
    width: 420
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: stngLabel
  }, "Full name"), /*#__PURE__*/React.createElement("input", {
    style: stngField,
    value: n,
    onChange: ev => setN(ev.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: stngLabel
  }, "Email address"), /*#__PURE__*/React.createElement("input", {
    style: stngField,
    type: "email",
    value: e,
    onChange: ev => setE(ev.target.value)
  }))));
}
function PayoutBanksModal({
  banks,
  onClose,
  onChange
}) {
  const {
    Button,
    Select
  } = window.RentVaultDesignSystem_eb37ad;
  const [view, setView] = React.useState("list");
  const [bankName, setBankName] = React.useState(NG_BANKS[1]);
  const [acct, setAcct] = React.useState("");
  const [resolved, setResolved] = React.useState(null);
  const [verifying, setVerifying] = React.useState(false);
  function setDefault(id) {
    onChange(banks.map(b => ({
      ...b,
      default: b.id === id
    })), "Default payout bank updated");
  }
  function remove(id) {
    const wasDefault = (banks.find(b => b.id === id) || {}).default;
    let next = banks.filter(b => b.id !== id);
    if (wasDefault && next.length) next = next.map((b, i) => ({
      ...b,
      default: i === 0
    }));
    onChange(next, "Bank account removed");
  }
  function verify() {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setResolved("EMEKA OKAFOR");
    }, 700);
  }
  function add() {
    const next = [...banks.map(b => ({
      ...b,
      default: false
    })), {
      id: "b" + Date.now(),
      bank: bankName,
      number: acct,
      name: resolved,
      default: true
    }];
    onChange(next, "Bank account added");
    onClose();
  }
  if (view === "add") {
    const footer = /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => {
        setView("list");
        setResolved(null);
        setAcct("");
      }
    }, "\u2190 Back"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: !resolved,
      onClick: add
    }, "Add account"));
    return /*#__PURE__*/React.createElement(Modal, {
      title: "Add bank account",
      subtitle: "We'll confirm the account name with Paystack before saving.",
      onClose: onClose,
      footer: footer,
      width: 420
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: stngLabel
    }, "Bank"), /*#__PURE__*/React.createElement(Select, {
      options: NG_BANKS,
      value: bankName,
      onChange: e => {
        setBankName(e.target.value);
        setResolved(null);
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: stngLabel
    }, "Account number"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("input", {
      style: {
        ...stngField,
        flex: 1
      },
      type: "tel",
      maxLength: 10,
      value: acct,
      placeholder: "10-digit account number",
      onChange: e => {
        setAcct(e.target.value.replace(/\D/g, ""));
        setResolved(null);
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      disabled: acct.length !== 10 || verifying,
      onClick: verify
    }, verifying ? "Checking…" : "Verify"))), resolved && /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--success-50)",
        borderLeft: "3px solid var(--success-600)",
        borderRadius: 10,
        padding: 14,
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "badge-check",
      size: 20,
      color: "var(--success-600)",
      style: {
        flex: "none",
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--success-900)"
      }
    }, resolved), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 2,
        fontSize: 12,
        color: "var(--success-600)"
      }
    }, bankName, " \xB7 ", maskAcct(acct))))));
  }
  const footer = /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 16,
      color: "var(--neutral-900)"
    }),
    onClick: () => setView("add")
  }, "Add bank account");
  return /*#__PURE__*/React.createElement(Modal, {
    title: "Payout banks",
    subtitle: "Released collateral and earnings are sent to your default bank.",
    onClose: onClose,
    footer: footer,
    width: 420
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, banks.map(b => /*#__PURE__*/React.createElement("div", {
    key: b.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: 14,
      borderRadius: 10,
      border: "1px solid " + (b.default ? "var(--brand-500)" : "var(--neutral-200)"),
      background: b.default ? "var(--brand-50)" : "#fff"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      flex: "none",
      borderRadius: 8,
      background: "var(--neutral-100)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "landmark",
    size: 18,
    color: "var(--neutral-700)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, b.bank), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, b.name, " \xB7 ", maskAcct(b.number))), b.default ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: "var(--brand-700)",
      background: "#fff",
      border: "1px solid var(--neutral-200)",
      borderRadius: 9999,
      padding: "3px 10px"
    }
  }, "Default") : /*#__PURE__*/React.createElement("button", {
    onClick: () => setDefault(b.id),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 12,
      fontWeight: 600,
      color: "var(--brand-600)"
    }
  }, "Set default"), /*#__PURE__*/React.createElement("button", {
    onClick: () => remove(b.id),
    "aria-label": "Remove bank",
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 4,
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash-2",
    size: 16,
    color: "var(--neutral-400)"
  }))))));
}
function SettingsScreen() {
  const {
    Card,
    Button,
    Avatar,
    Switch
  } = window.RentVaultDesignSystem_eb37ad;
  const [name, setName] = React.useState("Emeka Okafor");
  const [email, setEmail] = React.useState("emeka.okafor@gmail.com");
  const [editOpen, setEditOpen] = React.useState(false);
  const [banks, setBanks] = React.useState([{
    id: "b1",
    bank: "GTBank",
    number: "0123458821",
    name: "EMEKA OKAFOR",
    default: true
  }, {
    id: "b2",
    bank: "Access Bank",
    number: "0987654417",
    name: "EMEKA OKAFOR",
    default: false
  }]);
  const [bankModal, setBankModal] = React.useState(false);
  const [alerts, setAlerts] = React.useState(true);
  const [receipts, setReceipts] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const rowText = {
    fontSize: 14,
    color: "var(--neutral-900)"
  };
  const subText = {
    fontSize: 12,
    color: "var(--neutral-500)"
  };
  const defaultBank = banks.find(b => b.default) || banks[0];
  function Section({
    title,
    children
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "var(--neutral-500)"
      }
    }, title), /*#__PURE__*/React.createElement(Card, {
      padding: 20
    }, children));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      display: "flex",
      flexDirection: "column",
      gap: 24,
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: "Settings"
  }), /*#__PURE__*/React.createElement(Section, {
    title: "Profile"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      paddingBottom: 16,
      borderBottom: "1px solid var(--neutral-200)"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: name,
    size: 48
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: subText
  }, email)), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    onClick: () => setEditOpen(true)
  }, "Edit")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: rowText
  }, "BVN verification"), /*#__PURE__*/React.createElement("span", {
    style: subText
  }, "Verified \xB7 BVN \u2022\u2022\u2022\u2022 4417")), /*#__PURE__*/React.createElement(Icon, {
    name: "badge-check",
    size: 20,
    color: "var(--success-600)"
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "Payments"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      paddingBottom: 16,
      borderBottom: "1px solid var(--neutral-200)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: rowText
  }, "Escrow account"), /*#__PURE__*/React.createElement("span", {
    style: subText
  }, "Collateral held securely with Paystack")), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12,
      fontWeight: 600,
      color: "var(--success-900)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 14,
    color: "var(--success-600)"
  }), "Active")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "16px 0",
      borderBottom: "1px solid var(--neutral-200)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: rowText
  }, "Payout bank"), /*#__PURE__*/React.createElement("span", {
    style: subText
  }, defaultBank.bank, " \xB7 ", maskAcct(defaultBank.number))), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    onClick: () => setBankModal(true)
  }, "Manage")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...rowText,
      flex: 1
    }
  }, "Settlement"), /*#__PURE__*/React.createElement("span", {
    style: subText
  }, "Paystack \xB7 Nigerian Naira (\u20A6)"))), /*#__PURE__*/React.createElement(Section, {
    title: "Notifications"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      paddingBottom: 16,
      borderBottom: "1px solid var(--neutral-200)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: rowText
  }, "Overdue & penalty alerts"), /*#__PURE__*/React.createElement("span", {
    style: subText
  }, "Email + push")), /*#__PURE__*/React.createElement(Switch, {
    checked: alerts,
    onChange: e => setAlerts(e.target.checked)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: rowText
  }, "Payment & transfer receipts"), /*#__PURE__*/React.createElement("span", {
    style: subText
  }, "Email")), /*#__PURE__*/React.createElement(Switch, {
    checked: receipts,
    onChange: e => setReceipts(e.target.checked)
  }))), editOpen && /*#__PURE__*/React.createElement(EditProfileModal, {
    name: name,
    email: email,
    onClose: () => setEditOpen(false),
    onSave: (nm, em) => {
      setName(nm);
      setEmail(em);
      setEditOpen(false);
      setToast("Profile updated");
    }
  }), bankModal && /*#__PURE__*/React.createElement(PayoutBanksModal, {
    banks: banks,
    onClose: () => setBankModal(false),
    onChange: (next, msg) => {
      setBanks(next);
      if (msg) setToast(msg);
    }
  }), toast && /*#__PURE__*/React.createElement(Toast, {
    message: toast,
    onDone: () => setToast(null)
  }));
}
Object.assign(window, {
  AgreementsScreen,
  BorrowersScreen,
  ChainLogScreen,
  SettingsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/LenderSections.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/ListItemScreen.jsx
try { (() => {
// A-05 · List an item. Item details + rental terms + collateral, sticky CTA.
function ListItemScreen({
  onBack,
  onDeploy
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [cat, setCat] = React.useState("");
  const [catOpen, setCatOpen] = React.useState(false);
  const [photos, setPhotos] = React.useState([1, 2]);
  const [marketValue, setMarketValue] = React.useState(150000);
  const [mult, setMult] = React.useState(140);
  const categories = ["Electronics", "Camera & Photo", "Audio Equipment", "Vehicles & Bikes", "Event Equipment", "Furniture", "Other"];
  const naira = n => "₦" + Number(n || 0).toLocaleString("en-NG");
  const collateral = Math.round(marketValue * mult / 100);
  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--neutral-700)"
  };
  const fieldBase = {
    width: "100%",
    height: 44,
    padding: "12px 16px",
    boxSizing: "border-box",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--neutral-900)",
    background: "var(--neutral-100)",
    border: "1px solid var(--neutral-300)",
    borderRadius: 6,
    outline: "none"
  };
  function SectionLabel({
    children
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "var(--neutral-500)",
        flex: "none",
        whiteSpace: "nowrap"
      }
    }, children), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        background: "var(--neutral-200)"
      }
    }));
  }
  function Field({
    label,
    children,
    helper
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: labelStyle
    }, label), children, helper && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--neutral-400)",
        lineHeight: 1.5
      }
    }, helper));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement(FlowTopbar, {
    title: "List an item",
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      margin: "0 auto",
      padding: "40px 24px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(SectionLabel, null, "Item details"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Item name"
  }, /*#__PURE__*/React.createElement("input", {
    style: fieldBase,
    placeholder: "e.g. Canon EOS R6 Camera",
    defaultValue: "Canon EOS R6 Camera"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Category"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setCatOpen(v => !v),
    style: {
      ...fieldBase,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      textAlign: "left",
      color: cat ? "var(--neutral-900)" : "var(--neutral-400)"
    }
  }, cat || "Select a category", /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 16,
    color: "var(--neutral-400)"
  })), catOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 48,
      left: 0,
      right: 0,
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 4,
      zIndex: 5
    }
  }, categories.map(c => {
    const on = c === cat;
    return /*#__PURE__*/React.createElement("button", {
      key: c,
      onClick: () => {
        setCat(c);
        setCatOpen(false);
      },
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: 40,
        padding: "0 16px",
        border: "none",
        background: "transparent",
        borderRadius: 6,
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        color: on ? "var(--brand-600)" : "var(--neutral-900)",
        fontWeight: on ? 600 : 400
      },
      onMouseEnter: e => e.currentTarget.style.background = "var(--neutral-100)",
      onMouseLeave: e => e.currentTarget.style.background = "transparent"
    }, c, on && /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16,
      color: "var(--brand-600)"
    }));
  })))), /*#__PURE__*/React.createElement(Field, {
    label: "Serial number or unique identifier",
    helper: "Used to verify the correct item is returned. Can be a serial number, IMEI, or a unique description."
  }, /*#__PURE__*/React.createElement("input", {
    style: fieldBase,
    placeholder: "e.g. 062041000537"
  })), photos.length === 0 ? /*#__PURE__*/React.createElement("label", {
    onClick: () => setPhotos(ps => [...ps, Date.now()]),
    style: {
      minHeight: 120,
      border: "1.5px dashed var(--neutral-300)",
      borderRadius: 10,
      background: "var(--neutral-50)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      cursor: "pointer",
      transition: "background 150ms ease, border-color 150ms ease"
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = "var(--brand-50)";
      e.currentTarget.style.borderColor = "var(--brand-500)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = "var(--neutral-50)";
      e.currentTarget.style.borderColor = "var(--neutral-300)";
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "image-plus",
    size: 24,
    color: "var(--neutral-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-700)"
    }
  }, "Upload item photos"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-400)"
    }
  }, "Min 2 photos required \xB7 JPG or PNG")) : /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1.5px dashed var(--neutral-300)",
      borderRadius: 10,
      background: "var(--neutral-50)",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, photos.map(p => /*#__PURE__*/React.createElement("div", {
    key: p,
    style: {
      position: "relative",
      width: 80,
      height: 80,
      borderRadius: 6,
      background: "repeating-linear-gradient(135deg, var(--neutral-100) 0 9px, var(--neutral-200) 9px 18px)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setPhotos(ps => ps.filter(x => x !== p)),
    "aria-label": "Remove photo",
    style: {
      position: "absolute",
      top: -4,
      right: -4,
      width: 16,
      height: 16,
      borderRadius: 9999,
      background: "var(--danger-600)",
      border: "none",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 10,
    color: "#fff",
    strokeWidth: 2.5
  }))))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPhotos(ps => [...ps, Date.now()]),
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      width: "100%",
      paddingTop: 12,
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 14,
    color: "var(--brand-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--brand-600)"
    }
  }, "Add more photos"))))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(SectionLabel, null, "Rental terms"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Daily rate (\u20A6)"
  }, /*#__PURE__*/React.createElement("input", {
    type: "tel",
    style: fieldBase,
    placeholder: "5,000",
    defaultValue: "5,000"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Max rental duration"
  }, /*#__PURE__*/React.createElement("input", {
    style: fieldBase,
    placeholder: "7 days",
    defaultValue: "7 days"
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Late return penalty (\u20A6 per day)",
    helper: "Automatically deducted from the borrower's collateral for each day past the return date."
  }, /*#__PURE__*/React.createElement("input", {
    type: "tel",
    style: fieldBase,
    placeholder: "10,000",
    defaultValue: "10,000"
  })))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(SectionLabel, null, "Collateral"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Item market value (\u20A6)"
  }, /*#__PURE__*/React.createElement("input", {
    type: "tel",
    style: fieldBase,
    value: Number(marketValue).toLocaleString("en-NG"),
    onChange: e => setMarketValue(Number(e.target.value.replace(/\D/g, "")) || 0)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--success-50)",
      borderLeft: "3px solid var(--success-600)",
      borderRadius: 10,
      padding: 16,
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 20,
    color: "var(--success-600)",
    style: {
      flex: "none",
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "var(--success-900)"
    }
  }, "Suggested collateral"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      fontWeight: 600,
      color: "var(--success-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, naira(collateral)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--success-600)"
    }
  }, mult, "% of item value. Locked until clean return."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, [130, 140, 150].map(m => {
    const on = m === mult;
    return /*#__PURE__*/React.createElement("button", {
      key: m,
      onClick: () => setMult(m),
      style: {
        padding: "6px 14px",
        borderRadius: 9999,
        border: "none",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: 600,
        background: on ? "var(--brand-600)" : "var(--neutral-100)",
        color: on ? "#fff" : "var(--neutral-700)"
      }
    }, m, "%");
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none",
      borderTop: "1px solid var(--neutral-200)",
      background: "#fff",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    onClick: onDeploy
  }, "Save item to inventory \u2192"))));
}
Object.assign(window, {
  ListItemScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/ListItemScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/MyItems.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Inventory management — My Items list view + Item detail/edit drawer.
const ITEM_STATUS = {
  available: {
    variant: "success",
    label: "Available"
  },
  on_rent: {
    variant: "brand",
    label: "On rent"
  },
  unavailable: {
    variant: "neutral",
    label: "Unavailable"
  }
};
const ITEM_CATEGORIES = ["Camera & Photo", "Audio Equipment", "Electronics", "Vehicles & Bikes", "Event Equipment", "Furniture", "Other"];

// Unified dashed photo block (shared by the edit drawer + list form).
function ItemPhotoBlock({
  photos,
  setPhotos
}) {
  if (photos.length === 0) {
    return /*#__PURE__*/React.createElement("label", {
      onClick: () => setPhotos(p => [...p, Date.now()]),
      style: {
        minHeight: 120,
        border: "1.5px dashed var(--neutral-300)",
        borderRadius: 10,
        background: "var(--neutral-50)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "image-plus",
      size: 24,
      color: "var(--neutral-400)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--neutral-700)"
      }
    }, "Upload item photos"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--neutral-400)"
      }
    }, "Min 2 photos required \xB7 JPG or PNG"));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1.5px dashed var(--neutral-300)",
      borderRadius: 10,
      background: "var(--neutral-50)",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, photos.map(p => /*#__PURE__*/React.createElement("div", {
    key: p,
    style: {
      position: "relative",
      width: 80,
      height: 80,
      borderRadius: 6,
      background: "repeating-linear-gradient(135deg, var(--neutral-100) 0 9px, var(--neutral-200) 9px 18px)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setPhotos(ps => ps.filter(x => x !== p)),
    "aria-label": "Remove photo",
    style: {
      position: "absolute",
      top: -4,
      right: -4,
      width: 16,
      height: 16,
      borderRadius: 9999,
      background: "var(--danger-600)",
      border: "none",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 10,
    color: "#fff",
    strokeWidth: 2.5
  }))))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPhotos(ps => [...ps, Date.now()]),
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      width: "100%",
      paddingTop: 12,
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 14,
    color: "var(--brand-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--brand-600)"
    }
  }, "Add more photos")));
}
function ItemEditDrawer({
  item,
  onClose,
  onSaved
}) {
  const {
    Button,
    Select
  } = window.RentVaultDesignSystem_eb37ad;
  const [status, setStatus] = React.useState(item.status);
  const [name, setName] = React.useState(item.name);
  const [category, setCategory] = React.useState(item.category);
  const [serial, setSerial] = React.useState(item.serial);
  const [rate, setRate] = React.useState(item.rate);
  const [marketValue, setMarketValue] = React.useState(item.marketValue);
  const [mult, setMult] = React.useState(item.mult);
  const [photos, setPhotos] = React.useState(Array.from({
    length: item.photos
  }, (_, i) => i + 1));
  const label = {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--neutral-700)"
  };
  const field = {
    width: "100%",
    height: 44,
    padding: "12px 16px",
    boxSizing: "border-box",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--neutral-900)",
    background: "var(--neutral-100)",
    border: "1px solid var(--neutral-300)",
    borderRadius: 6,
    outline: "none"
  };
  const collateral = Math.round(marketValue * mult / 100);
  function Section({
    children
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "24px 0 16px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "var(--neutral-500)",
        flex: "none",
        whiteSpace: "nowrap"
      }
    }, children), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        background: "var(--neutral-200)"
      }
    }));
  }
  function Field({
    lab,
    children,
    helper
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: label
    }, lab), children, helper && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--neutral-400)",
        lineHeight: 1.5
      }
    }, helper));
  }
  const seg = (id, text, disabled) => {
    const on = status === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      disabled: disabled,
      onClick: () => !disabled && setStatus(id),
      style: {
        flex: 1,
        height: 30,
        borderRadius: 9999,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: on ? 600 : 400,
        background: on ? "#fff" : "transparent",
        boxShadow: on ? "var(--shadow-1)" : "none",
        color: disabled ? "var(--neutral-300)" : on ? "var(--brand-600)" : "var(--neutral-500)"
      }
    }, text);
  };
  const history = [["Total rentals", item.rentals + " completed", false], ["Last rented", null, false], ["Total earned", naira(item.earned), true]];
  const footer = /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onClose
  }, "Discard changes"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    style: {
      flex: 1
    },
    onClick: () => onSaved({
      ...item,
      status,
      name,
      category,
      serial,
      rate: Number(rate) || 0,
      marketValue: Number(marketValue) || 0,
      mult,
      collateral,
      photos: photos.length
    })
  }, "Save changes \u2192"));
  return /*#__PURE__*/React.createElement(Drawer, {
    title: "Edit item",
    onClose: onClose,
    footer: footer
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--neutral-700)",
      flex: "none"
    }
  }, "Item status"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: 0,
      background: "var(--neutral-100)",
      borderRadius: 9999,
      padding: 3,
      width: 280
    }
  }, seg("available", "Available", false), seg("on_rent", "On rent", true), seg("unavailable", "Unavailable", false))), /*#__PURE__*/React.createElement(Section, null, "Item details"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Field, {
    lab: "Item name"
  }, /*#__PURE__*/React.createElement("input", {
    style: field,
    value: name,
    onChange: e => setName(e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    lab: "Category"
  }, /*#__PURE__*/React.createElement(Select, {
    options: ITEM_CATEGORIES,
    value: category,
    onChange: e => setCategory(e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    lab: "Serial number or unique identifier",
    helper: "Used to verify the correct item is returned."
  }, /*#__PURE__*/React.createElement("input", {
    style: field,
    value: serial,
    onChange: e => setSerial(e.target.value)
  }))), /*#__PURE__*/React.createElement(Section, null, "Photos"), /*#__PURE__*/React.createElement(ItemPhotoBlock, {
    photos: photos,
    setPhotos: setPhotos
  }), /*#__PURE__*/React.createElement(Section, null, "Rental terms"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    lab: "Daily rate (\u20A6)"
  }, /*#__PURE__*/React.createElement("input", {
    type: "tel",
    style: field,
    value: Number(rate).toLocaleString("en-NG"),
    onChange: e => setRate(Number(e.target.value.replace(/\D/g, "")) || 0)
  })), /*#__PURE__*/React.createElement(Field, {
    lab: "Max rental duration"
  }, /*#__PURE__*/React.createElement("input", {
    style: field,
    defaultValue: item.maxDuration
  }))), /*#__PURE__*/React.createElement(Field, {
    lab: "Late return penalty (\u20A6 per day)",
    helper: "Automatically deducted from collateral for each day past the return date."
  }, /*#__PURE__*/React.createElement("input", {
    type: "tel",
    style: field,
    defaultValue: Number(item.penalty).toLocaleString("en-NG")
  }))), /*#__PURE__*/React.createElement(Section, null, "Collateral"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Field, {
    lab: "Item market value (\u20A6)"
  }, /*#__PURE__*/React.createElement("input", {
    type: "tel",
    style: field,
    value: Number(marketValue).toLocaleString("en-NG"),
    onChange: e => setMarketValue(Number(e.target.value.replace(/\D/g, "")) || 0)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--success-50)",
      borderLeft: "3px solid var(--success-600)",
      borderRadius: 10,
      padding: 16,
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 20,
    color: "var(--success-600)",
    style: {
      flex: "none",
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "var(--success-900)"
    }
  }, "Collateral held"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      fontWeight: 600,
      color: "var(--success-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, naira(collateral)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--success-600)"
    }
  }, mult, "% of item value. Locked until clean return."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, [130, 140, 150].map(m => {
    const on = m === mult;
    return /*#__PURE__*/React.createElement("button", {
      key: m,
      onClick: () => setMult(m),
      style: {
        padding: "6px 14px",
        borderRadius: 9999,
        border: "none",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: 600,
        background: on ? "var(--brand-600)" : "var(--neutral-100)",
        color: on ? "#fff" : "var(--neutral-700)"
      }
    }, m, "%");
  }))), /*#__PURE__*/React.createElement(Section, null, "Rental history"), /*#__PURE__*/React.createElement("div", null, history.map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: i < history.length - 1 ? "1px solid var(--neutral-200)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, k), k === "Last rented" ? /*#__PURE__*/React.createElement(DateText, {
    value: item.lastRented,
    style: {
      fontSize: 14,
      color: "var(--neutral-900)"
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: i === 2 ? 600 : 400,
      color: i === 2 ? "var(--success-600)" : "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, v))), /*#__PURE__*/React.createElement("button", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      marginTop: 12,
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      fontWeight: 600,
      color: "var(--brand-600)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 14,
    color: "var(--brand-600)"
  }), "View full rental history \u2192")));
}
function MyItemsScreen({
  onAddItem
}) {
  const {
    Card,
    Badge,
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [items, setItems] = React.useState(RV.items);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [menu, setMenu] = React.useState(null);
  const [editing, setEditing] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const pageSize = 4;
  React.useEffect(() => {
    setPage(1);
  }, [query, filter]);
  const filtered = items.filter(it => {
    const okFilter = filter === "all" || it.status === filter;
    const okQuery = !query || (it.name + " " + it.serial + " " + it.category).toLowerCase().includes(query.toLowerCase());
    return okFilter && okQuery;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const counts = id => id === "all" ? items.length : items.filter(i => i.status === id).length;
  const chips = [{
    id: "all",
    label: "All",
    count: counts("all")
  }, {
    id: "available",
    label: "Available",
    count: counts("available")
  }, {
    id: "on_rent",
    label: "On rent",
    count: counts("on_rent")
  }, {
    id: "unavailable",
    label: "Unavailable",
    count: counts("unavailable")
  }];
  function setStatus(id, status) {
    setItems(arr => arr.map(it => it.id === id ? {
      ...it,
      status
    } : it));
  }
  function archive(id) {
    setItems(arr => arr.filter(it => it.id !== id));
    setToast("Item archived");
  }
  function ActionMenu({
    it
  }) {
    const open = menu === it.id;
    const row = {
      display: "flex",
      alignItems: "center",
      gap: 10,
      width: "100%",
      height: 40,
      padding: "0 12px",
      border: "none",
      background: "transparent",
      borderRadius: 6,
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      textAlign: "left",
      color: "var(--neutral-900)"
    };
    const hov = c => ({
      onMouseEnter: e => e.currentTarget.style.background = c,
      onMouseLeave: e => e.currentTarget.style.background = "transparent"
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        flex: "none"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        setMenu(open ? null : it.id);
      },
      "aria-label": "Item actions",
      style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 4,
        display: "inline-flex",
        borderRadius: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "more-horizontal",
      size: 20,
      color: "var(--neutral-400)"
    })), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      onClick: e => {
        e.stopPropagation();
        setMenu(null);
      },
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 40
      }
    }), /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        position: "absolute",
        top: 36,
        right: 0,
        minWidth: 188,
        background: "#fff",
        boxShadow: "var(--shadow-3)",
        borderRadius: 10,
        padding: 8,
        zIndex: 41
      }
    }, /*#__PURE__*/React.createElement("button", _extends({
      style: row
    }, hov("var(--neutral-100)"), {
      onClick: () => {
        setMenu(null);
        setEditing(it);
      }
    }), /*#__PURE__*/React.createElement(Icon, {
      name: "edit-2",
      size: 16,
      color: "var(--neutral-700)"
    }), "Edit item"), it.status !== "on_rent" && /*#__PURE__*/React.createElement("button", _extends({
      style: row
    }, hov("var(--neutral-100)"), {
      onClick: () => {
        setMenu(null);
        setStatus(it.id, it.status === "unavailable" ? "available" : "unavailable");
        setToast(it.status === "unavailable" ? "Item marked available" : "Item marked unavailable");
      }
    }), /*#__PURE__*/React.createElement(Icon, {
      name: it.status === "unavailable" ? "eye" : "eye-off",
      size: 16,
      color: "var(--neutral-700)"
    }), it.status === "unavailable" ? "Mark available" : "Mark unavailable"), /*#__PURE__*/React.createElement("button", _extends({
      style: row
    }, hov("var(--neutral-100)"), {
      onClick: () => {
        setMenu(null);
        setEditing(it);
      }
    }), /*#__PURE__*/React.createElement(Icon, {
      name: "file-text",
      size: 16,
      color: "var(--neutral-700)"
    }), "View rental history"), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: "var(--neutral-200)",
        margin: "8px 0"
      }
    }), /*#__PURE__*/React.createElement("button", _extends({
      style: {
        ...row,
        color: "var(--danger-600)"
      }
    }, hov("var(--danger-50)"), {
      onClick: () => {
        setMenu(null);
        archive(it.id);
      }
    }), /*#__PURE__*/React.createElement(Icon, {
      name: "archive",
      size: 16,
      color: "var(--danger-600)"
    }), "Archive item"))));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      maxWidth: 960,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)"
    }
  }, "My Items"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 16,
      color: "#fff"
    }),
    onClick: onAddItem
  }, "Add item \u2192"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(SearchInput, {
    value: query,
    onChange: setQuery,
    placeholder: "Search items...",
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement(FilterChips, {
    options: chips,
    value: filter,
    onChange: setFilter
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "24px 0 16px",
      fontSize: 13,
      color: "var(--neutral-500)",
      fontVariantNumeric: "tabular-nums"
    }
  }, filtered.length, " ", filtered.length === 1 ? "item" : "items"), /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, pageItems.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "48px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 72,
      height: 72,
      borderRadius: 9999,
      background: "var(--neutral-100)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "package",
    size: 32,
    color: "var(--neutral-300)"
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "16px 0 0",
      fontSize: 16,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, items.length === 0 ? "No items yet" : "No matching items"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0 0",
      fontSize: 14,
      color: "var(--neutral-500)",
      lineHeight: 1.6,
      maxWidth: 280
    }
  }, items.length === 0 ? "Items you list will appear here. Add your first item to get started." : "Try a different search or filter."), items.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: onAddItem
  }, "Add your first item \u2192"))) : pageItems.map((it, i) => {
    const s = ITEM_STATUS[it.status];
    return /*#__PURE__*/React.createElement("div", {
      key: it.id,
      onClick: () => setEditing(it),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "20px 24px",
        minHeight: 72,
        boxSizing: "border-box",
        cursor: "pointer",
        borderBottom: i < pageItems.length - 1 ? "1px solid var(--neutral-200)" : "none"
      },
      onMouseEnter: e => e.currentTarget.style.background = "var(--neutral-50)",
      onMouseLeave: e => e.currentTarget.style.background = "transparent"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 44,
        height: 44,
        flex: "none",
        borderRadius: 8,
        background: "var(--neutral-100)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: it.icon,
      size: 20,
      color: "var(--neutral-700)"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--neutral-900)"
      }
    }, it.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--neutral-400)"
      }
    }, it.serial, " \xB7 ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--neutral-500)"
      }
    }, it.category))), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 100,
        flex: "none",
        textAlign: "right",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--neutral-700)",
        fontVariantNumeric: "tabular-nums"
      }
    }, naira(it.rate), "/day"), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 100,
        flex: "none",
        textAlign: "right",
        display: "flex",
        flexDirection: "column",
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: "var(--neutral-400)",
        textTransform: "uppercase",
        letterSpacing: "0.04em"
      }
    }, "Collateral"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--neutral-500)",
        fontVariantNumeric: "tabular-nums"
      }
    }, naira(it.collateral))), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 100,
        flex: "none",
        display: "flex",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: s.variant
    }, s.label)), /*#__PURE__*/React.createElement(ActionMenu, {
      it: it
    }));
  })), filtered.length > pageSize && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Pagination, {
    page: page,
    pageSize: pageSize,
    total: filtered.length,
    onPage: setPage
  })), editing && /*#__PURE__*/React.createElement(ItemEditDrawer, {
    item: editing,
    onClose: () => setEditing(null),
    onSaved: next => {
      setItems(arr => arr.map(x => x.id === next.id ? next : x));
      setEditing(null);
      setToast("Changes saved");
    }
  }), toast && /*#__PURE__*/React.createElement(Toast, {
    message: toast,
    onDone: () => setToast(null)
  }));
}
Object.assign(window, {
  MyItemsScreen,
  ItemEditDrawer,
  ItemPhotoBlock
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/MyItems.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/NewAgreementScreen.jsx
try { (() => {
// A-06 · New agreement. 3 steps: borrower → build bundle → review. Ends -> onGenerate(bundle) (payment link).
function NewAgreementScreen({
  onBack,
  onGenerate
}) {
  const {
    Button,
    Stepper,
    Badge,
    AlertBanner
  } = window.RentVaultDesignSystem_eb37ad;
  const [step, setStep] = React.useState(0);
  const [phone, setPhone] = React.useState("");
  const [invited, setInvited] = React.useState(false);
  const digits = phone.replace(/\D/g, "");
  const ready = digits.length >= 10;
  const lookup = !ready ? null : (() => {
    const d = Number(digits.slice(-1));
    if (d <= 5) return {
      state: "verified",
      name: "Tunde Bakare",
      initials: "TB"
    };
    if (d <= 8) return {
      state: "unverified",
      name: "Chidi Okeke",
      initials: "CO"
    };
    return {
      state: "new"
    };
  })();
  const borrowerName = lookup && lookup.name ? lookup.name : "New borrower";
  const canContinue = lookup && (lookup.state === "verified" || lookup.state === "unverified" || lookup.state === "new" && invited);

  // Bundle: map of itemId -> qty. Backed by inventory.
  const inventory = RV.items.filter(i => i.status !== "unavailable");
  const [qty, setQty] = React.useState({});
  const [query, setQuery] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [extra, setExtra] = React.useState([]); // ad-hoc items added via modal
  const allItems = [...inventory, ...extra];
  const lines = allItems.filter(it => (qty[it.id] || 0) > 0).map(it => ({
    ...it,
    qty: qty[it.id]
  }));
  const totalCollateral = lines.reduce((s, l) => s + l.collateral * l.qty, 0);
  const totalDaily = lines.reduce((s, l) => s + l.rate * l.qty, 0);
  const unitCount = lines.reduce((s, l) => s + l.qty, 0);
  const [startDate] = React.useState("20 Jun 2026");
  const [returnDate] = React.useState("27 Jun 2026");
  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--neutral-700)"
  };
  const fieldBase = {
    width: "100%",
    height: 44,
    padding: "12px 16px",
    boxSizing: "border-box",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--neutral-900)",
    background: "var(--neutral-100)",
    border: "1px solid var(--neutral-300)",
    borderRadius: 6,
    outline: "none"
  };
  function Field({
    label,
    children
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, label && /*#__PURE__*/React.createElement("label", {
      style: labelStyle
    }, label), children);
  }
  function setItemQty(id, n) {
    setQty(q => ({
      ...q,
      [id]: Math.max(0, n)
    }));
  }
  const filtered = allItems.filter(it => !query || (it.name + " " + it.category).toLowerCase().includes(query.toLowerCase()));
  function Stepper2() {
    return /*#__PURE__*/React.createElement(Stepper, {
      steps: ["Borrower", "Items", "Review"],
      current: step
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement(FlowTopbar, {
    title: "New agreement",
    onBack: step === 0 ? onBack : () => setStep(s => s - 1)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      margin: "0 auto",
      padding: "24px 24px 120px"
    }
  }, /*#__PURE__*/React.createElement(Stepper2, null), step === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "0 0 8px",
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)"
    }
  }, "Who is renting from you?"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      color: "var(--neutral-500)",
      lineHeight: 1.65
    }
  }, "Enter the borrower's phone number. If they're already on RentVault, their profile loads automatically.")), /*#__PURE__*/React.createElement(Field, {
    label: "Borrower phone number"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      background: "var(--neutral-100)",
      border: "1px solid var(--neutral-300)",
      borderRadius: 6,
      height: 44,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      height: "100%",
      padding: "0 12px",
      borderRight: "1px solid var(--neutral-200)",
      fontSize: 14,
      color: "var(--neutral-500)"
    }
  }, "+234"), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    placeholder: "803 555 0142",
    value: phone,
    onChange: e => setPhone(e.target.value),
    style: {
      flex: 1,
      height: "100%",
      border: "none",
      background: "transparent",
      padding: "0 16px",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--neutral-900)",
      outline: "none"
    }
  }))), lookup && lookup.state === "verified" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      flex: "none",
      borderRadius: 9999,
      background: "var(--neutral-100)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-700)"
    }
  }, lookup.initials), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, lookup.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, "+234 ", phone)), /*#__PURE__*/React.createElement(Badge, {
    variant: "success"
  }, "Verified")), lookup && lookup.state === "unverified" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      flex: "none",
      borderRadius: 9999,
      background: "var(--neutral-100)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-700)"
    }
  }, lookup.initials), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, lookup.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, "+234 ", phone)), /*#__PURE__*/React.createElement(Badge, {
    variant: "warning"
  }, "Not verified")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      background: "var(--warning-50)",
      borderLeft: "3px solid var(--warning-600)",
      borderRadius: 8,
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 18,
    color: "var(--warning-600)",
    style: {
      flex: "none",
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--warning-900)",
      lineHeight: 1.5
    }
  }, lookup.name.split(" ")[0], " hasn't verified their identity yet. You can still set up the agreement \u2014 they'll be asked to verify with BVN or NIN before they can pay."))), lookup && lookup.state === "new" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      flex: "none",
      borderRadius: 9999,
      background: "var(--brand-50)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user-plus",
    size: 20,
    color: "var(--brand-600)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, "New to RentVault"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, "+234 ", phone))), invited ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      background: "var(--success-50)",
      borderLeft: "3px solid var(--success-600)",
      borderRadius: 8,
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 18,
    color: "var(--success-600)",
    style: {
      flex: "none",
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--success-900)",
      lineHeight: 1.5
    }
  }, "Invite sent by SMS. They'll set up their account and verify when they open the link. You can keep setting up the rental now.")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--neutral-500)",
      lineHeight: 1.5
    }
  }, "We'll text them an invite to join RentVault and verify their identity. The rental activates once they've verified and paid."), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "send",
      size: 16,
      color: "var(--neutral-900)"
    }),
    onClick: () => setInvited(true)
  }, "Send invite to join"))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    disabled: !canContinue,
    onClick: () => setStep(1)
  }, "Continue to items \u2192")), step === 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "0 0 8px",
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)"
    }
  }, "What are they renting?"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      color: "var(--neutral-500)",
      lineHeight: 1.65
    }
  }, "Add one or more items from your inventory. The collateral is the sum of every item.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Rental start date"
  }, /*#__PURE__*/React.createElement("input", {
    style: fieldBase,
    defaultValue: startDate
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Return date"
  }, /*#__PURE__*/React.createElement("input", {
    style: fieldBase,
    defaultValue: returnDate
  }))), /*#__PURE__*/React.createElement(SearchInput, {
    value: query,
    onChange: setQuery,
    placeholder: "Search your inventory..."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, filtered.map(it => {
    const n = qty[it.id] || 0;
    const on = n > 0;
    return /*#__PURE__*/React.createElement("div", {
      key: it.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderRadius: 10,
        border: "1px solid " + (on ? "var(--brand-500)" : "var(--neutral-200)"),
        background: on ? "var(--brand-50)" : "#fff"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 40,
        height: 40,
        flex: "none",
        borderRadius: 8,
        background: "var(--neutral-100)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: it.icon,
      size: 20,
      color: "var(--neutral-700)"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--neutral-900)"
      }
    }, it.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--neutral-500)"
      }
    }, naira(it.rate), "/day \xB7 ", naira(it.collateral), " collateral")), on ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        flex: "none"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setItemQty(it.id, n - 1),
      "aria-label": "Decrease",
      style: {
        width: 28,
        height: 28,
        borderRadius: 8,
        border: "1px solid var(--neutral-300)",
        background: "#fff",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "minus",
      size: 14,
      color: "var(--neutral-700)"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 16,
        textAlign: "center",
        fontSize: 14,
        fontWeight: 600,
        color: "var(--neutral-900)",
        fontVariantNumeric: "tabular-nums"
      }
    }, n), /*#__PURE__*/React.createElement("button", {
      onClick: () => setItemQty(it.id, n + 1),
      "aria-label": "Increase",
      style: {
        width: 28,
        height: 28,
        borderRadius: 8,
        border: "1px solid var(--brand-500)",
        background: "var(--brand-600)",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 14,
      color: "#fff"
    }))) : /*#__PURE__*/React.createElement("button", {
      onClick: () => setItemQty(it.id, 1),
      style: {
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 32,
        padding: "0 12px",
        borderRadius: 8,
        border: "1px solid var(--neutral-300)",
        background: "#fff",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--neutral-700)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 14,
      color: "var(--neutral-700)"
    }), "Add"));
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => setAddOpen(true),
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 44,
      borderRadius: 10,
      border: "1.5px dashed var(--neutral-300)",
      background: "transparent",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--brand-600)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 16,
    color: "var(--brand-600)"
  }), "Add a new item to inventory")), step === 2 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, "Rental summary"), /*#__PURE__*/React.createElement(Badge, {
    variant: "brand"
  }, unitCount, " ", unitCount === 1 ? "item" : "items")), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "16px 0",
      height: 1,
      background: "var(--neutral-200)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, lines.map(l => /*#__PURE__*/React.createElement("div", {
    key: l.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      flex: "none",
      borderRadius: 8,
      background: "var(--neutral-100)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: l.icon,
    size: 18,
    color: "var(--neutral-700)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, l.name, l.qty > 1 ? " × " + l.qty : ""), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, naira(l.rate), "/day")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, naira(l.collateral * l.qty))))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "16px 0",
      height: 1,
      background: "var(--neutral-200)"
    }
  }), [["Borrower", borrowerName], ["Rental period", startDate + " → " + returnDate], ["Daily rate", naira(totalDaily) + "/day"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 0"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--neutral-500)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, v))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 12,
      marginTop: 6,
      borderTop: "1px solid var(--neutral-200)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, "Total collateral"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20,
      fontWeight: 600,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, naira(totalCollateral)))), /*#__PURE__*/React.createElement(AlertBanner, {
    variant: "success",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "shield-check",
      size: 20
    })
  }, naira(totalCollateral), " will be held in escrow when the borrower pays. It's released in full on a clean return of all items."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    onClick: () => onGenerate && onGenerate({
      borrower: borrowerName,
      lines,
      totalCollateral,
      totalDaily,
      unitCount,
      startDate,
      returnDate
    })
  }, "Create payment link & send \u2192")))), step === 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none",
      borderTop: "1px solid var(--neutral-200)",
      background: "#fff",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--neutral-500)"
    }
  }, unitCount === 0 ? "No items yet" : unitCount + (unitCount === 1 ? " item" : " items") + " · total collateral"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, naira(totalCollateral))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    disabled: unitCount === 0,
    onClick: () => setStep(2)
  }, "Review \u2192")))), addOpen && /*#__PURE__*/React.createElement(AddInventoryItemModal, {
    onClose: () => setAddOpen(false),
    onAdd: it => {
      setExtra(e => [...e, it]);
      setItemQty(it.id, 1);
      setAddOpen(false);
    }
  }));
}

// Lightweight add-item modal for the bundle builder.
function AddInventoryItemModal({
  onClose,
  onAdd
}) {
  const {
    Button,
    Select
  } = window.RentVaultDesignSystem_eb37ad;
  const [name, setName] = React.useState("");
  const [cat, setCat] = React.useState("Electronics");
  const [rate, setRate] = React.useState("");
  const [value, setValue] = React.useState("");
  const cats = ["Camera & Photo", "Audio Equipment", "Electronics", "Vehicles & Bikes", "Event Equipment", "Furniture", "Other"];
  const iconFor = {
    "Camera & Photo": "camera",
    "Audio Equipment": "music-2",
    "Electronics": "monitor",
    "Vehicles & Bikes": "bike",
    "Event Equipment": "speaker",
    "Furniture": "armchair",
    "Other": "package"
  };
  const field = {
    width: "100%",
    height: 44,
    padding: "12px 16px",
    boxSizing: "border-box",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--neutral-900)",
    background: "var(--neutral-100)",
    border: "1px solid var(--neutral-300)",
    borderRadius: 6,
    outline: "none"
  };
  const label = {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--neutral-700)"
  };
  const marketValue = Number(String(value).replace(/\D/g, "")) || 0;
  const collateral = Math.round(marketValue * 1.4);
  const can = name.trim() && marketValue > 0;
  const footer = /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    disabled: !can,
    onClick: () => onAdd({
      id: "IT-new-" + Date.now(),
      name: name.trim(),
      category: cat,
      icon: iconFor[cat],
      rate: Number(String(rate).replace(/\D/g, "")) || 0,
      collateral,
      marketValue,
      status: "available"
    })
  }, "Add to rental"));
  return /*#__PURE__*/React.createElement(Modal, {
    title: "Add a new item",
    subtitle: "This also saves the item to your inventory.",
    onClose: onClose,
    footer: footer,
    width: 440
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: label
  }, "Item name"), /*#__PURE__*/React.createElement("input", {
    style: field,
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "e.g. Sony A7 III"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: label
  }, "Category"), /*#__PURE__*/React.createElement(Select, {
    options: cats,
    value: cat,
    onChange: e => setCat(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: label
  }, "Daily rate (\u20A6)"), /*#__PURE__*/React.createElement("input", {
    style: field,
    type: "tel",
    value: rate,
    onChange: e => setRate(e.target.value.replace(/\D/g, "")),
    placeholder: "5,000"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: label
  }, "Item value (\u20A6)"), /*#__PURE__*/React.createElement("input", {
    style: field,
    type: "tel",
    value: value,
    onChange: e => setValue(e.target.value.replace(/\D/g, "")),
    placeholder: "150,000"
  }))), marketValue > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--success-50)",
      borderLeft: "3px solid var(--success-600)",
      borderRadius: 10,
      padding: 14,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--success-900)"
    }
  }, "Collateral (140% of value)"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      color: "var(--success-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, naira(collateral)))));
}
Object.assign(window, {
  NewAgreementScreen,
  AddInventoryItemModal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/NewAgreementScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/NotificationsScreen.jsx
try { (() => {
// Lender notifications — full list page + detail modal. Driven by RV.notifications + NOTE_STYLE.
function NotificationDetailModal({
  note,
  onClose,
  onOpenAgreement
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const s = NOTE_STYLE[note.cat] || NOTE_STYLE.agreement;
  const rental = note.agreementId ? RV.rentals.find(r => r.id === note.agreementId) : null;
  const metaRow = {
    display: "flex",
    gap: 8,
    alignItems: "center"
  };
  const footer = /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onClose
  }, "Close"), rental && /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => onOpenAgreement && onOpenAgreement(rental)
  }, "View agreement \u2192"));
  return /*#__PURE__*/React.createElement(Modal, {
    title: "Notification",
    onClose: onClose,
    footer: footer,
    width: 440
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 44,
      flex: "none",
      borderRadius: 9999,
      background: s.bg,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: note.icon,
    size: 22,
    color: s.color
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 16,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, note.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "6px 0 0",
      fontSize: 14,
      color: "var(--neutral-700)",
      lineHeight: 1.55
    }
  }, note.desc), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: metaRow
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 14,
    color: "var(--neutral-400)"
  }), /*#__PURE__*/React.createElement(DateText, {
    value: note.when,
    format: "long",
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-300)"
    }
  }, "\xB7"), /*#__PURE__*/React.createElement(DateText, {
    value: note.when,
    format: "time",
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  })), note.agreementId && /*#__PURE__*/React.createElement("div", {
    style: metaRow
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-text",
    size: 14,
    color: "var(--neutral-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, "Agreement ", note.agreementId)), note.ref && /*#__PURE__*/React.createElement("div", {
    style: metaRow
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "receipt",
    size: 14,
    color: "var(--neutral-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    }
  }, note.ref))))));
}
function NotificationsScreen({
  onOpenAgreement
}) {
  const {
    Card,
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [list, setList] = React.useState(RV.notifications);
  const [filter, setFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState(null);
  const pageSize = 6;
  React.useEffect(() => {
    setPage(1);
  }, [filter]);
  const match = n => filter === "all" ? true : filter === "unread" ? !n.read : n.cat === filter;
  const filtered = list.filter(match);
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const unreadCount = list.filter(n => !n.read).length;
  const count = id => id === "all" ? list.length : id === "unread" ? unreadCount : list.filter(n => n.cat === id).length;
  const chips = [{
    id: "all",
    label: "All",
    count: count("all")
  }, {
    id: "unread",
    label: "Unread",
    count: count("unread")
  }, {
    id: "penalty",
    label: "Penalties",
    count: count("penalty")
  }, {
    id: "return",
    label: "Returns",
    count: count("return")
  }, {
    id: "agreement",
    label: "Agreements",
    count: count("agreement")
  }];
  function markAllRead() {
    setList(l => l.map(n => ({
      ...n,
      read: true
    })));
  }
  function openNote(n) {
    setList(l => l.map(x => x.id === n.id ? {
      ...x,
      read: true
    } : x));
    setSelected({
      ...n,
      read: true
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      maxWidth: 760,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)"
    }
  }, "Notifications"), unreadCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "var(--brand-700)",
      background: "var(--brand-50)",
      borderRadius: 9999,
      padding: "2px 10px"
    }
  }, unreadCount, " unread"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    disabled: unreadCount === 0,
    onClick: markAllRead
  }, "Mark all as read"))), /*#__PURE__*/React.createElement(FilterChips, {
    options: chips,
    value: filter,
    onChange: setFilter
  }), /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, pageItems.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "48px 24px",
      textAlign: "center",
      fontSize: 14,
      color: "var(--neutral-400)"
    }
  }, "You're all caught up.") : pageItems.map((n, i) => {
    const s = NOTE_STYLE[n.cat] || NOTE_STYLE.agreement;
    return /*#__PURE__*/React.createElement("div", {
      key: n.id,
      onClick: () => openNote(n),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 20px",
        cursor: "pointer",
        borderBottom: i < pageItems.length - 1 ? "1px solid var(--neutral-200)" : "none",
        background: n.read ? "transparent" : "var(--neutral-50)"
      },
      onMouseEnter: e => e.currentTarget.style.background = "var(--neutral-100)",
      onMouseLeave: e => e.currentTarget.style.background = n.read ? "transparent" : "var(--neutral-50)"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 40,
        height: 40,
        flex: "none",
        borderRadius: 9999,
        background: s.bg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: n.icon,
      size: 20,
      color: s.color
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: n.read ? 500 : 600,
        color: "var(--neutral-900)"
      }
    }, n.title), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--neutral-500)",
        lineHeight: 1.45,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, n.desc)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(DateText, {
      value: n.when,
      format: "rel",
      style: {
        fontSize: 11,
        color: "var(--neutral-400)"
      }
    }), !n.read && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 9999,
        background: "var(--brand-600)"
      }
    })));
  })), filtered.length > pageSize && /*#__PURE__*/React.createElement(Pagination, {
    page: page,
    pageSize: pageSize,
    total: filtered.length,
    onPage: setPage
  }), selected && /*#__PURE__*/React.createElement(NotificationDetailModal, {
    note: selected,
    onClose: () => setSelected(null),
    onOpenAgreement: r => {
      setSelected(null);
      onOpenAgreement && onOpenAgreement(r);
    }
  }));
}
Object.assign(window, {
  NotificationsScreen,
  NotificationDetailModal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/NotificationsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/PenaltyScreen.jsx
try { (() => {
// A-10 · Penalty charged notification screen.
function PenaltyScreen({
  onBack,
  onViewAgreement
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const rows = [["Agreement", "Canon EOS R6 — Tunde Bakare"], ["Reason", "Late return (Day 1)"], ["Amount deducted", "₦5,000"], ["Remaining collateral", "₦80,000"], ["Charged at", "19 Jun 2026, 12:00 AM"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement(FlowTopbar, {
    title: "Penalty charged",
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 440,
      margin: "0 auto",
      padding: "40px 24px 48px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 64,
      height: 64,
      borderRadius: 9999,
      background: "var(--brand-50)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "banknote",
    size: 32,
    color: "var(--brand-600)"
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "16px 0 0",
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)",
      textAlign: "center",
      fontVariantNumeric: "tabular-nums"
    }
  }, "\u20A65,000 deducted automatically"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0 0",
      fontSize: 14,
      color: "var(--neutral-500)",
      lineHeight: 1.65,
      textAlign: "center",
      maxWidth: 340
    }
  }, "Late return penalty charged automatically. No action required from you."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      width: "100%",
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      boxSizing: "border-box"
    }
  }, rows.map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, v))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, "RentVault reference"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--neutral-400)",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      wordBreak: "break-all"
    }
  }, "RV-2026-04392"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      width: "100%",
      boxSizing: "border-box",
      background: "var(--success-50)",
      borderLeft: "3px solid var(--success-600)",
      borderRadius: 10,
      padding: 14,
      display: "flex",
      gap: 12,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 20,
    color: "var(--success-600)",
    style: {
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--success-900)"
    }
  }, "Recorded by RentVault \xB7 ref RV-2026-04392")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      width: "100%",
      boxSizing: "border-box",
      background: "var(--warning-50)",
      borderLeft: "3px solid var(--warning-600)",
      borderRadius: 10,
      padding: 14,
      display: "flex",
      gap: 12,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 20,
    color: "var(--warning-600)",
    style: {
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--warning-900)"
    }
  }, "Next deduction in 24 hours if the item is not returned.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    onClick: onViewAgreement
  }, "View full agreement \u2192")))));
}
Object.assign(window, {
  PenaltyScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/PenaltyScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/RegisterScreen.jsx
try { (() => {
// A-02 · Create account form. Topbar with back + step label, centered 480px form.
function RegisterScreen({
  onBack,
  onContinue
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [showPw, setShowPw] = React.useState(false);
  const [pw, setPw] = React.useState("");
  const [agree, setAgree] = React.useState(false);
  const [emailErr, setEmailErr] = React.useState(false);

  // password strength 0..4
  const strength = (() => {
    let s = 0;
    if (pw.length >= 6) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  })();
  const segColors = ["var(--danger-600)", "var(--danger-600)", "var(--warning-600)", "var(--brand-500)", "var(--success-600)"];
  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--neutral-700)"
  };
  const fieldBase = {
    width: "100%",
    height: 44,
    padding: "12px 16px",
    boxSizing: "border-box",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--neutral-900)",
    background: "var(--neutral-100)",
    border: "1px solid var(--neutral-300)",
    borderRadius: 6,
    outline: "none"
  };
  function Field({
    children
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, children);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      height: 64,
      background: "#fff",
      borderBottom: "1px solid var(--neutral-200)",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      position: "sticky",
      top: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    "aria-label": "Back",
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "inline-flex",
      padding: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 20,
    color: "var(--neutral-700)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      marginLeft: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 20,
    color: "var(--brand-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: "-0.2px",
      color: "var(--neutral-900)"
    }
  }, "RentVault")), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, "Create account"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, "Step 1 of 2")), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 480,
      margin: "0 auto",
      padding: "32px 24px 48px",
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Field, null, /*#__PURE__*/React.createElement("label", {
    style: labelStyle
  }, "Full name"), /*#__PURE__*/React.createElement("input", {
    style: fieldBase,
    placeholder: "Emeka Okafor",
    defaultValue: "Emeka Okafor"
  })), /*#__PURE__*/React.createElement(Field, null, /*#__PURE__*/React.createElement("label", {
    style: labelStyle
  }, "Email address"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    style: {
      ...fieldBase,
      ...(emailErr ? {
        border: "2px solid var(--danger-500)",
        background: "var(--danger-50)"
      } : {})
    },
    placeholder: "emeka@example.com",
    defaultValue: "emeka@example",
    onBlur: e => setEmailErr(!/^[^@]+@[^@]+\.[^@]+$/.test(e.target.value)),
    onFocus: () => setEmailErr(false)
  }), emailErr && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12,
      color: "var(--danger-600)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "alert-circle",
    size: 14,
    color: "var(--danger-600)"
  }), "Enter a valid email address.")), /*#__PURE__*/React.createElement(Field, null, /*#__PURE__*/React.createElement("label", {
    style: labelStyle
  }, "Phone number"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      background: "var(--neutral-100)",
      border: "1px solid var(--neutral-300)",
      borderRadius: 6,
      height: 44,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      height: "100%",
      padding: "0 12px",
      borderRight: "1px solid var(--neutral-200)",
      fontSize: 14,
      color: "var(--neutral-500)"
    }
  }, "+234"), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    placeholder: "801 234 5678",
    defaultValue: "801 234 5678",
    style: {
      flex: 1,
      height: "100%",
      border: "none",
      background: "transparent",
      padding: "0 16px",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--neutral-900)",
      outline: "none"
    }
  }))), /*#__PURE__*/React.createElement(Field, null, /*#__PURE__*/React.createElement("label", {
    style: labelStyle
  }, "Password"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: showPw ? "text" : "password",
    style: {
      ...fieldBase,
      paddingRight: 44
    },
    value: pw,
    onChange: e => setPw(e.target.value),
    placeholder: "Create a password"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowPw(v => !v),
    "aria-label": "Toggle password",
    style: {
      position: "absolute",
      right: 12,
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: showPw ? "eye-off" : "eye",
    size: 16,
    color: "var(--neutral-400)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      marginTop: 0
    }
  }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      flex: 1,
      height: 4,
      borderRadius: 4,
      background: i < strength ? segColors[strength] : "var(--neutral-200)",
      transition: "background 150ms ease"
    }
  })))), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
      marginTop: 8,
      cursor: "pointer",
      fontSize: 14,
      color: "var(--neutral-700)",
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => setAgree(v => !v),
    style: {
      width: 18,
      height: 18,
      flex: "none",
      marginTop: 1,
      borderRadius: 4,
      background: agree ? "var(--brand-600)" : "var(--neutral-100)",
      border: agree ? "none" : "1px solid var(--neutral-300)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, agree && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 12,
    color: "#fff",
    strokeWidth: 3
  })), /*#__PURE__*/React.createElement("span", null, "I agree to the ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      color: "var(--brand-600)",
      textDecoration: "none"
    }
  }, "Terms of Service"), " and ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      color: "var(--brand-600)",
      textDecoration: "none"
    }
  }, "Privacy Policy"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    onClick: onContinue,
    disabled: !agree
  }, "Continue to verification \u2192"))));
}
Object.assign(window, {
  RegisterScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/RegisterScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/RequestsScreen.jsx
try { (() => {
// Lender — Incoming rental requests. Accept (→ agreement + payment link) or decline. RV.requests-backed.
function RequestsScreen({
  onOpenAgreement
}) {
  const {
    Card,
    Badge,
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [list, setList] = React.useState(RV.requests);
  const [filter, setFilter] = React.useState("pending");
  const [accepted, setAccepted] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  // accepted = the request object once accepted → shows success state with payment link.
  if (accepted) {
    const total = accepted.lines.reduce((s, l) => s + l.collateral * l.qty, 0);
    const units = accepted.lines.reduce((s, l) => s + l.qty, 0);
    const ref = "RV-2026-00452";
    const link = "rentvault.co/pay/" + ref;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 40,
        maxWidth: 520,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 64,
        height: 64,
        borderRadius: 9999,
        background: "var(--success-50)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check-circle",
      size: 32,
      color: "var(--success-600)"
    })), /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: "20px 0 0",
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: "-0.3px",
        color: "var(--neutral-900)",
        textAlign: "center"
      }
    }, "Request accepted"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "8px 0 0",
        fontSize: 14,
        color: "var(--neutral-500)",
        lineHeight: 1.6,
        textAlign: "center",
        maxWidth: 360
      }
    }, "An agreement was created for ", accepted.borrower, ". We've sent them a payment link for the ", naira(total), " collateral \u2014 the rental activates as soon as they pay."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 24,
        width: "100%",
        background: "#fff",
        boxShadow: "var(--shadow-2)",
        borderRadius: 14,
        padding: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--neutral-50)",
        borderRadius: 10,
        padding: "14px 16px"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "link",
      size: 16,
      color: "var(--neutral-400)",
      style: {
        flex: "none"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--neutral-900)"
      }
    }, ref), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--neutral-400)",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
      }
    }, link))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        display: "flex",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      style: {
        flex: 1
      },
      leadingIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "share-2",
        size: 16,
        color: "var(--neutral-900)"
      }),
      onClick: async () => {
        const ok = await copyText("https://" + link);
        setToast(ok ? "Link copied — paste into WhatsApp" : link);
      }
    }, "Share via WhatsApp"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      style: {
        flex: 1
      },
      leadingIcon: /*#__PURE__*/React.createElement(Icon, {
        name: "copy",
        size: 16,
        color: "var(--neutral-900)"
      }),
      onClick: async () => {
        const ok = await copyText("https://" + link);
        setToast(ok ? "Payment link copied" : link);
      }
    }, "Copy link"))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 24,
        width: "100%"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      fullWidth: true,
      onClick: () => setAccepted(null)
    }, "Back to requests")), toast && /*#__PURE__*/React.createElement(Toast, {
      message: toast,
      onDone: () => setToast(null)
    }));
  }
  const visible = list.filter(r => filter === "all" ? true : r.status ? r.status === filter : filter === "pending");
  const chips = [{
    id: "pending",
    label: "Pending",
    count: list.filter(r => !r.status).length
  }, {
    id: "accepted",
    label: "Accepted",
    count: list.filter(r => r.status === "accepted").length
  }, {
    id: "declined",
    label: "Declined",
    count: list.filter(r => r.status === "declined").length
  }, {
    id: "all",
    label: "All",
    count: list.length
  }];
  function decide(id, status) {
    setList(l => l.map(r => r.id === id ? {
      ...r,
      status
    } : r));
    setToast(status === "declined" ? "Request declined" : "Request accepted");
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      maxWidth: 760,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)"
    }
  }, "Requests"), chips[0].count > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "var(--brand-700)",
      background: "var(--brand-50)",
      borderRadius: 9999,
      padding: "2px 10px"
    }
  }, chips[0].count, " pending")), /*#__PURE__*/React.createElement(FilterChips, {
    options: chips,
    value: filter,
    onChange: setFilter
  }), visible.length === 0 ? /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "48px 24px",
      textAlign: "center",
      fontSize: 14,
      color: "var(--neutral-400)"
    }
  }, "No ", filter === "all" ? "" : filter + " ", "requests.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, visible.map(r => {
    const total = r.lines.reduce((s, l) => s + l.collateral * l.qty, 0);
    const units = r.lines.reduce((s, l) => s + l.qty, 0);
    const trustColor = r.trust >= 85 ? "var(--success-600)" : r.trust >= 70 ? "var(--warning-600)" : "var(--danger-600)";
    return /*#__PURE__*/React.createElement(Card, {
      key: r.id,
      padding: 20
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 44,
        height: 44,
        flex: "none",
        borderRadius: 9999,
        background: "var(--neutral-100)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 15,
        fontWeight: 600,
        color: "var(--neutral-700)"
      }
    }, r.initials), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 600,
        color: "var(--neutral-900)"
      }
    }, r.borrower), r.verified ? /*#__PURE__*/React.createElement(Icon, {
      name: "badge-check",
      size: 15,
      color: "var(--success-600)"
    }) : /*#__PURE__*/React.createElement(Badge, {
      variant: "warning"
    }, "Not verified")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 2,
        fontSize: 12,
        color: "var(--neutral-400)"
      }
    }, r.id, " \xB7 ", /*#__PURE__*/React.createElement(DateText, {
      value: r.when,
      format: "rel"
    }))), r.status ? /*#__PURE__*/React.createElement(Badge, {
      variant: r.status === "accepted" ? "success" : "neutral"
    }, r.status === "accepted" ? "Accepted" : "Declined") : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16,
        fontWeight: 600,
        color: trustColor,
        fontVariantNumeric: "tabular-nums"
      }
    }, r.trust), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: "var(--neutral-400)",
        textTransform: "uppercase",
        letterSpacing: "0.04em"
      }
    }, "Trust score"))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16,
        padding: 14,
        background: "var(--neutral-50)",
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, r.lines.map(l => /*#__PURE__*/React.createElement("div", {
      key: l.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 30,
        height: 30,
        flex: "none",
        borderRadius: 7,
        background: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: l.icon,
      size: 15,
      color: "var(--neutral-700)"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        fontSize: 13,
        color: "var(--neutral-900)"
      }
    }, l.name, l.qty > 1 ? " × " + l.qty : ""), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--neutral-900)",
        fontVariantNumeric: "tabular-nums"
      }
    }, naira(l.collateral * l.qty))))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        display: "flex",
        gap: 24,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--neutral-400)",
        textTransform: "uppercase",
        letterSpacing: "0.04em"
      }
    }, "Rental period"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--neutral-900)"
      }
    }, r.start, " \u2192 ", r.returnDate)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--neutral-400)",
        textTransform: "uppercase",
        letterSpacing: "0.04em"
      }
    }, "Total collateral"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--neutral-900)",
        fontVariantNumeric: "tabular-nums"
      }
    }, naira(total), " \xB7 ", units, " ", units === 1 ? "item" : "items"))), r.note && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        display: "flex",
        gap: 10,
        padding: "12px 14px",
        background: "var(--brand-50)",
        borderRadius: 10
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "message-square",
      size: 16,
      color: "var(--brand-600)",
      style: {
        flex: "none",
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--brand-900)",
        lineHeight: 1.5,
        fontStyle: "italic"
      }
    }, "\"", r.note, "\"")), !r.status && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16,
        display: "flex",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      style: {
        color: "var(--danger-600)"
      },
      onClick: () => decide(r.id, "declined")
    }, "Decline"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      style: {
        flex: 1
      },
      onClick: () => {
        decide(r.id, "accepted");
        setAccepted(r);
      }
    }, "Accept & send payment link \u2192")));
  })), toast && /*#__PURE__*/React.createElement(Toast, {
    message: toast,
    onDone: () => setToast(null)
  }));
}
Object.assign(window, {
  RequestsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/RequestsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/SeizureScreen.jsx
try { (() => {
// C-02 · Lender — Full seizure / escalation. Item unreturned after 7 days, collateral seized.
function SeizureScreen({
  onBack
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const evidence = [["Agreement ID", "AG-3041"], ["Borrower identity", "Tunde Bakare · BVN verified"], ["Item registered", "Canon EOS R6 · SN 062041000537"], ["Pickup date + condition", "20 Jun 2026 · ref RV-2026-04417"], ["Last known status", "Overdue — 7 days, no contact"], ["Total penalties deducted", "₦35,000"], ["Collateral seized", "₦200,000"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement(FlowTopbar, {
    title: "Agreement escalated",
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      margin: "0 auto",
      padding: "24px 24px 48px",
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--danger-50)",
      borderLeft: "3px solid var(--danger-600)",
      borderRadius: 10,
      padding: 16,
      display: "flex",
      gap: 12,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-x",
    size: 20,
    color: "var(--danger-600)",
    style: {
      flex: "none",
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--danger-900)"
    }
  }, "Full collateral seized"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontSize: 12,
      color: "var(--danger-900)",
      lineHeight: 1.5
    }
  }, "Tunde Bakare did not return the Canon EOS R6 after 7 days. \u20A6200,000 has been transferred to your account."))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28,
      fontWeight: 600,
      letterSpacing: "-0.5px",
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums"
    }
  }, "\u20A6200,000"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 2,
      fontSize: 12,
      color: "var(--success-600)"
    }
  }, "Transferred to your RentVault balance"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      alignSelf: "stretch",
      background: "var(--neutral-200)",
      margin: "16px 0"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      alignSelf: "stretch",
      background: "var(--success-50)",
      borderLeft: "3px solid var(--success-600)",
      borderRadius: 10,
      padding: 14,
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 20,
    color: "var(--success-600)",
    style: {
      flex: "none",
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--success-900)"
    }
  }, "Seizure completed via Paystack."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 11,
      color: "var(--success-600)"
    }
  }, "RV-2026-04501")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-500)"
    }
  }, "Evidence package"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 10,
      padding: 20
    }
  }, evidence.map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 24,
      padding: "10px 0",
      borderBottom: i < evidence.length - 1 ? "1px solid var(--neutral-200)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)",
      whiteSpace: "nowrap"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--neutral-900)",
      fontVariantNumeric: "tabular-nums",
      textAlign: "right"
    }
  }, v))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 16,
      color: "var(--neutral-900)"
    })
  }, "Download PDF report"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "copy",
      size: 16,
      color: "var(--neutral-900)"
    })
  }, "Copy evidence link")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--danger-50)",
      borderLeft: "3px solid var(--danger-600)",
      borderRadius: 10,
      padding: 14,
      display: "flex",
      gap: 12,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user-x",
    size: 20,
    color: "var(--danger-600)",
    style: {
      flex: "none",
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--danger-900)",
      lineHeight: 1.5
    }
  }, "Tunde Bakare has been flagged on RentVault. They cannot rent from any lender on the platform.")))));
}
Object.assign(window, {
  SeizureScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/SeizureScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Sidebar.jsx
try { (() => {
// Lender sidebar — 240px, white, 1px right divider, nav + escrow-secured pill.
function Sidebar({
  active,
  onNavigate
}) {
  const items = [{
    id: "overview",
    label: "Overview",
    icon: "layout-dashboard"
  }, {
    id: "items",
    label: "My Items",
    icon: "package"
  }, {
    id: "agreements",
    label: "Agreements",
    icon: "file-text"
  }, {
    id: "requests",
    label: "Requests",
    icon: "inbox",
    badge: RV.requests.filter(r => !r.status).length || null
  }, {
    id: "borrowers",
    label: "Borrowers",
    icon: "users"
  }, {
    id: "notifications",
    label: "Notifications",
    icon: "bell",
    badge: RV.notifications.filter(n => !n.read).length || null
  }, {
    id: "chain",
    label: "Activity",
    icon: "activity"
  }, {
    id: "settings",
    label: "Settings",
    icon: "settings"
  }];
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 240,
      flex: "none",
      background: "#fff",
      borderRight: "1px solid var(--neutral-200)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      padding: "24px",
      borderBottom: "1px solid var(--neutral-200)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/rentvault-logo.svg",
    alt: "RentVault",
    style: {
      height: 28
    }
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      padding: "16px"
    }
  }, items.map(it => {
    const on = it.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      onClick: () => onNavigate && onNavigate(it.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 40,
        padding: "0 16px",
        borderRadius: 4,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        background: on ? "var(--neutral-100)" : "transparent",
        boxShadow: on ? "inset 2px 0 0 var(--brand-600)" : "none",
        color: on ? "var(--neutral-900)" : "var(--neutral-700)",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: on ? 600 : 400,
        transition: "background 150ms ease"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: it.icon,
      size: 20,
      color: on ? "var(--neutral-900)" : "var(--neutral-400)"
    }), it.label, it.badge ? /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto",
        fontSize: 11,
        fontWeight: 600,
        color: "#fff",
        background: "var(--brand-600)",
        borderRadius: 9999,
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, it.badge) : null);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate && onNavigate("settings"),
    title: "Collateral held safely in Paystack escrow \xB7 manage in settings",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      padding: "4px 10px",
      borderRadius: 9999,
      background: "var(--success-50)",
      color: "var(--success-900)",
      fontSize: 12,
      fontWeight: 600,
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      transition: "background 150ms ease"
    },
    onMouseEnter: e => e.currentTarget.style.background = "var(--success-100, hsl(152,60%,90%))",
    onMouseLeave: e => e.currentTarget.style.background = "var(--success-50)"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 14,
    color: "var(--success-600)"
  }), "Payments secured"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--neutral-400)",
      paddingLeft: 2
    }
  }, "Escrow by Paystack")));
}
Object.assign(window, {
  Sidebar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/SignInScreen.jsx
try { (() => {
// A-01b · Lender sign-in. Email + password, brand lockup, links to create account / reset.
function SignInScreen({
  onBack,
  onSignIn,
  onCreate
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [reset, setReset] = React.useState(false);
  const canSubmit = email.trim() && pw.trim();
  const label = {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--neutral-700)"
  };
  const field = {
    width: "100%",
    height: 44,
    padding: "12px 16px",
    boxSizing: "border-box",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--neutral-900)",
    background: "var(--neutral-100)",
    border: "1px solid var(--neutral-300)",
    borderRadius: 6,
    outline: "none"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--neutral-50)",
      padding: "48px 24px",
      boxSizing: "border-box",
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 380
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 28,
    color: "var(--brand-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)"
    }
  }, "RentVault")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 14,
      padding: 28,
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)",
      textAlign: "center"
    }
  }, "Welcome back"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0 0",
      fontSize: 14,
      color: "var(--neutral-500)",
      textAlign: "center"
    }
  }, "Sign in to your lender dashboard."), reset && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      background: "var(--success-50)",
      borderLeft: "3px solid var(--success-600)",
      borderRadius: 10,
      padding: 14,
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "mail-check",
    size: 20,
    color: "var(--success-600)",
    style: {
      flex: "none",
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--success-900)"
    }
  }, "Reset link sent"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      fontSize: 12,
      color: "var(--success-600)",
      lineHeight: 1.5
    }
  }, "Check ", email || "your email", " for a link to reset your password."))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: label
  }, "Email address"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "you@example.com",
    style: field
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: label
  }, "Password"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setReset(true),
    style: {
      marginLeft: "auto",
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 12,
      color: "var(--brand-600)"
    }
  }, "Forgot password?")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: show ? "text" : "password",
    value: pw,
    onChange: e => setPw(e.target.value),
    placeholder: "Your password",
    style: {
      ...field,
      paddingRight: 44
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShow(v => !v),
    "aria-label": show ? "Hide password" : "Show password",
    style: {
      position: "absolute",
      right: 12,
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "inline-flex",
      padding: 2
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: show ? "eye-off" : "eye",
    size: 18,
    color: "var(--neutral-400)"
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    disabled: !canSubmit,
    onClick: onSignIn
  }, "Sign in \u2192"))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "24px 0 0",
      fontSize: 13,
      color: "var(--neutral-500)",
      textAlign: "center"
    }
  }, "New to RentVault?", " ", /*#__PURE__*/React.createElement("button", {
    onClick: onCreate,
    style: {
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      fontWeight: 600,
      color: "var(--brand-600)"
    }
  }, "Create an account")), /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      display: "block",
      margin: "16px auto 0",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      color: "var(--neutral-400)"
    }
  }, "\u2190 Back")));
}
Object.assign(window, {
  SignInScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/SignInScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/SplashScreen.jsx
try { (() => {
// A-01 · Splash / welcome. Calm authority, escrow framing, two-column hero. No gradients.
function SplashScreen({
  onCreate,
  onSignIn,
  onBorrow
}) {
  const {
    Button
  } = window.RentVaultDesignSystem_eb37ad;
  const features = [["shield-check", "Collateral held in escrow", "Paystack secures every naira until the item is safely back in your hands."], ["banknote", "Penalties paid automatically", "Late or damaged? The right amount is transferred to you — no chasing, no awkward calls."], ["send", "Instant payouts to your bank", "Withdraw released collateral and earnings to any Nigerian bank, anytime."]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--neutral-50)",
      padding: "48px 32px",
      boxSizing: "border-box",
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 940,
      display: "grid",
      gridTemplateColumns: "1.05fr 0.95fr",
      gap: 56,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 32,
    color: "var(--brand-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)"
    }
  }, "RentVault")), /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 40,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--brand-600)"
    }
  }, "For lenders"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "12px 0 0",
      fontSize: 40,
      fontWeight: 600,
      lineHeight: 1.05,
      letterSpacing: "-1px",
      color: "var(--neutral-900)"
    }
  }, "Lend anything.", /*#__PURE__*/React.createElement("br", null), "Fear nothing."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "16px 0 0",
      fontSize: 15,
      fontWeight: 400,
      lineHeight: 1.6,
      color: "var(--neutral-500)",
      maxWidth: 380
    }
  }, "RentVault holds your borrower's collateral in secure escrow and handles penalties automatically. You never have to chase anyone."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      width: "100%",
      maxWidth: 300
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    onClick: onCreate
  }, "Create lender account"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    onClick: onBorrow
  }, "I'm borrowing an item")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "24px 0 0",
      fontSize: 13,
      color: "var(--neutral-500)"
    }
  }, "Already have an account?", " ", /*#__PURE__*/React.createElement("button", {
    onClick: onSignIn,
    style: {
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      fontWeight: 600,
      color: "var(--brand-600)"
    }
  }, "Sign in"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      boxShadow: "var(--shadow-2)",
      borderRadius: 16,
      padding: 28,
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--neutral-400)"
    }
  }, "How RentVault protects you"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, features.map(([icon, title, desc]) => /*#__PURE__*/React.createElement("div", {
    key: title,
    style: {
      display: "flex",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      flex: "none",
      borderRadius: 10,
      background: "var(--brand-50)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20,
    color: "var(--brand-600)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--neutral-500)",
      lineHeight: 1.5
    }
  }, desc))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      paddingTop: 20,
      borderTop: "1px solid var(--neutral-200)",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 16,
    color: "var(--success-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, "Payments secured by Paystack escrow")))));
}
Object.assign(window, {
  SplashScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/SplashScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Topbar.jsx
try { (() => {
// Lender topbar — 64px, white, 1px bottom divider, greeting + bell + avatar.
// Bell opens a notifications panel; avatar opens an account menu.
function Topbar({
  name = "Emeka",
  date = "Friday, 19 June 2026",
  subline = "3 active rentals",
  onOpenSettings,
  onSignOut,
  onOpenAgreement,
  onViewAll
}) {
  const {
    Avatar
  } = window.RentVaultDesignSystem_eb37ad;
  const [open, setOpen] = React.useState(null); // 'notif' | 'menu' | null
  const [unread, setUnread] = React.useState(true);
  const notifs = RV.notifications.slice(0, 5).map(n => {
    const s = NOTE_STYLE[n.cat] || NOTE_STYLE.agreement;
    const rental = n.agreementId ? RV.rentals.find(r => r.id === n.agreementId) : null;
    return {
      ...n,
      color: s.color,
      bg: s.bg,
      action: rental ? () => onOpenAgreement && onOpenAgreement(rental) : undefined
    };
  });
  const unreadCount = RV.notifications.filter(n => !n.read).length;
  const menuItem = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    height: 40,
    padding: "0 12px",
    border: "none",
    background: "transparent",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--neutral-900)",
    textAlign: "left"
  };
  const hoverOn = e => e.currentTarget.style.background = "var(--neutral-50)";
  const hoverOff = e => e.currentTarget.style.background = "transparent";
  const close = () => setOpen(null);
  return /*#__PURE__*/React.createElement("header", {
    style: {
      height: 64,
      flex: "none",
      background: "#fff",
      borderBottom: "1px solid var(--neutral-200)",
      display: "flex",
      alignItems: "center",
      gap: 24,
      padding: "0 40px",
      position: "relative",
      zIndex: 30
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: "-0.2px",
      color: "var(--neutral-900)"
    }
  }, "Good morning, ", name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, date, " \xB7 ", subline)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setOpen(open === "notif" ? null : "notif");
      setUnread(false);
    },
    style: {
      position: "relative",
      display: "inline-flex",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 4
    },
    "aria-label": "Notifications"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 20,
    color: open === "notif" ? "var(--neutral-900)" : "var(--neutral-500)"
  }), unread && unreadCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      right: 2,
      width: 8,
      height: 8,
      borderRadius: 9999,
      background: "var(--danger-600)"
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(open === "menu" ? null : "menu"),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
      borderRadius: 9999,
      display: "inline-flex",
      boxShadow: open === "menu" ? "0 0 0 2px var(--brand-500)" : "none"
    },
    "aria-label": "Account menu"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Emeka Okafor",
    size: 36
  }))), open && /*#__PURE__*/React.createElement("div", {
    onClick: close,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 25
    }
  }), open === "notif" && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 60,
      right: 64,
      width: 360,
      background: "#fff",
      borderRadius: 12,
      boxShadow: "var(--shadow-3)",
      zIndex: 31,
      overflow: "hidden",
      animation: "rvMenuIn 160ms ease-out"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 16px",
      borderBottom: "1px solid var(--neutral-200)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, "Notifications"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-400)"
    }
  }, unreadCount, " unread")), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: 340,
      overflowY: "auto"
    }
  }, notifs.map((n, i) => /*#__PURE__*/React.createElement("button", {
    key: n.id,
    onClick: () => {
      close();
      n.action && n.action();
    },
    style: {
      display: "flex",
      gap: 12,
      width: "100%",
      textAlign: "left",
      padding: "12px 16px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      borderBottom: i < notifs.length - 1 ? "1px solid var(--neutral-100)" : "none"
    },
    onMouseEnter: hoverOn,
    onMouseLeave: hoverOff
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      flex: "none",
      borderRadius: 9999,
      background: n.bg,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: n.icon,
    size: 16,
    color: n.color
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, n.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)",
      lineHeight: 1.4,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, n.desc)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 4,
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--neutral-400)",
      whiteSpace: "nowrap"
    }
  }, relTime(n.when)), !n.read && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 9999,
      background: "var(--brand-600)"
    }
  }))))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      close();
      onViewAll && onViewAll();
    },
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      width: "100%",
      height: 44,
      border: "none",
      borderTop: "1px solid var(--neutral-200)",
      background: "#fff",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      fontWeight: 600,
      color: "var(--brand-600)"
    },
    onMouseEnter: e => e.currentTarget.style.background = "var(--neutral-50)",
    onMouseLeave: e => e.currentTarget.style.background = "#fff"
  }, "View all notifications \u2192")), open === "menu" && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 60,
      right: 40,
      width: 224,
      background: "#fff",
      borderRadius: 12,
      boxShadow: "var(--shadow-3)",
      zIndex: 31,
      overflow: "hidden",
      animation: "rvMenuIn 160ms ease-out"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 16px",
      borderBottom: "1px solid var(--neutral-200)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, "Emeka Okafor"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, "emeka.okafor@gmail.com")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: menuItem,
    onMouseEnter: hoverOn,
    onMouseLeave: hoverOff,
    onClick: () => {
      close();
      onOpenSettings && onOpenSettings();
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "settings",
    size: 16,
    color: "var(--neutral-500)"
  }), "Settings"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...menuItem,
      color: "var(--danger-600)"
    },
    onMouseEnter: hoverOn,
    onMouseLeave: hoverOff,
    onClick: () => {
      close();
      onSignOut && onSignOut();
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "log-out",
    size: 16,
    color: "var(--danger-600)"
  }), "Sign out"))), /*#__PURE__*/React.createElement("style", null, `@keyframes rvMenuIn { from { transform: translateY(-6px); } to { transform: translateY(0); } }`));
}
Object.assign(window, {
  Topbar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Topbar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/VerifyScreen.jsx
try { (() => {
// A-03 · Identity verification. Step 2/2 stepper, BVN/NIN option cards, success banner.
function VerifyScreen({
  onBack,
  onComplete
}) {
  const {
    Button,
    Stepper,
    AlertBanner
  } = window.RentVaultDesignSystem_eb37ad;
  const [method, setMethod] = React.useState("bvn");
  const [val, setVal] = React.useState("");
  const [verified, setVerified] = React.useState(false);
  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--neutral-700)"
  };
  function OptionCard({
    id,
    icon,
    title,
    desc
  }) {
    const on = method === id;
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => setMethod(id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        background: on ? "var(--brand-50)" : "#fff",
        border: on ? "1.5px solid var(--brand-500)" : "none",
        boxShadow: on ? "none" : "var(--shadow-2)",
        borderRadius: 10,
        padding: on ? "18.5px" : "20px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 40,
        height: 40,
        flex: "none",
        borderRadius: 9999,
        background: "var(--brand-50)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 24,
      color: "var(--brand-600)"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--neutral-900)"
      }
    }, title), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--neutral-500)"
      }
    }, desc)), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 20,
        height: 20,
        flex: "none",
        borderRadius: 9999,
        border: on ? "6px solid var(--brand-600)" : "2px solid var(--neutral-300)",
        boxSizing: "border-box",
        background: "#fff"
      }
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100%",
      background: "var(--neutral-50)"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      height: 64,
      background: "#fff",
      borderBottom: "1px solid var(--neutral-200)",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      position: "sticky",
      top: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    "aria-label": "Back",
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "inline-flex",
      padding: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 20,
    color: "var(--neutral-700)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      marginLeft: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 20,
    color: "var(--brand-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: "-0.2px",
      color: "var(--neutral-900)"
    }
  }, "RentVault")), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, "Verify your identity"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, "Step 2 of 2")), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 480,
      margin: "0 auto",
      padding: "24px 24px 48px"
    }
  }, /*#__PURE__*/React.createElement(Stepper, {
    steps: ["Account", "Verification"],
    current: 1
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "32px 0 8px",
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "-0.3px",
      color: "var(--neutral-900)"
    }
  }, "Verify your identity"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      color: "var(--neutral-500)",
      lineHeight: 1.65
    }
  }, "Required to receive escrow payouts to your bank account when agreements are resolved in your favour."), verified ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement(AlertBanner, {
    variant: "success",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "check-circle",
      size: 20
    }),
    title: "Identity verified"
  }, "Your payout account is ready. Redirecting to your dashboard\u2026"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    onClick: onComplete
  }, "Open dashboard \u2192"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(OptionCard, {
    id: "bvn",
    icon: "credit-card",
    title: "Bank Verification Number (BVN)",
    desc: "Fastest option. Links your identity to your RentVault payout account."
  }), /*#__PURE__*/React.createElement(OptionCard, {
    id: "nin",
    icon: "fingerprint",
    title: "National ID Number (NIN)",
    desc: "Use if BVN is unavailable. Same verification outcome."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: labelStyle
  }, "Enter your ", method === "bvn" ? "BVN" : "NIN"), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    maxLength: 11,
    value: val,
    onChange: e => setVal(e.target.value.replace(/\D/g, "")),
    placeholder: "00000000000",
    style: {
      width: "100%",
      height: 44,
      padding: "12px 16px",
      boxSizing: "border-box",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      letterSpacing: "0.08em",
      color: "var(--neutral-900)",
      background: "var(--neutral-100)",
      border: "1px solid var(--neutral-300)",
      borderRadius: 6,
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-400)",
      lineHeight: 1.5
    }
  }, "Used only to verify your identity and enable payouts. Never stored in plain text or shared.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    onClick: () => setVerified(true)
  }, "Verify and open dashboard \u2192")))));
}
Object.assign(window, {
  VerifyScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/VerifyScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/kit-common.jsx
try { (() => {
// Shared helpers for the RentVault UI kits. Exposes Icon + sample data to window.
const {
  useState,
  useEffect,
  useRef
} = React;
function toPascal(s) {
  return s.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join("");
}

/** Lucide icon as a React component (1.5px stroke), built from icon node data. */
function Icon({
  name,
  size = 20,
  color = "currentColor",
  strokeWidth = 1.5,
  style = {}
}) {
  const nodes = window.lucide && window.lucide.icons && window.lucide.icons[toPascal(name)] || [];
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: "block",
      flex: "none",
      ...style
    }
  }, nodes.map((n, i) => React.createElement(n[0], {
    key: i,
    ...n[1]
  })));
}
const RV = {
  rentals: [{
    id: "AG-3041",
    item: "Canon EOS R6",
    icon: "camera",
    borrower: "Tunde Bakare",
    collateral: "₦200,000",
    status: "overdue",
    overdueDays: 2
  }, {
    id: "AG-3038",
    item: "DeWalt drill set",
    icon: "wrench",
    borrower: "Ada Eze",
    collateral: "₦60,000",
    status: "active"
  }, {
    id: "AG-3033",
    item: "Yamaha keyboard",
    icon: "music",
    borrower: "Chidi Okeke",
    collateral: "₦90,000",
    status: "active"
  }, {
    id: "AG-3029",
    item: "DJI Mavic drone",
    icon: "plane",
    borrower: "Ngozi Udo",
    collateral: "₦120,000",
    status: "pending"
  }, {
    id: "AG-3024",
    item: "Bosch projector",
    icon: "monitor",
    borrower: "Femi Adeyemi",
    collateral: "₦45,000",
    status: "returned"
  }],
  activity: [{
    icon: "shield-check",
    cat: "collateral",
    type: "Collateral secured",
    desc: "₦120,000 held in escrow for the DJI Mavic drone rental.",
    amount: "+₦120,000",
    ref: "RV-2026-04417",
    when: new Date(Date.now() - 12 * 60000),
    time: "12 min ago",
    agreementId: "AG-3029"
  }, {
    icon: "banknote",
    cat: "penalty",
    type: "Penalty charged",
    desc: "₦10,000 transferred to you from Tunde Bakare's collateral — Canon EOS R6 overdue.",
    amount: "+₦10,000",
    ref: "RV-2026-04392",
    when: new Date(Date.now() - 2 * 3600000),
    time: "2 hours ago",
    agreementId: "AG-3041"
  }, {
    icon: "check-circle",
    cat: "return",
    type: "Item returned",
    desc: "Bosch projector returned by Femi Adeyemi. Collateral released.",
    amount: null,
    ref: "RV-2026-04358",
    when: new Date(Date.now() - 26 * 3600000),
    time: "Yesterday",
    agreementId: "AG-3024"
  }, {
    icon: "send",
    cat: "payout",
    type: "Collateral released",
    desc: "₦45,000 returned to Femi Adeyemi after a clean return.",
    amount: "−₦45,000",
    ref: "RV-2026-04357",
    when: new Date(Date.now() - 27 * 3600000),
    time: "Yesterday",
    agreementId: "AG-3024"
  }, {
    icon: "file-text",
    cat: "agreement",
    type: "Agreement signed",
    desc: "Yamaha keyboard — Chidi Okeke signed and paid ₦90,000 collateral.",
    amount: "+₦90,000",
    ref: "RV-2026-04301",
    when: new Date(Date.now() - 50 * 3600000),
    time: "2 days ago",
    agreementId: "AG-3033"
  }, {
    icon: "user-check",
    cat: "agreement",
    type: "Borrower verified",
    desc: "Ada Eze completed BVN identity verification.",
    amount: null,
    ref: "RV-2026-04288",
    when: new Date(Date.now() - 72 * 3600000),
    time: "3 days ago",
    agreementId: "AG-3038"
  }, {
    icon: "shield-check",
    cat: "collateral",
    type: "Collateral secured",
    desc: "₦60,000 held in escrow for the DeWalt drill set rental.",
    amount: "+₦60,000",
    ref: "RV-2026-04270",
    when: new Date(Date.now() - 96 * 3600000),
    time: "4 days ago",
    agreementId: "AG-3038"
  }, {
    icon: "banknote",
    cat: "penalty",
    type: "Penalty charged",
    desc: "₦5,000 late fee applied on the DJI Mavic drone.",
    amount: "+₦5,000",
    ref: "RV-2026-04261",
    when: new Date(Date.now() - 120 * 3600000),
    time: "5 days ago",
    agreementId: "AG-3029"
  }],
  notifications: [{
    id: "n1",
    cat: "alert",
    icon: "alert-triangle",
    title: "Overdue return",
    desc: "Canon EOS R6 — Tunde Bakare is 2 days overdue. A penalty applies each day until it's returned.",
    when: new Date(Date.now() - 2 * 3600000),
    read: false,
    agreementId: "AG-3041"
  }, {
    id: "n2",
    cat: "penalty",
    icon: "banknote",
    title: "Penalty charged",
    desc: "₦10,000 was transferred to you from Tunde Bakare's collateral for the overdue Canon EOS R6.",
    when: new Date(Date.now() - 2 * 3600000),
    read: false,
    agreementId: "AG-3041",
    ref: "RV-2026-04392"
  }, {
    id: "n3",
    cat: "return",
    icon: "check-circle",
    title: "Item returned",
    desc: "Bosch projector returned by Femi Adeyemi. You have 48 hours to review its condition before collateral is released.",
    when: new Date(Date.now() - 26 * 3600000),
    read: false,
    agreementId: "AG-3024"
  }, {
    id: "n4",
    cat: "payout",
    icon: "send",
    title: "Collateral released",
    desc: "₦45,000 was released back to Femi Adeyemi after a clean return.",
    when: new Date(Date.now() - 28 * 3600000),
    read: true,
    ref: "RV-2026-04358"
  }, {
    id: "n5",
    cat: "agreement",
    icon: "file-text",
    title: "Agreement signed",
    desc: "Chidi Okeke signed the agreement and paid the ₦90,000 collateral for the Yamaha keyboard.",
    when: new Date(Date.now() - 50 * 3600000),
    read: true,
    agreementId: "AG-3033"
  }, {
    id: "n6",
    cat: "agreement",
    icon: "user-check",
    title: "Borrower verified",
    desc: "Ada Eze completed identity verification with BVN.",
    when: new Date(Date.now() - 72 * 3600000),
    read: true,
    agreementId: "AG-3038"
  }, {
    id: "n7",
    cat: "penalty",
    icon: "banknote",
    title: "Penalty charged",
    desc: "₦5,000 late fee was applied on the DJI Mavic drone rental.",
    when: new Date(Date.now() - 96 * 3600000),
    read: true,
    agreementId: "AG-3029",
    ref: "RV-2026-04280"
  }, {
    id: "n8",
    cat: "return",
    icon: "check-circle",
    title: "Item returned",
    desc: "DeWalt drill set returned by Ada Eze in good condition.",
    when: new Date(Date.now() - 120 * 3600000),
    read: true,
    agreementId: "AG-3038"
  }, {
    id: "n9",
    cat: "payout",
    icon: "send",
    title: "Payout sent",
    desc: "₦18,000 in earnings was withdrawn to GTBank •••• 8821.",
    when: new Date(Date.now() - 140 * 3600000),
    read: true,
    ref: "RV-2026-04190"
  }],
  items: [{
    id: "IT-1042",
    name: "Canon EOS R6",
    serial: "062041000537",
    category: "Camera & Photo",
    icon: "camera",
    rate: 5000,
    collateral: 210000,
    marketValue: 150000,
    mult: 140,
    maxDuration: "7 days",
    penalty: 10000,
    status: "on_rent",
    photos: 3,
    rentals: 8,
    lastRented: "2026-06-14",
    earned: 72000
  }, {
    id: "IT-1039",
    name: "Sony A7 III",
    serial: "37281902",
    category: "Camera & Photo",
    icon: "camera",
    rate: 4500,
    collateral: 180000,
    marketValue: 130000,
    mult: 140,
    maxDuration: "10 days",
    penalty: 8000,
    status: "available",
    photos: 2,
    rentals: 5,
    lastRented: "2026-06-02",
    earned: 40000
  }, {
    id: "IT-1031",
    name: "Shure SM7B mic kit",
    serial: "SM7B-44120",
    category: "Audio Equipment",
    icon: "music-2",
    rate: 3000,
    collateral: 90000,
    marketValue: 65000,
    mult: 140,
    maxDuration: "14 days",
    penalty: 5000,
    status: "available",
    photos: 2,
    rentals: 3,
    lastRented: "2026-05-20",
    earned: 18000
  }, {
    id: "IT-1024",
    name: "DJI Mavic 3 drone",
    serial: "DJI3M-90021",
    category: "Electronics",
    icon: "monitor",
    rate: 8000,
    collateral: 320000,
    marketValue: 230000,
    mult: 140,
    maxDuration: "5 days",
    penalty: 15000,
    status: "on_rent",
    photos: 4,
    rentals: 6,
    lastRented: "2026-06-10",
    earned: 96000
  }, {
    id: "IT-1018",
    name: "Yamaha keyboard",
    serial: "YK-771204",
    category: "Audio Equipment",
    icon: "music-2",
    rate: 2500,
    collateral: 60000,
    marketValue: 43000,
    mult: 140,
    maxDuration: "30 days",
    penalty: 4000,
    status: "available",
    photos: 2,
    rentals: 4,
    lastRented: "2026-06-01",
    earned: 20000
  }, {
    id: "IT-1009",
    name: "Bosch projector",
    serial: "BP-552013",
    category: "Electronics",
    icon: "monitor",
    rate: 3500,
    collateral: 45000,
    marketValue: 32000,
    mult: 140,
    maxDuration: "7 days",
    penalty: 5000,
    status: "unavailable",
    photos: 1,
    rentals: 2,
    lastRented: "2026-05-28",
    earned: 7000
  }],
  requests: [{
    id: "REQ-2041",
    borrower: "Tunde Bakare",
    initials: "TB",
    trust: 92,
    verified: true,
    when: new Date(Date.now() - 40 * 60000),
    start: "20 Jun 2026",
    returnDate: "27 Jun 2026",
    note: "Need these for a wedding shoot this weekend. Can pick up Friday evening.",
    lines: [{
      id: "IT-1042",
      name: "Canon EOS R6",
      icon: "camera",
      rate: 5000,
      collateral: 210000,
      qty: 1
    }, {
      id: "IT-1031",
      name: "Shure SM7B mic kit",
      icon: "music-2",
      rate: 3000,
      collateral: 90000,
      qty: 1
    }]
  }, {
    id: "REQ-2038",
    borrower: "Ada Eze",
    initials: "AE",
    trust: 88,
    verified: true,
    when: new Date(Date.now() - 5 * 3600000),
    start: "22 Jun 2026",
    returnDate: "24 Jun 2026",
    note: "Two-day product photography job.",
    lines: [{
      id: "IT-1039",
      name: "Sony A7 III",
      icon: "camera",
      rate: 4500,
      collateral: 180000,
      qty: 2
    }]
  }, {
    id: "REQ-2032",
    borrower: "Chidi Okeke",
    initials: "CO",
    trust: 71,
    verified: false,
    when: new Date(Date.now() - 28 * 3600000),
    start: "25 Jun 2026",
    returnDate: "30 Jun 2026",
    note: "",
    lines: [{
      id: "IT-1018",
      name: "Yamaha keyboard",
      icon: "music-2",
      rate: 2500,
      collateral: 60000,
      qty: 1
    }]
  }],
  statusMap: {
    active: {
      variant: "success",
      label: "Active"
    },
    overdue: {
      variant: "warning",
      label: "Overdue"
    },
    pending: {
      variant: "brand",
      label: "Pending"
    },
    returned: {
      variant: "neutral",
      label: "Returned"
    },
    penalty: {
      variant: "danger",
      label: "Penalty"
    }
  }
};
const NOTE_STYLE = {
  alert: {
    color: "var(--warning-600)",
    bg: "var(--warning-50)"
  },
  penalty: {
    color: "var(--brand-600)",
    bg: "var(--brand-50)"
  },
  return: {
    color: "var(--success-600)",
    bg: "var(--success-50)"
  },
  payout: {
    color: "var(--success-600)",
    bg: "var(--success-50)"
  },
  agreement: {
    color: "var(--brand-600)",
    bg: "var(--brand-50)"
  }
};
Object.assign(window, {
  Icon,
  RV,
  NOTE_STYLE,
  toPascal,
  FlowTopbar,
  Toast,
  copyText,
  Modal,
  Drawer,
  Pagination,
  FilterChips,
  SearchInput,
  DateText,
  fmtDate,
  fmtDateLong,
  fmtTime,
  relTime,
  naira,
  rvRef
});

// Shared full-screen topbar: back arrow + centered title + optional right slot.
function FlowTopbar({
  title,
  onBack,
  right = null
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      height: 64,
      flex: "none",
      background: "#fff",
      borderBottom: "1px solid var(--neutral-200)",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      position: "sticky",
      top: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    "aria-label": "Back",
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "inline-flex",
      padding: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 20,
    color: "var(--neutral-700)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      marginLeft: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 20,
    color: "var(--brand-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: "-0.2px",
      color: "var(--neutral-900)"
    }
  }, "RentVault")), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--neutral-900)",
      maxWidth: "46%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      display: "inline-flex",
      alignItems: "center"
    }
  }, right));
}

// Lightweight toast — fixed bottom-center, auto-dismisses. Render conditionally.
function Toast({
  message,
  icon = "check",
  onDone,
  duration = 1900
}) {
  useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), duration);
    return () => clearTimeout(t);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      left: "50%",
      bottom: 32,
      transform: "translateX(-50%)",
      zIndex: 200,
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "var(--neutral-900)",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: 9999,
      boxShadow: "var(--shadow-3)",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      animation: "rvToastIn 200ms ease-out"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 16,
    color: "#fff"
  }), message, /*#__PURE__*/React.createElement("style", null, `@keyframes rvToastIn { from { transform: translate(-50%, 8px); } to { transform: translate(-50%, 0); } }`));
}

// Copy helper with execCommand fallback (clipboard API is permission-gated in iframes).
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
}

// ── Date/time + currency formatters (Nigerian conventions) ───────────────────
const RV_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const RV_MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const RV_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function rvAsDate(d) {
  return d instanceof Date ? d : new Date(d);
}
function fmtDate(d) {
  const x = rvAsDate(d);
  return `${x.getDate()} ${RV_MONTHS[x.getMonth()]} ${x.getFullYear()}`;
}
function fmtDateLong(d) {
  const x = rvAsDate(d);
  return `${RV_DAYS[x.getDay()]}, ${x.getDate()} ${RV_MONTHS_FULL[x.getMonth()]} ${x.getFullYear()}`;
}
function fmtTime(d) {
  const x = rvAsDate(d);
  let h = x.getHours();
  const m = String(x.getMinutes()).padStart(2, "0");
  const ap = h < 12 ? "AM" : "PM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}
function relTime(d) {
  const s = Math.floor((Date.now() - rvAsDate(d).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const dd = Math.floor(h / 24);
  if (dd === 1) return "Yesterday";
  if (dd < 7) return `${dd} days ago`;
  return fmtDate(d);
}
function naira(n) {
  return "\u20a6" + Number(n || 0).toLocaleString("en-NG");
}
// RentVault escrow reference ID — replaces tx hashes everywhere. Format RV-2026-NNNNN.
function rvRef(n) {
  return "RV-2026-" + String(n != null ? n : Math.floor(10000 + Math.random() * 89999)).padStart(5, "0");
}

// Semantic <time> element with a full date+time tooltip. format: date | long | time | rel
function DateText({
  value,
  format = "date",
  style = {}
}) {
  const map = {
    date: fmtDate,
    long: fmtDateLong,
    time: fmtTime,
    rel: relTime
  };
  const fn = map[format] || fmtDate;
  const x = rvAsDate(value);
  const iso = isNaN(x.getTime()) ? undefined : x.toISOString();
  const tip = isNaN(x.getTime()) ? undefined : fmtDateLong(x) + " \u00b7 " + fmtTime(x);
  return React.createElement("time", {
    dateTime: iso,
    title: tip,
    style: {
      fontVariantNumeric: "tabular-nums",
      ...style
    }
  }, fn(value));
}

// ── Modal (centered) ─────────────────────────────────────────────────────────
function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  width = 480
}) {
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") onClose && onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      background: "hsla(232,8%,12%,0.40)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "100%",
      maxWidth: width,
      maxHeight: "calc(100vh - 48px)",
      display: "flex",
      flexDirection: "column",
      background: "#fff",
      borderRadius: 16,
      boxShadow: "var(--shadow-3)",
      boxSizing: "border-box",
      animation: "rvModalIn 180ms ease-out"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 16,
      padding: "20px 24px",
      borderBottom: "1px solid var(--neutral-200)",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: "-0.2px",
      color: "var(--neutral-900)"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "2px 0 0",
      fontSize: 12,
      color: "var(--neutral-500)"
    }
  }, subtitle)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      flex: "none",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 4,
      display: "inline-flex",
      borderRadius: 6
    },
    onMouseEnter: e => e.currentTarget.style.background = "var(--neutral-100)",
    onMouseLeave: e => e.currentTarget.style.background = "transparent"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 20,
    color: "var(--neutral-500)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      overflowY: "auto"
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 24px",
      borderTop: "1px solid var(--neutral-200)",
      flex: "none"
    }
  }, footer), /*#__PURE__*/React.createElement("style", null, `@keyframes rvModalIn { from { transform: translateY(8px); } to { transform: translateY(0); } }`)));
}

// ── Drawer (right-side) ──────────────────────────────────────────────────────
function Drawer({
  title,
  onClose,
  children,
  footer,
  width = 480
}) {
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") onClose && onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      background: "hsla(232,8%,12%,0.40)",
      display: "flex",
      justifyContent: "flex-end",
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "100%",
      maxWidth: width,
      height: "100%",
      background: "#fff",
      boxShadow: "-8px 0 24px hsla(232,30%,15%,0.10)",
      display: "flex",
      flexDirection: "column",
      animation: "rvDrawerIn 220ms cubic-bezier(0.16,1,0.3,1)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 64,
      flex: "none",
      borderBottom: "1px solid var(--neutral-200)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      color: "var(--neutral-900)"
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 4,
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 20,
    color: "var(--neutral-500)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: 24
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none",
      borderTop: "1px solid var(--neutral-200)",
      padding: 16
    }
  }, footer), /*#__PURE__*/React.createElement("style", null, `@keyframes rvDrawerIn { from { transform: translateX(24px); } to { transform: translateX(0); } }`)));
}

// ── Pagination ───────────────────────────────────────────────────────────────
function Pagination({
  page,
  pageSize,
  total,
  onPage
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const btn = disabled => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 32,
    padding: "0 12px",
    borderRadius: 6,
    border: "1px solid var(--neutral-200)",
    background: "#fff",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: disabled ? "var(--neutral-300)" : "var(--neutral-700)"
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--neutral-500)",
      fontVariantNumeric: "tabular-nums"
    }
  }, "Showing ", start, "\\u2013", end, " of ", total), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("button", {
    disabled: page <= 1,
    onClick: () => page > 1 && onPage(page - 1),
    style: btn(page <= 1)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 16,
    color: page <= 1 ? "var(--neutral-300)" : "var(--neutral-700)"
  }), "Prev"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      padding: "0 8px",
      fontSize: 13,
      color: "var(--neutral-700)",
      fontVariantNumeric: "tabular-nums"
    }
  }, page, " / ", pages), /*#__PURE__*/React.createElement("button", {
    disabled: page >= pages,
    onClick: () => page < pages && onPage(page + 1),
    style: btn(page >= pages)
  }, "Next", /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 16,
    color: page >= pages ? "var(--neutral-300)" : "var(--neutral-700)"
  }))));
}

// ── Filter chips (single-select pills) ───────────────────────────────────────
function FilterChips({
  options,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, options.map(o => {
    const on = o.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      onClick: () => onChange(o.id),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 32,
        padding: "0 14px",
        borderRadius: 9999,
        border: "1px solid " + (on ? "var(--brand-600)" : "var(--neutral-200)"),
        background: on ? "var(--brand-50)" : "#fff",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: on ? 600 : 400,
        color: on ? "var(--brand-700)" : "var(--neutral-700)"
      }
    }, o.label, o.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: on ? "var(--brand-600)" : "var(--neutral-400)",
        fontVariantNumeric: "tabular-nums"
      }
    }, o.count));
  }));
}

// ── Search input (leading icon) ──────────────────────────────────────────────
function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 14,
      display: "inline-flex",
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16,
    color: "var(--neutral-400)"
  })), /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: e => onChange(e.target.value),
    placeholder: placeholder,
    style: {
      width: "100%",
      height: 40,
      padding: "0 16px 0 40px",
      boxSizing: "border-box",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--neutral-900)",
      background: "var(--neutral-100)",
      border: "1px solid var(--neutral-300)",
      borderRadius: 6,
      outline: "none"
    }
  }));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/kit-common.jsx", error: String((e && e.message) || e) }); }

__ds_ns.AlertBanner = __ds_scope.AlertBanner;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.ListRow = __ds_scope.ListRow;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
