/**
 */
export default function shareSomething(title: string, inviteText: string, url: string) {
  function shareMobile() {
    const share: ShareData = {
      title: title,
      text: inviteText,
      url: url,
    };

    navigator.share(share);
    console.log('Shared data: ' + share);
  }

  /**
   */
  function copyTextToClipboard() {
    if (!navigator.clipboard) {
      alert('older browsers do not implement clipboard, please update.');
      return;
    }
    navigator.clipboard.writeText(url).then(
      function () {
        console.debug('Async: Copying to clipboard was successful!');
      },
      function (err) {
        const msg = 'Sorry, could not copy text to clipboard ';
        alert(msg);
        console.error(msg + err, err);
      }
    );
  }

  if (!navigator.canShare) {
    copyTextToClipboard();
    alert(title + ' copied to clipboard!');
  } else {
    shareMobile();
  }
}
