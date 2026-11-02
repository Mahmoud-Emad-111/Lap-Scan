import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::index
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:19
* @route '/api/v1/patient/addresses'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/patient/addresses',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::index
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:19
* @route '/api/v1/patient/addresses'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::index
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:19
* @route '/api/v1/patient/addresses'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::index
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:19
* @route '/api/v1/patient/addresses'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::index
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:19
* @route '/api/v1/patient/addresses'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::index
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:19
* @route '/api/v1/patient/addresses'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::index
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:19
* @route '/api/v1/patient/addresses'
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
* @see \App\Http\Controllers\Api\V1\PatientAddressController::store
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:34
* @route '/api/v1/patient/addresses'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/patient/addresses',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::store
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:34
* @route '/api/v1/patient/addresses'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::store
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:34
* @route '/api/v1/patient/addresses'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::store
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:34
* @route '/api/v1/patient/addresses'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::store
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:34
* @route '/api/v1/patient/addresses'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::update
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:55
* @route '/api/v1/patient/addresses/{patientAddress}'
*/
export const update = (args: { patientAddress: number | { id: number } } | [patientAddress: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/patient/addresses/{patientAddress}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::update
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:55
* @route '/api/v1/patient/addresses/{patientAddress}'
*/
update.url = (args: { patientAddress: number | { id: number } } | [patientAddress: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { patientAddress: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { patientAddress: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            patientAddress: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        patientAddress: typeof args.patientAddress === 'object'
        ? args.patientAddress.id
        : args.patientAddress,
    }

    return update.definition.url
            .replace('{patientAddress}', parsedArgs.patientAddress.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::update
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:55
* @route '/api/v1/patient/addresses/{patientAddress}'
*/
update.put = (args: { patientAddress: number | { id: number } } | [patientAddress: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::update
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:55
* @route '/api/v1/patient/addresses/{patientAddress}'
*/
update.patch = (args: { patientAddress: number | { id: number } } | [patientAddress: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::update
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:55
* @route '/api/v1/patient/addresses/{patientAddress}'
*/
const updateForm = (args: { patientAddress: number | { id: number } } | [patientAddress: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::update
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:55
* @route '/api/v1/patient/addresses/{patientAddress}'
*/
updateForm.put = (args: { patientAddress: number | { id: number } } | [patientAddress: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::update
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:55
* @route '/api/v1/patient/addresses/{patientAddress}'
*/
updateForm.patch = (args: { patientAddress: number | { id: number } } | [patientAddress: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::destroy
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:92
* @route '/api/v1/patient/addresses/{patientAddress}'
*/
export const destroy = (args: { patientAddress: number | { id: number } } | [patientAddress: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/patient/addresses/{patientAddress}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::destroy
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:92
* @route '/api/v1/patient/addresses/{patientAddress}'
*/
destroy.url = (args: { patientAddress: number | { id: number } } | [patientAddress: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { patientAddress: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { patientAddress: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            patientAddress: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        patientAddress: typeof args.patientAddress === 'object'
        ? args.patientAddress.id
        : args.patientAddress,
    }

    return destroy.definition.url
            .replace('{patientAddress}', parsedArgs.patientAddress.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::destroy
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:92
* @route '/api/v1/patient/addresses/{patientAddress}'
*/
destroy.delete = (args: { patientAddress: number | { id: number } } | [patientAddress: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::destroy
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:92
* @route '/api/v1/patient/addresses/{patientAddress}'
*/
const destroyForm = (args: { patientAddress: number | { id: number } } | [patientAddress: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\PatientAddressController::destroy
* @see app/Http/Controllers/Api/V1/PatientAddressController.php:92
* @route '/api/v1/patient/addresses/{patientAddress}'
*/
destroyForm.delete = (args: { patientAddress: number | { id: number } } | [patientAddress: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const PatientAddressController = { index, store, update, destroy }

export default PatientAddressController