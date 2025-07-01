#!/usr/bin/env python3
"""
Simple HTTP/HTTPS server for the Hand Drawing app
Ensures proper protocol for MediaPipe to work
"""

import http.server
import socketserver
import ssl
import os
import sys
from pathlib import Path

def run_server(port=8000, use_https=False):
    """Run the server on specified port"""
    
    # Change to the directory containing this script
    os.chdir(Path(__file__).parent)
    
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", port), Handler) as httpd:
            if use_https:
                # Note: This creates a self-signed certificate
                # For production, use a proper SSL certificate
                context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
                context.check_hostname = False
                context.verify_mode = ssl.CERT_NONE
                
                # Create self-signed certificate (for development only)
                import tempfile
                cert_file = tempfile.NamedTemporaryFile(mode='w', suffix='.pem', delete=False)
                key_file = tempfile.NamedTemporaryFile(mode='w', suffix='.key', delete=False)
                
                # Generate self-signed cert
                os.system(f'openssl req -x509 -newkey rsa:4096 -nodes -out {cert_file.name} -keyout {key_file.name} -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" 2>/dev/null')
                
                context.load_cert_chain(cert_file.name, key_file.name)
                httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
                
                protocol = "HTTPS"
                url = f"https://localhost:{port}"
            else:
                protocol = "HTTP"
                url = f"http://localhost:{port}"
            
            print(f"🚀 Starting {protocol} server...")
            print(f"📡 Server running at: {url}")
            print(f"🎮 Open your game at: {url}/game.html")
            print(f"📱 Or start from landing page: {url}")
            print("\n💡 Tips:")
            print("   - For best MediaPipe performance, Chrome is recommended")
            print("   - Make sure to allow camera permissions")
            print("   - Press Ctrl+C to stop the server")
            
            if not use_https:
                print("   - If hand tracking doesn't work, try HTTPS mode:")
                print(f"     python3 {sys.argv[0]} --https")
            
            print("\n" + "="*50)
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {port} is already in use. Try a different port:")
            print(f"   python3 {sys.argv[0]} --port {port + 1}")
        else:
            print(f"❌ Error starting server: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Run the Hand Drawing app server")
    parser.add_argument("--port", "-p", type=int, default=8000, help="Port to run the server on (default: 8000)")
    parser.add_argument("--https", action="store_true", help="Run server with HTTPS (recommended for MediaPipe)")
    
    args = parser.parse_args()
    
    run_server(port=args.port, use_https=args.https) 