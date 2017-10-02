// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */

// function getCurrentTabUrl(callback) {
//   // Query filter to be passed to chrome.tabs.query - see
//   // https://developer.chrome.com/extensions/tabs#method-query
//   var queryInfo = {
//     active: true,
//     currentWindow: true
//   };

//   chrome.tabs.query(queryInfo, (tabs) => {
//     // chrome.tabs.query invokes the callback with a list of tabs that match the
//     // query. When the popup is opened, there is certainly a window and at least
//     // one tab, so we can safely assume that |tabs| is a non-empty array.
//     // A window can only have one active tab at a time, so the array consists of
//     // exactly one tab.
//     var tab = tabs[0];

//     // A tab is a plain object that provides information about the tab.
//     // See https://developer.chrome.com/extensions/tabs#type-Tab
//     var url = tab.url;

//     // tab.url is only available if the "activeTab" permission is declared.
//     // If you want to see the URL of other tabs (e.g. after removing active:true
//     // from |queryInfo|), then the "tabs" permission is required to see their
//     // "url" properties.
//     console.assert(typeof url == 'string', 'tab.url should be a string');

//     callback(url);
//   });

//   // Most methods of the Chrome extension APIs are asynchronous. This means that
//   // you CANNOT do something like this:
//   //
//   // var url;
//   // chrome.tabs.query(queryInfo, (tabs) => {
//   //   url = tabs[0].url;
//   // });
//   // alert(url); // Shows "undefined", because chrome.tabs.query is async.
// }

/**
 * Change the background color of the current page.
 *
 * @param {string} color The new background color.
 */

// function changeBackgroundColor(color) {
//   var script = 'document.body.style.backgroundColor="' + color + '";';
//   // See https://developer.chrome.com/extensions/tabs#method-executeScript.
//   // chrome.tabs.executeScript allows us to programmatically inject JavaScript
//   // into a page. Since we omit the optional first argument "tabId", the script
//   // is inserted into the active tab of the current window, which serves as the
//   // default.
//   chrome.tabs.executeScript({
//     code: script
//   });
// }

/**
 * Gets the saved background color for url.
 *
 * @param {string} url URL whose background color is to be retrieved.
 * @param {function(string)} callback called with the saved background color for
 *     the given url on success, or a falsy value if no color is retrieved.
 */

// function getSavedBackgroundColor(url, callback) {
//   // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
//   // for chrome.runtime.lastError to ensure correctness even when the API call
//   // fails.
//   chrome.storage.sync.get(url, (items) => {
//     callback(chrome.runtime.lastError ? null : items[url]);
//   });
// }

/**
 * Sets the given background color for url.
 *
 * @param {string} url URL for which background color is to be saved.
 * @param {string} color The background color to be saved.
 */

// function saveBackgroundColor(url, color) {
//   var items = {};
//   items[url] = color;
//   // See https://developer.chrome.com/apps/storage#type-StorageArea. We omit the
//   // optional callback since we don't need to perform any action once the
//   // background color is saved.
//   chrome.storage.sync.set(items);
// }

// This extension loads the saved background color for the current tab if one
// exists. The user can select a new background color from the dropdown for the
// current page, and it will be saved as part of the extension's isolated
// storage. The chrome.storage API is used for this purpose. This is different
// from the window.localStorage API, which is synchronous and stores data bound
// to a document's origin. Also, using chrome.storage.sync instead of
// chrome.storage.local allows the extension data to be synced across multiple
// user devices.

// document.addEventListener('DOMContentLoaded', () => {
//   getCurrentTabUrl((url) => {
//     var dropdown = document.getElementById('dropdown');

//     // Load the saved background color for this page and modify the dropdown
//     // value, if needed.
//     getSavedBackgroundColor(url, (savedColor) => {
//       if (savedColor) {
//         changeBackgroundColor(savedColor);
//         dropdown.value = savedColor;
//       }
//     });

//     // Ensure the background color is changed and saved when the dropdown
//     // selection changes.
//     dropdown.addEventListener('change', () => {
//       changeBackgroundColor(dropdown.value);
//       saveBackgroundColor(url, dropdown.value);
//     });
//   });
// });

/**
 * Return all the text that is highlighted/selected
 *
 * @return [string] selected text contents.
 *
 * This function is directly attributed to
 * [Tim Down](https://stackoverflow.com/users/96100/tim-down)
 * From his comment on: https://stackoverflow.com/a/5670825/638153
 *
 */

