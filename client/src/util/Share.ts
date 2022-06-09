/**
 */
export default function Share(u: string) {
  const shareData = {
    url: u,
  };
  if (!navigator.canShare) copyTextToClipboard();
  else navigator.share(shareData);

  /**
   */
  function copyTextToClipboard() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(u);
      alert('Copied to clipboard: ' + u);
    } else {
      alert('Cannot share data without clipboard');
    }
  }
}
