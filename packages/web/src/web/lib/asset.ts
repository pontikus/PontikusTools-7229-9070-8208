// Builds a URL that works both at the site root (Runable) and under a sub-folder (GitHub Pages).
// Vite sets BASE_URL from the `base` option in vite.config.ts.
export const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, "");
// Router base without a trailing slash: "" at the root, "/PontikusTools-7229" on GitHub Pages.
export const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "");
