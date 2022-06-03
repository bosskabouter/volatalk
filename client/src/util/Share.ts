/**
 */
export default function shareURL(u: string) {
  const shareData = {
    url: u,
  };
  navigator.canShare && navigator.canShare() ? navigator.share(shareData) : copyTextToClipboard();

  /**
   */
  function copyTextToClipboard() {
    console.debug('Copying to clipboard');
    return navigator.clipboard && navigator.clipboard.writeText(u);
  }
}
