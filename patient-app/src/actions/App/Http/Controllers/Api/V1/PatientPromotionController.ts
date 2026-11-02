import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::index
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:23
* @route '/api/v1/patient-promotions'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/patient-promotions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::index
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:23
* @route '/api/v1/patient-promotions'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::index
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:23
* @route '/api/v1/patient-promotions'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::index
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:23
* @route '/api/v1/patient-promotions'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::store
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:41
* @route '/api/v1/patient-promotions'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/patient-promotions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::store
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:41
* @route '/api/v1/patient-promotions'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::store
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:41
* @route '/api/v1/patient-promotions'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::update
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:52
* @route '/api/v1/patient-promotions/{patientPromotion}'
*/
export const update = (args: { patientPromotion: number | { id: number } } | [patientPromotion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/patient-promotions/{patientPromotion}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::update
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:52
* @route '/api/v1/patient-promotions/{patientPromotion}'
*/
update.url = (args: { patientPromotion: number | { id: number } } | [patientPromotion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { patientPromotion: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { patientPromotion: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            patientPromotion: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        patientPromotion: typeof args.patientPromotion === 'object'
        ? args.patientPromotion.id
        : args.patientPromotion,
    }

    return update.definition.url
            .replace('{patientPromotion}', parsedArgs.patientPromotion.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::update
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:52
* @route '/api/v1/patient-promotions/{patientPromotion}'
*/
update.put = (args: { patientPromotion: number | { id: number } } | [patientPromotion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::update
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:52
* @route '/api/v1/patient-promotions/{patientPromotion}'
*/
update.patch = (args: { patientPromotion: number | { id: number } } | [patientPromotion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

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

const PatientPromotionController = { index, store, update, offers, coupons }

export default PatientPromotionController