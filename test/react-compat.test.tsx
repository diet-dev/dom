import { describe, expect, it, vi } from "vitest";
import { signal } from "../src/index.ts";

describe("React-совместимость пропсов через JSX", () => {
  it("className и htmlFor → class/for", () => {
    const node = (
      <label className="lbl" htmlFor="field">
        <input id="field" type="text" />
      </label>
    ) as HTMLElement;
    expect(node.className).toBe("lbl");
    expect(node.getAttribute("for")).toBe("field");
  });

  it("onChange на текстовом input слушает событие input", () => {
    const onChange = vi.fn();
    const node = <input type="text" onChange={onChange} /> as HTMLElement;
    node.dispatchEvent(new Event("input"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("onChange на checkbox и select слушает событие change", () => {
    const onCheck = vi.fn();
    const onSelect = vi.fn();
    const box = <input type="checkbox" checked onChange={onCheck} /> as HTMLInputElement;
    const select = (
      <select onChange={onSelect}>
        <option value="a">a</option>
      </select>
    ) as HTMLElement;
    box.dispatchEvent(new Event("change"));
    select.dispatchEvent(new Event("change"));
    expect(onCheck).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("onDoubleClick слушает dblclick", () => {
    const onDoubleClick = vi.fn();
    const node = <button onDoubleClick={onDoubleClick}>кнопка</button> as HTMLElement;
    node.dispatchEvent(new MouseEvent("dblclick"));
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
  });

  it("readOnly и autoFocus выставляются как DOM-свойства", () => {
    const node = <input type="text" readOnly={true} autoFocus={false} /> as HTMLInputElement;
    expect(node.readOnly).toBe(true);
    expect(node.getAttribute("readonly")).toBe("");
  });

  it("plain value + onChange → controlled: значение возвращается к пропу", () => {
    const node = <input type="text" value="проп" onChange={() => {}} /> as HTMLInputElement;
    node.value = "пользователь";
    node.dispatchEvent(new Event("input"));
    expect(node.value).toBe("проп");
  });

  it("Signal value → bind: значение следует за сигналом", () => {
    const value = signal("a");
    const node = <input type="text" value={value} /> as HTMLInputElement;
    expect(node.value).toBe("a");
    value.value = "b";
    expect(node.value).toBe("b");
  });

  it("ref-callback получает элемент", () => {
    const ref = vi.fn();
    const node = <div ref={ref} /> as HTMLElement;
    expect(ref).toHaveBeenCalledWith(node);
  });
});
