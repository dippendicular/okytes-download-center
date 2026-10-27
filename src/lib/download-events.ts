export const DOWNLOAD_EVENT = "okytes:download";

export interface DownloadEventDetail {
  x: number;
  y: number;
  label: string;
}

/** Fire-and-forget feedback (confetti + toast). Never blocks the real <a href>. */
export function announceDownload(e: React.MouseEvent, label: string) {
  window.dispatchEvent(
    new CustomEvent<DownloadEventDetail>(DOWNLOAD_EVENT, {
      detail: { x: e.clientX, y: e.clientY, label },
    }),
  );
}
