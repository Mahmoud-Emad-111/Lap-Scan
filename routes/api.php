<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BranchController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DoctorController;
use App\Http\Controllers\Api\V1\DoctorPortalController;
use App\Http\Controllers\Api\V1\DoctorProfileController;
use App\Http\Controllers\Api\V1\LabResultController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PatientController;
use App\Http\Controllers\Api\V1\PatientPortalController;
use App\Http\Controllers\Api\V1\ReferralDiscountRuleController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SampleController;
use App\Http\Controllers\Api\V1\TestController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function (): void {
    Route::post('/login', [AuthController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('login');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/me', [AuthController::class, 'show'])->name('me');
        Route::delete('/logout', [AuthController::class, 'destroy'])->name('logout');
        Route::apiResource('branches', BranchController::class)->only(['index', 'store', 'show', 'update']);
        Route::apiResource('patients', PatientController::class)->only(['index', 'store', 'show', 'update']);
        Route::apiResource('tests', TestController::class)->only(['index', 'store', 'show', 'update']);
        Route::get('/dashboard', DashboardController::class)->name('dashboard');
        Route::apiResource('users', UserController::class)->only(['index', 'store', 'show', 'update']);
        Route::apiResource('orders', OrderController::class)->only(['index', 'store', 'show']);
        Route::apiResource('referral-discount-rules', ReferralDiscountRuleController::class)
            ->only(['index', 'store', 'update']);
        Route::get('/doctors', [DoctorController::class, 'index'])->name('doctors.index');
        Route::patch('/doctors/{doctor}/verification', [DoctorController::class, 'updateVerification'])
            ->name('doctors.verification.update');
        Route::get('/doctor/profile', [DoctorProfileController::class, 'show'])->name('doctor.profile.show');
        Route::put('/doctor/profile', [DoctorProfileController::class, 'update'])->name('doctor.profile.update');
        Route::get('/doctor/branches', [DoctorPortalController::class, 'branches'])->name('doctor.branches.index');
        Route::get('/doctor/tests', [DoctorPortalController::class, 'tests'])->name('doctor.tests.index');
        Route::get('/doctor/patients', [DoctorPortalController::class, 'patients'])->name('doctor.patients.index');
        Route::get('/doctor/orders', [DoctorPortalController::class, 'index'])->name('doctor.orders.index');
        Route::post('/doctor/orders', [DoctorPortalController::class, 'store'])->name('doctor.orders.store');
        Route::get('/doctor/orders/{order}', [DoctorPortalController::class, 'show'])->name('doctor.orders.show');
        Route::get('/doctor/results/{result}', [DoctorPortalController::class, 'result'])->name('doctor.results.show');
        Route::get('/doctor/results/{result}/pdf', [DoctorPortalController::class, 'resultPdf'])
            ->name('doctor.results.pdf');
        Route::get('/samples', [SampleController::class, 'index'])->name('samples.index');
        Route::get('/samples/{sample}', [SampleController::class, 'show'])->name('samples.show');
        Route::post('/samples/{sample}/collection', [SampleController::class, 'collect'])->name('samples.collect');
        Route::get('/results', [LabResultController::class, 'index'])->name('results.index');
        Route::post('/order-items/{orderItem}/result', [LabResultController::class, 'store'])->name('order-items.results.store');
        Route::get('/results/{result}/document', [LabResultController::class, 'document'])
            ->name('results.document');
        Route::get('/results/{result}/revisions', [LabResultController::class, 'revisions'])->name('results.revisions.index');
        Route::post('/results/{result}/corrections', [LabResultController::class, 'correct'])->name('results.corrections.store');
        Route::post('/results/{result}/approval', [LabResultController::class, 'approve'])->name('results.approve');
        Route::get('/reports/operations', ReportController::class)->name('reports.operations');
        Route::get('/patient/orders', [PatientPortalController::class, 'orders'])->name('patient.orders');
        Route::get('/patient/results', [PatientPortalController::class, 'results'])->name('patient.results');
    });
});
