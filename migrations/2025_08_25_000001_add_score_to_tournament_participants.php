<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (!$schema->hasColumn('wusong8899_tournament_participants', 'score')) {
            $schema->table('wusong8899_tournament_participants', function (Blueprint $table) {
                $table->integer('score')->default(0)->after('platform_username');
                $table->index('score');
            });
        }
    },
    'down' => function (Builder $schema) {
        if ($schema->hasColumn('wusong8899_tournament_participants', 'score')) {
            $schema->table('wusong8899_tournament_participants', function (Blueprint $table) {
                $table->dropIndex(['score']);
                $table->dropColumn('score');
            });
        }
    },
];