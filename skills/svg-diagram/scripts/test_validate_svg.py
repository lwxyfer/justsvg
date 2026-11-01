#!/usr/bin/env python3
"""Behavioral checks for unsafe resources and semantic/reference failures."""
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from validate_svg import validate

SHELL = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><title>Test</title><desc>Fixture</desc>{}</svg>'
BASE = '<g id="a" data-node="true" data-bounds="0 0 100 60"><rect width="100" height="60" fill="#fff"/><text x="10" y="30">API</text></g><g id="b" data-node="true" data-bounds="200 0 100 60"><text x="210" y="30">Store</text></g><g id="write" data-edge="true" data-from="a" data-to="b"><polyline points="104,30 196,30"/><text x="125" y="20">write</text></g>'
GRAPH = dict(nodes=[dict(id='a', label='API'), dict(id='b', label='Store')],
             edges=[dict(id='write', **{'from':'a', 'to':'b'}, label='write')])


class ValidateSvg(unittest.TestCase):
    def check(self, body, graph=None, prefix=''):
        with TemporaryDirectory() as temp:
            svg = Path(temp) / 'fixture.svg'
            svg.write_text(prefix + SHELL.format(body))
            graph_path = None
            if graph is not None:
                graph_path = Path(temp) / 'graph.json'
                graph_path.write_text(json.dumps(graph))
            return validate(svg, graph_path)

    def test_valid_native_resources_and_semantics(self):
        defs = '<defs><linearGradient id="g"><stop stop-color="#fff"/></linearGradient></defs>'
        result = self.check(defs + BASE.replace('fill="#fff"', 'fill="url(#g)"'), GRAPH)
        self.assertEqual(result['errors'], [])
        self.assertEqual(result['warnings'], [])

    def test_dangerous_or_unsupported_content(self):
        cases = ['<script>alert(1)</script>', '<image href="https://example.com/a.png"/>',
                 '<foreignObject/>', '<style>@import "https://example.com/a.css";</style>',
                 '<rect style="fill:red"/>', '<rect onload="alert(1)"/>',
                 '<rect fill="url(https://example.com/a.svg#g)"/>',
                 '<use href="data:image/svg+xml,x"/>', '<animate attributeName="href"/>',
                 '<div xmlns="http://www.w3.org/1999/xhtml"/>',
                 '<rect fill="u\\72l(https://example.com/a)"/>']
        for body in cases:
            with self.subTest(body=body):
                self.assertTrue(self.check(BASE + body)['errors'])

    def test_dtd_and_processing_instruction(self):
        for prefix in ['<!DOCTYPE svg [<!ENTITY secret SYSTEM "file:///etc/passwd">]>',
                       '<?xml-stylesheet href="https://example.com/a.css"?>']:
            with self.subTest(prefix=prefix):
                self.assertTrue(self.check(BASE, prefix=prefix)['errors'])

    def test_duplicate_and_unresolved_ids(self):
        for extra in ['<g id="a"/>', '<use href="#missing"/>', '<rect fill="url(#missing)"/>']:
            with self.subTest(extra=extra):
                self.assertTrue(self.check(BASE + extra)['errors'])

    def test_local_resource_cycles(self):
        for extra in ['<g id="cycle"><use href="#cycle"/></g>',
                      '<defs><linearGradient id="one" href="#two"/><linearGradient id="two" href="#one"/></defs>']:
            with self.subTest(extra=extra):
                self.assertTrue(any('cyclic' in e for e in self.check(BASE + extra)['errors']))

    def test_semantic_direction_and_coverage(self):
        for body in [BASE.replace('data-to="b"', 'data-to="a"'),
                     BASE.replace('data-edge="true"', 'data-edge="false"'),
                     BASE.replace('>write<', '>read<')]:
            with self.subTest(body=body):
                self.assertTrue(self.check(body, GRAPH)['errors'])

    def test_labels_must_be_editable_text(self):
        body = BASE.replace('<text x="10" y="30">API</text>', '<desc>API</desc><text x="10" y="30">Other</text>')
        self.assertTrue(any('label missing' in e for e in self.check(body, GRAPH)['errors']))

    def test_invalid_bounds_and_graph(self):
        self.assertTrue(self.check(BASE.replace('0 0 100 60', '0 0 NaN 60'))['errors'])
        for graph in [dict(nodes=None, edges=[]), dict(nodes=[{}], edges=[]), [], 'bad']:
            with self.subTest(graph=graph):
                self.assertTrue(self.check(BASE, graph)['errors'])

    def test_packaged_trials(self):
        examples = Path(__file__).resolve().parents[1] / 'examples'
        for slug in ('event-architecture', 'release-flow'):
            with self.subTest(slug=slug):
                report = validate(examples / f'{slug}.svg', examples / f'{slug}.graph.json')
                self.assertEqual(report['errors'], [])


if __name__ == '__main__':
    unittest.main()
