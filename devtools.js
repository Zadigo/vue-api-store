import { setupDevtoolsPlugin } from '@vue/devtools-api'

const STATETYPE = 'vue-api-store'
const INSPECTORID = 'vue-api-store'
const TIMELINEID = 'vue-api-store'


export function setupDevtools(app, instance) {
    let devtoolsApi = null
    let trackId = 0

    const devtools = {
        // trackStart: (label, string) => {
        trackStart: (label) => {
            const groupId = 'track' + trackId++

            // Start
            devtoolsApi.addTimelineEvent({
                layerId: TIMELINEID,
                event: {
                    time: Date.now(),
                    title: `${label} - request sent`,
                    data: { label },
                    groupId
                }
            })

            // End
            return () => {
                devtoolsApi.addTimelineEvent({
                    layerId: TIMELINEID,
                    event: {
                        time: Date.now(),
                        title: `${label} - request finished`,
                        data: { label, requestName: instance.lastRequest },
                        groupId
                    }
                })
            }
        }
    }

    setupDevtoolsPlugin({
        id: 'vue-api-store',
        label: 'Vue API Store',
        packageName: 'vue-api-store',
        homePage: 'https://github.com/Zadigo/vue-api-store',
        componentStateTypes: [STATETYPE],
        enableEarlyProxy: true,
        app
    }, api => {
        devtoolsApi = api

        api.addInspector({
            id: INSPECTORID,
            label: 'Vue API Store',
            icon: 'send'
        })

        api.addTimelineLayer({
            id: TIMELINEID,
            label: 'Vue API Store',
            color: 0xff984f
        })

        api.on.getInspectorTree((payload) => {
            if (payload.inspectorId === INSPECTORID) {
                payload.rootNodes = [
                    {
                        id: 'root',
                        label: 'Root',
                        children: [
                            {
                                id: 'requests',
                                label: 'Requests'
                            }
                        ]
                    }
                ]
            }
        })

        api.on.getInspectorState((payload) => {
            if (payload.inspectorId === INSPECTORID) {
                if (payload.nodeId === 'requests') {
                    payload.state = {
                        state: [
                            {
                                key: 'requests',
                                value: instance._clients
                            }
                        ],
                        history: {
                            value: instance._history
                        }
                    }
                }
            }
        })

        api.sendInspectorState(INSPECTORID)
    })

    return devtools
}
