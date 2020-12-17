# factory-factory

factory for fbi factory development

> This is a factory for [fbi v4](https://github.com/fbi-js/fbi).


## Requirements

- `node v10+`

## Usage

```bash
npx fbi create @fbi-js/factory-factory
```

## Templates

- `factory`: template for fbi factory development

## Commands

- `watch`: watching for file changes (typescript only)

  ```bash
  fbi w
  ```

- `build`: build for production (typescript only)

  ```bash
  fbi b
  ```

## Development

Build your own `factory-factory` based on `@fbi-js/factory-factory`.

Create a project

```bash
npx fbi create @fbi-js/factory-factory

npm i @fbi-js/factory-factory
```

Create and modify files

```ts
// src/index.ts

import FactoryBase from '@fbi-js/factory-factory'

import CommandX from './commands/my-command'
import TemplateX from './templates/my-template'

const { name, description } = require('../package.json')

export default class FactoryCool extends FactoryBase {
  id = name
  description = description

  // 1. replace default commands
  commands = [new CommandX(this)]
  templates = [new TemplateX(this)]

  constructor() {
    super()

    // 2. OR: extends default commands
    // this.commands.push(new CommandX(this))
    // this.templates.push(new TemplateX(this))
  }
}
```

Compile ts files

```bash
yarn build
```

Test

```bash
fbi link
```

```bash
fbi create
```

## [Changelog](./CHANGELOG.md)

## Contribution

Please make sure to read the [Contributing Guide](./CONTRIBUTING.md) before making a pull request.

Thank you to all the people who already contributed to fbi factory!

## License

Licensed under [MIT](https://opensource.org/licenses/MIT).

