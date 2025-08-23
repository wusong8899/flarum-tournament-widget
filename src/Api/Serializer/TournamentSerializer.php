<?php

namespace wusong8899\TournamentWidget\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Settings\SettingsRepositoryInterface;
use wusong8899\TournamentWidget\Model\Participant;

class TournamentSerializer extends AbstractSerializer
{
    protected $type = 'tournament';

    protected function getDefaultAttributes($data)
    {
        $actor = $data['actor'] ?? null;
        $settings = $data['settings'] ?? resolve(SettingsRepositoryInterface::class);
        
        $participants = Participant::with('user')
            ->orderBy('score', 'desc')
            ->orderBy('created_at', 'asc')
            ->get();

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

        $tournamentData = [
            'title' => $settings->get('wusong8899_tournament.title', 'K8 无双积分王'),
            'prizePool' => $settings->get('wusong8899_tournament.prize_pool', '$12,500'),
            'startDate' => $settings->get('wusong8899_tournament.start_date', '2025-08-23T00:00:00Z'),
            'detailsUrl' => $settings->get('wusong8899_tournament.details_url', '#'),
            'backgroundImage' => $settings
                ->get('wusong8899_tournament.background_image', 'https://via.placeholder.com/400x200'),
            'totalParticipants' => $participants->count(),
            'participants' => $participantsData,
        ];

        // Check user participation (not cached since it's user-specific)
        $userParticipation = null;
        if ($actor && !$actor->isGuest()) {
            $userParticipation = Participant::where('user_id', $actor->id)->first();
        }

        return array_merge($tournamentData, [
            'userParticipated' => $userParticipation !== null,
        ]);
    }
}