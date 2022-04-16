/**
 * Generic shortcuts common used statements
 */

const domain = document.location.host;

/**
 */
function localSave(param, value) {
  let objToJSON = JSON.stringify(value);
  localStorage.setItem(param, objToJSON);
  console.debug("Saved to local storage param: " + param, objToJSON);
}

/**
 */
function localLoad(param) {
  let item = localStorage.getItem(param);
  let obj = JSON.parse(item);
  console.debug("Loaded from local storage param: " + param, obj);
  return obj;
}

/**
 */
function getUrlParam(name, url) {
  if (!url) {
    url = document.location;
  }
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(url);
  if (results == null) return null;
  else return results[1];
}

/**
 * requires input file upload event
 */
function readFileAsBase64(evt) {
  var files = evt.target.files;
  var file = files[0];

  return file.arrayBuffer().then((ab) => {
    console.debug("File uploaded: " + ab);
    return convertAbToBase64(ab);
  });
}
/**
 *
 * @param
 * @returns the string in hex
 * @see https://stackoverflow.com/questions/36637146/encode-string-to-hex
 * @see convertHexToString
 */
function convertStringToHex(s) {
  return s
    .split("")
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
}

/**
 *
 * @param {*} hex encoded string
 * @returns the original string
 * @see https://stackoverflow.com/questions/36637146/encode-string-to-hex
 * @see convertStringToHex
 */
function convertHexToString(hex) {
  return hex
    .split(/(\w\w)/g)
    .filter((p) => !!p)
    .map((c) => String.fromCharCode(parseInt(c, 16)))
    .join("");
}

/**
 */
function convertAb2str(buf) {
  return new TextDecoder("utf-8").decode(new DataView(buf));
}

/**
 */
function convertStr2ab(str) {
  return new TextEncoder("utf-8").encode(str);
}

export function convertHex2Ab(hex) {
  var typedArray = new Uint8Array(
    hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16);
    })
  );
  return typedArray.buffer;
}

export function convertBase64ToAb(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function convertAbToBase64(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/** Apply LZW-compression to a string and return base64 compressed string.
 * @see https://stackoverflow.com/questions/3640357/how-to-compress-a-string
 */
function zip(s) {
  try {
    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i = 1; i < data.length; i++) {
      currChar = data[i];
      if (dict[phrase + currChar] != null) {
        phrase += currChar;
      } else {
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        dict[phrase + currChar] = code;
        code++;
        phrase = currChar;
      }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var j = 0; j < out.length; j++) {
      out[j] = String.fromCharCode(out[j]);
    }
    return utoa(out.join(""));
  } catch (e) {
    console.log("Failed to zip string return empty string", e);
    return "";
  }
}

/** Decompress an LZW-encoded base64 string
 * @see https://stackoverflow.com/questions/3640357/how-to-compress-a-string
 */
function unzip(base64ZippedString) {
  try {
    var s = atou(base64ZippedString);
    var dict = {};
    var data = (s + "").split("");
    var currChar = data[0];
    var oldPhrase = currChar;
    var out = [currChar];
    var code = 256;
    var phrase;
    for (var i = 1; i < data.length; i++) {
      var currCode = data[i].charCodeAt(0);
      if (currCode < 256) {
        phrase = data[i];
      } else {
        phrase = dict[currCode] ? dict[currCode] : oldPhrase + currChar;
      }
      out.push(phrase);
      currChar = phrase.charAt(0);
      dict[code] = oldPhrase + currChar;
      code++;
      oldPhrase = phrase;
    }
    return out.join("");
  } catch (e) {
    console.log("Failed to unzip string return empty string", e);
    return "";
  }
}

// ucs-2 string to base64 encoded ascii
function utoa(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}
// base64 encoded ascii to ucs-2 string
function atou(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

/**
 * @see https://imagekit.io/blog/how-to-resize-image-in-javascript/
 */
export function resizeFileUpload(
  fileInput,
  previewOutput,
  MAX_WIDTH,
  MAX_HEIGHT
) {
  fileInput.setAttribute("accept", "image/*");

  fileInput.addEventListener("change", function (e) {
    if (e.target.files) {
      let imageFile = e.target.files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = document.createElement("img");
        img.onload = function (_event) {
          // Dynamically create a canvas element
          var width = img.width;
          var height = img.height;

          // Change the resizing logic
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = height * (MAX_WIDTH / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = width * (MAX_HEIGHT / height);
              height = MAX_HEIGHT;
            }
          }

          var canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Show resized image in preview element
          var dataurl = canvas.toDataURL(imageFile.type);
          previewOutput.src = dataurl;
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(imageFile);
    }
  });
}

export {
  domain,
  zip,
  unzip,
  localLoad,
  localSave,
  getUrlParam,
  convertAbToBase64,
  convertHexToString,
  convertStringToHex,
  convertAb2str,
  convertStr2ab,
  readFileAsBase64,
};
