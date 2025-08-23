<?php

namespace wusong8899\TournamentWidget\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use wusong8899\TournamentWidget\Model\Platform;

class PlatformSerializer extends AbstractSerializer
{
    protected $type = 'platforms';

    protected function getDefaultAttributes($platform)
    {
        if (!($platform instanceof Platform)) {
            throw new \InvalidArgumentException('Expected Platform model');
        }

        return [
            'id' => $platform->id,
            'name' => $platform->name,
            'iconUrl' => $platform->icon_url,
            'iconClass' => $platform->icon_class,
            'isActive' => $platform->is_active,
            'displayOrder' => $platform->display_order,
            'usesUrlIcon' => $platform->uses_url_icon,
            'usesCssIcon' => $platform->uses_css_icon,
            'icon' => $platform->icon,
            'participantCount' => $platform->participants()->count(),
            'createdAt' => $this->formatDate($platform->created_at),
            'updatedAt' => $this->formatDate($platform->updated_at),
        ];
    }
}