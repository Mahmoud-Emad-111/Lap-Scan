import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::index
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:18
 * @route '/api/v1/referral-discount-rules'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/referral-discount-rules',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::index
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:18
 * @route '/api/v1/referral-discount-rules'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::index
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:18
 * @route '/api/v1/referral-discount-rules'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::index
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:18
 * @route '/api/v1/referral-discount-rules'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::index
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:18
 * @route '/api/v1/referral-discount-rules'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::index
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:18
 * @route '/api/v1/referral-discount-rules'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::index
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:18
 * @route '/api/v1/referral-discount-rules'
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
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::store
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:31
 * @route '/api/v1/referral-discount-rules'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/referral-discount-rules',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::store
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:31
 * @route '/api/v1/referral-discount-rules'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::store
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:31
 * @route '/api/v1/referral-discount-rules'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::store
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:31
 * @route '/api/v1/referral-discount-rules'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::store
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:31
 * @route '/api/v1/referral-discount-rules'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::update
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:42
 * @route '/api/v1/referral-discount-rules/{referral_discount_rule}'
 */
export const update = (args: { referral_discount_rule: string | number | { id: string | number } } | [referral_discount_rule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/v1/referral-discount-rules/{referral_discount_rule}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::update
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:42
 * @route '/api/v1/referral-discount-rules/{referral_discount_rule}'
 */
update.url = (args: { referral_discount_rule: string | number | { id: string | number } } | [referral_discount_rule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { referral_discount_rule: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { referral_discount_rule: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    referral_discount_rule: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        referral_discount_rule: typeof args.referral_discount_rule === 'object'
                ? args.referral_discount_rule.id
                : args.referral_discount_rule,
                }

    return update.definition.url
            .replace('{referral_discount_rule}', parsedArgs.referral_discount_rule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::update
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:42
 * @route '/api/v1/referral-discount-rules/{referral_discount_rule}'
 */
update.put = (args: { referral_discount_rule: string | number | { id: string | number } } | [referral_discount_rule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::update
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:42
 * @route '/api/v1/referral-discount-rules/{referral_discount_rule}'
 */
update.patch = (args: { referral_discount_rule: string | number | { id: string | number } } | [referral_discount_rule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::update
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:42
 * @route '/api/v1/referral-discount-rules/{referral_discount_rule}'
 */
    const updateForm = (args: { referral_discount_rule: string | number | { id: string | number } } | [referral_discount_rule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::update
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:42
 * @route '/api/v1/referral-discount-rules/{referral_discount_rule}'
 */
        updateForm.put = (args: { referral_discount_rule: string | number | { id: string | number } } | [referral_discount_rule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\V1\ReferralDiscountRuleController::update
 * @see app/Http/Controllers/Api/V1/ReferralDiscountRuleController.php:42
 * @route '/api/v1/referral-discount-rules/{referral_discount_rule}'
 */
        updateForm.patch = (args: { referral_discount_rule: string | number | { id: string | number } } | [referral_discount_rule: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const referralDiscountRules = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
}

export default referralDiscountRules