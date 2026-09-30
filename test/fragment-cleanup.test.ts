import { describe, expect, it } from "vitest";
import { div, li, signal, list, unmount, Fragment } from "../src/index.ts";
import { jsxs } from "../src/jsx-runtime.ts";

describe("Fragment и очистка (регрессии ревью R1–R3)", () => {
  it("R2: unmount диспозит эффект signal-ребёнка, пришедшего через Fragment", () => {
    const name = signal("a");
    const frag = jsxs(Fragment, { children: [name] });
    const host = div();
    host.append(frag); // Fragment растворяется, маркер переезжает в host
    expect(host.textContent).toBe("a");

    name.value = "b";
    expect(host.textContent).toBe("b");

    unmount(host);
    name.value = "c";
    expect(host.textContent).toBe("b"); // эффект диспозился
  });

  it("R1: list внутри Fragment — изменение source после монтирования не крашится", () => {
    const source = signal(["a"]);
    const frag = jsxs(Fragment, {
      children: [
        list(
          source,
          (s) => s,
          (s) => li(s),
        ),
      ],
    });
    const host = div();
    host.append(frag);
    expect(host.querySelectorAll("li").length).toBe(1);

    source.value = ["a", "b"];
    expect(host.querySelectorAll("li").length).toBe(2);
    expect(host.textContent).toBe("ab");
  });

  it("R1: unmount(host) останавливает reconcile списка из Fragment", () => {
    const source = signal(["a"]);
    const frag = jsxs(Fragment, {
      children: [
        list(
          source,
          (s) => s,
          (s) => li(s),
        ),
      ],
    });
    const host = div();
    host.append(frag);
    unmount(host);
    source.value = ["a", "b", "c"];
    expect(host.querySelectorAll("li").length).toBe(1);
  });

  it("R3: Fragment экспортируется из корня пакета и работает как JSX-тег", () => {
    expect(typeof Fragment).toBe("function");
    const frag = jsxs(Fragment, { children: [div("x"), div("y")] });
    const host = div();
    host.append(frag);
    expect(host.textContent).toBe("xy");
  });

  it("signal-ребёнок в Fragment обновляется и после растворения фрагмента", () => {
    const view = signal<Node | null>(div("первый"));
    const frag = jsxs(Fragment, { children: [view] });
    const host = div();
    host.append(frag);
    expect(host.textContent).toBe("первый");
    view.value = div("второй");
    expect(host.textContent).toBe("второй");
    view.value = null;
    expect(host.textContent).toBe("");
  });
});
