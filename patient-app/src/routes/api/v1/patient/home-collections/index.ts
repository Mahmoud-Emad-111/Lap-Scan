import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::store
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:60
* @route '/api/v1/patient/home-collections'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/patient/home-collections',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::store
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:60
* @route '/api/v1/patient/home-collections'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientPortalController::store
* @see app/Http/Controllers/Api/V1/PatientPortalController.php:60
* @route '/api/v1/patient/home-collections'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

const homeCollections = {
    store: Object.assign(store, store),
}

export default homeCollections