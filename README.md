# @lunjs/split-cmd

> Split a string into an array, like as `process.argv`.

## Installation

```
npm install @lunjs/archy
```

## Usage

```
const { splitCmd } = require('@lunjs/split-cmd');

const command = `git commit -m "hello \
world!

This is a message."`;

console.log(splitCmd(command));
// Output:
// ['git', 'commit', '-m', 'hello world!\n\nThis is a message.']
```

## License

- [MIT](https://github.com/lunjs/split-cmd/blob/master/LICENSE)
