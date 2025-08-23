<?php

namespace wusong8899\TournamentWidget\Command;

use Flarum\Foundation\ValidationException;
use Illuminate\Support\Str;
use wusong8899\TournamentWidget\Model\Participant;
use wusong8899\TournamentWidget\Model\Platform;

class ParticipateHandler
{

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

        // Validate platform selection
        $platformId = $command->platformId ?? null;
        $platformUsername = trim(strip_tags($command->platformUsername ?? ''));
        
        // For backward compatibility, handle old platformAccount field
        $legacyPlatformAccount = trim(strip_tags($command->platformAccount ?? ''));
        
        // If we have new platform data, use it; otherwise fall back to legacy
        if ($platformId && $platformUsername) {
            // New platform system
            $platform = Platform::where('id', $platformId)->where('is_active', true)->first();
            if (!$platform) {
                throw new ValidationException([
                    'platformId' => 'Selected platform is not available.'
                ]);
            }

            if (strlen($platformUsername) < 2) {
                throw new ValidationException([
                    'platformUsername' => 'Platform username must be at least 2 characters long.'
                ]);
            }
            
            if (strlen($platformUsername) > 50) {
                throw new ValidationException([
                    'platformUsername' => 'Platform username must be less than 50 characters.'
                ]);
            }
            
            // Check for duplicate platform + username combination
            $existingParticipant = Participant::where('platform_id', $platformId)
                                            ->where('platform_username', $platformUsername)
                                            ->first();
            if ($existingParticipant) {
                throw new ValidationException([
                    'platformUsername' => 'This username is already registered on the selected platform.'
                ]);
            }

            $participant = new Participant();
            $participant->user_id = $actor->id;
            $participant->platform_id = $platformId;
            $participant->platform_username = $platformUsername;
            $participant->save();
            
        } else if ($legacyPlatformAccount) {
            // Legacy platform account system (for backward compatibility)
            if (strlen($legacyPlatformAccount) < 3) {
                throw new ValidationException([
                    'platformAccount' => 'Platform account must be at least 3 characters long.'
                ]);
            }
            
            if (strlen($legacyPlatformAccount) > 100) {
                throw new ValidationException([
                    'platformAccount' => 'Platform account must be less than 100 characters.'
                ]);
            }
            
            // Check for invalid characters
            if (!preg_match('/^[a-zA-Z0-9_-]+$/', $legacyPlatformAccount)) {
                throw new ValidationException([
                    'platformAccount' => 'Platform account can only contain letters, numbers, underscores and hyphens.'
                ]);
            }
            
            // Check for duplicate platform accounts
            $existingPlatformAccount = Participant::where('platform_account', $legacyPlatformAccount)->first();
            if ($existingPlatformAccount) {
                throw new ValidationException([
                    'platformAccount' => 'This platform account is already registered.'
                ]);
            }

            $participant = new Participant();
            $participant->user_id = $actor->id;
            $participant->platform_account = $legacyPlatformAccount;
            $participant->save();
            
        } else {
            throw new ValidationException([
                'platform' => 'Please select a platform and enter your username.'
            ]);
        }

        return $participant;
    }
}