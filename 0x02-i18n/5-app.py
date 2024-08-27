#!/usr/bin/env python3
"""Task 5 Module"""

from flask import Flask, render_template, request, g
from flask_babel import Babel


class Config(object):
    """Configuration class
    """
    LANGUAGES = ['en', 'fr']
    BABEL_DEFAULT_LOCAL = 'en'
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


@babel.localeselector
def get_locale():
    """to determine the best match with our supported languages
    """
    locale = request.args.get('locale')

    if locale in app.config['LANGUAGES']:
        print(locale)
        return locale
    return request.accept_languages.best_match(app.config['LANGUAGES'])


@app.route('/')
def hello_world():
    """GET route to home page
    """
    return render_template('5-index.html')


if __name__ == '__main__':
    app.run(port="5000", host="0.0.0.0", debug=True)
