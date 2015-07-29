/* global MLSearchController */

/**
 * @class MLRemoteSearchController
 * @augments MLSearchController
 * @classdesc <strong>extends {@link MLSearchController}</strong>
 *
 * base search controller class; the prototype for an angular search controller.
 * implements {@link MLRemoteInputService}, for use with {@link ml-remote-input}
 *
 * Note: this style requires you to use the `controllerAs` syntax.
 *
 * <pre class="prettyprint">
 *   (function() {
 *     'use strict';
 *
 *     angular.module('app').controller('SearchCtrl', SearchCtrl);
 *
 *     SearchCtrl.$inject = ['$scope', '$location', 'MLSearchFactory', 'MLRemoteInputService'];
 *
 *     // inherit from MLRemoteSearchController
 *     var superCtrl = MLRemoteSearchController.prototype;
 *     SearchCtrl.prototype = Object.create(superCtrl);
 *
 *     function SearchCtrl($scope, $location, searchFactory, remoteInput) {
 *       var ctrl = this;
 *       var mlSearch = searchFactory.newContext();
 *
 *       superCtrl.constructor.call(ctrl, $scope, $location, mlSearch, remoteInput);
 *
 *       // override a superCtrl method
 *       ctrl.updateSearchResults = function updateSearchResults(data) {
 *         superCtrl.updateSearchResults.apply(ctrl, arguments);
 *         console.log('updated search results');
 *       }
 *
 *       ctrl.init();
 *     }
 *   })();
 * </pre>
 *
 * @param {Object} $scope - child controller's scope
 * @param {Object} $location - angular's $location service
 * @param {MLSearchContext} mlSearch - child controller's searchContext
 * @param {MLRemoteInputService} remoteInput - child controller's remoteInput instance
 *
 * @prop {MLRemoteInputService} remoteInput - child controller's remoteInput instance
 */

// inherit from MLSearchController
var superCtrl = MLSearchController.prototype;
MLRemoteSearchController.prototype = Object.create(superCtrl);

function MLRemoteSearchController($scope, $location, mlSearch, remoteInput) {
  'use strict';
  if ( !(this instanceof MLRemoteSearchController) ) {
    return new MLRemoteSearchController($scope, $location, mlSearch, remoteInput);
  }

  superCtrl.constructor.call(this, $scope, $location, mlSearch);

  // TODO: error if not passed?
  this.remoteInput = remoteInput;
}

(function() {
  'use strict';

  /**
   * initialize the controller, wiring up the remote input service and invoking
   * {@link MLSearchController#init}
   *
   * @memberof MLRemoteSearchController
   */
  MLRemoteSearchController.prototype.init = function init() {
    // wire up remote input subscription
    var self = this;

    var unsubscribe = this.remoteInput.subscribe(function(input) {
      if (self.qtext !== input) {
        self.qtext = input;

        self.search.call(self);
      }
    });

    this.$scope.$on('$destroy', unsubscribe);

    this.remoteInput.mlSearch = this.mlSearch;

    if ( this.qtext.length && !this.remoteInput.input.length ) {
      this.remoteInput.setInput( this.qtext );
    } else {
      this.qtext = this.remoteInput.input;
    }

    superCtrl.init.apply(this, arguments);
  };

  /**
   * update controller state by invoking {@link MLSearchController#updateSearchResults},
   * then pass the latest `qtext` to the remote input service
   *
   * @memberof MLRemoteSearchController
   */
  MLRemoteSearchController.prototype.updateSearchResults = function updateSearchResults(data) {
    superCtrl.updateSearchResults.apply(this, arguments);
    this.remoteInput.setInput( this.qtext );
    return this;
  };

})();
