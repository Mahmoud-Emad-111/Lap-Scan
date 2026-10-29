import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::branches
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:33
 * @route '/api/v1/doctor/branches'
 */
export const branches = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: branches.url(options),
    method: 'get',
})

branches.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctor/branches',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::branches
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:33
 * @route '/api/v1/doctor/branches'
 */
branches.url = (options?: RouteQueryOptions) => {
    return branches.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::branches
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:33
 * @route '/api/v1/doctor/branches'
 */
branches.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: branches.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::branches
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:33
 * @route '/api/v1/doctor/branches'
 */
branches.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: branches.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::branches
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:33
 * @route '/api/v1/doctor/branches'
 */
    const branchesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: branches.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::branches
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:33
 * @route '/api/v1/doctor/branches'
 */
        branchesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: branches.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::branches
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:33
 * @route '/api/v1/doctor/branches'
 */
        branchesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: branches.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    branches.form = branchesForm
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::tests
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:44
 * @route '/api/v1/doctor/tests'
 */
export const tests = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tests.url(options),
    method: 'get',
})

tests.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctor/tests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::tests
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:44
 * @route '/api/v1/doctor/tests'
 */
tests.url = (options?: RouteQueryOptions) => {
    return tests.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::tests
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:44
 * @route '/api/v1/doctor/tests'
 */
tests.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tests.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::tests
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:44
 * @route '/api/v1/doctor/tests'
 */
tests.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tests.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::tests
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:44
 * @route '/api/v1/doctor/tests'
 */
    const testsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: tests.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::tests
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:44
 * @route '/api/v1/doctor/tests'
 */
        testsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: tests.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::tests
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:44
 * @route '/api/v1/doctor/tests'
 */
        testsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: tests.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    tests.form = testsForm
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::patients
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:55
 * @route '/api/v1/doctor/patients'
 */
export const patients = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: patients.url(options),
    method: 'get',
})

patients.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctor/patients',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::patients
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:55
 * @route '/api/v1/doctor/patients'
 */
patients.url = (options?: RouteQueryOptions) => {
    return patients.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::patients
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:55
 * @route '/api/v1/doctor/patients'
 */
patients.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: patients.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::patients
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:55
 * @route '/api/v1/doctor/patients'
 */
patients.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: patients.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::patients
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:55
 * @route '/api/v1/doctor/patients'
 */
    const patientsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: patients.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::patients
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:55
 * @route '/api/v1/doctor/patients'
 */
        patientsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: patients.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::patients
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:55
 * @route '/api/v1/doctor/patients'
 */
        patientsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: patients.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    patients.form = patientsForm
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:74
 * @route '/api/v1/doctor/orders'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctor/orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:74
 * @route '/api/v1/doctor/orders'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:74
 * @route '/api/v1/doctor/orders'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:74
 * @route '/api/v1/doctor/orders'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:74
 * @route '/api/v1/doctor/orders'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:74
 * @route '/api/v1/doctor/orders'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::index
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:74
 * @route '/api/v1/doctor/orders'
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
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::store
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:131
 * @route '/api/v1/doctor/orders'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/doctor/orders',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::store
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:131
 * @route '/api/v1/doctor/orders'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::store
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:131
 * @route '/api/v1/doctor/orders'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::store
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:131
 * @route '/api/v1/doctor/orders'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::store
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:131
 * @route '/api/v1/doctor/orders'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:149
 * @route '/api/v1/doctor/orders/{order}'
 */
export const show = (args: { order: string | number } | [order: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctor/orders/{order}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:149
 * @route '/api/v1/doctor/orders/{order}'
 */
show.url = (args: { order: string | number } | [order: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { order: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    order: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        order: args.order,
                }

    return show.definition.url
            .replace('{order}', parsedArgs.order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:149
 * @route '/api/v1/doctor/orders/{order}'
 */
show.get = (args: { order: string | number } | [order: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:149
 * @route '/api/v1/doctor/orders/{order}'
 */
show.head = (args: { order: string | number } | [order: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:149
 * @route '/api/v1/doctor/orders/{order}'
 */
    const showForm = (args: { order: string | number } | [order: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:149
 * @route '/api/v1/doctor/orders/{order}'
 */
        showForm.get = (args: { order: string | number } | [order: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::show
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:149
 * @route '/api/v1/doctor/orders/{order}'
 */
        showForm.head = (args: { order: string | number } | [order: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::result
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:169
 * @route '/api/v1/doctor/results/{result}'
 */
export const result = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: result.url(args, options),
    method: 'get',
})

result.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctor/results/{result}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::result
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:169
 * @route '/api/v1/doctor/results/{result}'
 */
result.url = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { result: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { result: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    result: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        result: typeof args.result === 'object'
                ? args.result.id
                : args.result,
                }

    return result.definition.url
            .replace('{result}', parsedArgs.result.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::result
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:169
 * @route '/api/v1/doctor/results/{result}'
 */
result.get = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: result.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::result
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:169
 * @route '/api/v1/doctor/results/{result}'
 */
result.head = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: result.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::result
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:169
 * @route '/api/v1/doctor/results/{result}'
 */
    const resultForm = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: result.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::result
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:169
 * @route '/api/v1/doctor/results/{result}'
 */
        resultForm.get = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: result.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::result
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:169
 * @route '/api/v1/doctor/results/{result}'
 */
        resultForm.head = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: result.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    result.form = resultForm
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::resultPdf
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:179
 * @route '/api/v1/doctor/results/{result}/pdf'
 */
export const resultPdf = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: resultPdf.url(args, options),
    method: 'get',
})

resultPdf.definition = {
    methods: ["get","head"],
    url: '/api/v1/doctor/results/{result}/pdf',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::resultPdf
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:179
 * @route '/api/v1/doctor/results/{result}/pdf'
 */
resultPdf.url = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { result: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { result: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    result: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        result: typeof args.result === 'object'
                ? args.result.id
                : args.result,
                }

    return resultPdf.definition.url
            .replace('{result}', parsedArgs.result.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::resultPdf
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:179
 * @route '/api/v1/doctor/results/{result}/pdf'
 */
resultPdf.get = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: resultPdf.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::resultPdf
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:179
 * @route '/api/v1/doctor/results/{result}/pdf'
 */
resultPdf.head = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: resultPdf.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::resultPdf
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:179
 * @route '/api/v1/doctor/results/{result}/pdf'
 */
    const resultPdfForm = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: resultPdf.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::resultPdf
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:179
 * @route '/api/v1/doctor/results/{result}/pdf'
 */
        resultPdfForm.get = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: resultPdf.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\DoctorPortalController::resultPdf
 * @see app/Http/Controllers/Api/V1/DoctorPortalController.php:179
 * @route '/api/v1/doctor/results/{result}/pdf'
 */
        resultPdfForm.head = (args: { result: string | number | { id: string | number } } | [result: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: resultPdf.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    resultPdf.form = resultPdfForm
const DoctorPortalController = { branches, tests, patients, index, store, show, result, resultPdf }

export default DoctorPortalController