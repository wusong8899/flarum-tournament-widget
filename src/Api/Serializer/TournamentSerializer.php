<?php

namespace wusong8899\TournamentWidget\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Settings\SettingsRepositoryInterface;
use wusong8899\TournamentWidget\Model\Participant;

class TournamentSerializer extends AbstractSerializer
{
    protected $type = 'tournament';

    public function __construct(
        private SettingsRepositoryInterface $settings
    ) {
    }

    protected function getDefaultAttributes($data)
    {
        $participants = Participant::with('user')
            ->orderBy('score', 'desc')
            ->orderBy('created_at', 'asc')
            ->get();

        $userParticipation = null;
        if (isset($data['actor']) && $data['actor'] && !$data['actor']->isGuest()) {
            $userParticipation = $participants->firstWhere('user_id', $data['actor']->id);
        }

        return [
            'title' => 'K8 无双积分王',
            'prizePool' => '$12,500',
            'startDate' => $this->settings->get('wusong8899_tournament.start_date', '2025-08-23T00:00:00Z'),
            'detailsUrl' => $this->settings->get('wusong8899_tournament.details_url', '#'),
            'backgroundImage' => $this->settings->get('wusong8899_tournament.background_image', 'https://via.placeholder.com/400x200'),
            'userParticipated' => $userParticipation !== null,
            'totalParticipants' => $participants->count(),
            'participants' => $participants->map(function ($participant) {
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
            })->values()->all()
        ];
    }
}