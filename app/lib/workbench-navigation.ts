// Keep case files addressable and make selection work with browser Back/Forward.
export function openWorkbenchPanel(panel: string) {
  window.location.assign(`#${panel}`);
  requestAnimationFrame(() => {
    const content = document.getElementById("main-content");
    content?.focus({ preventScroll: true });
    content?.scrollIntoView({ block: "start", behavior: "instant" });
  });
}
