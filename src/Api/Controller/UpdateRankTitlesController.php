<?php

namespace wusong8899\TournamentWidget\Api\Controller;

use Flarum\Http\RequestUtil;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Support\Arr;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class UpdateRankTitlesController implements RequestHandlerInterface
{
    protected SettingsRepositoryInterface $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertAdmin();

        $attributes = Arr::get($request->getParsedBody(), 'data.attributes', []);
        $rankTitles = Arr::get($attributes, 'rankTitles', []);

        // Validate and sanitize rank titles
        $validatedTitles = [];
        foreach ($rankTitles as $rank => $title) {
            if (empty(trim($title))) {
                continue;
            }
            
            // Validate rank format (number, range like "4-10", or "default")
            if (is_numeric($rank) || $rank === 'default' || preg_match('/^\d+-\d+$/', $rank)) {
                $validatedTitles[$rank] = trim($title);
            }
        }

        $this->settings->set('wusong8899_tournament.rank_titles', json_encode($validatedTitles));

        return new JsonResponse([
            'data' => [
                'type' => 'rank-titles',
                'id' => 'rank-titles',
                'attributes' => [
                    'rankTitles' => $validatedTitles
                ]
            ]
        ]);
    }
}