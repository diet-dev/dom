import { component } from "../src/index.ts";

export type IconName = "plus" | "minus" | "trash" | "list" | "hash";

const PATHS: Record<IconName, string> = {
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  trash: "M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M10 11v6M14 11v6",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  hash: "M5 9h14M5 15h14M10 4L8 20M16 4l-2 16",
};

export const Icon = component((props: { name: IconName; size?: number }) => (
  <svg
    class="icon"
    viewBox="0 0 24 24"
    width={props.size ?? 18}
    height={props.size ?? 18}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={PATHS[props.name]} />
  </svg>
));
