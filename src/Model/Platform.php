<?php

namespace wusong8899\TournamentWidget\Model;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

/**
 * @property int $id
 * @property string $name
 * @property string|null $icon_url
 * @property string|null $icon_class
 * @property bool $is_active
 * @property int $display_order
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Platform extends AbstractModel
{
    protected $table = 'wusong8899_tournament_platforms';
    
    protected $fillable = [
        'name',
        'icon_url',
        'icon_class',
        'is_active',
        'display_order'
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];
    
    protected $dates = ['created_at', 'updated_at'];

    /**
     * Get all participants using this platform
     */
    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }

    /**
     * Scope to get only active platforms
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by display order
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order')->orderBy('name');
    }

    /**
     * Get the icon to display (either URL or CSS class)
     */
    public function getIconAttribute(): ?string
    {
        return $this->icon_url ?: $this->icon_class;
    }

    /**
     * Check if this platform uses a URL icon
     */
    public function getUsesUrlIconAttribute(): bool
    {
        return !empty($this->icon_url);
    }

    /**
     * Check if this platform uses a CSS class icon
     */
    public function getUsesCssIconAttribute(): bool
    {
        return !empty($this->icon_class) && empty($this->icon_url);
    }
}