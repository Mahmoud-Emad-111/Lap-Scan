import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../wayfinder'
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
* @see \App\Http\Controllers\Api\V1\PatientReferralController::show
* @see app/Http/Controllers/Api/V1/PatientReferralController.php:18
* @route '/api/v1/patient/referrals'
*/
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientReferralController::show
* @see app/Http/Controllers/Api/V1/PatientReferralController.php:18
* @route '/api/v1/patient/referrals'
*/
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientReferralController::show
* @see app/Http/Controllers/Api/V1/PatientReferralController.php:18
* @route '/api/v1/patient/referrals'
*/
showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

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

/**
* @see \App\Http\Controllers\Api\V1\PatientReferralController::store
* @see app/Http/Controllers/Api/V1/PatientReferralController.php:46
* @route '/api/v1/patient/referrals'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientReferralController::store
* @see app/Http/Controllers/Api/V1/PatientReferralController.php:46
* @route '/api/v1/patient/referrals'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const PatientReferralController = { show, store }

export default PatientReferralController