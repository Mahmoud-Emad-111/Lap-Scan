import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\PushTokenController::store
* @see app/Http/Controllers/Api/V1/PushTokenController.php:13
* @route '/api/v1/push-tokens'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/push-tokens',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\PushTokenController::store
* @see app/Http/Controllers/Api/V1/PushTokenController.php:13
* @route '/api/v1/push-tokens'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PushTokenController::store
* @see app/Http/Controllers/Api/V1/PushTokenController.php:13
* @route '/api/v1/push-tokens'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\PushTokenController::store
* @see app/Http/Controllers/Api/V1/PushTokenController.php:13
* @route '/api/v1/push-tokens'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\PushTokenController::store
* @see app/Http/Controllers/Api/V1/PushTokenController.php:13
* @route '/api/v1/push-tokens'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\V1\PushTokenController::destroy
* @see app/Http/Controllers/Api/V1/PushTokenController.php:28
* @route '/api/v1/push-tokens'
*/
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/push-tokens',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\V1\PushTokenController::destroy
* @see app/Http/Controllers/Api/V1/PushTokenController.php:28
* @route '/api/v1/push-tokens'
*/
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PushTokenController::destroy
* @see app/Http/Controllers/Api/V1/PushTokenController.php:28
* @route '/api/v1/push-tokens'
*/
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\V1\PushTokenController::destroy
* @see app/Http/Controllers/Api/V1/PushTokenController.php:28
* @route '/api/v1/push-tokens'
*/
const destroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\PushTokenController::destroy
* @see app/Http/Controllers/Api/V1/PushTokenController.php:28
* @route '/api/v1/push-tokens'
*/
destroyForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const pushTokens = {
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default pushTokens