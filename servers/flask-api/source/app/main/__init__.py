from flask import Blueprint

main = Blueprint('main', __name__)

from . import errors
from ..models import Permission


@main.app_context_processor
def inject_permissions():
    return dict(Permission=Permission)


@main.route('/')
def index():
    return "api/v1"
