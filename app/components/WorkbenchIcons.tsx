import type { CSSProperties } from "react";

export type IconName =
  | "folder"
  | "game"
  | "code"
  | "phone"
  | "arrow"
  | "search"
  | "file"
  | "mail"
  | "grid"
  | "chevron"
  | "sound"
  | "mute"
  | "external"
  | "close"
  | "terminal";

const paths: Record<IconName, string> = {
  folder: "M3 7V5h6l2 2h10v12H3Z M3 10h18",
  game: "M7 7h10c3 0 5 10 3 11-2 2-4-3-5-3H9c-1 0-3 5-5 3C2 17 4 7 7 7Z M8 9v5 M5.5 11.5h5 M16 10h.01 M18 13h.01",
  code: "m8 6-6 6 6 6 m8-12 6 6-6 6 m-3-15-2 18",
  phone: "M7 2h10v20H7Z M10 18h4",
  arrow: "M4 12h16 m-6-6 6 6-6 6",
  search: "M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z m-2 5 6 6",
  file: "M5 3h9l5 5v13H5Z M14 3v6h5 M9 13h6 M9 17h6",
  mail: "M3 5h18v14H3Z m0 0 9 8 9-8",
  grid: "M3 3h7v7H3Z M14 3h7v7h-7Z M3 14h7v7H3Z M14 14h7v7h-7Z",
  chevron: "m9 5 7 7-7 7",
  sound: "M3 9h4l5-5v16l-5-5H3Z M16 8a6 6 0 0 1 0 8 M19 5a10 10 0 0 1 0 14",
  mute: "M3 9h4l5-5v16l-5-5H3Z m13 0 5 6 m0-6-5 6",
  external: "M14 3h7v7 m0-7-12 12 M10 3H3v18h18v-7",
  close: "m5 5 14 14 M19 5 5 19",
  terminal: "m4 5 7 7-7 7 M13 19h7",
};

export function Icon({
  name,
  size = 20,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}

export function Goose({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="114" cy="213" rx="72" ry="9" fill="#13233D" opacity=".12" />
      <path
        d="m100 183-6 22-18 4 34 3 5-27M135 185l11 20 21 1-25 8-22-25"
        fill="#F89435"
        stroke="#17263F"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M42 121c14 14 25 19 44 19 16 0 28-12 32-33l5-47c1-27 49-31 55-6 4 16-4 29-14 35-12 7-12 20-7 35 10 29-4 64-38 72-42 10-76-13-77-40l-8-27Z"
        fill="#FFF7DF"
        stroke="#17263F"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M70 151c19 15 40 7 55-7-1 27-34 36-55 7Z" fill="#E8DBBC" />
      <path
        d="m175 61 30 12-33 8"
        fill="#FF9F35"
        stroke="#17263F"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="m131 56 50-3-6 21-15 1-6-12-7 12-14-2Z" fill="#17263F" />
      <path d="m137 60 6-1m18-1 8-1" stroke="#BBD9E8" strokeWidth="3" />
    </svg>
  );
}
