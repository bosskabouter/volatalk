
/**
 */
 export default function shareSomething(t:string, inviteText: string, u:string) {


    function shareMobile() {

      const shareData = {
        title: t,
        text: inviteText,
        url: u,
      };
  
      navigator.share(shareData);
      console.log('Shared data: ' + shareData);
    }
  
    /**
     */
    function copyTextToClipboard() {
      if (!navigator.clipboard) {
        alert('older browsers do not implement clipboard, please update.');
        return;
      }
      navigator.clipboard.writeText(u).then(
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


      if (navigator.canShare()) {
        shareMobile();
      } else {
        copyTextToClipboard();
        alert(t + " copied to clipboard!");
      }
    

  }