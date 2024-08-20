#!/usr/bin/env python3
"""Task 2 Module"""


BaseCaching = __import__('base_caching').BaseCaching


class LIFOCache(BaseCaching):
    """inherits from BaseCaching and is a caching system
    """
    def __init__(self):
        """Initialize
        """
        super.__init__()

    def put(self, key, item):
        """Add an item in the cache
        """
        if key is None or item is None:
            pass
        else:
            if len(self.cache_data) >= BaseCaching.MAX_ITEMS \
                    and key not in self.cache_data.keys():
                discarded_key, discarded_item = self.cache_data.popitem()
                print("DISCARD: {}". format(discarded_key))
            self.cache_data[key] = item

    def get(self, key):
        """Get an item by key
        """
        if key is None or key not in self.cache_data.keys():
            return None
        return self.cache_data.get(key)
