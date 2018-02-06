/**
 * Character Counts
 *
 * This extension allows the user to see how many characters are in a selection's range.
 *
 * It will also convert characters between ASCII (char), ASCII (int), && 8-bit (Byte).
 *
 * Developer: Keith D Commiskey (https://kdcinfo.com) 2017-10; 2018-02
 *
 */

// The files in this extension were based on and created from:
  // https://developer.chrome.com/extensions/getstarted
  // Copyright (c) 2014 The Chromium Authors. All rights reserved.
  // Use of this source code is governed by a BSD-style license
  // that can be found in the LICENSE file.

let initText,
    initSource = 'ac',
    c0001;

let whichConvert = 0, // [0: 'ASCII (char)', 1: 'ASCII (int)', 2: '8-bit (Byte)']
    count = 0,
    nIntervId,
    allSelectedCharCount = 0,
    allPageCharCount = 0;

function displayIt() {

  c0001 = document.getElementById('convert0001');

  //
  // Get Selected Text on Page
  //

  chrome.tabs.executeScript( {

    // Getting selection from active tab/page: [rsanchez](https://stackoverflow.com/a/19165930/638153)
    code: "window.getSelection().toString();"

  }, function(selection) {

    if (chrome.runtime.lastError) {

      document.getElementById('container').style.display = 'none';
      document.getElementById('containerError').style.display = 'block';
      document.getElementById('containerErrorTxt').innerHTML = chrome.runtime.lastError.message;
      // console.log('chrome.tabs', chrome.runtime.lastError);

    } else {

      // Place selected text (from web page) into input field (in extension popup)
      document.getElementById('charVal').value = typeof(selection) === 'undefined' ? '' : selection[0];

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
    }
  });

  //
  // Get Page Text and Calc Perctentage
  //

  chrome.tabs.executeScript( {

    // Select all text on page: [Max G J Panas](https://stackoverflow.com/a/10606380/638153)
    code: "document.body.innerText;"

  }, function(selection) {

    if (chrome.runtime.lastError) {

      document.getElementById('container').style.display = 'none';
      document.getElementById('containerError').style.display = 'block';
      document.getElementById('containerErrorTxt').innerHTML = chrome.runtime.lastError.message;
      // console.log('chrome.tabs', chrome.runtime.lastError);

    } else {

      document.getElementById('pageCount').value = selection[0].trim().length;
      document.getElementById('pageAllText').value = selection[0].trim();

      allPageCharCount = selection[0].trim().length;
      setPageCharPct();
    }
  });

  //
  // Set Listeners
  //

  // <input>: selected/input text
  document.getElementById('charVal').addEventListener('change', (e) => {
    // Check if value has changed from the global `initText` value (e.g., don't update for arrow key presses)
    if (initSource === 'ac' && e.target.value !== initText) {
      // initSource === 'ac' // Only auto-update conversion on ASCII(char)
      updateIt(e.target.value);
    }
  });

  // <input>: selected/input text
  document.getElementById('charVal').addEventListener('keyup', (e) => {
    // Check if value has changed from the global `initText` value (e.g., don't update for arrow key presses)
    if (initSource === 'ac' && e.target.value !== initText) {
      // initSource === 'ac' // Only auto-update conversion on ASCII(char)
      updateIt(e.target.value);
    }
  });

  // <a>: Characters on Page
  document.getElementById('showPageText').addEventListener('click', (e) => {
    if (document.getElementById('pageAllText').style.display === 'none' ||
        document.getElementById('pageAllText').style.display === '') {

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
  });

  // <a>: "convert" it text
  document.getElementById('convert0101').addEventListener('click', (e) => {
    initText = document.getElementById('charVal').value;
    convert0101();
    return false;
  });

  // <a>: 'make it stop!'
  document.getElementById('convert0000').addEventListener('click', (e) => {
    stopAutoConvert();
    return false;
  });

  // <a>: All 3 radio buttons [ASCII(char), ASCII(int), Binary]
  document.getElementsByName('convert-source')[0].addEventListener('click', (e) => {
    changeSource(e.target.value, e.target.checked);
    return false;
  });
  document.getElementsByName('convert-source')[1].addEventListener('click', (e) => {
    stopAutoConvert();
    changeSource(e.target.value, e.target.checked);
    return false;
  });
  document.getElementsByName('convert-source')[2].addEventListener('click', (e) => {
    stopAutoConvert();
    changeSource(e.target.value, e.target.checked);
    return false;
  });
}

/**
 * Let the FUN Begin!!
 */

document.addEventListener('DOMContentLoaded', displayIt, false);

/**
 * Change Source
 */

// changeSource
function changeSource(thisVal, thisChecked) {
  // console.log(thisChecked, thisVal); // thisVal === 'ac', 'ai', 'b'
  if (thisChecked && thisVal !== initSource) {
    updateMessage(thisVal);
    turnOnMessage();
    initSource = thisVal;
  }
}

function updateMessage(thisVal) {
  if (thisVal === 'ac') {
    _updateMsgText('Enter characters above');
  } else if (thisVal === 'ai') {
    _updateMsgText('Enter space-delimited (int)ASCII above; Click \'Convert\'');
  } else {
    _updateMsgText('Enter space-delimited binary above; Click \'Convert\'');
  }
}

function _updateMsgText(newText) {
  // Only called as a helper function to: updateMessage()
  c0001.innerText = newText;
}

function turnOnMessage() {
  c0001.style = 'color: #66AA33;';
  c0001.style.display = 'block'; // Turn back on message
}

/**
 * Convert Text
 */

// autoChange: Is called from the initial `displayIt()` function
// Once the HTML <input> tag is updated, this auto-rotation cycle can begin.
function autoChange() {
  initText = document.getElementById('charVal').value;

  document.getElementById('ascii-div').style.display = 'block'; // Turn on entire 'convert block' section

  convert0101(); // Initially execute primary function - Then `setTimer` will take over.
  nIntervId = setInterval(convert0101, 3000); // 3-second wait between auto-conversions.
}

function stopAutoConvert() { // Clear the `setInterval` and show/hide the appropriate inline messages.
  count = 99; // Set count above all logic checkers (usually looking for count < 2)
  clearInterval(nIntervId);
  document.getElementById('convert0001').style.display = 'none';   // Turn off message: 'make it stop'
  document.getElementById('convert1111').style.display = 'inline'; // Turn on message: '<-- convert'
  updateMessage(initSource);
}

//
// The Primary Function
//

function convert0101() {

  if (count === 2) { // Let it go 1 time around (3x each cycle; beginning with 0; 5 would be 2 rounds).
    stopAutoConvert();
  }
  count++; // Count will simply forever increase (but never again hit 2).

  let newText = '';

  // whichConvert: [0: 'ASCII (char)', 1: 'ASCII (int)', 2: '8-bit (Byte)']

  whichConvert = (whichConvert === 0) ? 1 : (whichConvert === 1) ? 2 : 0;
    // ^^
    // If `whichConvert` is currently 0; Set to 1 // ASCII (char) --> ASCII (int)
    // If `whichConvert` is currently 1; Set to 2 // ASCII (int) --> Binary
    // If `whichConvert` is currently 2; Set to 0 // Binary --> ASCII (char)

  let activeConvert = (whichConvert === 0) ? 'ac' : (whichConvert === 1) ? 'ai' : 'b',
      getRadios = document.querySelectorAll('.convert-source'),
      getRadio = document.querySelector('.convert-radio-' + activeConvert).parentElement;

  getRadios.forEach( thisRadio => thisRadio.style.borderBottom = '0px solid #000000' );
  getRadio.style.borderBottom = '1px solid #000000';

  if ((whichConvert === 0 && initSource === 'ac') ||
      (whichConvert === 1 && initSource === 'ai') ||
      (whichConvert === 2 && initSource === 'b') // 'b'inary
     ) {
    // Convert to ASCII(char) from ASCII(char) ||
    // Convert to ASCII(int) from ASCII(int) ||
    // Convert to Binary from Binary
    newText = initText;

  } else if (whichConvert === 0) {
    if (initSource === 'ai') {
      // Convert to ASCII(char) from ASCII(int)
      newText = convertAItoAC();
    } else if (initSource === 'b') {
      // Convert to ASCII(char) from Binary
      newText = convertBtoAC();
    }

  } else if (whichConvert === 1) {
    if (initSource === 'ac') {
      // Convert to ASCII(int) from ASCII(char)
      newText = convertAtoAIB(whichConvert);
      newText = newText.substr(0, newText.length-1);
    } else if (initSource === 'b') {
      // Convert to ASCII(int) from Binary
      newText = convertBtoAI();
    }

  } else if (whichConvert === 2) {
    if (initSource === 'ac') {
      // Convert to Binary from ASCII(char)
      newText = convertAtoAIB(whichConvert);
      newText = newText.substr(0, newText.length-1);
    } else if (initSource === 'ai') {
      // Convert to Binary from ASCII(int)
      newText = convertAItoB();
    }

  }

  document.getElementById("convert010T").innerText = newText;
}

function convertAItoAC() {
  return initText
    .split(" ")
    .reduce( (word, ltr, idx) => {
      word[idx] = String.fromCharCode(ltr);
      return word;
    }, []).join(''); // .replace(/,/g, '');
}

function convertAItoB() {
  return initText
    .split(" ")
    .reduce( (word, ltr, idx) => {
      word[idx] = byteString(parseInt(ltr, 10));
      return word;
    }, []).join(' '); // .replace(/,/g, '');
}

function convertBtoAC() {
  return initText
    .split(" ")
    .reduce( (word, ltr, idx) => {
      // Thanks to: https://stackoverflow.com/a/21354328/638153
      word[idx] = String.fromCharCode(parseInt(ltr, 2).toString(10)); // <--^^^
      return word;
    }, []).join(''); // .replace(/,/g, '');
}

function convertBtoAI() {
  return initText
    .split(" ")
    .reduce( (word, ltr, idx) => {
      // Thanks to: https://stackoverflow.com/a/21354328/638153
      word[idx] = parseInt(ltr, 2).toString(10); // <--^^^
      return word;
    }, []).join(' '); // .replace(/,/g, '');
}

function convertAtoAIB(whichConvert) {
  return initText
    .split("")
    .reduce( (word, ltr, idx) => {
      if (whichConvert === 1) {

        /* Convert to ASCII */
        word[idx] = '' + ltr.charCodeAt().toString() + ' ';
      } else {

        /* Convert to 1-Byte bits */
        // word[idx] = '' + ("000000000" + ltr.charCodeAt().toString(2)).substr(-8) + ' ';
        word[idx] = '' + byteString(ltr.charCodeAt()) + ' ';
      }
      return word;
    }, []).join().replace(/,/g, '');
}

function updateIt(newVal) {
  if (count < 2) { // No need executing something if you know it's not running.
    stopAutoConvert();
  }

  document.getElementById('charCount-h4').innerText = 'Characters to Convert';
  turnOnMessage();

  initText = document.getElementById('charVal').value;            // Update global initial text

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
    // throw new Error(dec + " does not fit in a byte");
    console.error("[ " + dec + " ] does not fit in a byte");
    return "00100000"; // Return a space
  }
  return ("000000000" + dec.toString(2)).substr(-8);
}
