import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../wayfinder'
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
* @see \App\Http\Controllers\Api\V1\AuthController::store
 * @see app/Http/Controllers/Api/V1/AuthController.php:16
 * @route '/api/v1/login'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\AuthController::store
 * @see app/Http/Controllers/Api/V1/AuthController.php:16
 * @route '/api/v1/login'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\V1\AuthController::show
 * @see app/Http/Controllers/Api/V1/AuthController.php:47
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
 * @see app/Http/Controllers/Api/V1/AuthController.php:47
 * @route '/api/v1/me'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AuthController::show
 * @see app/Http/Controllers/Api/V1/AuthController.php:47
 * @route '/api/v1/me'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\AuthController::show
 * @see app/Http/Controllers/Api/V1/AuthController.php:47
 * @route '/api/v1/me'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\AuthController::show
 * @see app/Http/Controllers/Api/V1/AuthController.php:47
 * @route '/api/v1/me'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\AuthController::show
 * @see app/Http/Controllers/Api/V1/AuthController.php:47
 * @route '/api/v1/me'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\AuthController::show
 * @see app/Http/Controllers/Api/V1/AuthController.php:47
 * @route '/api/v1/me'
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
* @see \App\Http\Controllers\Api\V1\AuthController::destroy
 * @see app/Http/Controllers/Api/V1/AuthController.php:64
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
 * @see app/Http/Controllers/Api/V1/AuthController.php:64
 * @route '/api/v1/logout'
 */
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AuthController::destroy
 * @see app/Http/Controllers/Api/V1/AuthController.php:64
 * @route '/api/v1/logout'
 */
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\V1\AuthController::destroy
 * @see app/Http/Controllers/Api/V1/AuthController.php:64
 * @route '/api/v1/logout'
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
* @see \App\Http\Controllers\Api\V1\AuthController::destroy
 * @see app/Http/Controllers/Api/V1/AuthController.php:64
 * @route '/api/v1/logout'
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
const AuthController = { store, show, destroy }

export default AuthController