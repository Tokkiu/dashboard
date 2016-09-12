package endpoint


import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"

	"k8s.io/kubernetes/pkg/api"
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"
)

type EndpointDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`
	Subset     []api.EndpointSubset
}

func GetEndpointDetail(client k8sClient.Interface, heapsterClient client.HeapsterClient,
namespace, name string, pQuery *common.PaginationQuery) (*EndpointDetail, error) {

	log.Printf("Getting details of %s endpoint in %s namespace", name, namespace)

	// TODO(maciaszczykm): Use channels.
	endpointData, err := client.Endpoints(namespace).Get(name)
	if err != nil {
		return nil, err
	}

	endpoint := ToEndpointDetail(endpointData)

	return &endpoint, nil
}