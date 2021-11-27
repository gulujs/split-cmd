# @lunjs/split-cmd

> Split a string into an array, like as `process.argv`.

## Installation

```
npm install @lunjs/archy
```

## Usage

```js
import { splitCmd } from '@lunjs/split-cmd';

const command = `git commit -m "hello \
world!

This is a message."`;

console.log(splitCmd(command));
// Output:
// ['git', 'commit', '-m', 'hello world!\n\nThis is a message.']
```

## License

- [MIT](LICENSE)
