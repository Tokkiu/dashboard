package endpoint

import (
	"log"

	client "k8s.io/kubernetes/pkg/client/unversioned"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	//"k8s.io/kubernetes/pkg/api"
)

type EndpointList struct {
	ListMeta common.ListMeta `json:"listMeta"`
	Endpoints []Endpoint `json:"endpoints"`
}

type Endpoint struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`
}

func GetEndpointList(client client.Interface, nsQuery *common.NamespaceQuery,
pQuery *common.PaginationQuery) (*EndpointList, error) {
	log.Printf("Getting list of all endpoints in the cluster")

	channels := &common.ResourceChannels{
		EndpointList: common.GetEndpointListChannel(client, nsQuery, 1),
	}

	return GetEndpointListFromChannels(channels, pQuery)
}

func GetEndpointListFromChannels(channels *common.ResourceChannels,
pQuery *common.PaginationQuery) (*EndpointList, error) {
	endpoints := <-channels.EndpointList.List
	if err := <-channels.EndpointList.Error; err != nil {
		return nil, err
	}

	return CreateEndpointList(endpoints.Items, pQuery), nil
}
