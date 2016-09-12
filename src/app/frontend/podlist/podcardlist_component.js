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
import {StateParams as LogsStateParams, stateName as logsStateName} from 'logs/logs_state';
import {stateName} from 'poddetail/poddetail_state';
import {PaginationService} from 'common/pagination/pagination_service';

/**
 * @final
 */
export class PodCardListController {
  /**
   * @ngInject
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
   */
  constructor($state,$interpolate,$scope, kdNamespaceService,kdResourceVerberService,$http,$resource,kdPaginationService,$stateParams) {
    /**
     * List of pods. Initialized from the scope.
     * @export {!backendApi.PodList}
     */
     this.podList;
    //  console.log(this.podList);

    /** @export {!angular.Resource} Initialized from binding. */
    this.podListResource;

    /** @export Initialized from binding. */
    this.ifShowDetail;
    // console.log('podCardListComponent show detail:'+this.ifShowDetail);
    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$interpolate} */
    this.interpolate_ = $interpolate;

    /** @private {!./../common/namespace/namespace_service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;

    /** @export */
    this.i18n = i18n;

    /** @export */
    this.myPodStatus='all';

    /** @export */
    this.kdResourceVerberService_=kdResourceVerberService;
    this.pass=false;
    this.view="view";
    this.http_=$http;
    this.resource=$resource;
    this.stateParams_=$stateParams;
    this.paginationId='pods';
    this.paginationService_ = kdPaginationService;
    // this.
    this.init_();
  }

  /**
   * @private
   */

   init_(){
     var pods=this.podList.pods;
     for (var i = 0; i < pods.length; i++) {
       this.podList.pods[i].ifShowDetail=this.ifShowDetail;
       this.podList.pods[i].index=i;
       this.getPod(i,this.podList.pods[i]);
     }
     this.pass=true;
   }
   getPod(num,pod){
     var podPromise=this.http_.get('api/v1/pod/'+pod.objectMeta.namespace+'/'+pod.objectMeta.name);
     podPromise.then(
       (response)=>{
         this.podList.pods[num].info=response.data;}
     )
   }

   changeShow(num){

     var ifShowDetail=this.podList.pods[num].ifShowDetail;
     if (ifShowDetail) {
      this.podList.pods[num].ifShowDetail=false;
     }else {
       this.podList.pods[num].ifShowDetail=true;
       if(this.podList.pods[num].info===undefined){
         this.getPod(num,this.podList.pods[num]);
       }
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
   * @return {boolean}
   * @export
   */

   getFailedPodList(){
     var pod={
       typeMeta:[],
       objectMeta:[]
     };
     var pods=[];
     pods=this.podList.pods;
     var len=pods.length;
     for (var i = 0; i < len; i++) {
       if (pods[i].podPhase==="Failed") {
         pod.objectMeta.push(pods[i].objectMeta);
       }
     }
     return pod;
   }

   removeAll(){
       var pod=this.getFailedPodList();
       if (pod.objectMeta.length!==0) {
         this.kdResourceVerberService_
             .showDeleteDialog(
                "pod","pods",pod.objectMeta)
             .then(() => {
               // For now just reload the state. Later we can remove the item in place.
               this.state_.reload();
             });
        }else {
          this.state_.reload();
        }



   }

  /**
   * @export
   */
  changeselect(){
    if (this.myPodStatus==='all'){
      this.podListResource=this.resource('api/v1/pod/:namespace');

    }else {
      this.podListResource=this.resource('api/v1/status/'+this.myPodStatus+'/:namespace/');
    }
    let namespace = this.stateParams_.namespace || this.stateParams_.objectNamespace;
    let query = PaginationService.getResourceQuery(
        this.paginationService_.getRowsLimit(this.paginationId), 0, namespace,
        this.stateParams_.objectName);

    this.podListResource.get(
        query, (list) => { this.podList = list;
    this.init_();},
    (err) => { console.log('Pagination error', err.data); });

    console.log("changeselect:"+this.myPodStatus);
    console.log("namespace:"+namespace);
  };

  /**
   * @return {boolean}
   * @export
   */
  showMetrics() {
    if (this.podList.pods && this.podList.pods.length > 0) {
      let firstPod = this.podList.pods[0];
      return !!firstPod.metrics;
    }
    return false;
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
   * @return {string}
   * @export
   */
  getPodLogsHref(pod) {
    return this.state_.href(
        logsStateName, new LogsStateParams(pod.objectMeta.namespace, pod.objectMeta.name));
  }

  /**
   * @param {!backendApi.Pod} pod
   * @return {string}
   * @export
   */
  getPodDetailHref(pod) {
    return this.state_.href(
        stateName, new StateParams(pod.objectMeta.namespace, pod.objectMeta.name));
  }

  /**
   * Checks if pod status is successful, i.e. running or succeeded.
   * @param pod
   * @return {boolean}
   * @export
   */
  isStatusSuccessful(pod) { return pod.podPhase === 'Running' || pod.podPhase === 'Succeeded'; }

  /**
   * Checks if pod status is pending.
   * @param pod
   * @return {boolean}
   * @export
   */
  isStatusPending(pod) { return pod.podPhase === 'Pending'; }

  /**
   * Checks if pod status is failed.
   * @param pod
   * @return {boolean}
   * @export
   */
  isStatusFailed(pod) { return pod.podPhase === 'Failed'; }

  /**
   * @export
   * @param  {string} startDate - start date of the pod
   * @return {string} localized tooltip with the formated start date
   */
  getStartedAtTooltip(startDate) {
    let filter = this.interpolate_(`{{date | date:'d/M/yy HH:mm':'UTC'}}`);
    /** @type {string} @desc Tooltip 'Started at [some date]' showing the exact start time of
     * the pod.*/
    let MSG_POD_LIST_STARTED_AT_TOOLTIP =
        goog.getMsg('Started at {$startDate} UTC', {'startDate': filter({'date': startDate})});
    return MSG_POD_LIST_STARTED_AT_TOOLTIP;
  }
}

/**
 * Definition object for the component that displays pods list card.
 *
 * Pod list factory should expose endpoint that will return list of pods (all or related to some
 * resource).
 *
 * @type {!angular.Component}
 */
export const podCardListComponent = {
  templateUrl: 'podlist/podcardlist.html',
  controller: PodCardListController,
  bindings: {
    /** {!backendApi.PodList} */
    'podList': '<',
    /** {!angular.Resource} */
    'podListResource': '<',
    /** {boolean} */
    'selectable': '<',
    /** {boolean} */
    'withStatuses': '<',
    /** {boolean} */
    'ifShowDetail': '<',
  },
};

const i18n = {
  /** @export {string} @desc tooltip for failed pod card icon */
  MSG_POD_IS_FAILED_TOOLTIP: goog.getMsg('This pod has errors.'),
  /** @export {string} @desc tooltip for pending pod card icon */
  MSG_POD_IS_PENDING_TOOLTIP: goog.getMsg('This pod is in a pending state.'),
  /** @export {string} @desc Label 'Name' which appears as a column label in the table of
   pods (pod list view). */
  MSG_POD_LIST_NAME_LABEL: goog.getMsg('Name'),
  /** @export {string} @desc Label 'Namespace' which appears as a column label in the
   table of pods (pod list view). */
  MSG_POD_LIST_NAMESPACE_LABEL: goog.getMsg('Namespace'),
  /** @export {string} @desc Label 'Status' which appears as a column label in the table of
   pods (pod list view). */
  MSG_POD_LIST_STATUS_LABEL: goog.getMsg('Status'),
  /** @export {string} @desc Label 'Restarts' which appears as a column label in the
   table of pods (pod list view). */
  MSG_POD_LIST_RESTARTS_LABEL: goog.getMsg('Restarts'),
  /** @export {string} @desc Label 'Age' which appears as a column label in the
   table of pods (pod list view). */
  MSG_POD_LIST_AGE_LABEL: goog.getMsg('Age'),
  /** @export {string} @desc Label 'Cluster IP' which appears as a column label in the table of
   pods (pod list view). */
  MSG_POD_LIST_CLUSTER_IP_LABEL: goog.getMsg('Cluster IP'),
  /** @export {string} @desc Label which appears as a column label in the table of pods */
  MSG_POD_LIST_CPU_USAGE_LABEL: goog.getMsg('CPU (cores)'),
  /** @export {string} @desc Label which appears as a column label in the table of pods */
  MSG_POD_LIST_MEMORY_USAGE_LABEL: goog.getMsg('Memory (bytes)'),
  /** @export {string} @desc Label 'Logs' for the pod's logs which appears as a column label in the
   table of pods (pod list view). */
  MSG_POD_LIST_LOGS_LABEL: goog.getMsg('Logs'),
  /** @export {string} @desc Title 'Pod' which is used as a title for the delete/update
   dialogs (that can be opened from the pod list view.) */
  MSG_POD_LIST_POD_TITLE: goog.getMsg('Pod'),
};
