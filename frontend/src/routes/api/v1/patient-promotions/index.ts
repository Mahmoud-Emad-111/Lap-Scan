import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
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
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::index
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:23
* @route '/api/v1/patient-promotions'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::index
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:23
* @route '/api/v1/patient-promotions'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::index
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:23
* @route '/api/v1/patient-promotions'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

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
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::store
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:41
* @route '/api/v1/patient-promotions'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::store
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:41
* @route '/api/v1/patient-promotions'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

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
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::update
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:52
* @route '/api/v1/patient-promotions/{patientPromotion}'
*/
const updateForm = (args: { patientPromotion: number | { id: number } } | [patientPromotion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::update
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:52
* @route '/api/v1/patient-promotions/{patientPromotion}'
*/
updateForm.put = (args: { patientPromotion: number | { id: number } } | [patientPromotion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientPromotionController::update
* @see app/Http/Controllers/Api/V1/PatientPromotionController.php:52
* @route '/api/v1/patient-promotions/{patientPromotion}'
*/
updateForm.patch = (args: { patientPromotion: number | { id: number } } | [patientPromotion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const patientPromotions = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
}

export default patientPromotions