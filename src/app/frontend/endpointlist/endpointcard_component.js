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

import {StateParams} from 'common/resource/resourcedetail';
import {stateName} from 'endpointdetail/endpointdetail_state';

/**
 * @final
 */
export class EndpointCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!./../common/namespace/namespace_endpoint.NamespaceEndpoint} kdNamespaceEndpoint
   * @ngInject
   */
  constructor($state, $resource, kdNamespaceService) {
    /** @private {!./../common/namespace/namespace_endpoint.NamespaceEndpoint} */
    this.kdNamespaceService_ = kdNamespaceService;

    /** @export {!backendApi.Endpoint} */
    this.endpoint;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    this.resource_ = $resource;

    /** @export */
    this.i18n = i18n;

    this.pass = false;

    this.endpointDetail = null;
  }

  $onInit(){
    this.resource_(`api/v1/endpoint/${this.endpoint.objectMeta.namespace}/${this.endpoint.objectMeta.name}`)
        .get().$promise.then((response) => {
          this.endpointDetail = response;
        });
  }

  changeShow(){
    if (this.pass) {
        this.pass=false;
    }else {
      this.pass=true;
    }
  }
  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }

  /**
   * @return {string}
   * @export
   */
  getEndpointDetailHref() {
    return this.state_.href(
        stateName,
        new StateParams(this.endpoint.objectMeta.namespace, this.endpoint.objectMeta.name));
  }

  /**
   * Returns true if Endpoint has no assigned Cluster IP
   * or if Endpoint type is LoadBalancer or NodePort and doesn't have an external endpoint IP
   * @return {boolean}
   * @export
   */
  isPending() {
    return this.endpoint.clusterIP === null ||
        ((this.endpoint.type === 'LoadBalancer') && this.endpoint.externalEndpoints === null);
  }

  /**
   * Returns true if Endpoint has ClusterIP assigned and one of the following conditions is met:
   *  - Endpoint type is LoadBalancer or NodePort and has an external endpoint IP
   *  - Endpoint type is not LoadBalancer or NodePort
   * @return {boolean}
   * @export
   */
  isSuccess() { return !this.isPending(); }

  /**
   * Returns the endpoint's clusterIP or a dash ('-') if it is not yet set
   * @return {string}
   * @export
   */
  getEndpointClusterIP() { return this.endpoint.clusterIP ? this.endpoint.clusterIP : '-'; }
}

/**
 * Definition object for the component that displays endpoint card.
 *
 * @type {!angular.Component}
 */
export const endpointCardComponent = {
  templateUrl: 'endpointlist/endpointcard.html',
  controller: EndpointCardController,
  bindings: {
    /** {!backendApi.Endpoint} */
    'endpoint': '<',
  },
};

const i18n = {
  /** @export {string} @desc tooltip for pending endpoint card icon */
  MSG_SERVICE_IS_PENDING_TOOLTIP: goog.getMsg('This endpoint is in a pending state.'),
  /** @export {string} @desc tooltip for pending endpoint card icon */
  MSG_SERVICE_VIEW_TOOLTIP:goog.getMsg('VIEW'),
};
