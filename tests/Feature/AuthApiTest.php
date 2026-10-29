<?php

use App\Models\User;

it('issues an expiring bearer token for valid credentials', function () {
    $user = User::factory()->create(['email' => 'lab@example.test']);

    $response = $this->postJson('/api/v1/login', [
        'email' => 'lab@example.test',
        'password' => 'password',
        'device_name' => 'laboratory-client',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.user.id', $user->id)
        ->assertJsonPath('data.user.role', 'patient')
        ->assertJsonStructure(['data' => ['token', 'user' => ['id', 'name', 'email', 'role']]]);

    $this->assertDatabaseHas('personal_access_tokens', [
        'tokenable_id' => $user->id,
        'name' => 'laboratory-client',
    ]);

    expect($user->tokens()->firstOrFail()->expires_at)->not->toBeNull();
});

it('returns 401 when the password is invalid', function () {
    User::factory()->create(['email' => 'lab@example.test']);

    $this->postJson('/api/v1/login', [
        'email' => 'lab@example.test',
        'password' => 'incorrect',
        'device_name' => 'laboratory-client',
    ])->assertUnauthorized();

    $this->assertDatabaseCount('personal_access_tokens', 0);
});

it('returns 401 when no bearer token is provided', function () {
    $this->getJson('/api/v1/me')->assertUnauthorized();
});

it('revokes the current token on logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('laboratory-client');

    $this->withToken($token->plainTextToken)->deleteJson('/api/v1/logout')->assertOk();

    $this->assertDatabaseMissing('personal_access_tokens', ['id' => $token->accessToken->id]);
});
