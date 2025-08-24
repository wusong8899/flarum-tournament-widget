<?php

declare(strict_types=1);

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use wusong8899\TournamentWidget\Model\Platform;

class DeletePlatformController extends AbstractDeleteController
{
    protected function delete(ServerRequestInterface $request): void
    {
        $actor = RequestUtil::getActor($request);
        
        if (!$actor->isAdmin()) {
            $actor->assertCan('tournament.managePlatforms');
        }

        $id = Arr::get($request->getQueryParams(), 'id');
        $platform = Platform::findOrFail($id);

        // Check if platform has participants
        if ($platform->participants()->count() > 0) {
            // Don't delete, just deactivate
            $platform->is_active = false;
            $platform->save();
        } else {
            // Safe to delete
            $platform->delete();
        }
    }
}