# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

`day02/` contains three independent projects that together form the **ZX API Test Platform** (an API/page/flow test-management system):

- `qcoder-python/` — FastAPI + MySQL backend (the core application)
- `trae-vue/` — Vue 3 admin frontend that talks to the backend
- `locust/` — standalone load/Playwright scripts (not wired into the app; see notes below)

> The backend `readme.md` and frontend `PROJECT.md` are extensive but partly aspirational — they describe an idealized structure that has drifted from the code (e.g. route paths, a `tests/` dir, `utils/` filenames). **When docs and code disagree, trust the code.** Concrete divergences are called out below.

## Commands

### Backend (`qcoder-python/`)
```bash
python -m venv venv && venv\Scripts\activate   # Windows; venv/ is committed but recreate if needed
pip install -r requirements.txt
python main.py            # runs uvicorn on 0.0.0.0:8000 with reload (see __main__ block)
# or: uvicorn main:app --reload
```
- API docs: `http://localhost:8000/docs` (Swagger), `/redoc`, health at `/health`.
- There is **no test suite present** despite `readme.md` referencing `pytest tests/` — the `tests/` directory does not exist. `pytest`/`playwright` are in `requirements.txt` but unused in-repo.
- VS Code launch config: `.vscode/launch.json` ("Python 调试程序: FastAPI").

### Frontend (`trae-vue/`)
```bash
npm install
npm run dev        # Vite dev server on :5173
npm run build      # production build
npm run preview
```
- No linter/test scripts are configured (only `dev`/`build`/`preview` in `package.json`).
- The dev server proxies `/api/*` → `http://localhost:8000` and **strips the `/api` prefix** (`rewrite: path.replace(/^\/api/, '')`). So a frontend call to `/api/v1/apiInfo` hits the backend at `/api/v1/apiInfo` only because `VITE_API_BASE_URL=/api` and the backend routes already include `/api/v1`. Keep this in mind when adding routes.

### Load testing (`locust/`)
```bash
locust -f locust/locustfile.py
```
Note: `locustfile.py` currently targets a **different** system (`/dev-api/...`, `business/customer/list`) and a `token` login field — it is leftover template code, not aligned with this backend. Update endpoints before using.

## Backend architecture (`qcoder-python/`)

Strict 5-layer split, **one file per domain entity in each layer**. For an entity `X` (e.g. `api_info`, `project_info`, `flow_step`, `token_info`):

```
api/v1/X.py        # FastAPI router: thin, delegates to service
service/X_service.py  # business logic, validation, builds response dicts
mysql/X_sql.py     # all DB/CRUD/query logic (the "repository" layer)
models/X_model.py  # SQLAlchemy ORM model (table)
schemas/X_schemas.py  # Pydantic v2 request/response models
```

Request flow: **router → service → mysql (CRUD) → models**, with `schemas` validating in/out at the router and service boundaries. `api/v1/__init__.py` mounts every entity router under `prefix="/api/v1"`.

### Conventions that matter (and are easy to get wrong)

1. **Services return plain dicts, they do not raise.** Use `success_response(msg, data)` / `error_response(msg, data, error)` from `core/responsemsg.py`. Business failures (not-found, duplicate) return `error_response` with `success=False` and HTTP 200 — they are *not* HTTPExceptions. Only unexpected exceptions bubble up to the global handler in `main.py`, which wraps them as a 500 `error_response`. The response envelope is always `{msg, success, data, error?}`.

2. **camelCase boundary, snake_case internals.** Schemas set `alias_generator=to_camel, populate_by_name=True, from_attributes=True` (see `schemas/api_info_schemas.py`). Frontend sends and receives **camelCase** (`apiName`, `projectId`); Python code, ORM columns, and DB fields stay **snake_case**. `datetime` fields are serialized to `"YYYY-MM-DD HH:MM:SS"` strings via a `@field_serializer` on the response schema.

