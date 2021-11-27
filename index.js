
export function splitCmd(str, options) {
  options = options || {};
  const s = {
    argv: [],
    arg: '',
    caputring: false,
    doubleQuotes: {
      start: false,
      end: false
    },
    singleQuotes: {
      start: false,
      end: false
    },
    backslash: false,
    keepQuotes: options.keepQuotes === true
  };

  str = str.replace('\r\n', '\n').replace('\r', '');

  for (let i = 0, l = str.length; i < l; i++) {
    const c = str[i];
    switch(c) {
      case '\\':
        handleBackwardSlash(s, c);
        break;
      case ' ':
      case '\t':
        handleSpace(s, c);
        break;
      case '"':
        handleDoubleQuote(s, c);
        break;
      case '\'':
        handleSingleQuote(s, c);
        break;
      case '\n':
        handleLineFeed(s, c);
        break;
      default:
        s.caputring = true;
        eatChar(s, c);
    }
  }

  if (s.caputring) {
    reapArg(s);
  }

  return s.argv;
}

/**
 * @typedef State
 * @property {string[]} argv
 * @property {string} arg
 * @property {boolean} caputring
 * @property {{start: boolean; end: boolean;}} doubleQuotes
 * @property {{start: boolean; end: boolean;}} singleQuotes
 * @property {boolean} backslash
 * @property {boolean} keepQuotes
 */

/**
 *
 * @param {State} s
 * @param {string} c
 */
function handleBackwardSlash(s, c) {
  if (!s.caputring) {
    if (s.backslash) {
      s.caputring = true;
    }
    eatBackslash(s, c);
    return;
  }

  if (s.doubleQuotes.start) {
    if (s.doubleQuotes.end) {
      resetQuoteState(s, 'doubleQuotes');
      s.backslash = true;
    } else {
      eatBackslash(s, c);
    }
    return;
  }

  if (s.singleQuotes.start) {
    if (s.singleQuotes.end) {
      resetQuoteState(s, 'singleQuotes');
      s.backslash = true;
    } else {
      s.arg += c;
    }
    return;
  }

  eatBackslash(s, c);
}
/**
 *
 * @param {State} s
 * @param {string} c
 */
function handleSpace(s, c) {
  if (!s.caputring) {
    if (s.backslash) {
      s.caputring = true;
      s.backslash = false;
      s.arg += '\\' + c;
    }
    return;
  }

  if (
    (s.doubleQuotes.end || s.singleQuotes.end)
    || (!s.backslash && !s.doubleQuotes.start && !s.singleQuotes.start)
  ) {
    reapArg(s);
    return;
  }

  eatChar(s, c);
}
/**
 *
 * @param {State} s
 * @param {string} c
 */
function handleDoubleQuote(s, c) {
  if (!s.caputring) {
    s.caputring = true;
    eatQuote(s, c, 'doubleQuotes', 'start');
    return;
  }

  if (s.singleQuotes.start) {
    if (s.singleQuotes.end) {
      resetAndEatQuote(s, c, 'singleQuotes', 'doubleQuotes');
    } else {
      s.arg += c;
    }
    return;
  }

  if (s.doubleQuotes.start) {
    if (s.doubleQuotes.end) {
      resetAndEatQuote(s, c, 'doubleQuotes', 'doubleQuotes');
    } else {
      eatQuote(s, c, 'doubleQuotes', 'end');
    }
    return;
  }

  eatQuote(s, c, 'doubleQuotes', 'start');
}
/**
 *
 * @param {State} s
 * @param {string} c
 */
function handleSingleQuote(s, c) {
  if (!s.caputring) {
    s.caputring = true;
    eatQuote(s, c, 'singleQuotes', 'start');
    return;
  }

  if (s.doubleQuotes.start) {
    if (s.doubleQuotes.end) {
      resetAndEatQuote(s, c, 'doubleQuotes', 'singleQuotes');
    } else {
      s.arg += c;
    }
    return;
  }

  if (s.singleQuotes.start) {
    if (s.singleQuotes.end) {
      resetAndEatQuote(s, c, 'singleQuotes', 'singleQuotes');
    } else {
      s.singleQuotes.end = true;
      if (s.keepQuotes) {
        s.arg += c;
      }
    }
    return;
  }

  eatQuote(s, c, 'singleQuotes', 'start');
}
/**
 *
 * @param {State} s
 * @param {string} c
 */
function handleLineFeed(s, c) {
  if (!s.caputring) {
    if (s.backslash) {
      s.backslash = false;
    }
    return;
  }

  if (s.backslash) {
    s.backslash = false;
  } else {
    s.arg += c;
  }
}

/**
 *
 * @param {State} s
 * @param {'doubleQuotes'|'singleQuotes'} type
 */
function resetQuoteState(s, type) {
  s[type].start = false;
  s[type].end = false;
}

/**
 *
 * @param {State} s
 * @param {string} c
 */
function eatBackslash(s, c) {
  if (s.backslash) {
    s.arg += c;
  }
  s.backslash = !s.backslash;
}

/**
 *
 * @param {State} s
 */
function reapArg(s) {
  s.argv.push(s.arg);
  s.arg = '';
  s.caputring = false;
  resetQuoteState(s, 'doubleQuotes');
  resetQuoteState(s, 'singleQuotes');
}

/**
 *
 * @param {State} s
 * @param {string} c
 */
function eatChar(s, c) {
  if (s.backslash) {
    s.backslash = false;
    s.arg += '\\';
  }
  s.arg += c;
}

/**
 *
 * @param {State} s
 * @param {string} c
 * @param {'doubleQuotes'|'singleQuotes'} type
 * @param {'start'|'end'} position
 */
function eatQuote(s, c, type, position) {
  if (s.backslash) {
    s.backslash = false;
    if (s.keepQuotes) {
      s.arg += '\\' + c;
    } else {
      s.arg += c;
    }
  } else {
    s[type][position] = true;
    if (s.keepQuotes) {
      s.arg += c;
    }
  }
}

/**
 *
 * @param {State} s
 * @param {string} c
 * @param {'doubleQuotes'|'singleQuotes'} resetType
 * @param {'doubleQuotes'|'singleQuotes'} eatType
 */
function resetAndEatQuote(s, c, resetType, eatType) {
  resetQuoteState(s, resetType);
  s[eatType].start = true;
  if (s.keepQuotes) {
    s.arg += c;
  }
}
