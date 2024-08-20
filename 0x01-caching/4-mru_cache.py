#!/usr/bin/env python3
"""Task 4 Module"""


BaseCaching = __import__('base_caching').BaseCaching


class MRUCache(BaseCaching):
    """inherits from BaseCaching and is a caching system
    """
    def __init__(self):
        """Initialize
        """
        super().__init__()
        self.usedKeys = []

    def put(self, key, item):
        """ Add an item in the cache
        """
        if key is not None and item is not None:
            self.cache_data[key] = item
            if key not in self.usedKeys:
                self.usedKeys.append(key)
            else:
                self.usedKeys.append(
                    self.usedKeys.pop(self.usedKeys.index(key)))
            if len(self.usedKeys) > BaseCaching.MAX_ITEMS:
                discarded = self.usedKeys.pop(-2)
                del self.cache_data[discarded]
                print('DISCARD: {:s}'.format(discarded))

    def get(self, key):
        """ Get an item by key
        """
        if key is not None and key in self.cache_data.keys():
            self.usedKeys.append(self.usedKeys.pop(self.usedKeys.index(key)))
            return self.cache_data.get(key)
        return None
