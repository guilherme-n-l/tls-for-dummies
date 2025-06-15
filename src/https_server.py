import http.server
import ssl

# Set up the server address and port
server_address = (
    "",
    4443,
)  # Empty string means the server will listen on all available interfaces, port 4443

# Create the HTTP server
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

# Create an SSLContext
context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)

# Load the server's private key and certificate
context.load_cert_chain(certfile="server-cert.pem", keyfile="private.key")

# Wrap the server socket with SSL/TLS using the context
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print("Starting HTTPS server on port 4443...")
httpd.serve_forever()
