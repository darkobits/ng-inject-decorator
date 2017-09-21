import classDecorator from '@darkobits/class-decorator';

/**
 * @private
 *
 * Provided any number of arrays, returns a new array containing the unique set
 * of elements from each array.
 *
 * @param  {...[array]} arrays
 * @return {array}
 */
function unique(...arrays) {
  const ret = new Set();

  arrays.forEach(arr => {
    if (arr.length > 0) {
      arr.forEach(i => ret.add(i));
    }
  });

  return Array.from(ret);
}

/**
 * @private
 *
 * Provided a class, constructor function, or prototype object, traverses up the
 * prototype chain invoking the provided callback for each prototype
 * encountered, except Object (the root prototype).
 *
 * @param  {function} callback
 * @param  {function|object} ctorOrProto
 */
function traversePrototypeChain(callback, ctorOrProto) {
  function getPrototype(value) {
    return typeof value === 'function' ? value.prototype : Object.getPrototypeOf(value);
  }

  const proto = getPrototype(ctorOrProto);
  const nextProto = getPrototype(proto);

  if (nextProto) {
    callback(proto);
    traversePrototypeChain(callback, proto);
  }
}

/**
 * Provided any number of dependencies, returns a class decorator that will
 * attach dependencies to class instances. The decorator will also inject any
 * dependencies (declared using this decorator or with the $inject property) of
 * any classes the target class inherits from.
 *
 * @param  {...[string]} dependencies
 * @return {function}
 */
export default function inject(...dependencies) {
  // Ensure we were provided a list of strings.
  dependencies.forEach(dependency => {
    if (typeof dependency !== 'string') {
      throw new TypeError(`[Inject] Expected dependency to be of type "String", got: ${typeof dependency}.`);
    }
  });

  return classDecorator(decoratedClass => {
    let ancestorDependencies = [];

    traversePrototypeChain(proto => {
      // Read the $inject key of each constructor in the prototype chain.
      ancestorDependencies = ancestorDependencies.concat(proto.constructor.$inject || []);
    }, decoratedClass.prototype);

    class AngularDI {
      constructor(...args) {
        // If we were invoked with the name number of arguments as items in our
        // $inject key, it means we are decorating the class being instantiated,
        // and should handle attaching dependencies. Otherwise, it means we are
        // an ancestor of the class being instantiated and should pass.
        if (AngularDI.$inject.length === args.length) {
          AngularDI.$inject.forEach((name, index) => {
            this[name] = args[index];
          });
        }
      }
    }

    // Set our own $inject key to the unique set of all direct and ancestor
    // dependencies so that Angular will provide all of them upon instantiation.
    AngularDI.$inject = unique(dependencies, ancestorDependencies);

    return AngularDI;
  });
}
