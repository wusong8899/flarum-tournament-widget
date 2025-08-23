<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (!$schema->hasTable('ziven_tournament_participants')) {
            $schema->create('ziven_tournament_participants', function (Blueprint $table) {
                $table->increments('id');
                $table->unsignedInteger('user_id')->unique();
                $table->string('platform_account');
                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->index('created_at');
            });
        }
    },
    'down' => function (Builder $schema) {
        $schema->dropIfExists('ziven_tournament_participants');
    },
];