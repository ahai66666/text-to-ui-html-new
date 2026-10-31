
export const escapeOverlayHandler = `if(event.key==='Escape'){event.preventDefault();const e=this.closest('[data-overlay-example]');this.closest('.tui-overlay-layer').hidden=true;e.querySelector('[data-overlay-trigger]').focus()}`;
