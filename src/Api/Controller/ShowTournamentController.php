<?php

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use wusong8899\TournamentWidget\Api\Serializer\TournamentSerializer;
use wusong8899\TournamentWidget\Model\Participant;

class ShowTournamentController extends AbstractShowController
{
    public $serializer = TournamentSerializer::class;

    public function __construct(
        private SettingsRepositoryInterface $settings
    ) {
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        
        // Pass the data needed by the serializer
        return [
            'actor' => $actor,
            'settings' => $this->settings
        ];
    }
}