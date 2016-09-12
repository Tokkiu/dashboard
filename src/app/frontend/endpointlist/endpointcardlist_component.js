// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @final
 */
export class EndpointCardListController {
  /**
   * @param {!./../common/namespace/namespace_endpoint.NamespaceEndpoint} kdNamespaceEndpoint
   * @ngInject
   */
  constructor(kdNamespaceService) {
    /** @private {!./../common/namespace/namespace_endpoint.NamespaceEndpoint} */
    this.kdNamespaceService_ = kdNamespaceService;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }
}

/**
 * Definition object for the component that displays endpoint card list.
 *
 * @type {!angular.Component}
 */
export const endpointCardListComponent = {
  templateUrl: 'endpointlist/endpointcardlist.html',
  controller: EndpointCardListController,
  bindings: {
    /** {!backendApi.EndpointList} */
    'endpointList': '<',
    /** {angular.Resource} */
    'endpointListResource': '<',
    /** {boolean} */
    'selectable': '<',
  },
};

const i18n = {
  /** @export {string} @desc Label 'Name' which appears as a column label in the table of
     endpoints (endpoint list view). */
  MSG_SERVICE_LIST_NAME_LABEL: goog.getMsg('Name'),
  /** @export {string} @desc Label 'Namespace' which appears as a column label in the
     table of endpoints (endpoint list view). */
  MSG_SERVICE_LIST_NAMESPACE_LABEL: goog.getMsg('Namespace'),
  /** @export {string} @desc Label 'Labels' which appears as a column label in the table of
     endpoints (endpoint list view). */
  MSG_SERVICE_LIST_LABELS_LABEL: goog.getMsg('Labels'),
  /** @export {string} @desc Label 'Cluster IP' which appears as a column label in the table of
     endpoints (endpoint list view). */
  MSG_SERVICE_LIST_CLUSTER_IP_LABEL: goog.getMsg('Cluster IP'),
  /** @export {string} @desc Label 'Internal endpoints' which appears as a column label in the
     table of endpoints (endpoint list view). */
  MSG_SERVICE_LIST_KIND_LABEL: goog.getMsg('kind'),
  /** @export {string} @desc Label 'External endpoints' which appears as a column label in the
     table of endpoints (endpoint list view). */
  MSG_SERVICE_LIST_TIME_LABEL: goog.getMsg('Creation timestamp'),
  /** @export {string} @desc Label 'External endpoints' which appears as a column label in the
     table of endpoints (endpoint list view). */
  MSG_SERVICE_LIST_OPTION_LABEL: goog.getMsg('Option'),
};
