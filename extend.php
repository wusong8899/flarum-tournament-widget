<?php

declare(strict_types=1);

namespace wusong8899\TournamentWidget;

use Flarum\Extend;
use Flarum\Api\Serializer\ForumSerializer;
use wusong8899\TournamentWidget\Api\Controller\ShowTournamentController;
use wusong8899\TournamentWidget\Api\Controller\ParticipateController;
use wusong8899\TournamentWidget\Api\Controller\ListPlatformsController;
use wusong8899\TournamentWidget\Api\Controller\CreatePlatformController;
use wusong8899\TournamentWidget\Api\Controller\UpdatePlatformController;
use wusong8899\TournamentWidget\Api\Controller\DeletePlatformController;
use wusong8899\TournamentWidget\Api\Controller\ListRankTitlesController;
use wusong8899\TournamentWidget\Api\Controller\UpdateRankTitlesController;
use wusong8899\TournamentWidget\Api\Controller\ListParticipantsController;
use wusong8899\TournamentWidget\Api\Controller\UpdateParticipantScoreController;
use wusong8899\TournamentWidget\Api\Controller\DeleteParticipantController;
use wusong8899\TournamentWidget\Api\Controller\ApproveParticipantController;
use wusong8899\TournamentWidget\Api\Controller\ListPendingParticipantsController;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
        ->route('/tournament/rankings', 'tournament.rankings'),
        
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),

    (new Extend\Routes('api'))
        ->get('/tournament', 'tournament.show', ShowTournamentController::class)
        ->post('/tournament/participate', 'tournament.participate', ParticipateController::class)
        ->get('/tournament/platforms', 'tournament.platforms.list', ListPlatformsController::class)
        ->post('/tournament/platforms', 'tournament.platforms.create', CreatePlatformController::class)
        ->patch('/tournament/platforms/{id}', 'tournament.platforms.update', UpdatePlatformController::class)
        ->delete('/tournament/platforms/{id}', 'tournament.platforms.delete', DeletePlatformController::class)
        ->get('/tournament/rank-titles', 'tournament.rank-titles.list', ListRankTitlesController::class)
        ->post('/tournament/rank-titles', 'tournament.rank-titles.update', UpdateRankTitlesController::class)
        ->get('/tournament/participants', 'tournament.participants.list', ListParticipantsController::class)
        ->get('/tournament/participants/pending', 'tournament.participants.pending', ListPendingParticipantsController::class)
        ->patch('/tournament/participants/{id}', 'tournament.participants.update', UpdateParticipantScoreController::class)
        ->patch('/tournament/participants/{id}/approve', 'tournament.participants.approve', ApproveParticipantController::class)
        ->delete('/tournament/participants/{id}', 'tournament.participants.delete', DeleteParticipantController::class),


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