"""Pagination permettant au client de demander jusqu'à 1 000 000 éléments (ex. patients)."""
from rest_framework.pagination import PageNumberPagination


class LargePageNumberPagination(PageNumberPagination):
    page_size = 5000
    page_size_query_param = 'page_size'
    max_page_size = 1000000
