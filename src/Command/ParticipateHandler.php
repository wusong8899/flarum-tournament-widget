<?php

declare(strict_types=1);

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
                'message' => '您已经参加过此次锦标赛'
            ]);
        }

        // Validate platform selection
        $platformId = $command->platformId ?? null;
        $platformUsername = trim(strip_tags($command->platformUsername ?? ''));
        
        // For backward compatibility, handle old platformAccount field
        $legacyPlatformAccount = trim(strip_tags($command->platformAccount ?? ''));
        
        // If we have new platform data, use it; otherwise fall back to legacy
        if ($platformId && !empty($platformUsername)) {
            // New platform system
            $platform = Platform::where('id', $platformId)->where('is_active', true)->first();
            if (!$platform) {
                throw new ValidationException([
                    'platformId' => '所选平台不可用'
                ]);
            }
            
            // Check for duplicate platform + username combination
            $existingParticipant = Participant::where('platform_id', $platformId)
                                            ->where('platform_username', $platformUsername)
                                            ->first();
            if ($existingParticipant) {
                throw new ValidationException([
                    'platformUsername' => '此用户名在该平台上已被注册'
                ]);
            }

            $participant = new Participant();
            $participant->user_id = $actor->id;
            $participant->platform_id = $platformId;
            $participant->platform_username = $platformUsername;
            $participant->score = $command->winLossAmount;
            $participant->is_approved = false; // New participants need approval
            $participant->save();
            
        } else if (!empty($legacyPlatformAccount)) {
            // Legacy platform account system (for backward compatibility)
            
            // Check for duplicate platform accounts
            $existingPlatformAccount = Participant::where('platform_account', $legacyPlatformAccount)->first();
            if ($existingPlatformAccount) {
                throw new ValidationException([
                    'platformAccount' => '此平台账号已被注册'
                ]);
            }

            $participant = new Participant();
            $participant->user_id = $actor->id;
            $participant->platform_account = $legacyPlatformAccount;
            $participant->score = $command->winLossAmount;
            $participant->is_approved = false; // New participants need approval
            $participant->save();
            
        } else {
            throw new ValidationException([
                'platform' => '请选择平台并输入用户名'
            ]);
        }

        return $participant;
    }
}