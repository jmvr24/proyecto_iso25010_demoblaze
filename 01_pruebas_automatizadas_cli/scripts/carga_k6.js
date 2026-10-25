import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 50 },
    { duration: '20s', target: 50 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['avg<2000', 'p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const resHome = http.get('https://www.demoblaze.com/index.html');
  check(resHome, {
    'GET index.html status 200': (r) => r.status === 200,
  });

  const resApi = http.get('https://api.demoblaze.com/entries');
  check(resApi, {
    'GET api/entries status 200': (r) => r.status === 200,
  });

  sleep(1);
}
