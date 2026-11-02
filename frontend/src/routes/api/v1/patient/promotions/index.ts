import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::offers
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:65
* @route '/api/v1/patient/promotions/offers'
*/
export const offers = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: offers.url(options),
    method: 'get',
})

offers.definition = {
    methods: ["get","head"],
    url: '/api/v1/patient/promotions/offers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::offers
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:65
* @route '/api/v1/patient/promotions/offers'
*/
offers.url = (options?: RouteQueryOptions) => {
    return offers.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::offers
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:65
* @route '/api/v1/patient/promotions/offers'
*/
offers.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: offers.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::offers
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:65
* @route '/api/v1/patient/promotions/offers'
*/
offers.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: offers.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::offers
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:65
* @route '/api/v1/patient/promotions/offers'
*/
const offersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: offers.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::offers
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:65
* @route '/api/v1/patient/promotions/offers'
*/
offersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: offers.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::offers
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:65
* @route '/api/v1/patient/promotions/offers'
*/
offersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: offers.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

offers.form = offersForm

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::coupons
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:98
* @route '/api/v1/patient/promotions/coupons'
*/
export const coupons = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: coupons.url(options),
    method: 'get',
})

coupons.definition = {
    methods: ["get","head"],
    url: '/api/v1/patient/promotions/coupons',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::coupons
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:98
* @route '/api/v1/patient/promotions/coupons'
*/
coupons.url = (options?: RouteQueryOptions) => {
    return coupons.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::coupons
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:98
* @route '/api/v1/patient/promotions/coupons'
*/
coupons.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: coupons.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::coupons
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:98
* @route '/api/v1/patient/promotions/coupons'
*/
coupons.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: coupons.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::coupons
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:98
* @route '/api/v1/patient/promotions/coupons'
*/
const couponsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: coupons.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::coupons
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:98
* @route '/api/v1/patient/promotions/coupons'
*/
couponsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: coupons.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::coupons
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:98
* @route '/api/v1/patient/promotions/coupons'
*/
couponsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: coupons.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

coupons.form = couponsForm

const promotions = {
    offers: Object.assign(offers, offers),
    coupons: Object.assign(coupons, coupons),
}

export default promotions