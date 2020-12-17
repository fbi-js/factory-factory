# Contribute Guide

## Pull Request Guidelines

- Checkout a topic branch from `main` branch, and merge back against that branch.
- Work in the `src` and `templates` folders.
- Use [fbi commit](https://github.com/fbi-js/factory-commands/blob/main/src/commands/commit/README.md) to commit your code.

    ```bash
    # install
    npx fbi add factory-commands
    # usage
    npx fbi commit
    ```

## Development

- Setup

   ```bash
   npm i -g fbi
   yarn

   # link local factory to global env, so you can use it everywhere in terminal. (like `npm link`)
   fbi link
   ```

- Start development

   ```bash
   yarn dev
   ```

## Test

- Create an examples folder

  ```bash
  cd [project-root]
  mkdir examples
  cd examples
  ```

- Create a project

  ```bash
  fbi create
  ```

  Exit when showing `Installing dependencies...` in terminal.

- Change project to use local deps. In project's package.json `devDependencies`

  ```json
  <!-- before -->
  {
    "@fbi-js/factory-node": "^2.0.3"
  }

  <!-- after -->
  {
    "@fbi-js/factory-node": "file:../" <!-- relative to factory-node's root -->
  }
  ```

- Install dependencies

  ```bash
  npm i
  ```

- Run npm scripts

  ```bash
  yarn dev

  yarn build
  ```

## Project Structure


- `src`
  - `index.ts`: factory class entry file. It extends [`fbi` `Factory`](https://github.com/fbi-js/fbi).
  - `src/commands`: contains all executable commands which extends [`fbi` `Command`](https://github.com/fbi-js/fbi).
  - `src/templates`: contains all templates which extends [`fbi` `Template`](https://github.com/fbi-js/fbi).
- `templates`: contains all static files of each template, used by `src/templates`.
