// Load test: simulate N concurrent users on the HCMC traffic-cam map.
// One iteration = one user session slice: load page, open a camera popup (image
// via worker), sometimes load tide. Mirrors real usage in index.html.
// Run: k6 run -e VUS=100 -e DUR=20s -e CAM_IDS=<comma,separated> loadtest.js

import http from 'k6/http';
import { check, sleep } from 'k6';

const VUS = parseInt(__ENV.VUS || '10');
const DUR = __ENV.DUR || '20s';
const CAM_IDS = (__ENV.CAM_IDS || '5a6065c58576340017d06615').split(',');

const PAGE = 'https://rin2401.github.io/map/';
const WORKER = 'https://rinapi.rin2401.workers.dev';

export const options = {
    vus: VUS,
    duration: DUR,
    // one connection reuse per host like a browser session
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) loadtest',
};

export default function () {
    // 1. user opens the page
    let page = http.get(PAGE, { tags: { name: 'page' } });
    check(page, { 'page 200': (r) => r.status === 200 });

    sleep(Math.random() * 1.5 + 0.5);

    // 2. user clicks a camera marker -> popup image via worker
    const camId = CAM_IDS[Math.floor(Math.random() * CAM_IDS.length)];
    let cam = http.get(`${WORKER}/cam?id=${camId}`, { tags: { name: 'cam' } });
    check(cam, { 'cam 200': (r) => r.status === 200 });

    sleep(Math.random() * 2);

    // 3. ~20% of users also check the tide popup
    if (Math.random() < 0.2) {
        let tide = http.get(`${WORKER}/tide?location=sai-gon`, { tags: { name: 'tide' } });
        check(tide, { 'tide 200': (r) => r.status === 200 });
    }

    sleep(Math.random() * 1.5);
}
