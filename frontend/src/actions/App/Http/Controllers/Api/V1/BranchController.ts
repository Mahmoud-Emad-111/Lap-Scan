import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\BranchController::index
 * @see app/Http/Controllers/Api/V1/BranchController.php:18
 * @route '/api/v1/branches'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/branches',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\BranchController::index
 * @see app/Http/Controllers/Api/V1/BranchController.php:18
 * @route '/api/v1/branches'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\BranchController::index
 * @see app/Http/Controllers/Api/V1/BranchController.php:18
 * @route '/api/v1/branches'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\BranchController::index
 * @see app/Http/Controllers/Api/V1/BranchController.php:18
 * @route '/api/v1/branches'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\BranchController::index
 * @see app/Http/Controllers/Api/V1/BranchController.php:18
 * @route '/api/v1/branches'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\BranchController::index
 * @see app/Http/Controllers/Api/V1/BranchController.php:18
 * @route '/api/v1/branches'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\BranchController::index
 * @see app/Http/Controllers/Api/V1/BranchController.php:18
 * @route '/api/v1/branches'
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
* @see \App\Http\Controllers\Api\V1\BranchController::store
 * @see app/Http/Controllers/Api/V1/BranchController.php:38
 * @route '/api/v1/branches'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/branches',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\BranchController::store
 * @see app/Http/Controllers/Api/V1/BranchController.php:38
 * @route '/api/v1/branches'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\BranchController::store
 * @see app/Http/Controllers/Api/V1/BranchController.php:38
 * @route '/api/v1/branches'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\BranchController::store
 * @see app/Http/Controllers/Api/V1/BranchController.php:38
 * @route '/api/v1/branches'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\BranchController::store
 * @see app/Http/Controllers/Api/V1/BranchController.php:38
 * @route '/api/v1/branches'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\V1\BranchController::show
 * @see app/Http/Controllers/Api/V1/BranchController.php:45
 * @route '/api/v1/branches/{branch}'
 */
export const show = (args: { branch: string | number | { id: string | number } } | [branch: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/branches/{branch}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\BranchController::show
 * @see app/Http/Controllers/Api/V1/BranchController.php:45
 * @route '/api/v1/branches/{branch}'
 */
show.url = (args: { branch: string | number | { id: string | number } } | [branch: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { branch: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { branch: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    branch: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        branch: typeof args.branch === 'object'
                ? args.branch.id
                : args.branch,
                }

    return show.definition.url
            .replace('{branch}', parsedArgs.branch.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\BranchController::show
 * @see app/Http/Controllers/Api/V1/BranchController.php:45
 * @route '/api/v1/branches/{branch}'
 */
show.get = (args: { branch: string | number | { id: string | number } } | [branch: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\BranchController::show
 * @see app/Http/Controllers/Api/V1/BranchController.php:45
 * @route '/api/v1/branches/{branch}'
 */
show.head = (args: { branch: string | number | { id: string | number } } | [branch: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\BranchController::show
 * @see app/Http/Controllers/Api/V1/BranchController.php:45
 * @route '/api/v1/branches/{branch}'
 */
    const showForm = (args: { branch: string | number | { id: string | number } } | [branch: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\BranchController::show
 * @see app/Http/Controllers/Api/V1/BranchController.php:45
 * @route '/api/v1/branches/{branch}'
 */
        showForm.get = (args: { branch: string | number | { id: string | number } } | [branch: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\BranchController::show
 * @see app/Http/Controllers/Api/V1/BranchController.php:45
 * @route '/api/v1/branches/{branch}'
 */
        showForm.head = (args: { branch: string | number | { id: string | number } } | [branch: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\V1\BranchController::update
 * @see app/Http/Controllers/Api/V1/BranchController.php:52
 * @route '/api/v1/branches/{branch}'
 */
export const update = (args: { branch: string | number | { id: string | number } } | [branch: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/branches/{branch}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\V1\BranchController::update
 * @see app/Http/Controllers/Api/V1/BranchController.php:52
 * @route '/api/v1/branches/{branch}'
 */
update.url = (args: { branch: string | number | { id: string | number } } | [branch: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { branch: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { branch: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    branch: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        branch: typeof args.branch === 'object'
                ? args.branch.id
                : args.branch,
                }

    return update.definition.url
            .replace('{branch}', parsedArgs.branch.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\BranchController::update
 * @see app/Http/Controllers/Api/V1/BranchController.php:52
 * @route '/api/v1/branches/{branch}'
 */
update.put = (args: { branch: string | number | { id: string | number } } | [branch: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\V1\BranchController::update
 * @see app/Http/Controllers/Api/V1/BranchController.php:52
 * @route '/api/v1/branches/{branch}'
 */
update.patch = (args: { branch: string | number | { id: string | number } } | [branch: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\V1\BranchController::update
 * @see app/Http/Controllers/Api/V1/BranchController.php:52
 * @route '/api/v1/branches/{branch}'
 */
    const updateForm = (args: { branch: string | number | { id: string | number } } | [branch: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\BranchController::update
 * @see app/Http/Controllers/Api/V1/BranchController.php:52
 * @route '/api/v1/branches/{branch}'
 */
        updateForm.put = (args: { branch: string | number | { id: string | number } } | [branch: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\V1\BranchController::update
 * @see app/Http/Controllers/Api/V1/BranchController.php:52
 * @route '/api/v1/branches/{branch}'
 */
        updateForm.patch = (args: { branch: string | number | { id: string | number } } | [branch: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const BranchController = { index, store, show, update }

export default BranchController