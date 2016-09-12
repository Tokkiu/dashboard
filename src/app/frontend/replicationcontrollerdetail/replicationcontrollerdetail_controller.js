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
 * Controller for the replication controller details view.
 *
 * @final
 */
export default class ReplicationControllerDetailController {
  /**
   * @param {!backendApi.ReplicationControllerDetail} replicationControllerDetail
   * @param {!ui.router.$state} $state
   * @param {!../common/resource/resourcedetail.StateParams} $stateParams
   * @param {!angular.Resource} kdRCPodsResource
   * @param {!angular.Resource} kdRCServicesResource
   * @ngInject
   */
  constructor(
      replicationControllerDetail, $state, $stateParams, kdRCPodsResource, kdRCServicesResource,$resource,kdEndpointListResource) {
    /** @export {!backendApi.ReplicationControllerDetail} */
    this.replicationControllerDetail = replicationControllerDetail;
    console.log(this.replicationControllerDetail);
    /** @export {!angular.Resource} */
    this.podListResource = kdRCPodsResource;

    /** @export {!angular.Resource} */
    this.serviceListResource = kdRCServicesResource;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!../common/resource/resourcedetail.StateParams} */
    this.stateParams_ = $stateParams;

    /** @export */
    this.i18n = i18n;
    this.resource_=$resource;
    this.serviceNameList=[];
    this.endpointList = {"listMeta":{"totalItems": 0}, "endpoints": []};
    // this.endpointTotalItems = 0;

    this.endpointListResource = kdEndpointListResource;
    this.init_();
  }
  init_(){
    let namespace=this.replicationControllerDetail.objectMeta.namespace;
    let name=this.replicationControllerDetail.objectMeta.name;
    var sl=this.replicationControllerDetail.serviceList.services;
    for (var i = 0; i < sl.length; i++) {
      this.serviceNameList.push(sl[i].objectMeta.name);
    }
    this.resource_('api/v1/endpoint/'+namespace)
        .get().$promise.then((response)=>{
          var el=response;
          // console.log('response');
          // console.log(el);
          // console.log(this.serviceNameList);
          for (var m = 0; m < el.endpoints.length; m++) {
            console.log(el.endpoints[m].objectMeta.name);
            if (this.serviceNameList.indexOf(el.endpoints[m].objectMeta.name)<0) {
              // console.log('index not');
            }else {
              // console.log("index in");
              this.endpointList.endpoints.push(el.endpoints[m]);
              this.endpointList.listMeta.totalItems++;
              // console.log(this.endpointList);
            }
          }
          // console.log(this.endpointList);
        });
  }

  /**
   * @param {!backendApi.Pod} pod
   * @return {boolean}
   * @export
   */
  hasCpuUsage(pod) {
    return !!pod.metrics && !!pod.metrics.cpuUsageHistory && pod.metrics.cpuUsageHistory.length > 0;
  }

  /**
   * @param {!backendApi.Pod} pod
   * @return {boolean}
   * @export
   */
  hasMemoryUsage(pod) {
    return !!pod.metrics && !!pod.metrics.memoryUsageHistory &&
        pod.metrics.memoryUsageHistory.length > 0;
  }
}

const i18n = {
  /** @export {string} @desc Title 'Pods', which appears at the top of the pods list on the
      replication controller detail view. */
  MSG_RC_DETAIL_PODS_TITLE: goog.getMsg('Pods'),
  /** @export {string} @desc Title 'Service', which appears at the top of the services list on the
      replication controller detail view. */
  MSG_RC_DETAIL_SERVICES_TITLE: goog.getMsg('Services'),
  /** @export {string} @desc Label 'Overview' for the left navigation tab on the replication
      controller details page. */
  MSG_RC_DETAIL_OVERVIEW_LABEL: goog.getMsg('Overview'),
  /** @export {string} @desc Label 'Events' for the right navigation tab on the replication
      controller details page. */
  MSG_RC_DETAIL_EVENTS_LABEL: goog.getMsg('Events'),
  /** @export {string} @desc Label 'Endpoints' for the right navigation tab on the replication
      controller details page. */
  MSG_RC_ENDOPINT_TITLE: goog.getMsg('Endpoints'),
};
