[![][travis-img]][travis-url] [![][npm-img]][npm-url] [![][codacy-img]][codacy-url] [![][xo-img]][xo-url] [![][cc-img]][cc-url]

# ng-inject-decorator

This package provides a [decorator](https://github.com/tc39/proposal-decorators) which can be used to make [dependency injection](https://docs.angularjs.org/guide/di) with [classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) easier.

## Installation

This package requires `babel-plugin-transform-decorators-legacy`.

```bash
$ yarn add -D babel-plugin-transform-decorators-legacy
$ yarn add @darkobits/ng-inject-decorator
```

or

```bash
$ npm install --save-dev babel-plugin-transform-decorators-legacy
$ npm install --save @darkobits/ng-inject-decorator
```

Then, update your `.babelrc` file:

```
{
  "plugins": ["transform-decorators-legacy"]
}
```

## Features

- Classes express their dependencies in a single place, without incurring constructor bloat.
- Providing dependencies to parent classes is trivial.
- Parent classes and child classes that use the same dependency can (and should) declare it; `inject` will take care of de-duping for you.

## Usage

#### `default(...dependencies: Array<string>): function`

This package's default export is a function that accepts an arbitrary number of string arguments representing dependencies to be injected into the decorated class upon instantiation, and returns a decorator function.

### Example

First, let's look at how dependency injection is typically handled in Angular 1 when using classes:

```js
import angular from 'angular';

class MyCtrl {
  // 1. Declare dependencies as constructor arguments.
  constructor ($document, $http, $q) {
    // 2. Attach each dependency to the instance.
    this.$document = $document;
    this.$http = $http;
    this.$q = $q;
  }

  someMethod () {
    // 3. Use dependencies in controller methods.
    this.$http({
      // ...
    });
  }
}

angular.module('MyApp').component({
  controller: MyCtrl,
  // ...
});
```

This approach is fairly verbose because it requires each additional dependency be added as a constructor argument and then manually attached to the controller instance in the constructor.

Another problem with this approach is that `extend`-ing a parent class that may also need to use dependency injection is awkward:

> `ParentCtrl.js`

```js
export default class ParentCtrl {
  // Some method that needs $element.
  parentMethod () {
    this.$element; // ...
  }
}
```

> `MyComponent.js`

```js
import angular from 'angular';
import ParentCtrl from './ParentCtrl.js';

class MyCtrl extends ParentCtrl {
  constructor ($document, $element, $http, $q) {
    this.$document = $document;
    this.$http = $http;
    this.$q = $q;

    // MyCtrl needs to declare $element as a dependency, even though it doesn't
    // use it directly, so that ParentCtrl will have access to it. Meanwhile,
    // ParentCtrl must assume that classes that extend it will declare $element
    // as a dependency.
    this.$element = $element;
  }

  // Implement methods that use $document, $http, $q...
}

angular.module('MyApp').component({
  controller: MyCtrl,
  // ...
});
```

Let's see how we can improve this with the `inject` decorator:

> `ParentCtrl.js`

```js
import inject from '@darkobits/ng-inject-decorator';

@inject('$element')
export default class ParentCtrl {
  // Some method that needs $element.
  parentMethod () {
    this.$element; // ...
  }
}
```

> `MyComponent.js`

```js
import ParentCtrl from './ParentCtrl.js';

@inject('$document', '$http', '$q')
class MyCtrl extends ParentCtrl {
  myMethod () {
    // Do something with this.$document, this.$http, this.$q...
  }
}

angular.module('MyApp').component({
  controller: MyCtrl,
  // ...
});
```

_Wowza!_ We did such a good job of reducing constructor bloat that we were able to eliminate them entirely!

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>

[travis-img]: https://img.shields.io/travis/darkobits/ng-inject-decorator.svg?style=flat-square
[travis-url]: https://travis-ci.org/darkobits/ng-inject-decorator

[npm-img]: https://img.shields.io/npm/v/@darkobits/ng-inject-decorator.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@darkobits/ng-inject-decorator

[codacy-img]: https://img.shields.io/codacy/coverage/8cf3c53ed5124385964e7d053cb90e82.svg?style=flat-square
[codacy-url]: https://www.codacy.com/app/darkobits/ng-inject-decorator

[xo-img]: https://img.shields.io/badge/code_style-XO-e271a5.svg?style=flat-square
[xo-url]: https://github.com/sindresorhus/xo

[cc-img]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square
[cc-url]: https://conventionalcommits.org/
