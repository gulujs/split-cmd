
function splitCmd(str, options) {
  options = options || {};
  const s = {
    argv: [],
    arg: '',
    caputring: false,
    startOfDoubleQuotes: false,
    endOfDoubleQuotes: false,
    startOfSingleQuotes: false,
    endOfSingleQuotes: false,
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

function handleBackwardSlash(s, c) {
  if (!s.caputring) {
    if (s.backslash) {
      s.caputring = true;
    }
    eatBackslash(s, c);
    return;
  }

  if (s.startOfDoubleQuotes) {
    if (s.endOfDoubleQuotes) {
      resetQuoteState(s, 'Double');
      s.backslash = true;
    } else {
      eatBackslash(s, c);
    }
    return;
  }

  if (s.startOfSingleQuotes) {
    if (s.endOfSingleQuotes) {
      resetQuoteState(s, 'Single');
      s.backslash = true;
    } else {
      s.arg += c;
    }
    return;
  }

  eatBackslash(s, c);
}
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
    (s.endOfDoubleQuotes || s.endOfSingleQuotes)
    || (!s.backslash && !s.startOfDoubleQuotes && !s.startOfSingleQuotes)
  ) {
    reapArg(s);
    return;
  }

  eatChar(s, c);
}
function handleDoubleQuote(s, c) {
  if (!s.caputring) {
    s.caputring = true;
    eatDoubleQuote(s, c, 'start');
    return;
  }

  if (s.startOfSingleQuotes) {
    if (s.endOfSingleQuotes) {
      resetAndEatQuote(s, c, 'Single', 'Double');
    } else {
      s.arg += c;
    }
    return;
  }

  if (s.startOfDoubleQuotes) {
    if (s.endOfDoubleQuotes) {
      resetAndEatQuote(s, c, 'Double', 'Double');
    } else {
      eatDoubleQuote(s, c, 'end');
    }
    return;
  }

  eatDoubleQuote(s, c, 'start');
}
function handleSingleQuote(s, c) {
  if (!s.caputring) {
    s.caputring = true;
    eatStartOfSingleQuote(s, c);
    return;
  }

  if (s.startOfDoubleQuotes) {
    if (s.endOfDoubleQuotes) {
      resetAndEatQuote(s, c, 'Double', 'Single');
    } else {
      s.arg += c;
    }
    return;
  }

  if (s.startOfSingleQuotes) {
    if (s.endOfSingleQuotes) {
      resetAndEatQuote(s, c, 'Single', 'Single');
    } else {
      s.endOfSingleQuotes = true;
      if (s.keepQuotes) {
        s.arg += c;
      }
    }
    return;
  }

  eatStartOfSingleQuote(s, c);
}
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

function resetQuoteState(s, type) {
  s[`startOf${type}Quotes`] = false;
  s[`endOf${type}Quotes`] = false;
}

function eatBackslash(s, c) {
  if (s.backslash) {
    s.arg += c;
  }
  s.backslash = !s.backslash;
}

function reapArg(s) {
  s.argv.push(s.arg);
  s.arg = '';
  s.caputring = false;
  s.startOfDoubleQuotes = false;
  s.endOfDoubleQuotes = false;
  s.startOfSingleQuotes = false;
  s.endOfSingleQuotes = false;
}

function eatChar(s, c) {
  if (s.backslash) {
    s.backslash = false;
    s.arg += '\\';
  }
  s.arg += c;
}

function eatDoubleQuote(s, c, position) {
  if (s.backslash) {
    s.backslash = false;
    if (s.keepQuotes) {
      s.arg += '\\' + c;
    } else {
      s.arg += c;
    }
  } else {
    s[`${position}OfDoubleQuotes`] = true;
    if (s.keepQuotes) {
      s.arg += c;
    }
  }
}

function eatStartOfSingleQuote(s, c) {
  if (s.backslash) {
    s.backslash = false;
    if (s.keepQuotes) {
      s.arg += '\\' + c;
    } else {
      s.arg += c;
    }
  } else {
    s.startOfSingleQuotes = true;
    if (s.keepQuotes) {
      s.arg += c;
    }
  }
}

function resetAndEatQuote(s, c, resetType, eatType) {
  resetQuoteState(s, resetType);
  s[`startOf${eatType}Quotes`] = true;
  if (s.keepQuotes) {
    s.arg += c;
  }
}

module.exports = {
  splitCmd
};