// function getSelectionHtml() {
//     var html = "";
//     if (typeof window.getSelection != "undefined") {
//         var sel = window.getSelection();
//         if (sel.rangeCount) {
//             var container = document.createElement("div");
//             for (var i = 0, len = sel.rangeCount; i < len; ++i) {
//                 container.appendChild(sel.getRangeAt(i).cloneContents());
//             }
//             // html = container.innerHTML;
//             // html = container.innerText;
//             html = container.textContent;
//         }
//     } else if (typeof document.selection != "undefined") {
//         if (document.selection.type == "Text") {
//             html = document.selection.createRange().htmlText;
//         }
//     }
//     return html;
// }

function displayIt() {
  //
  // Setup and establish listeners
  //

  // var selText = getSelectionHtml();

  // $("body").children().each(function () {
  //     $(this).html( $(this).html().replace(/@/g,"$") );
  // });

  // https://stackoverflow.com/a/19165930/638153
  chrome.tabs.executeScript( {
    //       ^^
    // Was getting error: Unchecked runtime.lastError while running tabs.executeScript: Cannot access a chrome:// URL
    // This was due to testing directly on the actual 'chrome://extensions/' tab (pressing Ctrl-R and testing direct).
    code: "window.getSelection().toString();"
  }, function(selection) {
    // document.getElementById("pageText").value = selection[0];
    document.getElementById('charVal').value = typeof(selection) === 'undefined' ? '' : selection[0]; // Don't .trim()

    const charValLength = document.getElementById('charVal').value.length;

    document.getElementById('charCount').value = charValLength;

    if (charValLength > 0) {
      document.getElementById('pageCount-span').style.display = 'inline-block';
      document.getElementById('pageCharPct-span').style.display = 'inline-block';

      allSelectedCharCount = charValLength;
      setPageCharPct();

      // Once the HTML <input> tag is updated, begin the auto-rotation cycle
      autoChange();
    }
  });

  chrome.tabs.executeScript( {
    // Select all text on page: [Max G J Panas](https://stackoverflow.com/a/10606380/638153)
    code: "document.body.innerText;"
  }, function(selection) {

    console.log(selection[0].trim());
    document.getElementById('pageCount').value = selection[0].trim().length;
    document.getElementById('pageAllText').value = selection[0].trim();
    allPageCharCount = selection[0].trim().length;
    setPageCharPct();
  });

  // document.getElementById('charVal').value = selText;
  // document.getElementById('charCount').value = selText.length;
  // document.getElementById('pageText').value = document.body.textContent.length;
  document.getElementById('charVal').addEventListener('change', (e) => {
    // chrome.extension.getBackgroundPage().console.log('charVal change');
    // console.log('charVal change');

    // Don't update 'selected character' count when input text changes.
    // document.getElementById('charCount').value = document.getElementById('charVal').value.length;
  })

  // <input>: selected/input text
  document.getElementById('charVal').addEventListener('keyup', (e) => {
    // onkeyup="updateIt(this.value)"
    // console.log('charVal change: ', e.target.value, '_', initText, '_', e.target.value == initText, e.target.value === initText);
    // Check if value has changed from the global `initText` value (e.g., don't update for arrow key presses)
    if (e.target.value !== initText) {
      // console.log('charVal change IF: ', e.target.value !== initText);

      // Don't update 'selected character' count when input text changes.
      // document.getElementById('charCount').value = document.getElementById('charVal').value.length;
      updateIt(e.target.value);
    }
  })

  // <a>: Characters on Page
  document.getElementById('showPageText').addEventListener('click', (e) => {
    if (document.getElementById('pageAllText').style.display == 'none' ||
        document.getElementById('pageAllText').style.display == '') {

      // <textarea>: Show the collected page's text
      document.getElementById('pageAllText').style.display = 'inline-block';

      // Switch show/hide
      document.getElementById('showPageText').innerText = 'hide';
    } else {

      // <textarea>: Hide the collected page's text
      document.getElementById('pageAllText').style.display = 'none';

      // Switch show/hide
      document.getElementById('showPageText').innerText = 'show';
    }
    return false;
  })

  // <a>: converted text
  document.getElementById('convert0101').addEventListener('click', (e) => {
    convert0101();
    return false;
  })

  // <a>: 'make it stop!'
  document.getElementById('convert0000').addEventListener('click', (e) => {
    stopAutoConvert();
    return false;
  })

}

