from typing import TypedDict


class State(TypedDict):
    file_path: str
    raw_text: str
    text_path: str
    csv_path: str