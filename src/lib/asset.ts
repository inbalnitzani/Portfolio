/** URL for a file in /public that works under any deploy base path (e.g. GitHub Pages' /Portfolio/). */
export const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '')
