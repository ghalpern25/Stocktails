declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_BASE_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
