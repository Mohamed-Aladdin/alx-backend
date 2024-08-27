#!/usr/bin/env python3
"""Task 8 Module"""

from flask import Flask, render_template, request, g
from flask_babel import Babel
from pytz import timezone
import pytz.exceptions
from datetime import datetime
import locale


class Config(object):
    """Configuration class
    """
    LANGUAGES = ['en', 'fr']
    BABEL_DEFAULT_LOCALE = 'en'
    BABEL_DEFAULT_TIMEZONE = 'UTC'


app = Flask(__name__)
app.config.from_object(Config)
app.url_map.strict_slashes = False
babel = Babel(app)


users = {
    1: {"name": "Balou", "locale": "fr", "timezone": "Europe/Paris"},
    2: {"name": "Beyonce", "locale": "en", "timezone": "US/Central"},
    3: {"name": "Spock", "locale": "kg", "timezone": "Vulcan"},
    4: {"name": "Teletubby", "locale": None, "timezone": "Europe/London"},
}


def get_user():
    """returns a user dictionary or None if the ID
    cannot be found or if login_as was not passed
    """
    login_id = request.args.get('login_as')

    if login_id:
        return users.get(int(login_id))
    return None


@app.before_request
def before_request():
    """use the app.before_request decorator to make
    it be executed before all other functions
    """
    user = get_user()
    g.user = user

    now = pytz.utc.localize(datetime.utcnow())
    time = now.astimezone(timezone(get_timezone()))
    locale.setlocale(locale.LC_TIME, (get_locale(), 'UTF-8'))
    format = "%b %d, %Y %I:%M:%S %p"
    g.time = time.strftime(format)


@babel.localeselector
def get_locale():
    """to determine the best match with our supported languages
    """
    locale = request.args.get('locale')

    if locale in app.config['LANGUAGES']:
        print(locale)
        return locale

    if g.user:
        locale = g.user.get('locale')
        if locale and locale in app.config['LANGUAGES']:
            return locale

    locale = request.headers.get('locale', None)
    if locale in app.config['LANGUAGES']:
        return locale

    return request.accept_languages.best_match(app.config['LANGUAGES'])


@babel.timezoneselector
def get_timezone():
    """The logic should be the same as get_locale
    """
    timezone = request.args.get('timezone', None)
    if timezone:
        try:
            return timezone(timezone).zone
        except pytz.exceptions.UnknownTimeZoneError:
            pass

    if g.user:
        try:
            timezone = g.user.get('timezone')
            return timezone(timezone).zone
        except pytz.exceptions.UnknownTimeZoneError:
            pass

    default_timezone = app.config['BABEL_DEFAULT_TIMEZONE']
    return default_timezone


@app.route('/')
def hello_world():
    """GET route to home page
    """
    return render_template('index.html')


if __name__ == '__main__':
    app.run(port="5000", host="0.0.0.0", debug=True)
