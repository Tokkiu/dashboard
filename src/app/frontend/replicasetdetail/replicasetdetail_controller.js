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
export class ReplicaSetDetailController {
  /**
   * @param {!backendApi.ReplicaSetDetail} replicaSetDetail
   * @ngInject
   */
  constructor($resource, replicaSetDetail, kdReplicaSetPodsResource, kdServiceListResource, kdEndpointListResource) {

    /** @export {!backendApi.ReplicaSetDetail} */
    this.replicaSetDetail = replicaSetDetail;

    /** @export {!angular.Resource} */
    this.replicaSetPodsResource = kdReplicaSetPodsResource;

    /** @export */
    this.i18n = i18n;

    this.resource_ = $resource;

    this.serviceList = {"listMeta":{"totalItems": this.serviceTotalItems}, "services": []};
    this.serviceTotalItems = 0;

    this.serviceListResource = kdServiceListResource;

    this.endpointListResource = kdEndpointListResource

    this.endpointList = {"listMeta":{"totalItems": this.endpointTotalItems}, "endpoints": []};
    this.endpointTotalItems = 0;

    this.pass = false;
  }

  $onInit(){
    this.resource_(`api/v1/service/${this.replicaSetDetail.objectMeta.namespace}`)
    .get().$promise.then((response) => {
      let sl = response.services;
      let pl = this.replicaSetDetail.podList.pods;
      let flag = 0, flag1 = 0;

      for(var i = 0; i < pl.length; i++){
        for(var j = 0; j < sl.length; j++){
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
        this.resource_(`api/v1/endpoint/${this.replicaSetDetail.objectMeta.namespace}` +
        `/${this.serviceList.services[a].objectMeta.name}`).get().$promise.then((response) => {
          this.endpointList.endpoints.push(response);
        });
      }

      this.resource_(`api/v1/replicaset/namespace/${this.replicaSetDetail.objectMeta.namespace}` +
      `/name/${this.replicaSetDetail.objectMeta.name}`).get().$promise.then((response) => {
        if(response.spec.template.spec.volumes !== null){
          let vl = response.spec.template.spec.volumes;
            for(var b in vl){
              flag1 = 0;
              if(vl[b].glusterfs.endpoints !== null){
                this.resource_(`api/v1/endpoint/${this.replicaSetDetail.objectMeta.namespace}` +
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
}

const i18n = {
  /** @export {string} @desc Title 'Pods', which appears at the top of the pods list on the
      replica set details view. */
  MSG_REPLICA_SET_DETAIL_PODS_TITLE: goog.getMsg('Pods'),
  /** @export {string} @desc Label 'Overview' for the left navigation tab on the replica
      set details page. */
  MSG_REPLICA_SET_DETAIL_OVERVIEW_LABEL: goog.getMsg('Overview'),
  /** @export {string} @desc Label 'Events' for the right navigation tab on the replica
      set details page. */
  MSG_REPLICA_SET_DETAIL_EVENTS_LABEL: goog.getMsg('Events'),
  /** @export {string} @desc Label 'Endpoints' for the right navigation tab on the replica
      set details page. */
  MSG_REPLICA_SET_DETAIL_ENDPOINTS_TITLE: goog.getMsg('Endpoints'),
};
