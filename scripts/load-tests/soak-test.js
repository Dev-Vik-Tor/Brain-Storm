import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Soak Test — sustained load over a long period to detect memory leaks,
 * connection pool exhaustion, and gradual degradation.
 */

export const options = {
  stages: [
    { duration: '5m', target: 50 },
    { duration: '4h', target: 50 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<600', 'p(99)<1200'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/v1/courses`, {
    tags: { scenario: 'soak' },
  });

  check(res, {
    'status 200': (r) => r.status === 200,
    'response time < 600ms': (r) => r.timings.duration < 600,
  });

  sleep(3);
}
