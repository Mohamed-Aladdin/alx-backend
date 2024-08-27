#!/usr/bin/env python3
"""Task 0 Module"""

from flask import flask, render_template

app = flask(__name__)


@app.route('/')
def hello_world():
    """GET route to home page
    """
    return render_template('0-index.html')


if __name__ == '__main__':
    app.run(port="5000", host="0.0.0.0", debug=True)
