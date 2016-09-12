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
import {stateName} from 'replicasetdetail/replicasetdetail_state';

/**
 * Controller for the replica set card.
 *
 * @final
 */
export default class ReplicaSetCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor($state, $interpolate, kdNamespaceService,$resource,$http, kdServiceListResource, kdEndpointListResource) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.ReplicaSet}
     */
    this.replicaSet;
    // console.log('card:'+JSON.stringify(this.replicaSet));
    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private */
    this.interpolate_ = $interpolate;

    /** @private {!./../common/namespace/namespace_service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;

    /** @export */
    this.i18n = i18n;

    /** @export Initialized from binding. */
    this.ifShowDetail;
    // console.log('replicaSet card show detail:'+this.ifShowDetail);
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

    this.init_();

    this.serviceList = {"listMeta":{"totalItems": this.serviceTotalItems}, "services": []};
    this.serviceTotalItems = 0;

    this.serviceListResource = kdServiceListResource;

    this.endpointListResource = kdEndpointListResource

    this.endpointList = {"listMeta":{"totalItems": this.endpointTotalItems}, "endpoints": []};
    this.endpointTotalItems = 0;
  }

  /**
   * @private
   */
  init_(){
    this.initBool=this.ifShowDetail;
    this.ifShowService=this.ifShowDetail;
    let namespace=this.replicaSet.objectMeta.namespace;
    let name=this.replicaSet.objectMeta.name;
    this.podsResource=this.resource_('api/v1/replicaset/'+namespace+'/'+name+'/pod');
    let rsPromise=this.http_.get('api/v1/replicaset/'+namespace+"/"+name);
    rsPromise.then((response) => {
      this.nodes=response.data;

      this.resource_(`api/v1/service/${this.replicaSet.objectMeta.namespace}`)
          .get().$promise.then((response) => {
            let sl = response.services;
            let pl = this.nodes.podList.pods;
            let flag = 0, flag1 = 0;

            for(var i = 0; i < pl.length; i++){
              for(var j = 0; j < sl.length; j++){
                flag = 0;
                if(sl[j].selector !== null){
                  if(this.is_array_contain(pl[i].objectMeta.labels, sl[j].selector)){
                    for(var k = 0; k < this.serviceList.services.length; k++){
                      if(sl[j] === this.serviceList.services[k]){
                        flag = 1;
                        break;
                      }
                    }
                    if(flag == 0){
                      this.serviceList.services.push(sl[j]);
                    }
                  }
                }
              }
            }

            this.serviceTotalItems = this.serviceList.services.length;

            for(var a = 0; a < this.serviceTotalItems; a++){
              this.resource_(`api/v1/endpoint/${this.replicaSet.objectMeta.namespace}` +
              `/${this.serviceList.services[a].objectMeta.name}`).get().$promise.then((response) => {
                this.endpointList.endpoints.push(response);
              });
            }

            this.resource_(`api/v1/replicaset/namespace/${this.replicaSet.objectMeta.namespace}` +
            `/name/${this.replicaSet.objectMeta.name}`).get().$promise.then((response) => {
              if(response.spec.template.spec.volumes !== null){
                let vl = response.spec.template.spec.volumes;
                for(var b in vl){
                  flag1 = 0;
                  if(vl[b].glusterfs.endpoints !== null){
                    this.resource_(`api/v1/endpoint/${this.replicaSet.objectMeta.namespace}` +
                    `/${vl[b].glusterfs.endpoints}`).get().$promise.then((response) => {
                      for(var c = 0; c < this.endpointList.endpoints.length; c++){
                        if(this.endpointList.endpoints[c] === response){
                          flag1 = 1;
                          break;
                        }
                      }
                      if(flag1 == 0){
                        this.endpointList.endpoints.push(response);
                      }
                    });
                  }
                }
              }
            });

            this.endpointTotalItems = this.endpointList.endpoints.length;
          });

      this.pass=true;
    })
  }
  is_array_contain(a,b){
    var flag = true;
    for(var i in b){
      if(i in a){
        if(a[i] !== b[i]){
          flag = false;
          break;
        }
      }else{
        flag = false;
        break;
      }
    }
    return flag;
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
//     console.log(this.ifShowDetail);
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
  getReplicaSetDetailHref() {
    return this.state_.href(
        stateName,
        new StateParams(this.replicaSet.objectMeta.namespace, this.replicaSet.objectMeta.name));
  }

  /**
   * Returns true if any of replica set pods has warning, false otherwise
   * @return {boolean}
   * @export
   */
  hasWarnings() { return this.replicaSet.pods.warnings.length > 0; }

  /**
   * Returns true if replica set pods have no warnings and there is at least one pod
   * in pending state, false otherwise
   * @return {boolean}
   * @export
   */
  isPending() { return !this.hasWarnings() && this.replicaSet.pods.pending > 0; }

  /**
   * @return {boolean}
   * @export
   */
  isSuccess() { return !this.isPending() && !this.hasWarnings(); }

  /**
   * @export
   * @param  {string} creationDate - creation date of the replica set
   * @return {string} localized tooltip with the formated creation date
   */
  getCreatedAtTooltip(creationDate) {
    let filter = this.interpolate_(`{{date | date:'short'}}`);
    /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
     * replica set. */
    let MSG_REPLICA_SET_LIST_CREATED_AT_TOOLTIP =
        goog.getMsg('Created at {$creationDate}', {'creationDate': filter({'date': creationDate})});
    return MSG_REPLICA_SET_LIST_CREATED_AT_TOOLTIP;
  }
}

/**
 * @return {!angular.Component}
 */
export const replicaSetCardComponent = {
  bindings: {
    'replicaSet': '=',
    'ifShowDetail':'<',
  },
  controller: ReplicaSetCardController,
  templateUrl: 'replicasetlist/replicasetcard.html',
};

const i18n = {
  /** @export {string} @desc Tooltip saying that some pods in a replica set have errors. */
  MSG_REPLICA_SET_LIST_PODS_ERRORS_TOOLTIP: goog.getMsg('One or more pods have errors'),
  /** @export {string} @desc Tooltip saying that some pods in a replica set are pending. */
  MSG_REPLICA_SET_LIST_PODS_PENDING_TOOLTIP: goog.getMsg('One or more pods are in pending state'),
  /** @export {string} @desc Label 'Replica Set' which appears at the top of the
      delete dialog, opened from a replica set list page. */
  MSG_REPLICA_SET_LIST_REPLICA_SET_LABEL: goog.getMsg('Replica Set'),
  /** @export {string} @desc Label 'Endpoints' which appears at the top of the
      replica set list, opened from a replica set list page. */
  MSG_REPLICA_SET_LIST_ENDPOINTS_TITLE: goog.getMsg('Endpoints'),
};
