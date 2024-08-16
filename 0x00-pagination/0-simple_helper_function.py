#!/usr/bin/env python3
"""Task 0 Module"""


from typing import Tuple


def index_range(page: int, page_size: int) -> Tuple:
    """The function should return a tuple of size two containing a start
    index and an end index corresponding to the range of indexes to
    return in a list for those particular pagination parameters.
    """
    return ((page - 1) * page_size, page * page_size)
