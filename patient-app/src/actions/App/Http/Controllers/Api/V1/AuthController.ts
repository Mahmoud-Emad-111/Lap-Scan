import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\AuthController::store
* @see app/Http/Controllers/Api/V1/AuthController.php:16
* @route '/api/v1/login'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\AuthController::store
* @see app/Http/Controllers/Api/V1/AuthController.php:16
* @route '/api/v1/login'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AuthController::store
* @see app/Http/Controllers/Api/V1/AuthController.php:16
* @route '/api/v1/login'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::show
* @see app/Http/Controllers/Api/V1/AuthController.php:61
* @route '/api/v1/me'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/me',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\AuthController::show
* @see app/Http/Controllers/Api/V1/AuthController.php:61
* @route '/api/v1/me'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AuthController::show
* @see app/Http/Controllers/Api/V1/AuthController.php:61
* @route '/api/v1/me'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::show
* @see app/Http/Controllers/Api/V1/AuthController.php:61
* @route '/api/v1/me'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::destroy
* @see app/Http/Controllers/Api/V1/AuthController.php:78
* @route '/api/v1/logout'
*/
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/logout',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\V1\AuthController::destroy
* @see app/Http/Controllers/Api/V1/AuthController.php:78
* @route '/api/v1/logout'
*/
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AuthController::destroy
* @see app/Http/Controllers/Api/V1/AuthController.php:78
* @route '/api/v1/logout'
*/
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

const AuthController = { store, show, destroy }

export default AuthController