import os
import sys
# Had to add this line so that we could run our tests like so:
# python -m unittest discover -s backend/__tests__/security -p "*.py"
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))


from dotenv import load_dotenv

# Manually load .env from the Fibersync root directory
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(env_path)

from backend.src.app import app
import unittest

class TestHeaderSecurity(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_root_endpoint_returns_text(self):
        """
        Test that the root endpoint ('/') returns a 200 OK status
        and contains the expected message body for basic health checking.
        """
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"FiberSync Backend is Running!", response.data)

    def test_headers_contain_security_flags(self):
        response = self.client.get('/')
        """
        Test that the HTTP response from the root endpoint includes our new security headers. Added in app.py
        These headers protect against attacks, that probably won't happen but looked like standard ones
        """
        expected_headers = [
            "X-Content-Type-Options",  
            "X-Frame-Options",         
            "Content-Security-Policy"  
        ]
        for header in expected_headers:
            print(f"Checking for header: {header}")
            self.assertIn(header, response.headers)

if __name__ == '__main__':
    unittest.main()
