<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('ziven_tournament_participants', function (Blueprint $table) {
            $table->integer('score')->default(0)->after('platform_username');
            $table->index('score');
        });
    },
    'down' => function (Builder $schema) {
        $schema->table('ziven_tournament_participants', function (Blueprint $table) {
            $table->dropIndex(['score']);
            $table->dropColumn('score');
        });
    },
];