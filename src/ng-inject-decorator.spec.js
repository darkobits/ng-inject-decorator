import angular from 'angular';

import {
  get,
  module,
  componentController
} from '@darkobits/unity';

import inject from './ng-inject-decorator'; // eslint-disable-line no-unused-vars

describe('Inject Decorator', () => {
  let TestApp;
  let T;

  beforeEach(() => {
    TestApp = angular.module('TestApp', []);
  });

  describe('basic dependency injection', () => {
    const componentName = 'testComponent';
    const dependencies = ['$http', '$q', '$compile'];

    beforeEach(() => {
      @inject(...dependencies)
      class TestCtrl {

      }

      TestApp.component(componentName, {
        controller: TestCtrl
      });

      module(TestApp.name);

      T = componentController(componentName);
    });

    it('should inject the provided dependencies', () => {
      dependencies.forEach(d => {
        expect(T[componentName][d]).toEqual(get(d));
      });
    });
  });

  describe('ancestor dependency injection', () => {
    const componentName = 'testComponent';
    const ancestorDependencies = ['$location', '$document'];
    const dependencies = ['$http', '$q', '$compile'];

    beforeEach(() => {
      @inject(...ancestorDependencies)
      class ParentCtrl {

      }

      @inject(...dependencies)
      class TestCtrl extends ParentCtrl {

      }

      TestApp.component(componentName, {
        controller: TestCtrl
      });

      module(TestApp.name);

      T = componentController(componentName);
    });

    it('should inject the provided combined dependencies', () => {
      dependencies.concat(ancestorDependencies).forEach(d => {
        expect(T[componentName][d]).toEqual(get(d));
      });
    });
  });

  describe('ancestor dependency injection with overlap', () => {
    const componentName = 'testComponent';
    const ancestorDependencies = ['$http', '$q', '$compile'];
    const dependencies = ['$http', '$q', '$compile', '$location'];

    beforeEach(() => {
      @inject(...ancestorDependencies)
      class ParentCtrl {

      }

      @inject(...dependencies)
      class TestCtrl extends ParentCtrl {

      }

      TestApp.component(componentName, {
        controller: TestCtrl
      });

      module(TestApp.name);

      T = componentController(componentName);
    });

    it('should inject the provided combined dependencies', () => {
      dependencies.concat(ancestorDependencies).forEach(d => {
        expect(T[componentName].constructor.$inject.length).toBe(dependencies.length);
        expect(T[componentName][d]).toEqual(get(d));
      });
    });
  });
});
