from app.main import bp

@bp.route('/')
def index():
    return '<h1>Home page</h1>'
