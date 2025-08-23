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
        $actor = $data->actor ?? null;
        $settings = $data->settings ?? resolve(SettingsRepositoryInterface::class);

        $participants = Participant::with('user')
            ->join('users', 'ziven_tournament_participants.user_id', '=', 'users.id')
            ->orderBy('users.money', 'desc')
            ->orderBy('ziven_tournament_participants.created_at', 'asc')
            ->select('ziven_tournament_participants.*')
            ->get();

        $participantsData = $participants->map(function ($participant) {
            return [
                'id' => $participant->id,
                'platformAccount' => $participant->platform_account,
                'money' => $participant->user !== null ? (int) $participant->user->getAttribute('money') : 0,
                'createdAt' => $participant->created_at !== null ? $participant->created_at->toISOString() : null,
                'user' => $participant->user !== null ? [
                    'id' => $participant->user_id,
                    'username' => $participant->user->username,
                    'displayName' => $participant->user->display_name,
                    'avatarUrl' => $participant->user->avatar_url,
                ] : [
                    'id' => $participant->user_id,
                    'username' => 'Deleted User',
                    'displayName' => 'Deleted User',
                    'avatarUrl' => null,
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