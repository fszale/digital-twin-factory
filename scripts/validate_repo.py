#!/usr/bin/env python3
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
REGISTRY = ROOT / "diagrams" / "registry.json"


def fail(message: str) -> None:
    raise SystemExit(message)


def validate_registry() -> None:
    data = json.loads(REGISTRY.read_text())
    for entry in data["diagrams"]:
        diagram_id = entry["id"]
        diagram_path = ROOT / entry["file"]
        if not diagram_path.exists():
            fail(f"missing diagram file: {entry['file']}")
        for used_in in entry["used_in"]:
            doc_path = ROOT / used_in
            if not doc_path.exists():
                fail(f"missing doc for diagram {diagram_id}: {used_in}")
            text = doc_path.read_text()
            start = f"<!-- DIAGRAM: {diagram_id} START -->"
            end = f"<!-- DIAGRAM: {diagram_id} END -->"
            if start not in text or end not in text:
                fail(f"missing markers for {diagram_id} in {used_in}")
            if not re.search(rf"{re.escape(start)}\s*```mermaid", text, re.DOTALL):
                fail(f"diagram {diagram_id} is not embedded in {used_in}")


def validate_required_files() -> None:
    required = [
        ROOT / "AGENTS.md",
        ROOT / "CONTEXT.md",
        ROOT / "docs" / "architecture.md",
        ROOT / "docs" / "data-model.md",
        ROOT / "docs" / "api-surface.md",
    ]
    for path in required:
        if not path.exists():
            fail(f"missing required file: {path.relative_to(ROOT)}")


def main() -> int:
    validate_required_files()
    validate_registry()
    print("repo validation passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
