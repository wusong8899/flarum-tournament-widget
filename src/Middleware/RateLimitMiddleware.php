<?php

namespace wusong8899\TournamentWidget\Middleware;

use Flarum\Http\Exception\RouteNotFoundException;
use Illuminate\Cache\CacheManager;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class RateLimitMiddleware implements MiddlewareInterface
{
    private const RATE_LIMIT_REQUESTS = 5;
    private const RATE_LIMIT_WINDOW = 60; // seconds

    public function __construct(
        private CacheManager $cache
    ) {
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $uri = $request->getUri()->getPath();
        
        // Only apply rate limiting to tournament participation endpoint
        if (!str_contains($uri, '/tournament/participate')) {
            return $handler->handle($request);
        }

        // Get user IP and user ID for rate limiting key
        $ip = $this->getClientIp($request);
        $userId = $request->getAttribute('actor')?->id ?? 'guest';
        $key = "tournament_rate_limit:{$ip}:{$userId}";

        $attempts = $this->cache->get($key, 0);
        
        if ($attempts >= self::RATE_LIMIT_REQUESTS) {
            return new JsonResponse(
                ['error' => 'Too Many Requests'],
                429,
                [
                    'X-RateLimit-Limit' => (string) self::RATE_LIMIT_REQUESTS,
                    'X-RateLimit-Remaining' => '0',
                    'X-RateLimit-Reset' => (string) (time() + self::RATE_LIMIT_WINDOW)
                ]
            );
        }

        // Increment attempts counter
        $this->cache->put($key, $attempts + 1, self::RATE_LIMIT_WINDOW);

        $response = $handler->handle($request);
        
        // Add rate limit headers to response
        $remaining = max(0, self::RATE_LIMIT_REQUESTS - ($attempts + 1));
        $response = $response
            ->withHeader('X-RateLimit-Limit', (string) self::RATE_LIMIT_REQUESTS)
            ->withHeader('X-RateLimit-Remaining', (string) $remaining)
            ->withHeader('X-RateLimit-Reset', (string) (time() + self::RATE_LIMIT_WINDOW));

        return $response;
    }

    private function getClientIp(ServerRequestInterface $request): string
    {
        $serverParams = $request->getServerParams();
        
        // Check for IP from various headers (for reverse proxies)
        $headers = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_X_FORWARDED_FOR',      // Standard proxy header
            'HTTP_X_REAL_IP',            // Nginx
            'REMOTE_ADDR'                // Direct connection
        ];

        foreach ($headers as $header) {
            if (!empty($serverParams[$header])) {
                $ip = trim(explode(',', $serverParams[$header])[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }

        return $serverParams['REMOTE_ADDR'] ?? '127.0.0.1';
    }
}