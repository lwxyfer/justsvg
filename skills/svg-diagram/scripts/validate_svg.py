#!/usr/bin/env python3
"""Check a deliberately small static SVG profile; never rewrite the source."""
import argparse
import json
import math
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

SVG = "http://www.w3.org/2000/svg"
XLINK = "http://www.w3.org/1999/xlink"
XML = "http://www.w3.org/XML/1998/namespace"
ELEMENTS = set("svg g defs title desc rect circle ellipse line polyline polygon path text tspan "
               "linearGradient radialGradient stop pattern clipPath mask marker symbol use".split())
ATTRS = set("id version width height viewBox preserveAspectRatio x y x1 y1 x2 y2 cx cy r rx ry "
            "d points dx dy rotate transform fill fill-opacity fill-rule stroke stroke-width "
            "stroke-opacity stroke-linecap stroke-linejoin stroke-miterlimit stroke-dasharray "
            "stroke-dashoffset opacity color font-family font-size font-weight font-style "
            "font-variant text-anchor dominant-baseline alignment-baseline baseline-shift "
            "letter-spacing word-spacing textLength lengthAdjust text-decoration "
            "vector-effect shape-rendering text-rendering display visibility overflow "
            "clip-path clip-rule mask marker-start marker-mid marker-end markerUnits "
            "markerWidth markerHeight refX refY orient gradientUnits gradientTransform "
            "spreadMethod offset stop-color stop-opacity fx fy fr patternUnits "
            "patternContentUnits patternTransform clipPathUnits maskUnits maskContentUnits "
            "href role focusable".split())
URL = re.compile(r"url\(\s*(['\"]?)([^)'\"\s]+)\1\s*\)", re.I)
MAX_BYTES = 5_000_000


def split_name(name):
    if name.startswith("{"):
        return name[1:].split("}", 1)
    return "", name


def numbers(value):
    return [float(v) for v in re.split(r"[\s,]+", value.strip()) if v]


def editable_text(el):
    return " ".join(" ".join("".join(t.itertext()) for t in el.iter(f"{{{SVG}}}text")).split())


