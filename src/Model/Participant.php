<?php

namespace wusong8899\TournamentWidget\Model;

use Flarum\Database\AbstractModel;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $platform_id
 * @property string|null $platform_username
 * @property string $platform_account
 * @property int $score
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property-read User $user
 * @property-read Platform|null $platform
 */
class Participant extends AbstractModel
{
    protected $table = 'wusong8899_tournament_participants';
    
    protected $fillable = [
        'user_id', 
        'platform_id', 
        'platform_username',
        'platform_account', // Keep for backward compatibility during migration
        'score'
    ];
    
    protected $dates = ['created_at', 'updated_at'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function platform(): BelongsTo
    {
        return $this->belongsTo(Platform::class);
    }

    /**
     * Get the display name for the platform
     * This handles both new (platform_id) and legacy (platform_account) data
     */
    public function getPlatformDisplayNameAttribute(): string
    {
        if ($this->platform) {
            return $this->platform->name;
        }
        
        // Fallback to legacy platform_account if no platform relationship exists
        return $this->platform_account ?: 'Unknown Platform';
    }

    /**
     * Get the username on the platform
     * This handles both new (platform_username) and legacy (platform_account) data
     */
    public function getPlatformUsernameDisplayAttribute(): string
    {
        return $this->platform_username ?: $this->platform_account ?: '';
    }
}