3. **Route paths use camelCase resource names**, e.g. `GET/POST/PUT /api/v1/apiInfo`, `DELETE /api/v1/apiInfo/{id}`, batch `DELETE /api/v1/apiInfo/batch`. This contradicts `readme.md`, which describes kebab-case (`/api/v1/project-info`) and `/projects/` style paths — the README is wrong here. **Define the batch route before the `/{item_id}` route** so `/batch` isn't captured as an id (see `api/v1/api_info.py`).

4. **List endpoints take a flat filter+pagination schema via `Depends()`.** The `XList` schema subclasses the base, adds `page_num`/`page_size`, and exposes a `filter_params()` method returning a list of SQLAlchemy filter clauses. The mysql layer applies `.filter(*data.filter_params())`. Pagination responses are built with `create_page_response(...)` from `utils/pagination.py` (returns `total/pageNum/pageSize/pages/items`).

5. **The mysql layer often hand-builds response schema objects with joins.** Read queries (e.g. `get_api_info_by_id`, `get_api_info_list`) `outerjoin` related tables (project name/address, token name/value) and construct `XInfo(...)` Pydantic objects column-by-column rather than returning raw ORM rows. When adding fields, update both the query projection and the manual object construction.

6. **Audit fields are set in the mysql layer**, not the model — call `set_audit_fields_for_create` / `set_audit_fields_for_update` from `utils/data_paser.py` (already wired in the CRUD create/update functions).

7. **Cascade deletes are manual.** Deleting a parent (e.g. `delete_api_info_service`) explicitly calls the child `delete_..._by_api_id` functions before deleting itself — there is no DB-level cascade.

8. **DB session & async.** `core/db.py` exposes `get_db()` (FastAPI dependency) and `engine`/`Base`. `main.py` calls `Base.metadata.create_all(bind=engine)` on import — **tables are auto-created, there are no migrations**. Note: service/mysql functions are declared `async def` and `await`ed, but the SQLAlchemy `Session` calls inside are **synchronous** (this is a stylistic pattern in the codebase, not true async DB I/O).

9. **Config** comes from `core/config.py` (`pydantic-settings`) reading `.env`. `DATABASE_URL` is required from the environment (`os.getenv`); `SECRET_KEY`, JWT, and CORS settings live here too.

### Adding a new backend entity
Create the five files (`models`, `schemas`, `mysql`, `service`, `api/v1`) following an existing entity like `api_info` as the template, then register the router in `api/v1/__init__.py`. Newer non-CRUD features live in `api_execute.py` / `swagger_parse.py` (+ matching `service/`), which deviate from the pure-CRUD pattern.

## Frontend architecture (`trae-vue/`)

Vue 3 (Composition API) + Vite + Element Plus + Pinia + Vue Router.

- **API modules** in `src/api/`, grouped by menu module then page: e.g. `src/api/api/api.js`, `src/api/system/user.js`. Method naming convention: `getList`, `getDetail`, `add`, `update`, `delete`. All go through the shared axios instance.
- **`src/utils/request.js`** — axios wrapper: injects `Bearer` token from the Pinia user store / `localStorage`, handles HTTP-status errors, and auto-logs-out + redirects to `/login` on 401. Its response interceptor branches on a numeric `res.code`, but **this backend does not return `code`** — it returns `{msg, success, data}`. Because `res.code` is `undefined`, responses pass through untouched and the data envelope reaches the caller.
- **`src/utils/responseHandler.js`** — this is where the backend envelope is actually interpreted: `handleApiResponse(res)` / `handleApiResponseWithCallback(res, onSuccess)` branch on `res.success` and toast `res.msg`. Views use these for the standard `{msg, success, data}` shape.
- **Views** under `src/views/<module>/<page>/index.vue`; routes in `src/router/index.js` (with auth guard). Reusable `CommonTable` / `CommonDialog` / `CommonButton` components in `src/components/` back most list pages.
- `@` aliases to `src/` (Vite config). Backend base URL via `VITE_API_BASE_URL` in `.env.development` / `.env.production`.

## Default credentials (dev/seed)
Backend seed users (from `readme.md`): `admin` / `admin123`, `test_user` / `test123`. These are for local development only.
