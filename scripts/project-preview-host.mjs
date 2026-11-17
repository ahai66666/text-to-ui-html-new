export const projectPreviewDirectory = ".text-to-ui/preview";

const moduleEntry = '<script type="module" src="./main.js"></script>';
const previewEntry = '<link rel="stylesheet" href="./' + projectPreviewDirectory + '/styles/app.css">'
  + '<script defer src="./' + projectPreviewDirectory + '/runtime/app.js"></script>';

export function hasProjectPreviewHost(html) {
  return html.includes(previewEntry);
}

export function sourcePageHost(html) {
  return html.replace(previewEntry, moduleEntry);
}

export function projectPreviewHost(html) {
  const host = sourcePageHost(html);
  if (!host.includes(moduleEntry)) {
    throw new Error("OFFLINE_PROJECT_HOST: index.html must use the managed ./main.js entry; use an explicit export format for a custom host");
  }
  return host.replace(moduleEntry, previewEntry);
}
