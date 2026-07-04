"""
RAG Retriever — wraps ChromaDB queries with optional source filtering.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

import chromadb

CHROMA_DB_PATH = os.environ.get("CHROMA_DB_PATH", "./chroma_db")
if not os.path.isabs(CHROMA_DB_PATH):
    CHROMA_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), CHROMA_DB_PATH.lstrip("./"))

COLLECTION_NAME = "eduos"

_client = None
_collection = None


def _get_collection():
    global _client, _collection
    if _collection is None:
        _client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
        _collection = _client.get_collection(COLLECTION_NAME)
    return _collection


def retrieve(
    query: str,
    source_filter: str | None = None,
    student_id_filter: str | None = None,
    n: int = 6,
) -> list[str]:
    """
    Query ChromaDB and return a list of matching text chunks.

    Args:
        query: Natural language query
        source_filter: One of 'students', 'quiz_results', 'video_engagement', 'assignments', 'curriculum'
        student_id_filter: e.g. 'S042' — filters to a specific student
        n: Number of results to return

    Returns:
        List of document text strings
    """
    collection = _get_collection()

    where_conditions = []
    if source_filter:
        where_conditions.append({"source": {"$eq": source_filter}})
    if student_id_filter:
        where_conditions.append({"student_id": {"$eq": student_id_filter}})

    where = None
    if len(where_conditions) == 1:
        where = where_conditions[0]
    elif len(where_conditions) > 1:
        where = {"$and": where_conditions}

    kwargs = {
        "query_texts": [query],
        "n_results": min(n, collection.count()),
        "include": ["documents", "metadatas", "distances"],
    }
    if where:
        kwargs["where"] = where

    results = collection.query(**kwargs)
    return results["documents"][0] if results["documents"] else []


def retrieve_with_metadata(
    query: str,
    source_filter: str | None = None,
    student_id_filter: str | None = None,
    n: int = 6,
) -> list[dict]:
    """Same as retrieve but returns dicts with text + metadata."""
    collection = _get_collection()

    where_conditions = []
    if source_filter:
        where_conditions.append({"source": {"$eq": source_filter}})
    if student_id_filter:
        where_conditions.append({"student_id": {"$eq": student_id_filter}})

    where = None
    if len(where_conditions) == 1:
        where = where_conditions[0]
    elif len(where_conditions) > 1:
        where = {"$and": where_conditions}

    kwargs = {
        "query_texts": [query],
        "n_results": min(n, collection.count()),
        "include": ["documents", "metadatas", "distances"],
    }
    if where:
        kwargs["where"] = where

    results = collection.query(**kwargs)
    if not results["documents"]:
        return []

    output = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        output.append({"text": doc, "metadata": meta, "distance": dist})
    return output
