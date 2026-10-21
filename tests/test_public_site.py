"""Public XREYVE site safety and route tests (no external services)."""
from pathlib import Path
import re
import unittest

BASE=Path(__file__).resolve().parents[1]
PAGES=("index.html","about.html","terms.html","privacy.html","tiktok-connect.html","studio.html")
ASSETS=("public-site.css","studio.css","studio.js")
LINKS=set(PAGES+ASSETS)


class PublicSiteTests(unittest.TestCase):
    def test_all_public_pages_exist_with_expected_toc(self):
        for name in PAGES:
            with self.subTest(name=name):
                raw=(BASE/name).read_text(encoding="utf-8")
                self.assertIn('<html lang="en">',raw)
                self.assertIn('name="viewport"',raw)
                self.assertIn("XREYVE OS",raw)
                self.assertIn('href="./privacy.html"',raw)
                self.assertIn('href="./terms.html"',raw)

    def test_no_broken_relative_navigation_or_secret_references(self):
        for name in PAGES:
            content=(BASE/name).read_text(encoding="utf-8")
            for attr,path in re.findall(r'''(href|src)=["']\./([^"']+)["']''',content):
                with self.subTest(page=name,reference=path):
                    self.assertIn(path,LINKS)
                    self.assertTrue((BASE/path).is_file())
            for marker in ("drive.google.com/drive/folders","ghp_","sk-proj-",
                           "Client secret","LIVE_TIKTOK_ACCESS_TOKEN"):
                with self.subTest(page=name,marker=marker):
                    self.assertNotIn(marker,content)

    def test_privacy_is_truthful_about_unconnected_platform(self):
        privacy=(BASE/"privacy.html").read_text()
        self.assertIn("No live TikTok account is connected",privacy)
        self.assertIn("local browser",privacy.lower())
        self.assertIn("Privacy Policy",privacy)
        connect=(BASE/"tiktok-connect.html").read_text()
        self.assertIn("No valid authorization flow is available",connect)
        self.assertIn("not connected",connect.lower())

    def test_functioning_demo_is_explicitly_device_only(self):
        html=(BASE/"studio.html").read_text()
        js=(BASE/"studio.js").read_text()
        self.assertIn('id="source-video"',html)
        self.assertIn('id="preview"',html)
        self.assertIn('id="clip-notes"',html)
        self.assertIn('id="approve"',html)
        self.assertIn("mediaUploaded:false",js)
        self.assertIn("productionSubmitted:false",js)
        self.assertIn("tiktokPublished:false",js)
        self.assertIn("localStorage",js)
        for forbidden in ("fetch(", "XMLHttpRequest", "window.open(",
                          "client_secret","tiktokapis.com", "drive.google.com"):
            self.assertNotIn(forbidden,js)

    def test_public_only_deployment_artifact(self):
        pipeline=(BASE/".github/workflows/deploy-pages.yml").read_text()
        self.assertIn("cp index.html about.html terms.html privacy.html tiktok-connect.html studio.html",pipeline)
        self.assertIn("cp public-site.css studio.css studio.js",pipeline)
        self.assertIn("actions/deploy-pages@v4",pipeline)
        self.assertNotIn("xreyve-agency-v1",pipeline)


if __name__=="__main__":
    unittest.main()
