<?php

namespace wusong8899\TournamentWidget\Command;

use Flarum\Foundation\ValidationException;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Support\Str;
use wusong8899\TournamentWidget\Model\Participant;

class ParticipateHandler
{
    public function __construct(
        private SettingsRepositoryInterface $settings
    ) {
    }

    public function handle(Participate $command): Participant
    {
        $actor = $command->actor;
        
        $actor->assertRegistered();
        $actor->assertCan('tournament.participate');
        
        // Check if user already participated
        $existingParticipation = Participant::where('user_id', $actor->id)->first();
        if ($existingParticipation) {
            throw new ValidationException([
                'message' => 'You have already participated in this tournament.'
            ]);
        }

        // Enhanced validation for platform account
        $platformAccount = trim(strip_tags($command->platformAccount));
        
        if (strlen($platformAccount) < 3) {
            throw new ValidationException([
                'platformAccount' => 'Platform account must be at least 3 characters long.'
            ]);
        }
        
        if (strlen($platformAccount) > 100) {
            throw new ValidationException([
                'platformAccount' => 'Platform account must be less than 100 characters.'
            ]);
        }
        
        // Check for invalid characters
        if (!preg_match('/^[a-zA-Z0-9_-]+$/', $platformAccount)) {
            throw new ValidationException([
                'platformAccount' => 'Platform account can only contain letters, numbers, underscores and hyphens.'
            ]);
        }
        
        // Check for duplicate platform accounts
        $existingPlatformAccount = Participant::where('platform_account', $platformAccount)->first();
        if ($existingPlatformAccount) {
            throw new ValidationException([
                'platformAccount' => 'This platform account is already registered.'
            ]);
        }

        $participant = new Participant();
        $participant->user_id = $actor->id;
        $participant->platform_account = $platformAccount;
        $participant->score = (int) $this->settings->get('wusong8899_tournament.initial_score', 0);
        $participant->save();

        return $participant;
    }
}