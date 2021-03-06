(() => {
'use strict';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GAME = document.getElementById('game');

let keyListener = null;

// https://www.rosettacode.org/wiki/Knuth_shuffle#JavaScript
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    let rand = Math.floor((i + 1) * Math.random());
    let temp = arr[rand];
    arr[rand] = arr[i];
    arr[i] = temp;
  }
  return arr;
}

// ensures there are no fixed points
function shuffleAlphabet() {
  const shuffled = shuffle(ALPHABET.split(''));
  return shuffled.some((letter, i) => letter === ALPHABET[i]) ?
      shuffleAlphabet() :
      shuffled;
}

// "cipher" == bijective map acting on the alphabet
function generateCipher() {
  const randAlphabet = shuffleAlphabet();
  return Array.prototype.reduce.call(ALPHABET, (cipher, letter, i) => {
    cipher[letter] = randAlphabet[i];
    return cipher;
  }, {});
}

// used to encrypt/decrypt
function applyCipher(text, cipher) {
  return Array.prototype.map.call(text, char => {
    return char in cipher ? cipher[char] : char;
  }).join('');
}

function restart(text) {
  if (keyListener) {
    GAME.removeEventListener('keydown', keyListener);
  }

  // generate encrypted version
  text = text.toUpperCase();
  const cipher = generateCipher();
  const encrypted = applyCipher(text, cipher);

  // display game
  GAME.innerHTML = encrypted.split('').map(char => {
    const glyph = char === ' ' ? '&nbsp;' : char;
    return `<div class="char">
      <div>${glyph}</div>
      <div ${char in cipher ? `contenteditable class="${char}"` : ''}>
        ${char in cipher ? '' : glyph}
      </div>
    </div>`;
  }).join('');

  // listen for keystrokes
  const editables = Array.from(GAME.querySelectorAll('[contenteditable]'));
  keyListener = handleKeydown.bind(null, cipher, editables);
  GAME.addEventListener('keydown', keyListener);
  editables[0].focus();
}

// handle keystrokes in editable elements
function handleKeydown(cipher, editables, event) {
  const el = event.srcElement;
  let i;
  if (el.isContentEditable) {
    const key = event.key.toUpperCase();
    switch (key) {
      case 'TAB':
      case 'ESCAPE':
        return;
      case 'ARROWLEFT':
        i = editables.indexOf(el);
        if (i > 0) {
          editables[i - 1].focus();
        }
        break;
      case 'ARROWRIGHT':
        i = editables.indexOf(el);
        if (i + 1 < editables.length) {
          editables[i + 1].focus();
        }
        break;
      case 'BACKSPACE':
      case 'DELETE':
        setTextOnClass(el.className, '');
        break;
      default:
        if (key in cipher) {
          setTextOnClass(el.className, key);
          i = editables.indexOf(el);
          const increment = 1 + editables.slice(i + 1).findIndex(editable => {
            return editable.className !== el.className;
          });
          if (increment > 0) {
            editables[i + increment].focus();
          }
        }
    }
    event.preventDefault();
  }
}

function setTextOnClass(className, text) {
  GAME.querySelectorAll('.' + className).forEach(el => {
    el.innerText = text;
  });
}

const MESSAGES = [
  'A word of kindness is seldom spoken in vain, while witty sayings are as easily lost as the pearls slipping from a broken string.',
];
document.getElementById('restart').addEventListener('click', () => {
  restart(MESSAGES[0]);
});
restart(MESSAGES[0]);
})();
