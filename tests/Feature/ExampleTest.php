<?php

test('does not serve the frontend from the Laravel application', function () {
    $this->get('/')->assertNotFound();
});
