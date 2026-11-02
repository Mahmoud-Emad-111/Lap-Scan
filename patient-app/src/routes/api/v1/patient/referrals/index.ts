import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\PatientReferralController::show
* @see app/Http/Controllers/Api/V1/PatientReferralController.php:18
* @route '/api/v1/patient/referrals'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/patient/referrals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientReferralController::show
* @see app/Http/Controllers/Api/V1/PatientReferralController.php:18
* @route '/api/v1/patient/referrals'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientReferralController::show
* @see app/Http/Controllers/Api/V1/PatientReferralController.php:18
* @route '/api/v1/patient/referrals'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientReferralController::show
* @see app/Http/Controllers/Api/V1/PatientReferralController.php:18
* @route '/api/v1/patient/referrals'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientReferralController::store
* @see app/Http/Controllers/Api/V1/PatientReferralController.php:46
* @route '/api/v1/patient/referrals'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/patient/referrals',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientReferralController::store
* @see app/Http/Controllers/Api/V1/PatientReferralController.php:46
* @route '/api/v1/patient/referrals'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientReferralController::store
* @see app/Http/Controllers/Api/V1/PatientReferralController.php:46
* @route '/api/v1/patient/referrals'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

const referrals = {
    show: Object.assign(show, show),
    store: Object.assign(store, store),
}

export default referrals