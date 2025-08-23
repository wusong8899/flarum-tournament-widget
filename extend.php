<?php

namespace wusong8899\TournamentWidget;

use Flarum\Extend;
use Flarum\Api\Serializer\ForumSerializer;
use wusong8899\TournamentWidget\Api\Controller;
use wusong8899\TournamentWidget\Middleware\RateLimitMiddleware;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),
        
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),

    (new Extend\Routes('api'))
        ->get('/tournament', 'tournament.show', Controller\ShowTournamentController::class)
        ->post('/tournament/participate', 'tournament.participate', Controller\ParticipateController::class)
        ->get('/tournament/platforms', 'tournament.platforms.list', Controller\ListPlatformsController::class)
        ->post('/tournament/platforms', 'tournament.platforms.create', Controller\CreatePlatformController::class)
        ->patch('/tournament/platforms/{id}', 'tournament.platforms.update', Controller\UpdatePlatformController::class)
        ->delete('/tournament/platforms/{id}', 'tournament.platforms.delete', Controller\DeletePlatformController::class)
        ->get('/tournament/rank-titles', 'tournament.rank-titles.list', Controller\ListRankTitlesController::class)
        ->post('/tournament/rank-titles', 'tournament.rank-titles.update', Controller\UpdateRankTitlesController::class),

    (new Extend\Middleware('api'))
        ->add(RateLimitMiddleware::class),


    (new Extend\ApiSerializer(ForumSerializer::class))
        ->attributes(function () {
            return [
                'tournamentDetailsUrl' => resolve('flarum.settings')->get('wusong8899_tournament.details_url', '#'),
                'tournamentStartDate' => resolve('flarum.settings')->get('wusong8899_tournament.start_date', '2025-08-23T00:00:00Z'),
                'tournamentBackgroundImage' => resolve('flarum.settings')->get('wusong8899_tournament.background_image', 'https://via.placeholder.com/400x200'),
            ];
        }),

    new Extend\Locales(__DIR__.'/locale'),
];