document.addEventListener('DOMContentLoaded', displayIt, false);
// window.onload = displayIt();

// document.addEventListener('mouseup', () => {
//   // chrome.extension.getBackgroundPage().console.log('window.selection mouseup');
//   console.log('window.selection mouseup');
//   displayIt();
// })
// document.addEventListener('keyup', () => {
//   // chrome.extension.getBackgroundPage().console.log('window.selection keyup');
//   console.log('window.selection keyup');
//   displayIt();
// })

/**
 * Convert Text
 */
let initText;

let whichConvert = 0, // ['ASCII (char)', 'ASCII (int)', '8-bit (Byte)']
    count = 0,
    nIntervId,
    allSelectedCharCount = 0,
    allPageCharCount = 0;

// document.addEventListener('DOMContentLoaded', autoChange, false);
// window.onload = autoChange();

// autoChange: Is called from the initial `displayIt()` function
// Once the HTML <input> tag is updated, this auto-rotation cycle can begin.
function autoChange() {
  // Could not get the `initText` to populate. `charVal` is always empty,
  // despite being inside 'DOMContentLoaded' (also tried window.load).
  // Solution was to move the `autoChange()` call into the
  // `executeScript` callback, directly after the input value is set.
  initText = document.getElementById('charVal').value;

  document.getElementById('ascii-div').style.display = 'block'; // Turn on entire 'convert block' section

  convert0101(); // Execute it initially, then `setTimer` will take over.
  nIntervId = setInterval(convert0101, 3000);
}

function stopAutoConvert() {
  // Clear the setInterval and show/hide the appropriate inline messages.
  clearInterval(nIntervId);
  document.getElementById('convert0001').style.display = 'none';   // Turn off message: 'make it stop'
  document.getElementById('convert1111').style.display = 'inline'; // Turn on message: 'click to convert'
}

function convert0101() {

  if (count == 2) { // Let it go 1 time around (3x each cycle; beginning with 0).
    stopAutoConvert();
  }
  count++; // Count will simply forever increase (but never again hit 2).

  if (whichConvert == 0) {

    // If whichConvert is 0; Set text as initial text
    // And move `whichConvert` to 1 (for ASCII (int))

    document.getElementById("convert010T").innerText = initText;
    whichConvert = 1;

  } else {

    // If whichConvert is 1 || 2 then
    // use either ASCII (int) || 8-bit conversion methods

    const newText = initText
      .split("")
      .reduce( (word, ltr, idx) => {
        if (whichConvert == 1) {

          /* Convert to ASCII */
          word[idx] = '' + ltr.charCodeAt().toString() + ' ';
        } else {

          /* Convert to 1-Byte bits */
          word[idx] = '' + ("000000000" + ltr.charCodeAt().toString(2)).substr(-8) + ' ';
        }
        return word;
      }, []).join().replace(/,/g, '');
    document.getElementById("convert010T").innerText = newText.substr(0, newText.length-2);

    // If whichConvert is currently 1 (ASCII (int)),
    // then set to 2; Else reset back to 0
    whichConvert = whichConvert == 1 ? 2 : 0;
  }
}

function updateIt(newVal) {
  if (count < 5) { // No need executing something if you know it's not running.
    stopAutoConvert();
  }

  document.getElementById('charCount-h4').innerText = 'Characters to Convert';

  initText = document.getElementById('charVal').value;          // Update global initial text

  if (newVal.length > 0) {
    document.getElementById('ascii-div').style.display = 'block'; // Turn ON entire 'convert block' section
    whichConvert = 0;                                             // Begin with ASCII (char) output
    convert0101();
  } else {
    document.getElementById('ascii-div').style.display = 'none';  // Turn OFF entire 'convert block' section
  }
}

function setPageCharPct() {
  let newVal = 0.00;
  if (allPageCharCount > 0) {
    newVal = (allSelectedCharCount / allPageCharCount);
  } else {
    newVal = 0;
  }
  document.getElementById('pageCharPct').value = (newVal * 100).toFixed(1) + '%';
}

function byteString(dec) {
  // `byteString()` attribution: [Ray Toal](https://stackoverflow.com/a/24337276/638153)
  if (dec < 0 || dec > 255 || dec % 1 !== 0) {
    throw new Error(dec + " does not fit in a byte");
  }
  return ("000000000" + dec.toString(2)).substr(-8)
}
