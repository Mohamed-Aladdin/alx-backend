#!/usr/bin/env python3
"""Task 3 Module"""

from flask import flask, render_template, request
from flask_babel import Babel


class Config(object):
    """Configuration class
    """
    LANGUAGES = ['en', 'fr']
    BABEL_DEFAULT_LOCAL = 'en'
    BABEL_DEFAULT_TIMEZONE = 'UTC'


app = flask(__name__)
app.config.from_object(Config)
babel = Babel(app)

@babel.localeselector
def get_locale():
    """to determine the best match with our supported languages
    """
    return request.accept_languages.best_match(app.config['LANGUAGES'])

@app.route('/')
def hello_world():
    """GET route to home page
    """
    return render_template('1-index.html')


if __name__ == '__main__':
    app.run(port="5000", host="0.0.0.0", debug=True)
