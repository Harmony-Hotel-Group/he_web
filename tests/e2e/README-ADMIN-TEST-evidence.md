Admin route exists but requires authentication.

Route: src/pages/api/admin/cache.ts
Method: POST
Authentication: Requires Authorization header with Bearer token matching the environment variable CACHE_PRIVATE_KEY.

Without providing the correct credentials, the route returns a 401 Unauthorized response.

Therefore, the admin route is not accessible without authentication and cannot be tested in an E2E test without exposing sensitive credentials or disabling security measures, which is not acceptable for a production-ready setup.