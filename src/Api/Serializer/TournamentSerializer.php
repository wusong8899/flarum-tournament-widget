<?php

declare(strict_types=1);

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

        $participants = Participant::with(['user', 'platform'])
            ->orderBy('score', 'desc')
            ->orderBy('created_at', 'asc')
            ->get();

        // Get custom rank titles from settings
        $rankTitles = json_decode($settings->get('wusong8899_tournament.rank_titles', '{}'), true);
        $defaultTitles = [
            1 => '冠军',
            2 => '亚军',
            3 => '季军',
            '4-10' => '优秀选手',
            'default' => '参赛选手'
        ];
        $rankTitles = array_merge($defaultTitles, $rankTitles);

        $participantsData = $participants->map(function ($participant, $index) use ($rankTitles) {
            $rank = $index + 1;

            // Determine rank title
            $title = $rankTitles['default'];
            if (isset($rankTitles[$rank])) {
                $title = $rankTitles[$rank];
            } else {
                // Check range titles like "4-10"
                foreach ($rankTitles as $key => $value) {
                    if (strpos($key, '-') !== false) {
                        [$start, $end] = explode('-', $key);
                        if ($rank >= (int)$start && $rank <= (int)$end) {
                            $title = $value;
                            break;
                        }
                    }
                }
            }

            return [
                'id' => $participant->id,
                'rank' => $rank,
                'title' => $title,
                'score' => (int) $participant->score,
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
                ],
                'platform' => [
                    'id' => $participant->platform_id,
                    'name' => $participant->platform_display_name,
                    'username' => $participant->platform_username_display,
                    'iconUrl' => $participant->platform?->icon_url,
                    'iconClass' => $participant->platform?->icon_class,
                    'usesUrlIcon' => $participant->platform?->uses_url_icon ?? false,
                    'usesCssIcon' => $participant->platform?->uses_css_icon ?? false,
                ],
                // Keep legacy field for compatibility
                'platformAccount' => $participant->platform_account,
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