def validate(path, graph_path=None):
    errors, warnings, refs = [], [], []
    report = {"file": str(path), "errors": errors, "warnings": warnings,
              "profile": "static-presentation-attributes", "counts": {}}
    try:
        if path.stat().st_size > MAX_BYTES:
            raise ValueError("SVG exceeds 5 MB helper limit")
        source = path.read_text(encoding="utf-8")
        if re.search(r"<!\s*(DOCTYPE|ENTITY)\b|<\?(?!xml(?:\s|\?>))", source, re.I):
            raise ValueError("DTD, entities and processing instructions are outside the profile")
        root = ET.fromstring(source)
        if root.tag != f"{{{SVG}}}svg":
            raise ValueError("root must be svg in the SVG namespace")
    except (OSError, UnicodeError, ET.ParseError, ValueError) as exc:
        errors.append(str(exc))
        return report

    try:
        vb = numbers(root.get("viewBox", ""))
        if len(vb) != 4 or not all(map(math.isfinite, vb)) or vb[2] <= 0 or vb[3] <= 0:
            raise ValueError()
    except ValueError:
        errors.append("viewBox must contain four finite numbers with positive width/height")
    for dim in ("width", "height"):
        if not re.fullmatch(r"(?:\d+(?:\.\d*)?|\.\d+)(?:px)?", root.get(dim, "")):
            errors.append(f"root {dim} must be a positive numeric/px dimension in this profile")
        elif float(root.get(dim).removesuffix("px")) <= 0:
            errors.append(f"root {dim} must be positive")

    ids, nodes, edges, labels = {}, {}, {}, []
    for el in root.iter():
        ns, tag = split_name(el.tag)
        where = el.get("id", tag)
        if ns != SVG or tag not in ELEMENTS:
            errors.append(f"{where}: unsupported element {el.tag}")
        identifier = el.get("id")
        if identifier:
            if not re.fullmatch(r"[A-Za-z_][\w.:-]*", identifier):
                errors.append(f"{where}: use a simple nonempty semantic ID")
            if identifier in ids:
                errors.append(f"duplicate ID: {identifier}")
            ids[identifier] = el
        for name, value in el.attrib.items():
            ans, attr = split_name(name)
            if ans not in ("", XLINK, XML) or (ans == XLINK and attr != "href") or (
                ans == XML and attr not in ("space", "lang")
            ):
                errors.append(f"{where}: unsupported attribute namespace: {name}")
            elif not (attr in ATTRS or attr.startswith("data-") or attr.startswith("aria-")
                      or (ans == XML and attr in ("space", "lang"))):
                errors.append(f"{where}: unsupported attribute {attr}")
            if attr.lower().startswith("on"):
                errors.append(f"{where}: event attribute {attr}")
            if attr in ("href", "data-sf-start-node", "data-sf-end-node"):
                if value.startswith("#") and len(value) > 1:
                    refs.append((where, value[1:]))
                else:
                    errors.append(f"{where}: {attr} must be a local fragment")
            if attr in ("data-sf-label-for", "aria-labelledby", "aria-describedby"):
                refs.extend((where, ref) for ref in value.split())
            # Arbitrary data/text can contain URLs; resource syntax is checked only in attributes
            # which the allowlisted SVG renderer interprets, never in text labels.
            if not attr.startswith(("data-", "aria-")):
                matches = list(URL.finditer(value))
                if len(re.findall(r"url\s*\(", value, re.I)) != len(matches):
                    errors.append(f"{where}: malformed resource URL in {attr}")
                for match in matches:
                    ref = match.group(2)
                    if not ref.startswith("#") or len(ref) < 2:
                        errors.append(f"{where}: external resource in {attr}")
                    else:
                        refs.append((where, ref[1:]))
                if "\\" in value or re.search(r"javascript:|@import|expression\s*\(", value, re.I):
                    errors.append(f"{where}: unsafe/unsupported attribute syntax in {attr}")
        if el.get("data-node") == "true":
            if not identifier:
                errors.append("semantic node needs an ID")
            nodes[identifier] = editable_text(el)
            bounds = el.get("data-bounds", el.get("data-layout"))
            try:
                b = numbers(bounds or "")
                if len(b) != 4 or not all(map(math.isfinite, b)) or min(b[2:]) <= 0:
                    raise ValueError()
            except ValueError:
                errors.append(f"{where}: needs finite data-bounds (x y positive-width positive-height)")
        if el.get("data-edge") == "true" or el.get("data-sf-start-node"):
            if not identifier:
                errors.append("semantic edge needs an ID")
            start = el.get("data-from", el.get("data-sf-start-node", "").removeprefix("#"))
            end = el.get("data-to", el.get("data-sf-end-node", "").removeprefix("#"))
            edges[identifier] = (start, end, editable_text(el))
        if tag == "text":
            labels.append("".join(el.itertext()))
    for where, ref in refs:
        if ref not in ids:
            errors.append(f"{where}: missing internal reference #{ref}")
    for identifier, (start, end, _) in edges.items():
        if start not in nodes or end not in nodes:
            errors.append(f"{identifier}: endpoints must reference semantic nodes")
    if not labels:
        errors.append("diagram needs editable text")
    for tag in ("title", "desc"):
        if root.find(f"{{{SVG}}}{tag}") is None:
            warnings.append(f"add a root {tag} for context/accessibility")
    if not nodes or not edges:
        warnings.append("semantic/route checks incomplete: add helper node/edge metadata and --graph")

    # Prevent local use/paint-reference cycles from hanging a renderer. Ancestor edges
    # account for e.g. a symbol that contains a use of that symbol.
    dependencies = {el: list(el) for el in root.iter()}
    for el in root.iter():
        for name, value in el.attrib.items():
            _, attr = split_name(name)
            targets = ([value[1:]] if attr == "href" and value.startswith("#") else [])
            if not attr.startswith(("data-", "aria-")):
                targets += [m.group(2)[1:] for m in URL.finditer(value) if m.group(2).startswith("#")]
            dependencies[el].extend(ids[t] for t in targets if t in ids)
    active, done = set(), set()

    def visit(el):
        if el in active:
            raise ValueError("cyclic local SVG resource reference")
        if el in done:
            return
        active.add(el)
        for child in dependencies[el]:
            visit(child)
        active.remove(el)
        done.add(el)
    try:
        visit(root)
    except (ValueError, RecursionError) as exc:
        errors.append(str(exc) or "SVG nesting exceeds helper limits")

    if graph_path:
        try:
            graph = json.loads(graph_path.read_text(encoding="utf-8"))
            expected_nodes = graph["nodes"]
            expected_edges = graph["edges"]
            node_ids = [n["id"] for n in expected_nodes]
            edge_ids = [e["id"] for e in expected_edges]
            if len(set(node_ids)) != len(node_ids) or len(set(edge_ids)) != len(edge_ids):
                errors.append("graph IDs must be unique")
            if set(node_ids) != set(nodes):
                errors.append("semantic node coverage differs from graph")
            if set(edge_ids) != set(edges):
                errors.append("semantic edge coverage differs from graph")
            for node in expected_nodes:
                if " ".join(node["label"].split()) not in nodes.get(node["id"], ""):
                    errors.append(f"{node['id']}: graph label missing from editable text")
            for edge in expected_edges:
                actual = edges.get(edge["id"])
                if actual and actual[:2] != (edge["from"], edge["to"]):
                    errors.append(f"{edge['id']}: graph direction/endpoints differ")
                if actual and edge.get("label") and edge["label"] not in actual[2]:
                    errors.append(f"{edge['id']}: graph relation label missing from edge group")
        except (OSError, ValueError, KeyError, TypeError, AttributeError) as exc:
            errors.append(f"invalid graph: {exc}")
    report["counts"] = {"ids": len(ids), "nodes": len(nodes), "edges": len(edges), "texts": len(labels)}
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("svg", type=Path)
    parser.add_argument("--graph", type=Path, help="optional semantic graph JSON")
    args = parser.parse_args()
    report = validate(args.svg, args.graph)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if report["errors"] else 0


if __name__ == "__main__":
    sys.exit(main())
