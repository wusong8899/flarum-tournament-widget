<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if ($schema->hasTable('wusong8899_tournament_participants')) {
            $schema->table('wusong8899_tournament_participants', function (Blueprint $table) {
                // Add platform_id foreign key
                $table->unsignedInteger('platform_id')->nullable()->after('user_id');
                
                // Add platform_username field
                $table->string('platform_username')->nullable()->after('platform_id');
                
                // Add foreign key constraint
                $table->foreign('platform_id')->references('id')->on('wusong8899_tournament_platforms')->onDelete('set null');
                
                // Add index for platform queries
                $table->index('platform_id');
            });
            
            // If the old platform_account column exists, we'll keep it for now to allow data migration
            // It can be dropped in a future migration after data has been migrated
        }
    },
    'down' => function (Builder $schema) {
        if ($schema->hasTable('wusong8899_tournament_participants')) {
            $schema->table('wusong8899_tournament_participants', function (Blueprint $table) {
                $table->dropForeign(['platform_id']);
                $table->dropIndex(['platform_id']);
                $table->dropColumn(['platform_id', 'platform_username']);
            });
        }
    },
];