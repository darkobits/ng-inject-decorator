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
  return classDecorator(decoratedClass => {
    let $inject = dependencies || [];

    traversePrototypeChain(proto => {
      $inject = unique($inject, proto.constructor.$inject);
    }, decoratedClass.prototype);

    return {
      onConstruct(...args) {
        $inject.forEach((name, index) => {
          this[name] = args[index];
        });
      },
      static: {
        $inject
      }
    };
  });
}
