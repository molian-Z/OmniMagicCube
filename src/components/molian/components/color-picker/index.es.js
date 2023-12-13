var ze = Object.defineProperty;
var Ge = (e, t, o) => t in e ? ze(e, t, { enumerable: !0, configurable: !0, writable: !0, value: o }) : e[t] = o;
var L = (e, t, o) => (Ge(e, typeof t != "symbol" ? t + "" : t, o), o);
import { defineComponent as O, ref as A, reactive as q, watch as Q, computed as K, openBlock as b, createElementBlock as $, normalizeClass as W, createElementVNode as c, normalizeStyle as E, pushScopeId as ee, popScopeId as te, Fragment as j, renderList as ne, getCurrentInstance as Xe, nextTick as qe, createCommentVNode as B, toDisplayString as re, resolveComponent as I, createBlock as M, createVNode as U, onMounted as Fe, inject as Re, withDirectives as Ae, vShow as Pe, createTextVNode as Ye, renderSlot as Ue, provide as je, withCtx as me, resolveDynamicComponent as Se, mergeProps as ke, Teleport as Ze } from "vue";
import { tryOnMounted as oe, whenever as N, useDebounceFn as Z, useLocalStorage as ue, onClickOutside as Je } from "@vueuse/core";
import H from "tinycolor2";
import { stringify as Qe, parse as xe } from "gradient-parser";
import { createPopper as et } from "@popperjs/core";
import C from "vue-types";
import { DOMUtils as x } from "@aesoper/normal-utils";
import { merge as le } from "lodash-es";
const V = (e) => Math.round(e * 100) / 100;
class R {
  constructor(t) {
    L(this, "instance");
    L(this, "alphaValue", 0);
    // RGB
    L(this, "redValue", 0);
    L(this, "greenValue", 0);
    L(this, "blueValue", 0);
    // HSV
    L(this, "hueValue", 0);
    L(this, "saturationValue", 0);
    L(this, "brightnessValue", 0);
    // HSL
    L(this, "hslSaturationValue", 0);
    L(this, "lightnessValue", 0);
    L(this, "initAlpha", () => {
      const t = this.instance.getAlpha();
      this.alphaValue = Math.min(1, t) * 100;
    });
    L(this, "initLightness", () => {
      const { s: t, l: o } = this.instance.toHsl();
      this.hslSaturationValue = V(t), this.lightnessValue = V(o);
    });
    L(this, "initRgb", () => {
      const { r: t, g: o, b: n } = this.instance.toRgb();
      this.redValue = V(t), this.greenValue = V(o), this.blueValue = V(n);
    });
    L(this, "initHsb", () => {
      const { h: t, s: o, v: n } = this.instance.toHsv();
      this.hueValue = Math.min(360, Math.ceil(t)), this.saturationValue = V(o), this.brightnessValue = V(n);
    });
    L(this, "toHexString", () => this.instance.toHexString());
    L(this, "toRgbString", () => this.instance.toRgbString());
    this.instance = H(t), this.initRgb(), this.initHsb(), this.initLightness(), this.initAlpha();
  }
  toString(t) {
    return this.instance.toString(t);
  }
  get hex() {
    return this.instance.toHex();
  }
  set hex(t) {
    this.instance = H(t), this.initHsb(), this.initRgb(), this.initAlpha(), this.initLightness();
  }
  // 色调
  set hue(t) {
    this.saturation === 0 && this.brightness === 0 && (this.saturationValue = 1, this.brightnessValue = 1), this.instance = H({
      h: V(t),
      s: this.saturation,
      v: this.brightness,
      a: this.alphaValue / 100
    }), this.initRgb(), this.initLightness(), this.hueValue = V(t);
  }
  get hue() {
    return this.hueValue;
  }
  // 饱和度
  set saturation(t) {
    this.instance = H({
      h: this.hue,
      s: V(t),
      v: this.brightness,
      a: this.alphaValue / 100
    }), this.initRgb(), this.initLightness(), this.saturationValue = V(t);
  }
  get saturation() {
    return this.saturationValue;
  }
  // 明度
  set brightness(t) {
    this.instance = H({
      h: this.hue,
      s: this.saturation,
      v: V(t),
      a: this.alphaValue / 100
    }), this.initRgb(), this.initLightness(), this.brightnessValue = V(t);
  }
  get brightness() {
    return this.brightnessValue;
  }
  // 亮度
  set lightness(t) {
    this.instance = H({
      h: this.hue,
      s: this.hslSaturationValue,
      l: V(t),
      a: this.alphaValue / 100
    }), this.initRgb(), this.initHsb(), this.lightnessValue = V(t);
  }
  get lightness() {
    return this.lightnessValue;
  }
  // red
  set red(t) {
    const o = this.instance.toRgb();
    this.instance = H({
      ...o,
      r: V(t),
      a: this.alphaValue / 100
    }), this.initHsb(), this.initLightness(), this.redValue = V(t);
  }
  get red() {
    return this.redValue;
  }
  // green
  set green(t) {
    const o = this.instance.toRgb();
    this.instance = H({
      ...o,
      g: V(t),
      a: this.alphaValue / 100
    }), this.initHsb(), this.initLightness(), this.greenValue = V(t);
  }
  get green() {
    return this.greenValue;
  }
  // blue
  set blue(t) {
    const o = this.instance.toRgb();
    this.instance = H({
      ...o,
      b: V(t),
      a: this.alphaValue / 100
    }), this.initHsb(), this.initLightness(), this.blueValue = V(t);
  }
  get blue() {
    return this.blueValue;
  }
  // alpha
  set alpha(t) {
    this.instance.setAlpha(t / 100), this.alphaValue = t;
  }
  get alpha() {
    return this.alphaValue;
  }
  get RGB() {
    return [this.red, this.green, this.blue, this.alpha / 100];
  }
  get HSB() {
    return [this.hue, this.saturation, this.brightness, this.alpha / 100];
  }
  get HSL() {
    return [this.hue, this.hslSaturationValue, this.lightness, this.alpha / 100];
  }
}
function $e(e, t, o, n) {
  return `rgba(${[e, t, o, n / 100].join(",")})`;
}
const ie = (e, t, o) => t < o ? e < t ? t : e > o ? o : e : e < o ? o : e > t ? t : e, de = "color-history", ge = 8;
const X = (e, t) => {
  const o = e.__vccOpts || e;
  for (const [n, s] of t)
    o[n] = s;
  return o;
}, tt = O({
  name: "Alpha",
  props: {
    color: C.instanceOf(R),
    size: C.oneOf(["small", "default"]).def("default")
  },
  emits: ["change"],
  setup(e, { emit: t }) {
    const o = A(null), n = A(null);
    let s = e.color || new R();
    const r = q({
      red: s.red,
      green: s.green,
      blue: s.blue,
      alpha: s.alpha
    });
    Q(
      () => e.color,
      (i) => {
        i && (s = i, le(r, {
          red: i.red,
          green: i.green,
          blue: i.blue,
          alpha: i.alpha
        }));
      },
      { deep: !0 }
    );
    const a = K(() => {
      const i = $e(r.red, r.green, r.blue, 0), g = $e(r.red, r.green, r.blue, 100);
      return {
        background: `linear-gradient(to right, ${i} , ${g})`
      };
    }), l = () => {
      if (o.value && n.value) {
        const i = r.alpha / 100, g = o.value.getBoundingClientRect(), f = n.value.offsetWidth;
        return Math.round(i * (g.width - f) + f / 2);
      }
      return 0;
    }, u = K(() => ({
      left: l() + "px",
      top: 0
    })), S = (i) => {
      i.target !== o.value && h(i);
    }, h = (i) => {
      if (i.stopPropagation(), o.value && n.value) {
        const g = o.value.getBoundingClientRect(), f = n.value.offsetWidth;
        let v = i.clientX - g.left;
        v = Math.max(f / 2, v), v = Math.min(v, g.width - f / 2);
        const p = Math.round((v - f / 2) / (g.width - f) * 100);
        s.alpha = p, r.alpha = p, t("change", p);
      }
    };
    return oe(() => {
      const i = {
        drag: (g) => {
          h(g);
        },
        end: (g) => {
          h(g);
        }
      };
      o.value && n.value && x.triggerDragEvent(o.value, i);
    }), { barElement: o, cursorElement: n, getCursorStyle: u, getBackgroundStyle: a, onClickSider: S };
  }
}), ot = (e) => (ee("data-v-18925ba6"), e = e(), te(), e), nt = /* @__PURE__ */ ot(() => /* @__PURE__ */ c("div", { class: "vc-alpha-slider__bar-handle" }, null, -1)), at = [
  nt
];
function rt(e, t, o, n, s, r) {
  return b(), $("div", {
    class: W(["vc-alpha-slider", "transparent", { "small-slider": e.size === "small" }])
  }, [
    c("div", {
      ref: "barElement",
      class: "vc-alpha-slider__bar",
      style: E(e.getBackgroundStyle),
      onClick: t[0] || (t[0] = (...a) => e.onClickSider && e.onClickSider(...a))
    }, [
      c("div", {
        class: W(["vc-alpha-slider__bar-pointer", { "small-bar": e.size === "small" }]),
        ref: "cursorElement",
        style: E(e.getCursorStyle)
      }, at, 6)
    ], 4)
  ], 2);
}
const he = /* @__PURE__ */ X(tt, [["render", rt], ["__scopeId", "data-v-18925ba6"]]);
const lt = [
  // 第一行
  [
    "#fcc02e",
    "#f67c01",
    "#e64a19",
    "#d81b43",
    "#8e24aa",
    "#512da7",
    "#1f87e8",
    "#008781",
    "#05a045"
  ],
  // 第二行
  [
    "#fed835",
    "#fb8c00",
    "#f5511e",
    "#eb1d4e",
    "#9c28b1",
    "#5d35b0",
    "#2097f3",
    "#029688",
    "#4cb050"
  ],
  // 第三行
  [
    "#ffeb3c",
    "#ffa727",
    "#fe5722",
    "#eb4165",
    "#aa47bc",
    "#673bb7",
    "#42a5f6",
    "#26a59a",
    "#83c683"
  ],
  // 第四行
  [
    "#fff176",
    "#ffb74e",
    "#ff8a66",
    "#f1627e",
    "#b968c7",
    "#7986cc",
    "#64b5f6",
    "#80cbc4",
    "#a5d6a7"
  ],
  // 第五行
  [
    "#fff59c",
    "#ffcc80",
    "#ffab91",
    "#fb879e",
    "#cf93d9",
    "#9ea8db",
    "#90caf8",
    "#b2dfdc",
    "#c8e6ca"
  ],
  // 最后一行
  [
    "transparent",
    "#ffffff",
    "#dedede",
    "#a9a9a9",
    "#4b4b4b",
    "#353535",
    "#212121",
    "#000000",
    "advance"
  ]
], st = O({
  name: "Palette",
  emits: ["change"],
  setup(e, { emit: t }) {
    return { palettes: lt, computedBgStyle: (s) => s === "transparent" ? s : s === "advance" ? {} : { background: H(s).toRgbString() }, onColorChange: (s) => {
      t("change", s);
    } };
  }
}), it = { class: "vc-compact" }, ct = ["onClick"];
function ut(e, t, o, n, s, r) {
  return b(), $("div", it, [
    (b(!0), $(j, null, ne(e.palettes, (a, l) => (b(), $("div", {
      key: l,
      class: "vc-compact__row"
    }, [
      (b(!0), $(j, null, ne(a, (u, S) => (b(), $("div", {
        key: S,
        class: "vc-compact__color-cube--wrap",
        onClick: (h) => e.onColorChange(u)
      }, [
        c("div", {
          class: W([
            "vc-compact__color_cube",
            {
              advance: u === "advance",
              transparent: u === "transparent"
            }
          ]),
          style: E(e.computedBgStyle(u))
        }, null, 6)
      ], 8, ct))), 128))
    ]))), 128))
  ]);
}
const Ve = /* @__PURE__ */ X(st, [["render", ut], ["__scopeId", "data-v-b969fd48"]]);
const dt = O({
  name: "Board",
  props: {
    color: C.instanceOf(R),
    round: C.bool.def(!1),
    hide: C.bool.def(!0)
  },
  emits: ["change"],
  setup(e, { emit: t }) {
    var v, p, m;
    const o = Xe(), n = {
      h: ((v = e.color) == null ? void 0 : v.hue) || 0,
      s: 1,
      v: 1
    }, s = new R(n).toHexString(), r = q({
      hueColor: s,
      saturation: ((p = e.color) == null ? void 0 : p.saturation) || 0,
      brightness: ((m = e.color) == null ? void 0 : m.brightness) || 0
    }), a = A(0), l = A(0), u = A(), S = A(), h = K(() => ({
      top: a.value + "px",
      left: l.value + "px"
    })), i = () => {
      if (o) {
        const y = o.vnode.el;
        l.value = r.saturation * (y == null ? void 0 : y.clientWidth), a.value = (1 - r.brightness) * (y == null ? void 0 : y.clientHeight);
      }
    }, g = (y) => {
      y.target !== S.value && f(y);
    }, f = (y) => {
      if (o) {
        const z = o.vnode.el, D = z == null ? void 0 : z.getBoundingClientRect();
        let F = y.clientX - D.left, Y = y.clientY - D.top;
        F = ie(F, 0, D.width), Y = ie(Y, 0, D.height);
        const G = F / D.width, J = ie(-(Y / D.height) + 1, 0, 1);
        l.value = F, a.value = Y, r.saturation = G, r.brightness = J, t("change", G, J);
      }
    };
    return oe(() => {
      o && o.vnode.el && u.value && (x.triggerDragEvent(u.value, {
        drag: (y) => {
          f(y);
        },
        end: (y) => {
          f(y);
        }
      }), qe(() => {
        i();
      }));
    }), N(
      () => e.color,
      (y) => {
        le(r, {
          hueColor: new R({ h: y.hue, s: 1, v: 1 }).toHexString(),
          saturation: y.saturation,
          brightness: y.brightness
        }), i();
      },
      { deep: !0 }
    ), { state: r, cursorElement: u, getCursorStyle: h, onClickBoard: g };
  }
}), pe = (e) => (ee("data-v-058e5db2"), e = e(), te(), e), gt = /* @__PURE__ */ pe(() => /* @__PURE__ */ c("div", { class: "vc-saturation__white" }, null, -1)), ht = /* @__PURE__ */ pe(() => /* @__PURE__ */ c("div", { class: "vc-saturation__black" }, null, -1)), pt = /* @__PURE__ */ pe(() => /* @__PURE__ */ c("div", null, null, -1)), ft = [
  pt
];
function vt(e, t, o, n, s, r) {
  return b(), $("div", {
    ref: "boardElement",
    class: W(["vc-saturation", { "vc-saturation__chrome": e.round, "vc-saturation__hidden": e.hide }]),
    style: E({ backgroundColor: e.state.hueColor }),
    onClick: t[0] || (t[0] = (...a) => e.onClickBoard && e.onClickBoard(...a))
  }, [
    gt,
    ht,
    c("div", {
      class: "vc-saturation__cursor",
      ref: "cursorElement",
      style: E(e.getCursorStyle)
    }, ft, 4)
  ], 6);
}
const fe = /* @__PURE__ */ X(dt, [["render", vt], ["__scopeId", "data-v-058e5db2"]]);
const Ct = O({
  name: "Hue",
  props: {
    color: C.instanceOf(R),
    size: C.oneOf(["small", "default"]).def("default")
  },
  emits: ["change"],
  setup(e, { emit: t }) {
    const o = A(null), n = A(null);
    let s = e.color || new R();
    const r = q({
      hue: s.hue || 0
    });
    Q(
      () => e.color,
      (h) => {
        h && (s = h, le(r, { hue: s.hue }));
      },
      { deep: !0 }
    );
    const a = () => {
      if (o.value && n.value) {
        const h = o.value.getBoundingClientRect(), i = n.value.offsetWidth;
        return r.hue === 360 ? h.width - i / 2 : r.hue % 360 * (h.width - i) / 360 + i / 2;
      }
      return 0;
    }, l = K(() => ({
      left: a() + "px",
      top: 0
    })), u = (h) => {
      h.target !== o.value && S(h);
    }, S = (h) => {
      if (h.stopPropagation(), o.value && n.value) {
        const i = o.value.getBoundingClientRect(), g = n.value.offsetWidth;
        let f = h.clientX - i.left;
        f = Math.min(f, i.width - g / 2), f = Math.max(g / 2, f);
        const v = Math.round((f - g / 2) / (i.width - g) * 360);
        s.hue = v, r.hue = v, t("change", v);
      }
    };
    return oe(() => {
      const h = {
        drag: (i) => {
          S(i);
        },
        end: (i) => {
          S(i);
        }
      };
      o.value && n.value && x.triggerDragEvent(o.value, h);
    }), { barElement: o, cursorElement: n, getCursorStyle: l, onClickSider: u };
  }
}), bt = (e) => (ee("data-v-e1a08576"), e = e(), te(), e), yt = /* @__PURE__ */ bt(() => /* @__PURE__ */ c("div", { class: "vc-hue-slider__bar-handle" }, null, -1)), _t = [
  yt
];
function mt(e, t, o, n, s, r) {
  return b(), $("div", {
    class: W(["vc-hue-slider", { "small-slider": e.size === "small" }])
  }, [
    c("div", {
      ref: "barElement",
      class: "vc-hue-slider__bar",
      onClick: t[0] || (t[0] = (...a) => e.onClickSider && e.onClickSider(...a))
    }, [
      c("div", {
        class: W(["vc-hue-slider__bar-pointer", { "small-bar": e.size === "small" }]),
        ref: "cursorElement",
        style: E(e.getCursorStyle)
      }, _t, 6)
    ], 512)
  ], 2);
}
const ve = /* @__PURE__ */ X(Ct, [["render", mt], ["__scopeId", "data-v-e1a08576"]]);
const St = O({
  name: "Lightness",
  props: {
    color: C.instanceOf(R),
    size: C.oneOf(["small", "default"]).def("default")
  },
  emits: ["change"],
  setup(e, { emit: t }) {
    const o = A(null), n = A(null);
    let s = e.color || new R();
    const [r, a, l] = s.HSL, u = q({
      hue: r,
      saturation: a,
      lightness: l
    });
    Q(
      () => e.color,
      (v) => {
        if (v) {
          s = v;
          const [p, m, y] = s.HSL;
          le(u, {
            hue: p,
            saturation: m,
            lightness: y
          });
        }
      },
      { deep: !0 }
    );
    const S = K(() => {
      const v = H({
        h: u.hue,
        s: u.saturation,
        l: 0.8
      }).toPercentageRgbString(), p = H({
        h: u.hue,
        s: u.saturation,
        l: 0.6
      }).toPercentageRgbString(), m = H({
        h: u.hue,
        s: u.saturation,
        l: 0.4
      }).toPercentageRgbString(), y = H({
        h: u.hue,
        s: u.saturation,
        l: 0.2
      }).toPercentageRgbString();
      return {
        background: [
          `linear-gradient(to right, rgb(255, 255, 255), ${v}, ${p}, ${m}, ${y}, rgb(0, 0, 0))`,
          `-webkit-linear-gradient(left, rgb(255, 255, 255), ${v}, ${p}, ${m}, ${y}, rgb(0, 0, 0))`,
          `-moz-linear-gradient(left, rgb(255, 255, 255), ${v}, ${p}, ${m}, ${y}, rgb(0, 0, 0))`,
          `-ms-linear-gradient(left, rgb(255, 255, 255), ${v}, ${p}, ${m}, ${y}, rgb(0, 0, 0))`
        ]
      };
    }), h = () => {
      if (o.value && n.value) {
        const v = u.lightness, p = o.value.getBoundingClientRect(), m = n.value.offsetWidth;
        return (1 - v) * (p.width - m) + m / 2;
      }
      return 0;
    }, i = K(() => ({
      left: h() + "px",
      top: 0
    })), g = (v) => {
      v.target !== o.value && f(v);
    }, f = (v) => {
      if (v.stopPropagation(), o.value && n.value) {
        const p = o.value.getBoundingClientRect(), m = n.value.offsetWidth;
        let y = v.clientX - p.left;
        y = Math.max(m / 2, y), y = Math.min(y, p.width - m / 2);
        const z = 1 - (y - m / 2) / (p.width - m);
        s.lightness = z, t("change", z);
      }
    };
    return oe(() => {
      const v = {
        drag: (p) => {
          f(p);
        },
        end: (p) => {
          f(p);
        }
      };
      o.value && n.value && x.triggerDragEvent(o.value, v);
    }), { barElement: o, cursorElement: n, getCursorStyle: i, getBackgroundStyle: S, onClickSider: g };
  }
}), kt = (e) => (ee("data-v-94a50a9e"), e = e(), te(), e), $t = /* @__PURE__ */ kt(() => /* @__PURE__ */ c("div", { class: "vc-lightness-slider__bar-handle" }, null, -1)), wt = [
  $t
];
function Ht(e, t, o, n, s, r) {
  return b(), $("div", {
    class: W(["vc-lightness-slider", { "small-slider": e.size === "small" }])
  }, [
    c("div", {
      ref: "barElement",
      class: "vc-lightness-slider__bar",
      style: E(e.getBackgroundStyle),
      onClick: t[0] || (t[0] = (...a) => e.onClickSider && e.onClickSider(...a))
    }, [
      c("div", {
        class: W(["vc-lightness-slider__bar-pointer", { "small-bar": e.size === "small" }]),
        ref: "cursorElement",
        style: E(e.getCursorStyle)
      }, wt, 6)
    ], 4)
  ], 2);
}
const Ie = /* @__PURE__ */ X(St, [["render", Ht], ["__scopeId", "data-v-94a50a9e"]]);
const Bt = O({
  name: "History",
  props: {
    colors: C.arrayOf(String).def(() => []),
    round: C.bool.def(!1)
  },
  emits: ["change"],
  setup(e, { emit: t }) {
    return { onColorSelect: (n) => {
      t("change", n);
    } };
  }
}), Rt = {
  key: 0,
  class: "vc-colorPicker__record"
}, At = { class: "color-list" }, Pt = ["onClick"];
function Vt(e, t, o, n, s, r) {
  return e.colors && e.colors.length > 0 ? (b(), $("div", Rt, [
    c("div", At, [
      (b(!0), $(j, null, ne(e.colors, (a, l) => (b(), $("div", {
        key: l,
        class: W(["color-item", "transparent", { "color-item__round": e.round }]),
        onClick: (u) => e.onColorSelect(a)
      }, [
        c("div", {
          class: "color-item__display",
          style: E({ backgroundColor: a })
        }, null, 4)
      ], 10, Pt))), 128))
    ])
  ])) : B("", !0);
}
const Ce = /* @__PURE__ */ X(Bt, [["render", Vt], ["__scopeId", "data-v-0f657238"]]);
const It = O({
  name: "Display",
  props: {
    color: C.instanceOf(R),
    disableAlpha: C.bool.def(!1)
  },
  emits: ["update:color", "change"],
  setup(e, { emit: t }) {
    var u, S, h, i;
    const o = A("hex"), n = q({
      color: e.color,
      hex: (u = e.color) == null ? void 0 : u.hex,
      alpha: ((S = e.color) == null ? void 0 : S.alpha) + "%",
      rgba: (h = e.color) == null ? void 0 : h.RGB,
      previewBgColor: (i = e.color) == null ? void 0 : i.toRgbString()
    }), s = K(() => ({
      background: n.previewBgColor
    })), r = () => {
      o.value = o.value === "rgba" ? "hex" : "rgba";
    }, a = Z((g) => {
      if (!g.target.value)
        return;
      let f = parseInt(g.target.value.replace("%", ""));
      f > 100 && (g.target.value = "100%", f = 100), f < 0 && (g.target.value = "0%", f = 0), isNaN(f) && (g.target.value = "100%", f = 100), !isNaN(f) && n.color && (n.color.alpha = f), t("update:color", n.color), t("change", n.color);
    }, 300), l = Z((g, f) => {
      if (console.log(g.target.value), !!g.target.value) {
        if (o.value === "hex") {
          const v = g.target.value.replace("#", "");
          H(v).isValid() && n.color && (n.color.hex = v);
        } else if (f !== void 0 && n.rgba && n.color) {
          g.target.value < 0 && (g.target.value = 0), f === 3 && g.target.value > 1 && (g.target.value = 1), f < 3 && g.target.value > 255 && (g.target.value = 255), n.rgba[f] = Number(g.target.value);
          const [v, p, m, y] = n.rgba;
          n.color.hex = H({ r: v, g: p, b: m }).toHex(), n.color.alpha = Math.floor(y * 100);
        }
        t("update:color", n.color), t("change", n.color);
      }
    }, 300);
    return N(
      () => e.color,
      (g) => {
        g && (n.color = g, n.alpha = Math.floor(n.color.alpha) + "%", n.hex = n.color.hex, n.rgba = n.color.RGB);
      },
      { deep: !0 }
    ), N(
      () => n.color,
      () => {
        n.color && (n.previewBgColor = n.color.toRgbString());
      },
      { deep: !0 }
    ), { state: n, getBgColorStyle: s, inputType: o, onInputTypeChange: r, onAlphaBlur: a, onInputChange: l };
  }
}), Mt = { class: "vc-display" }, Kt = { class: "vc-current-color vc-transparent" }, Lt = {
  key: 0,
  style: { display: "flex", flex: "1", gap: "4px", height: "100%" }
}, Et = { class: "vc-color-input" }, Nt = ["value"], Wt = {
  key: 0,
  class: "vc-alpha-input"
}, Dt = ["value"], Tt = {
  key: 1,
  style: { display: "flex", flex: "1", gap: "4px", height: "100%" }
}, Ot = ["value", "onInput"];
function zt(e, t, o, n, s, r) {
  return b(), $("div", Mt, [
    c("div", Kt, [
      c("div", {
        class: "color-cube",
        style: E(e.getBgColorStyle)
      }, null, 4)
    ]),
    e.inputType === "hex" ? (b(), $("div", Lt, [
      c("div", Et, [
        c("input", {
          value: e.state.hex,
          onInput: t[0] || (t[0] = (...a) => e.onInputChange && e.onInputChange(...a))
        }, null, 40, Nt)
      ]),
      e.disableAlpha ? B("", !0) : (b(), $("div", Wt, [
        c("input", {
          class: "vc-alpha-input__inner",
          value: e.state.alpha,
          onInput: t[1] || (t[1] = (...a) => e.onAlphaBlur && e.onAlphaBlur(...a))
        }, null, 40, Dt)
      ]))
    ])) : e.state.rgba ? (b(), $("div", Tt, [
      (b(!0), $(j, null, ne(e.state.rgba, (a, l) => (b(), $("div", {
        class: "vc-rgb-input",
        key: l
      }, [
        c("div", null, [
          c("input", {
            value: a,
            onInput: (u) => e.onInputChange(u, l)
          }, null, 40, Ot)
        ]),
        c("div", null, re(["R", "G", "B", "A"][l]), 1)
      ]))), 128))
    ])) : B("", !0),
    c("div", {
      class: "vc-input-toggle",
      onClick: t[2] || (t[2] = (...a) => e.onInputTypeChange && e.onInputTypeChange(...a))
    })
  ]);
}
const be = /* @__PURE__ */ X(It, [["render", zt], ["__scopeId", "data-v-f6f511ec"]]);
const Gt = O({
  name: "FkColorPicker",
  components: { Display: be, Alpha: he, Palette: Ve, Board: fe, Hue: ve, Lightness: Ie, History: Ce },
  props: {
    color: C.instanceOf(R),
    disableHistory: C.bool.def(!1),
    roundHistory: C.bool.def(!1),
    disableAlpha: C.bool.def(!1)
  },
  emits: ["update:color", "change", "advanceChange"],
  setup(e, { emit: t }) {
    const o = e.color || new R(), n = q({
      color: o,
      hex: o.toHexString(),
      rgb: o.toRgbString()
    }), s = A(!1), r = K(() => ({ background: n.rgb })), a = () => {
      s.value = !1, t("advanceChange", !1);
    }, l = ue(de, [], {}), u = Z(() => {
      if (e.disableHistory)
        return;
      const p = n.color.toRgbString();
      if (l.value = l.value.filter((m) => !H.equals(m, p)), !l.value.includes(p)) {
        for (; l.value.length > ge; )
          l.value.pop();
        l.value.unshift(p);
      }
    }, 500), S = (p) => {
      p === "advance" ? (s.value = !0, t("advanceChange", !0)) : (n.color.hex = p, t("advanceChange", !1));
    }, h = (p) => {
      n.color.alpha = p;
    }, i = (p) => {
      n.color.hue = p;
    }, g = (p, m) => {
      n.color.saturation = p, n.color.brightness = m;
    }, f = (p) => {
      n.color.lightness = p;
    }, v = (p) => {
      const y = p.target.value.replace("#", "");
      H(y).isValid() && (n.color.hex = y);
    };
    return N(
      () => e.color,
      (p) => {
        p && (n.color = p);
      },
      { deep: !0 }
    ), N(
      () => n.color,
      () => {
        n.hex = n.color.hex, n.rgb = n.color.toRgbString(), u(), t("update:color", n.color), t("change", n.color);
      },
      { deep: !0 }
    ), {
      state: n,
      advancePanelShow: s,
      onBack: a,
      onCompactChange: S,
      onAlphaChange: h,
      onHueChange: i,
      onBoardChange: g,
      onLightChange: f,
      onInputChange: v,
      previewStyle: r,
      historyColors: l
    };
  }
}), Xt = (e) => (ee("data-v-0d5bef46"), e = e(), te(), e), qt = { class: "vc-fk-colorPicker" }, Ft = { class: "vc-fk-colorPicker__inner" }, Yt = { class: "vc-fk-colorPicker__header" }, Ut = /* @__PURE__ */ Xt(() => /* @__PURE__ */ c("div", { class: "back" }, null, -1)), jt = [
  Ut
];
function Zt(e, t, o, n, s, r) {
  const a = I("Palette"), l = I("Board"), u = I("Hue"), S = I("Lightness"), h = I("Alpha"), i = I("Display"), g = I("History");
  return b(), $("div", qt, [
    c("div", Ft, [
      c("div", Yt, [
        e.advancePanelShow ? (b(), $("span", {
          key: 0,
          style: { cursor: "pointer" },
          onClick: t[0] || (t[0] = (...f) => e.onBack && e.onBack(...f))
        }, jt)) : B("", !0)
      ]),
      e.advancePanelShow ? B("", !0) : (b(), M(a, {
        key: 0,
        onChange: e.onCompactChange
      }, null, 8, ["onChange"])),
      e.advancePanelShow ? (b(), M(l, {
        key: 1,
        color: e.state.color,
        onChange: e.onBoardChange
      }, null, 8, ["color", "onChange"])) : B("", !0),
      e.advancePanelShow ? (b(), M(u, {
        key: 2,
        color: e.state.color,
        onChange: e.onHueChange
      }, null, 8, ["color", "onChange"])) : B("", !0),
      e.advancePanelShow ? B("", !0) : (b(), M(S, {
        key: 3,
        color: e.state.color,
        onChange: e.onLightChange
      }, null, 8, ["color", "onChange"])),
      e.disableAlpha ? B("", !0) : (b(), M(h, {
        key: 4,
        color: e.state.color,
        onChange: e.onAlphaChange
      }, null, 8, ["color", "onChange"])),
      U(i, {
        color: e.state.color,
        "disable-alpha": e.disableAlpha
      }, null, 8, ["color", "disable-alpha"]),
      e.disableHistory ? B("", !0) : (b(), M(g, {
        key: 5,
        round: e.roundHistory,
        colors: e.historyColors,
        onChange: e.onCompactChange
      }, null, 8, ["round", "colors", "onChange"]))
    ])
  ]);
}
const we = /* @__PURE__ */ X(Gt, [["render", Zt], ["__scopeId", "data-v-0d5bef46"]]);
const Jt = O({
  name: "ChromeColorPicker",
  components: { Display: be, Alpha: he, Board: fe, Hue: ve, History: Ce },
  props: {
    color: C.instanceOf(R),
    disableHistory: C.bool.def(!1),
    roundHistory: C.bool.def(!1),
    disableAlpha: C.bool.def(!1)
  },
  emits: ["update:color", "change"],
  setup(e, { emit: t }) {
    const o = e.color || new R(), n = q({
      color: o,
      hex: o.toHexString(),
      rgb: o.toRgbString()
    }), s = K(() => ({ background: n.rgb })), r = ue(de, [], {}), a = Z(() => {
      if (e.disableHistory)
        return;
      const i = n.color.toRgbString();
      if (r.value = r.value.filter((g) => !H.equals(g, i)), !r.value.includes(i)) {
        for (; r.value.length > ge; )
          r.value.pop();
        r.value.unshift(i);
      }
    }, 500), l = (i) => {
      n.color.alpha = i;
    }, u = (i) => {
      n.color.hue = i;
    }, S = (i, g) => {
      n.color.saturation = i, n.color.brightness = g;
    }, h = (i) => {
      i !== "advance" && (n.color.hex = i);
    };
    return N(
      () => e.color,
      (i) => {
        i && (n.color = i);
      },
      { deep: !0 }
    ), N(
      () => n.color,
      () => {
        n.hex = n.color.hex, n.rgb = n.color.toRgbString(), a(), t("update:color", n.color), t("change", n.color);
      },
      { deep: !0 }
    ), {
      state: n,
      previewStyle: s,
      historyColors: r,
      onAlphaChange: l,
      onHueChange: u,
      onBoardChange: S,
      onCompactChange: h
    };
  }
}), Qt = { class: "vc-chrome-colorPicker" }, xt = { class: "vc-chrome-colorPicker-body" }, eo = { class: "chrome-controls" }, to = { class: "chrome-sliders" };
function oo(e, t, o, n, s, r) {
  const a = I("Board"), l = I("Hue"), u = I("Alpha"), S = I("Display"), h = I("History");
  return b(), $("div", Qt, [
    U(a, {
      round: !0,
      hide: !1,
      color: e.state.color,
      onChange: e.onBoardChange
    }, null, 8, ["color", "onChange"]),
    c("div", xt, [
      c("div", eo, [
        c("div", to, [
          U(l, {
            size: "small",
            color: e.state.color,
            onChange: e.onHueChange
          }, null, 8, ["color", "onChange"]),
          e.disableAlpha ? B("", !0) : (b(), M(u, {
            key: 0,
            size: "small",
            color: e.state.color,
            onChange: e.onAlphaChange
          }, null, 8, ["color", "onChange"]))
        ])
      ]),
      U(S, {
        color: e.state.color,
        "disable-alpha": e.disableAlpha
      }, null, 8, ["color", "disable-alpha"]),
      e.disableHistory ? B("", !0) : (b(), M(h, {
        key: 0,
        round: e.roundHistory,
        colors: e.historyColors,
        onChange: e.onCompactChange
      }, null, 8, ["round", "colors", "onChange"]))
    ])
  ]);
}
const He = /* @__PURE__ */ X(Jt, [["render", oo], ["__scopeId", "data-v-33636434"]]), ye = "Vue3ColorPickerProvider", no = (e, t) => {
  const o = e.getBoundingClientRect(), n = o.left + o.width / 2, s = o.top + o.height / 2, r = Math.abs(n - t.clientX), a = Math.abs(s - t.clientY), l = Math.sqrt(Math.pow(r, 2) + Math.pow(a, 2)), u = a / l, S = Math.acos(u);
  let h = Math.floor(180 / (Math.PI / S));
  return t.clientX > n && t.clientY > s && (h = 180 - h), t.clientX == n && t.clientY > s && (h = 180), t.clientX > n && t.clientY == s && (h = 90), t.clientX < n && t.clientY > s && (h = 180 + h), t.clientX < n && t.clientY == s && (h = 270), t.clientX < n && t.clientY < s && (h = 360 - h), h;
};
let ce = !1;
const ao = (e, t) => {
  const o = function(s) {
    var r;
    (r = t.drag) == null || r.call(t, s);
  }, n = function(s) {
    var r;
    document.removeEventListener("mousemove", o, !1), document.removeEventListener("mouseup", n, !1), document.onselectstart = null, document.ondragstart = null, ce = !1, (r = t.end) == null || r.call(t, s);
  };
  e && e.addEventListener("mousedown", (s) => {
    var r;
    ce || (document.onselectstart = () => !1, document.ondragstart = () => !1, document.addEventListener("mousemove", o, !1), document.addEventListener("mouseup", n, !1), ce = !0, (r = t.start) == null || r.call(t, s));
  });
};
const ro = {
  angle: {
    type: Number,
    default: 0
  },
  size: {
    type: Number,
    default: 16,
    validator: (e) => e >= 16
  },
  borderWidth: {
    type: Number,
    default: 1,
    validator: (e) => e >= 1
  },
  borderColor: {
    type: String,
    default: "#666"
  }
}, lo = O({
  name: "Angle",
  props: ro,
  emits: ["update:angle", "change"],
  setup(e, {
    emit: t
  }) {
    const o = A(null), n = A(0);
    Q(() => e.angle, (l) => {
      n.value = l;
    });
    const s = () => {
      let l = Number(n.value);
      isNaN(l) || (l = l > 360 || l < 0 ? e.angle : l, n.value = l === 360 ? 0 : l, t("update:angle", n.value), t("change", n.value));
    }, r = K(() => ({
      width: e.size + "px",
      height: e.size + "px",
      borderWidth: e.borderWidth + "px",
      borderColor: e.borderColor,
      transform: `rotate(${n.value}deg)`
    })), a = (l) => {
      o.value && (n.value = no(o.value, l) % 360, s());
    };
    return Fe(() => {
      const l = {
        drag: (u) => {
          a(u);
        },
        end: (u) => {
          a(u);
        }
      };
      o.value && ao(o.value, l);
    }), () => U("div", {
      class: "bee-angle"
    }, [U("div", {
      class: "bee-angle__round",
      ref: o,
      style: r.value
    }, null)]);
  }
});
const so = O({
  name: "GradientColorPicker",
  components: { Angle: lo, Display: be, Alpha: he, Palette: Ve, Board: fe, Hue: ve, Lightness: Ie, History: Ce },
  props: {
    startColor: C.instanceOf(R).isRequired,
    endColor: C.instanceOf(R).isRequired,
    startColorStop: C.number.def(0),
    endColorStop: C.number.def(100),
    angle: C.number.def(0),
    type: C.oneOf(["linear", "radial"]).def("linear"),
    disableHistory: C.bool.def(!1),
    roundHistory: C.bool.def(!1),
    disableAlpha: C.bool.def(!1),
    pickerType: C.oneOf(["fk", "chrome"]).def("fk")
  },
  emits: [
    "update:startColor",
    "update:endColor",
    "update:angle",
    "update:startColorStop",
    "update:endColorStop",
    "startColorChange",
    "endColorChange",
    "advanceChange",
    "angleChange",
    "startColorStopChange",
    "endColorStopChange",
    "typeChange"
  ],
  setup(e, { emit: t }) {
    const o = q({
      startActive: !0,
      startColor: e.startColor,
      endColor: e.endColor,
      startColorStop: e.startColorStop,
      endColorStop: e.endColorStop,
      angle: e.angle,
      type: e.type,
      // rgba
      startColorRgba: e.startColor.toRgbString(),
      endColorRgba: e.endColor.toRgbString()
    }), n = Re(ye), s = A(e.pickerType === "chrome"), r = A(), a = A(), l = A();
    Q(
      () => [e.startColor, e.endColor, e.angle],
      (d) => {
        o.startColor = d[0], o.endColor = d[1], o.angle = d[2];
      }
    ), Q(
      () => e.type,
      (d) => {
        o.type = d;
      }
    );
    const u = K({
      get: () => o.startActive ? o.startColor : o.endColor,
      set: (d) => {
        if (o.startActive) {
          o.startColor = d;
          return;
        }
        o.endColor = d;
      }
    }), S = K(() => {
      if (l.value && r.value) {
        const d = o.startColorStop / 100, P = l.value.getBoundingClientRect(), k = r.value.offsetWidth;
        return Math.round(d * (P.width - k) + k / 2);
      }
      return 0;
    }), h = K(() => {
      if (l.value && a.value) {
        const d = o.endColorStop / 100, P = l.value.getBoundingClientRect(), k = a.value.offsetWidth;
        return Math.round(d * (P.width - k) + k / 2);
      }
      return 0;
    }), i = K(() => {
      let d = `background: linear-gradient(${o.angle}deg, ${o.startColorRgba} ${o.startColorStop}%, ${o.endColorRgba} ${o.endColorStop}%)`;
      return o.type === "radial" && (d = `background: radial-gradient(circle, ${o.startColorRgba} ${o.startColorStop}%, ${o.endColorRgba} ${o.endColorStop}%)`), d;
    }), g = (d) => {
      var P;
      if (o.startActive = !0, l.value && r.value) {
        const k = (P = l.value) == null ? void 0 : P.getBoundingClientRect();
        let T = d.clientX - k.left;
        T = Math.max(r.value.offsetWidth / 2, T), T = Math.min(T, k.width - r.value.offsetWidth / 2), o.startColorStop = Math.round(
          (T - r.value.offsetWidth / 2) / (k.width - r.value.offsetWidth) * 100
        ), t("update:startColorStop", o.startColorStop), t("startColorStopChange", o.startColorStop);
      }
    }, f = (d) => {
      var P;
      if (o.startActive = !1, l.value && a.value) {
        const k = (P = l.value) == null ? void 0 : P.getBoundingClientRect();
        let T = d.clientX - k.left;
        T = Math.max(a.value.offsetWidth / 2, T), T = Math.min(T, k.width - a.value.offsetWidth / 2), o.endColorStop = Math.round(
          (T - a.value.offsetWidth / 2) / (k.width - a.value.offsetWidth) * 100
        ), t("update:endColorStop", o.endColorStop), t("endColorStopChange", o.endColorStop);
      }
    }, v = (d) => {
      const P = d.target, k = parseInt(P.value.replace("°", ""));
      isNaN(k) || (o.angle = k % 360), t("update:angle", o.angle), t("angleChange", o.angle);
    }, p = (d) => {
      o.angle = d, t("update:angle", o.angle), t("angleChange", o.angle);
    }, m = (d) => {
      d === "advance" ? (s.value = !0, t("advanceChange", !0)) : (u.value.hex = d, t("advanceChange", !1)), G();
    }, y = (d) => {
      u.value.alpha = d, G();
    }, z = (d) => {
      u.value.hue = d, G();
    }, D = (d, P) => {
      u.value.saturation = d, u.value.brightness = P, G();
    }, F = (d) => {
      u.value.lightness = d, G();
    }, Y = () => {
      G();
    }, G = () => {
      o.startActive ? (t("update:startColor", o.startColor), t("startColorChange", o.startColor)) : (t("update:endColor", o.endColor), t("endColorChange", o.endColor));
    }, J = () => {
      s.value = !1, t("advanceChange", !1);
    }, se = () => {
      o.type = o.type === "linear" ? "radial" : "linear", t("typeChange", o.type);
    }, _ = ue(de, [], {}), w = Z(() => {
      if (e.disableHistory)
        return;
      const d = u.value.toRgbString();
      if (_.value = _.value.filter((P) => !H.equals(P, d)), !_.value.includes(d)) {
        for (; _.value.length > ge; )
          _.value.pop();
        _.value.unshift(d);
      }
    }, 500);
    return oe(() => {
      a.value && r.value && (x.triggerDragEvent(a.value, {
        drag: (d) => {
          f(d);
        },
        end: (d) => {
          f(d);
        }
      }), x.triggerDragEvent(r.value, {
        drag: (d) => {
          g(d);
        },
        end: (d) => {
          g(d);
        }
      }));
    }), N(
      () => o.startColor,
      (d) => {
        o.startColorRgba = d.toRgbString();
      },
      { deep: !0 }
    ), N(
      () => o.endColor,
      (d) => {
        o.endColorRgba = d.toRgbString();
      },
      { deep: !0 }
    ), N(
      () => u.value,
      () => {
        w();
      },
      { deep: !0 }
    ), {
      startGradientRef: r,
      stopGradientRef: a,
      colorRangeRef: l,
      state: o,
      currentColor: u,
      getStartColorLeft: S,
      getEndColorLeft: h,
      gradientBg: i,
      advancePanelShow: s,
      onDegreeBlur: v,
      onCompactChange: m,
      onAlphaChange: y,
      onHueChange: z,
      onBoardChange: D,
      onLightChange: F,
      historyColors: _,
      onBack: J,
      onDegreeChange: p,
      onDisplayChange: Y,
      onTypeChange: se,
      lang: n == null ? void 0 : n.lang
    };
  }
}), Me = (e) => (ee("data-v-1e7e32e5"), e = e(), te(), e), io = { class: "vc-gradient-picker" }, co = { class: "vc-gradient-picker__header" }, uo = { class: "vc-gradient__types" }, go = { class: "vc-gradient-picker__body" }, ho = {
  class: "vc-color-range",
  ref: "colorRangeRef"
}, po = { class: "vc-color-range__container" }, fo = { class: "vc-gradient__stop__container" }, vo = ["title"], Co = /* @__PURE__ */ Me(() => /* @__PURE__ */ c("span", { class: "vc-gradient__stop--inner" }, null, -1)), bo = [
  Co
], yo = ["title"], _o = /* @__PURE__ */ Me(() => /* @__PURE__ */ c("span", { class: "vc-gradient__stop--inner" }, null, -1)), mo = [
  _o
], So = { class: "vc-picker-degree-input vc-degree-input" }, ko = { class: "vc-degree-input__control" }, $o = ["value"], wo = { class: "vc-degree-input__panel" }, Ho = { class: "vc-degree-input__disk" };
function Bo(e, t, o, n, s, r) {
  var v, p;
  const a = I("Angle"), l = I("Board"), u = I("Hue"), S = I("Palette"), h = I("Lightness"), i = I("Alpha"), g = I("Display"), f = I("History");
  return b(), $("div", io, [
    c("div", co, [
      c("div", null, [
        Ae(c("div", {
          class: "back",
          style: { cursor: "pointer" },
          onClick: t[0] || (t[0] = (...m) => e.onBack && e.onBack(...m))
        }, null, 512), [
          [Pe, e.pickerType === "fk" && e.advancePanelShow]
        ])
      ]),
      c("div", uo, [
        (b(), $(j, null, ne(["linear", "radial"], (m) => c("div", {
          class: W(["vc-gradient__type", { active: e.state.type === m }]),
          key: m,
          onClick: t[1] || (t[1] = (...y) => e.onTypeChange && e.onTypeChange(...y))
        }, re(e.lang ? e.lang[m] : m), 3)), 64))
      ])
    ]),
    c("div", go, [
      c("div", ho, [
        c("div", po, [
          c("div", {
            class: "vc-background",
            style: E(e.gradientBg)
          }, null, 4),
          c("div", fo, [
            c("div", {
              class: W(["vc-gradient__stop", {
                "vc-gradient__stop--current": e.state.startActive
              }]),
              ref: "startGradientRef",
              title: (v = e.lang) == null ? void 0 : v.start,
              style: E({ left: e.getStartColorLeft + "px" })
            }, bo, 14, vo),
            c("div", {
              class: W(["vc-gradient__stop", {
                "vc-gradient__stop--current": !e.state.startActive
              }]),
              ref: "stopGradientRef",
              title: (p = e.lang) == null ? void 0 : p.end,
              style: E({ left: e.getEndColorLeft + "px" })
            }, mo, 14, yo)
          ])
        ])
      ], 512),
      c("div", So, [
        c("div", ko, [
          c("input", {
            value: e.state.angle,
            onBlur: t[2] || (t[2] = (...m) => e.onDegreeBlur && e.onDegreeBlur(...m))
          }, null, 40, $o),
          Ye("deg ")
        ]),
        c("div", wo, [
          c("div", Ho, [
            U(a, {
              angle: e.state.angle,
              "onUpdate:angle": t[3] || (t[3] = (m) => e.state.angle = m),
              size: 40,
              onChange: e.onDegreeChange
            }, null, 8, ["angle", "onChange"])
          ])
        ])
      ])
    ]),
    e.advancePanelShow ? (b(), M(l, {
      key: 0,
      color: e.currentColor,
      onChange: e.onBoardChange
    }, null, 8, ["color", "onChange"])) : B("", !0),
    e.advancePanelShow ? (b(), M(u, {
      key: 1,
      color: e.currentColor,
      onChange: e.onHueChange
    }, null, 8, ["color", "onChange"])) : B("", !0),
    e.advancePanelShow ? B("", !0) : (b(), M(S, {
      key: 2,
      onChange: e.onCompactChange
    }, null, 8, ["onChange"])),
    e.advancePanelShow ? B("", !0) : (b(), M(h, {
      key: 3,
      color: e.currentColor,
      onChange: e.onLightChange
    }, null, 8, ["color", "onChange"])),
    e.disableAlpha ? B("", !0) : (b(), M(i, {
      key: 4,
      color: e.currentColor,
      onChange: e.onAlphaChange
    }, null, 8, ["color", "onChange"])),
    U(g, {
      color: e.currentColor,
      "disable-alpha": e.disableAlpha,
      onChange: e.onDisplayChange
    }, null, 8, ["color", "disable-alpha", "onChange"]),
    e.disableHistory ? B("", !0) : (b(), M(f, {
      key: 5,
      round: e.roundHistory,
      colors: e.historyColors,
      onChange: e.onCompactChange
    }, null, 8, ["round", "colors", "onChange"]))
  ]);
}
const Be = /* @__PURE__ */ X(so, [["render", Bo], ["__scopeId", "data-v-1e7e32e5"]]);
const Ro = O({
  name: "WrapContainer",
  props: {
    theme: C.oneOf(["white", "black"]).def("white"),
    showTab: C.bool.def(!1),
    activeKey: C.oneOf(["pure", "gradient"]).def("pure")
  },
  emits: ["update:activeKey", "change"],
  setup(e, { emit: t }) {
    const o = q({
      activeKey: e.activeKey
    }), n = Re(ye), s = (r) => {
      o.activeKey = r, t("update:activeKey", r), t("change", r);
    };
    return N(
      () => e.activeKey,
      (r) => {
        o.activeKey = r;
      }
    ), { state: o, onActiveKeyChange: s, lang: n == null ? void 0 : n.lang };
  }
}), Ao = { class: "vc-colorpicker--container" }, Po = {
  key: 0,
  class: "vc-colorpicker--tabs"
}, Vo = { class: "vc-colorpicker--tabs__inner" }, Io = { class: "vc-btn__content" }, Mo = { class: "vc-btn__content" };
function Ko(e, t, o, n, s, r) {
  var a, l;
  return b(), $("div", {
    class: W(["vc-colorpicker", e.theme])
  }, [
    c("div", Ao, [
      e.showTab ? (b(), $("div", Po, [
        c("div", Vo, [
          c("div", {
            class: W([
              "vc-colorpicker--tabs__btn",
              {
                "vc-btn-active": e.state.activeKey === "pure"
              }
            ]),
            onClick: t[0] || (t[0] = (u) => e.onActiveKeyChange("pure"))
          }, [
            c("button", null, [
              c("div", Io, re((a = e.lang) == null ? void 0 : a.pure), 1)
            ])
          ], 2),
          c("div", {
            class: W([
              "vc-colorpicker--tabs__btn",
              {
                "vc-btn-active": e.state.activeKey === "gradient"
              }
            ]),
            onClick: t[1] || (t[1] = (u) => e.onActiveKeyChange("gradient"))
          }, [
            c("button", null, [
              c("div", Mo, re((l = e.lang) == null ? void 0 : l.gradient), 1)
            ])
          ], 2),
          c("div", {
            class: "vc-colorpicker--tabs__bg",
            style: E({
              width: "50%",
              left: `calc(${e.state.activeKey === "gradient" ? 50 : 0}%)`
            })
          }, null, 4)
        ])
      ])) : B("", !0),
      Ue(e.$slots, "default", {}, void 0, !0)
    ])
  ], 2);
}
const Lo = /* @__PURE__ */ X(Ro, [["render", Ko], ["__scopeId", "data-v-0492277d"]]), Eo = {
  start: "Start",
  end: "End",
  pure: "Pure",
  gradient: "Gradient",
  linear: "linear",
  radial: "radial"
}, No = {
  start: "开始",
  end: "结束",
  pure: "纯色",
  gradient: "渐变",
  linear: "线性",
  radial: "径向"
}, Wo = {
  En: Eo,
  "ZH-cn": No
};
const Do = {
  isWidget: C.bool.def(!1),
  pickerType: C.oneOf(["fk", "chrome"]).def("fk"),
  shape: C.oneOf(["circle", "square"]).def("square"),
  pureColor: {
    type: [String, Object],
    default: "#000000"
  },
  gradientColor: C.string.def(
    "linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(0, 0, 0, 1) 100%)"
  ),
  format: {
    type: String,
    default: "rgb"
  },
  disableAlpha: C.bool.def(!1),
  disableHistory: C.bool.def(!1),
  roundHistory: C.bool.def(!1),
  useType: C.oneOf(["pure", "gradient", "both"]).def("pure"),
  activeKey: C.oneOf(["pure", "gradient"]).def("pure"),
  lang: {
    type: String,
    default: "ZH-cn"
  },
  zIndex: C.number.def(9999),
  pickerContainer: {
    type: String || HTMLElement,
    default: "body"
  },
  debounce: C.number.def(100),
  theme: C.oneOf(["white", "black"]).def("white")
}, To = O({
  name: "ColorPicker",
  components: { FkColorPicker: we, ChromeColorPicker: He, GradientColorPicker: Be, WrapContainer: Lo },
  inheritAttrs: !1,
  props: Do,
  emits: [
    "update:pureColor",
    "pureColorChange",
    "update:gradientColor",
    "gradientColorChange",
    "update:activeKey",
    "activeKeyChange"
  ],
  setup(e, { emit: t }) {
    je(ye, {
      lang: K(() => Wo[e.lang || "ZH-cn"])
    });
    const o = q({
      pureColor: e.pureColor || "",
      activeKey: e.useType === "gradient" ? "gradient" : e.activeKey,
      //  "pure" | "gradient"
      isAdvanceMode: !1
    }), n = new R("#000"), s = new R("#000"), r = new R(o.pureColor), a = q({
      startColor: n,
      endColor: s,
      startColorStop: 0,
      endColorStop: 100,
      angle: 0,
      type: "linear",
      gradientColor: e.gradientColor
    }), l = A(r), u = A(!1), S = A(null), h = A(null);
    let i = null;
    const g = K(() => ({
      background: o.activeKey !== "gradient" ? H(o.pureColor).toRgbString() : a.gradientColor
    })), f = K(() => o.activeKey === "gradient" ? Be.name : e.pickerType === "fk" ? we.name : He.name), v = (_) => {
      o.isAdvanceMode = _;
    }, p = K(() => {
      const _ = {
        disableAlpha: e.disableAlpha,
        disableHistory: e.disableHistory,
        roundHistory: e.roundHistory,
        pickerType: e.pickerType
      };
      return o.activeKey === "gradient" ? {
        ..._,
        startColor: a.startColor,
        endColor: a.endColor,
        angle: a.angle,
        type: a.type,
        startColorStop: a.startColorStop,
        endColorStop: a.endColorStop,
        onStartColorChange: (w) => {
          a.startColor = w, D();
        },
        onEndColorChange: (w) => {
          a.endColor = w, D();
        },
        onStartColorStopChange: (w) => {
          a.startColorStop = w, D();
        },
        onEndColorStopChange: (w) => {
          a.endColorStop = w, D();
        },
        onAngleChange: (w) => {
          a.angle = w, D();
        },
        onTypeChange: (w) => {
          a.type = w, D();
        },
        onAdvanceChange: v
      } : {
        ..._,
        disableAlpha: e.disableAlpha,
        disableHistory: e.disableHistory,
        roundHistory: e.roundHistory,
        color: l.value,
        onChange: G,
        onAdvanceChange: v
      };
    }), m = () => {
      u.value = !0, i ? i.update() : Y();
    }, y = () => {
      u.value = !1;
    }, z = () => {
      var _, w, d, P;
      try {
        const [k] = xe(a.gradientColor);
        if (k && k.type.includes("gradient") && k.colorStops.length >= 2) {
          const T = k.colorStops[0], _e = k.colorStops[1];
          a.startColorStop = Number((_ = T.length) == null ? void 0 : _.value) || 0, a.endColorStop = Number((w = _e.length) == null ? void 0 : w.value) || 0, k.type === "linear-gradient" && ((d = k.orientation) == null ? void 0 : d.type) === "angular" && (a.angle = Number((P = k.orientation) == null ? void 0 : P.value) || 0), a.type = k.type.split("-")[0];
          const [Ke, Le, Ee, Ne] = T.value, [We, De, Te, Oe] = _e.value;
          a.startColor = new R({
            r: Number(Ke),
            g: Number(Le),
            b: Number(Ee),
            a: Number(Ne)
          }), a.endColor = new R({
            r: Number(We),
            g: Number(De),
            b: Number(Te),
            a: Number(Oe)
          });
        }
      } catch (k) {
        console.log(`[Parse Color]: ${k}`);
      }
    }, D = Z(() => {
      const _ = F();
      try {
        a.gradientColor = Qe(_), t("update:gradientColor", a.gradientColor), t("gradientColorChange", a.gradientColor);
      } catch (w) {
        console.log(w);
      }
    }, e.debounce), F = () => {
      const _ = [], w = a.startColor.RGB.map((k) => k.toString()), d = a.endColor.RGB.map((k) => k.toString()), P = [
        {
          type: "rgba",
          value: [w[0], w[1], w[2], w[3]],
          length: { value: a.startColorStop + "", type: "%" }
        },
        {
          type: "rgba",
          value: [d[0], d[1], d[2], d[3]],
          length: { value: a.endColorStop + "", type: "%" }
        }
      ];
      return a.type === "linear" ? _.push({
        type: "linear-gradient",
        orientation: { type: "angular", value: a.angle + "" },
        colorStops: P
      }) : a.type === "radial" && _.push({
        type: "radial-gradient",
        orientation: [{ type: "shape", value: "circle" }],
        colorStops: P
      }), _;
    }, Y = () => {
      S.value && h.value && (i = et(S.value, h.value, {
        placement: "auto",
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, 8]
            }
          },
          {
            name: "flip",
            options: {
              allowedAutoPlacements: ["top", "bottom", "left", "right"],
              rootBoundary: "viewport"
            }
          }
        ]
      }));
    }, G = (_) => {
      l.value = _, o.pureColor = _.toString(e.format), J();
    }, J = Z(() => {
      t("update:pureColor", o.pureColor), t("pureColorChange", o.pureColor);
    }, e.debounce);
    Je(h, () => {
      y();
    });
    const se = (_) => {
      o.activeKey = _, t("update:activeKey", _), t("activeKeyChange", _);
    };
    return oe(() => {
      z();
    }), N(
      () => e.gradientColor,
      (_) => {
        _ != a.gradientColor && (a.gradientColor = _);
      }
    ), N(
      () => a.gradientColor,
      () => {
        z();
      }
    ), N(
      () => e.activeKey,
      (_) => {
        o.activeKey = _;
      }
    ), N(
      () => e.useType,
      (_) => {
        o.activeKey !== "gradient" && _ === "gradient" ? o.activeKey = "gradient" : o.activeKey = "pure";
      }
    ), N(
      () => e.pureColor,
      (_) => {
        H.equals(_, o.pureColor) || (o.pureColor = _, l.value = new R(_));
      },
      { deep: !0 }
    ), {
      colorCubeRef: S,
      pickerRef: h,
      showPicker: u,
      colorInstance: l,
      getBgColorStyle: g,
      onColorChange: G,
      onShowPicker: m,
      onActiveKeyChange: se,
      getComponentName: f,
      getBindArgs: p,
      state: o
    };
  }
});
function Oo(e, t, o, n, s, r) {
  const a = I("WrapContainer");
  return b(), $(j, null, [
    e.isWidget ? (b(), M(a, {
      key: 0,
      "active-key": e.state.activeKey,
      "onUpdate:activeKey": t[0] || (t[0] = (l) => e.state.activeKey = l),
      "show-tab": e.useType === "both",
      onChange: e.onActiveKeyChange,
      style: E({ zIndex: e.zIndex }),
      theme: e.theme
    }, {
      default: me(() => [
        (b(), M(Se(e.getComponentName), ke({ key: e.getComponentName }, e.getBindArgs), null, 16))
      ]),
      _: 1
    }, 8, ["active-key", "show-tab", "onChange", "style", "theme"])) : B("", !0),
    e.isWidget ? B("", !0) : (b(), $(j, { key: 1 }, [
      c("div", {
        class: W(["vc-color-wrap transparent", { round: e.shape === "circle" }]),
        ref: "colorCubeRef"
      }, [
        c("div", {
          class: "current-color",
          style: E(e.getBgColorStyle),
          onClick: t[1] || (t[1] = (...l) => e.onShowPicker && e.onShowPicker(...l))
        }, null, 4)
      ], 2),
      (b(), M(Ze, { to: e.pickerContainer }, [
        Ae(c("div", {
          ref: "pickerRef",
          style: E({ zIndex: e.zIndex })
        }, [
          e.showPicker ? (b(), M(a, {
            key: 0,
            "show-tab": e.useType === "both" && !e.state.isAdvanceMode,
            "active-key": e.state.activeKey,
            "onUpdate:activeKey": t[2] || (t[2] = (l) => e.state.activeKey = l),
            onChange: e.onActiveKeyChange,
            theme: e.theme
          }, {
            default: me(() => [
              (b(), M(Se(e.getComponentName), ke({ key: e.getComponentName }, e.getBindArgs), null, 16))
            ]),
            _: 1
          }, 8, ["show-tab", "active-key", "onChange", "theme"])) : B("", !0)
        ], 4), [
          [Pe, e.showPicker]
        ])
      ], 8, ["to"]))
    ], 64))
  ], 64);
}
const ae = /* @__PURE__ */ X(To, [["render", Oo], ["__scopeId", "data-v-11de56b7"]]), Jo = {
  install: (e) => {
    e.component(ae.name, ae), e.component("Vue3" + ae.name, ae);
  }
};
export {
  ae as ColorPicker,
  Jo as default
};
