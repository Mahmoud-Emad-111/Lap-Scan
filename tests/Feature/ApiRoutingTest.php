<?php

it('keeps unknown API routes out of the frontend fallback', function () {
    $this->getJson('/api/v1/not-a-route')
        ->assertNotFound()
        ->assertJsonStructure(['message']);
});
