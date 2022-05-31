/**
 */
export default function shareURL(url: string) {
  navigator.canShare() ? shareMobile() : copyTextToClipboard();

  function shareMobile() {
    alert('Sharing...');

    navigator.share({
      url: url,
    });
  }

  /**
   */
  function copyTextToClipboard() {
    return navigator.clipboard && navigator.clipboard.writeText(url);
  }
}
