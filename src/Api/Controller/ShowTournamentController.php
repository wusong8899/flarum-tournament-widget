<?php

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\TournamentWidget\Api\Serializer\TournamentSerializer;
use wusong8899\TournamentWidget\Model\Participant;

class ShowTournamentController extends AbstractShowController
{
    public $serializer = TournamentSerializer::class;

    public function __construct(
        private SettingsRepositoryInterface $settings
    ) {
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        
        $participants = Participant::with('user')
            ->orderBy('score', 'desc')
            ->orderBy('created_at', 'asc')
            ->get();

        $userParticipation = null;
        if ($actor && !$actor->isGuest()) {
            $userParticipation = $participants->firstWhere('user_id', $actor->id);
        }

        $participantsData = $participants->map(function ($participant) {
            return [
                'id' => $participant->id,
                'platformAccount' => $participant->platform_account,
                'score' => $participant->score,
                'createdAt' => $participant->created_at->toISOString(),
                'user' => [
                    'id' => $participant->user_id,
                    'username' => $participant->user->username,
                    'displayName' => $participant->user->display_name,
                    'avatarUrl' => $participant->user->avatar_url,
                ]
            ];
        })->values()->all();

        return [
            'type' => 'tournament',
            'id' => '1',
            'attributes' => [
                'title' => 'K8 无双积分王',
                'prizePool' => '$12,500',
                'startDate' => $this->settings->get('wusong8899_tournament.start_date', '2025-08-23T00:00:00Z'),
                'detailsUrl' => $this->settings->get('wusong8899_tournament.details_url', '#'),
                'backgroundImage' => $this->settings->get('wusong8899_tournament.background_image', 'https://via.placeholder.com/400x200'),
                'userParticipated' => $userParticipation !== null,
                'totalParticipants' => $participants->count(),
                'participants' => $participantsData,
            ]
        ];
    }
}