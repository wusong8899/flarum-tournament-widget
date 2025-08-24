<?php

declare(strict_types=1);

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\TournamentWidget\Api\Serializer\ParticipantSerializer;
use wusong8899\TournamentWidget\Model\Participant;

class ListParticipantsController extends AbstractListController
{
    public $serializer = ParticipantSerializer::class;

    public $include = ['user', 'platform', 'approvedBy'];

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);

        // Only admins can view participants list
        $actor->assertAdmin();

        // Get filter parameter: 'all', 'approved', 'pending'
        $filter = Arr::get($request->getQueryParams(), 'filter', 'all');

        $query = Participant::with(['user', 'platform', 'approvedBy']);

        // Apply filter
        switch ($filter) {
            case 'approved':
                $query->where('is_approved', true);
                break;
            case 'pending':
                $query->where('is_approved', false);
                break;
            case 'all':
            default:
                // No filter, show all participants
                break;
        }

        // Order by approval status (pending first), then by score, then by creation date
        return $query->orderBy('is_approved', 'asc')
            ->orderBy('score', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}