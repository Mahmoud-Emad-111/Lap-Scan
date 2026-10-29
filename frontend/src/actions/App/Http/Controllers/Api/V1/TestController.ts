import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\TestController::index
 * @see app/Http/Controllers/Api/V1/TestController.php:16
 * @route '/api/v1/tests'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/tests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\TestController::index
 * @see app/Http/Controllers/Api/V1/TestController.php:16
 * @route '/api/v1/tests'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\TestController::index
 * @see app/Http/Controllers/Api/V1/TestController.php:16
 * @route '/api/v1/tests'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\TestController::index
 * @see app/Http/Controllers/Api/V1/TestController.php:16
 * @route '/api/v1/tests'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\TestController::index
 * @see app/Http/Controllers/Api/V1/TestController.php:16
 * @route '/api/v1/tests'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\TestController::index
 * @see app/Http/Controllers/Api/V1/TestController.php:16
 * @route '/api/v1/tests'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\TestController::index
 * @see app/Http/Controllers/Api/V1/TestController.php:16
 * @route '/api/v1/tests'
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
* @see \App\Http\Controllers\Api\V1\TestController::store
 * @see app/Http/Controllers/Api/V1/TestController.php:29
 * @route '/api/v1/tests'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/tests',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\TestController::store
 * @see app/Http/Controllers/Api/V1/TestController.php:29
 * @route '/api/v1/tests'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\TestController::store
 * @see app/Http/Controllers/Api/V1/TestController.php:29
 * @route '/api/v1/tests'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\TestController::store
 * @see app/Http/Controllers/Api/V1/TestController.php:29
 * @route '/api/v1/tests'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\TestController::store
 * @see app/Http/Controllers/Api/V1/TestController.php:29
 * @route '/api/v1/tests'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\V1\TestController::show
 * @see app/Http/Controllers/Api/V1/TestController.php:36
 * @route '/api/v1/tests/{test}'
 */
export const show = (args: { test: string | number | { id: string | number } } | [test: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/tests/{test}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\TestController::show
 * @see app/Http/Controllers/Api/V1/TestController.php:36
 * @route '/api/v1/tests/{test}'
 */
show.url = (args: { test: string | number | { id: string | number } } | [test: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { test: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { test: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    test: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        test: typeof args.test === 'object'
                ? args.test.id
                : args.test,
                }

    return show.definition.url
            .replace('{test}', parsedArgs.test.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\TestController::show
 * @see app/Http/Controllers/Api/V1/TestController.php:36
 * @route '/api/v1/tests/{test}'
 */
show.get = (args: { test: string | number | { id: string | number } } | [test: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\TestController::show
 * @see app/Http/Controllers/Api/V1/TestController.php:36
 * @route '/api/v1/tests/{test}'
 */
show.head = (args: { test: string | number | { id: string | number } } | [test: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\TestController::show
 * @see app/Http/Controllers/Api/V1/TestController.php:36
 * @route '/api/v1/tests/{test}'
 */
    const showForm = (args: { test: string | number | { id: string | number } } | [test: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\TestController::show
 * @see app/Http/Controllers/Api/V1/TestController.php:36
 * @route '/api/v1/tests/{test}'
 */
        showForm.get = (args: { test: string | number | { id: string | number } } | [test: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\TestController::show
 * @see app/Http/Controllers/Api/V1/TestController.php:36
 * @route '/api/v1/tests/{test}'
 */
        showForm.head = (args: { test: string | number | { id: string | number } } | [test: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\Api\V1\TestController::update
 * @see app/Http/Controllers/Api/V1/TestController.php:43
 * @route '/api/v1/tests/{test}'
 */
export const update = (args: { test: string | number | { id: string | number } } | [test: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/tests/{test}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\V1\TestController::update
 * @see app/Http/Controllers/Api/V1/TestController.php:43
 * @route '/api/v1/tests/{test}'
 */
update.url = (args: { test: string | number | { id: string | number } } | [test: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { test: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { test: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    test: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        test: typeof args.test === 'object'
                ? args.test.id
                : args.test,
                }

    return update.definition.url
            .replace('{test}', parsedArgs.test.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\TestController::update
 * @see app/Http/Controllers/Api/V1/TestController.php:43
 * @route '/api/v1/tests/{test}'
 */
update.put = (args: { test: string | number | { id: string | number } } | [test: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\V1\TestController::update
 * @see app/Http/Controllers/Api/V1/TestController.php:43
 * @route '/api/v1/tests/{test}'
 */
update.patch = (args: { test: string | number | { id: string | number } } | [test: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\V1\TestController::update
 * @see app/Http/Controllers/Api/V1/TestController.php:43
 * @route '/api/v1/tests/{test}'
 */
    const updateForm = (args: { test: string | number | { id: string | number } } | [test: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\TestController::update
 * @see app/Http/Controllers/Api/V1/TestController.php:43
 * @route '/api/v1/tests/{test}'
 */
        updateForm.put = (args: { test: string | number | { id: string | number } } | [test: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\V1\TestController::update
 * @see app/Http/Controllers/Api/V1/TestController.php:43
 * @route '/api/v1/tests/{test}'
 */
        updateForm.patch = (args: { test: string | number | { id: string | number } } | [test: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const TestController = { index, store, show, update }

export default TestController