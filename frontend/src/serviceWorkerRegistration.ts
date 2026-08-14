export function registerServiceWorker() {
  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    const serviceWorkerUrl = `${process.env.PUBLIC_URL}/sw.js`;

    navigator.serviceWorker.register(serviceWorkerUrl).catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}
