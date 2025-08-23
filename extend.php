<?php

namespace wusong8899\TournamentWidget;

use Flarum\Extend;
use Flarum\Api\Serializer\ForumSerializer;
use wusong8899\TournamentWidget\Api\Controller;
use wusong8899\TournamentWidget\Command\Participate;
use wusong8899\TournamentWidget\Command\ParticipateHandler;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist-forum/extension.js')
        ->css(__DIR__.'/less/forum.less'),
        
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist-admin/extension.js'),

    (new Extend\Routes('api'))
        ->get('/tournament', 'tournament.show', Controller\ShowTournamentController::class)
        ->post('/tournament/participate', 'tournament.participate', Controller\ParticipateController::class),

    (new Extend\Bus())
        ->command(Participate::class, ParticipateHandler::class),

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