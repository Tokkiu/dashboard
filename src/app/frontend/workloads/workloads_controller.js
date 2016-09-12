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
export class WorkloadsController {
  /**
   * @param {!backendApi.Workloads} workloads
   * @param {!angular.Resource} kdPodListResource
   * @param {!angular.Resource} kdReplicaSetListResource
   * @param {!angular.Resource} kdDaemonSetListResource
   * @param {!angular.Resource} kdDeploymentListResource
   * @param {!angular.Resource} kdPetSetListResource
   * @param {!angular.Resource} kdJobListResource
   * @param {!angular.Resource} kdRCListResource
   * @param {!angular.Resource} kdServiceListResource
   * @param {!angular.Resource} kdendpointListResource
   * @ngInject
   */
  constructor(
      workloads, kdPodListResource, kdReplicaSetListResource, kdDaemonSetListResource,
      kdDeploymentListResource, kdPetSetListResource, kdJobListResource, kdRCListResource, kdServiceListResource,$resource) {
    this.resource=$resource;
    /** @export {!backendApi.Workloads} */
    this.workloads = workloads;

    /** @export {!angular.Resource} */
    this.podListResource = kdPodListResource;

    /** @export {!angular.Resource} */
    this.replicaSetListResource = kdReplicaSetListResource;

    /** @export {!angular.Resource} */
    this.daemonSetListResource = kdDaemonSetListResource;

    /** @export {!angular.Resource} */
    this.deploymentListResource = kdDeploymentListResource;

    /** @export {!angular.Resource} */
    this.petSetListResource = kdPetSetListResource;

    /** @export {!angular.Resource} */
    this.jobListResource = kdJobListResource;

    /** @export {!angular.Resource} */
    this.rcListResource = kdRCListResource;

    /** @export {!angular.Resource} */
    this.serviceListResource = kdServiceListResource;

    /** @export {!angular.Resource} */
    this.endpointListResource = this.resource('api/v1/endpoint');

    /** @export */
    this.i18n = i18n;

    this.selects=[{
      select:"deployments",
      i18n:this.i18n.SELECT_DEPLOYMENTS,
    },{
      select:"replica set",
      i18n:this.i18n.SELECT_RS,
    },{
      select:"replication controller",
      i18n:this.i18n.SELECT_RC,
    },{
      select:"service",
      i18n:this.i18n.SELECT_SERVICES,
    },{
      select:"endpoint",
      i18n:this.i18n.SELECT_ENDPOINTS,
    },{
      select:"pods",
      i18n:this.i18n.SELECT_PODS,
    }];

    this.option='deployments';

    this.endpointList=null;

    this.init_();
  }

  init_() {
    this.resource('api/v1/endpoint').get().$promise.then((response) => {
      this.endpointList=response;
      // console.log("endpoints");
      // console.log(response);
      // console.log("serviceList");
      // console.log(this.workloads.serviceList);
    });
  }
  /**
   * @return {boolean}
   * @export
   */
  shouldShowZeroState() {
    /** @type {number} */
    let resourcesLength = this.workloads.deploymentList.listMeta.totalItems +
        this.workloads.replicaSetList.listMeta.totalItems +
        this.workloads.jobList.listMeta.totalItems +
        this.workloads.replicationControllerList.listMeta.totalItems +
        this.workloads.podList.listMeta.totalItems +
        this.workloads.daemonSetList.listMeta.totalItems +
        this.workloads.petSetList.listMeta.totalItems +
        this.workloads.serviceList.listMeta.totalItems;
        // this.workloads.endpointList.listMeta.totalItems;

    return resourcesLength === 0;
  }

  changeSelect(option){
    console.log(option);
    this.option=option;
  }

}

const i18n = {
  /** @export {string} @desc Label "Daemon sets", which appears above the daemon sets list on
   the workloads page. */
  MSG_WORKLOADS_DEAMON_SETS_LABEL: goog.getMsg('Daemon sets'),
  /** @export {string} @desc Label "Deployments", which appears above the deployments list on
   the workloads page.*/
  MSG_WORKLOADS_DEPLOYMENTS_LABEL: goog.getMsg('Deployments'),
  /** @export {string} @desc Label "Pet Sets", which appears above the replica set list on the
   workloads page.*/
  MSG_WORKLOADS_PET_SETS_LABEL: goog.getMsg('Pet Sets'),
  /** @export {string} @desc Label "Replica sets", which appears above the replica sets list on
   the workloads page.*/
  MSG_WORKLOADS_REPLICA_SETS_LABEL: goog.getMsg('Replica sets'),
  /** @export {string} @desc Label "Job", which appears above the replica sets list on the
   workloads page.*/
  MSG_WORKLOADS_JOBS_LABEL: goog.getMsg('Jobs'),
  /** @export {string} @desc Label "Replication controllers", which appears above the
   replication controllers list on the workloads page.*/
  MSG_WORKLOADS_REPLICATION_CONTROLLERS_LABEL: goog.getMsg('Replication controllers'),
  /** @export {string} @desc Label "Pods", which appears above the pods list on the workloads
   page.*/
  MSG_WORKLOADS_PODS_LABEL: goog.getMsg('Pods'),
  /** @export {string} @desc Label "Services", which appears above the services list on the workloads
   page.*/
  MSG_WORKLOADS_SERVICES_LABEL: goog.getMsg('Services'),
  /** @export {string} @desc Label "endpoints", which appears above the endpoints list on the workloads
   page.*/
  MSG_WORKLOADS_ENDPOINTS_LABEL:goog.getMsg('Endpoints'),
  /** @export {string} @desc Label "endpoints", which appears above the endpoints list on the workloads
   page.*/
  SELECT_DEPLOYMENTS:goog.getMsg("deployments"),
  /** @export {string} @desc Label "endpoints", which appears above the endpoints list on the workloads
   page.*/
  SELECT_RS:goog.getMsg("replica set"),
  /** @export {string} @desc Label "endpoints", which appears above the endpoints list on the workloads
   page.*/
  SELECT_RC:goog.getMsg("replication controller"),
  /** @export {string} @desc Label "endpoints", which appears above the endpoints list on the workloads
   page.*/
  SELECT_SERVICES:goog.getMsg("service"),
  /** @export {string} @desc Label "endpoints", which appears above the endpoints list on the workloads
   page.*/
  SELECT_PODS:goog.getMsg("pods"),
  /** @export {string} @desc Label "endpoints", which appears above the endpoints list on the workloads
   page.*/
  SELECT_ENDPOINTS:goog.getMsg("endpoint"),
};
