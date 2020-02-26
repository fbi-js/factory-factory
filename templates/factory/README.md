# <%= project.name %>

<%= project.description %>

> This project is generated via&nbsp;[fbi](https://github.com/fbi-js/fbi)&nbsp; <%_ if (factory.url) { _%> [<%= factory.id %>](<%= factory.url %>) <%_ } else { _%> <%= factory.id %> <%_ } _%>

## Development

- watch
  ```bash
  $ fbi w
  # or
  $ npm run watch
  ```
- build
  ```bash
  $ fbi b
  # or
  $ npm run build
  ```
- commit
  ```bash
  $ fbi commit
  ```

## Usage

- Add to fbi
  ```bash
  $ fbi add <%= project.name %>
  ```

## Semver

This project is following [Semantic Versioning 2.0](https://semver.org/).

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
