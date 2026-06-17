from backend.app.main import app as fastapi_app


class VercelApiPrefixMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get("type") == "http":
            path = scope.get("path", "")
            if path and not path.startswith("/api"):
                scope = dict(scope)
                scope["path"] = f"/api{path}"

        await self.app(scope, receive, send)


app = VercelApiPrefixMiddleware(fastapi_app)
