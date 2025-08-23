<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (!$schema->hasTable('ziven_tournament_platforms')) {
            $schema->create('ziven_tournament_platforms', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name');
                $table->string('icon_url')->nullable();
                $table->string('icon_class')->nullable();
                $table->boolean('is_active')->default(true);
                $table->integer('display_order')->default(0);
                $table->timestamps();

                $table->index(['is_active', 'display_order']);
            });
        }
    },
    'down' => function (Builder $schema) {
        $schema->dropIfExists('ziven_tournament_platforms');
    },
];