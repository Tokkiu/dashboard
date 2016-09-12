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
import {stateName} from 'replicationcontrollerdetail/replicationcontrollerdetail_state';

/**
 * Controller for the replication controller card.
 *
 * @final
 */
export default class ReplicationControllerCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor($state, $interpolate, kdNamespaceService,$resource,$http,kdServiceListResource,kdEndpointListResource) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.ReplicationController}
     */
    this.replicationController;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$interpolate} */
    this.interpolate_ = $interpolate;

    /** @private {!./../common/namespace/namespace_service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;

    /** @export */
    this.i18n = i18n;

    /** @export Initialized from binding. */
    this.ifShowDetail;

    this.initBool=true;
    this.ifShowService=true;
    this.event="event";
    this.view="view";
    this.podsResource=null;

    this.http_=$http;
    this.pod=null;

    this.nodes=null;
    this.podinfoList=[];
    this.resource_=$resource;
    this.pass=false;
    this.endpointList = {"listMeta":{"totalItems": 0}, "endpoints": []};
    this.endpointListResource = kdEndpointListResource;
    this.serviceNameList=[];
    this.init_();


  }

  init_(){
    // console.log("replicationController");
    // console.log(this.replicationController);
    this.initBool=this.ifShowDetail;
    this.ifShowService=this.ifShowDetail;
    let namespace=this.replicationController.objectMeta.namespace;
    let name=this.replicationController.objectMeta.name;
    this.podsResource=this.resource_('api/v1/replicationcontroller/'+namespace+'/'+name+'/pod');
    let rsPromise=this.http_.get('api/v1/replicationcontroller/'+namespace+"/"+name);
    rsPromise.then((response) => {
      this.nodes=response.data;
      var sl=this.nodes.serviceList.services;
      for (var i = 0; i < sl.length; i++) {
        this.serviceNameList.push(sl[i].objectMeta.name);
      }
      this.resource_('api/v1/endpoint/'+namespace)
          .get().$promise.then((response)=>{
            var el=response;
            console.log('response');
            console.log(el);
            console.log(this.serviceNameList);
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
      this.pass=true;
    })
  }
  is_array_contain(a,b){
    var t;
    for(var i = 0; i < b.length; i++){
      t = false;
      for(var j = 0; j < a.length; j++){
        if(b[i] == a[j]){
          t = true;
          break;
        }
      }
      if(!t) return false;
    }
    return true;
  }

  getPod(pod){
    var podPromise=this.http_.get('api/v1/pod/'+pod.objectMeta.namespace+'/'+pod.objectMeta.name);
    podPromise.then(
      (response)=>{
       //  console.log("i sure get a pod!");
       //  console.log(response.data);
        this.podinfoList.push(response.data);}
    )
  }
  changeShow(){
    if (this.ifShowDetail) {
      this.ifShowDetail=false;
    }else {
      this.ifShowDetail=true;
    }
    console.log(this.ifShowDetail);
    if (!this.initBool) {
      this.ifShowService=this.ifShowDetail;
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
  getReplicationControllerDetailHref() {
    return this.state_.href(
        stateName, new StateParams(
                       this.replicationController.objectMeta.namespace,
                       this.replicationController.objectMeta.name));
  }

  /**
   * Returns true if any of the replication controller's pods have warning, false otherwise
   * @return {boolean}
   * @export
   */
  hasWarnings() { return this.replicationController.pods.warnings.length > 0; }

  /**
   * Returns true if the replication controller's pods have no warnings and there is at least one
   * pod
   * in pending state, false otherwise
   * @return {boolean}
   * @export
   */
  isPending() { return !this.hasWarnings() && this.replicationController.pods.pending > 0; }

  /**
   * @return {boolean}
   * @export
   */
  isSuccess() { return !this.isPending() && !this.hasWarnings(); }

  /**
   * @export
   * @param  {string} creationDate - creation date of the pod
   * @return {string} localized tooltip with the formated creation date
   */
  getCreatedAtTooltip(creationDate) {
    let filter = this.interpolate_(`{{date | date:'short'}}`);
    /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
     * replication controller. */
    let MSG_RC_LIST_CREATED_AT_TOOLTIP =
        goog.getMsg('Created at {$creationDate}', {'creationDate': filter({'date': creationDate})});
    return MSG_RC_LIST_CREATED_AT_TOOLTIP;
  }
}

/**
 * @return {!angular.Component}
 */
export const replicationControllerCardComponent = {
  bindings: {
    'replicationController': '=',
    'ifShowDetail':'<',
  },
  controller: ReplicationControllerCardController,
  templateUrl: 'replicationcontrollerlist/replicationcontrollercard.html',
};

const i18n = {
  /** @export {string} @desc Tooltip saying that some pods in a replication controller have errors. */
  MSG_RC_LIST_PODS_ERRORS_TOOLTIP: goog.getMsg('One or more pods have errors'),
  /** @export {string} @desc Tooltip saying that some pods in a replication controller are pending. */
  MSG_RC_LIST_PODS_PENDING_TOOLTIP: goog.getMsg('One or more pods are in pending state'),
  /** @export {string} @desc Tooltip saying that some pods in a replication controller are pending. */
  MSG_RC_DETAIL_SERVICES_TITLE:goog.getMsg('Services'),
  /** @export {string} @desc Tooltip saying that some pods in a replication controller are pending. */
  MSG_RC_DETAIL_VIEW_TITLE:goog.getMsg('VIEW'),
  /** @export {string} @desc Tooltip saying that some pods in a replication controller are pending. */
  MSG_RC_DETAIL_ENDPOINTS_TITLE:goog.getMsg('Endpoints'),
  /** @export {string} @desc Tooltip saying that some pods in a replication controller are pending. */
  MSG_RC_DETAIL_PODS_TITLE:goog.getMsg('Pods List'),
};
