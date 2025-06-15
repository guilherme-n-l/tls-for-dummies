# TLS 4 Dummies

## Generating a Private Key

To understand how to generate a private key, you need to first know what a private key is.

### What’s a Private Key?

A **private key** is a secret key used in **Asymmetric Key Cryptography**. It’s paired with a **public key** and is used for encrypting and decrypting messages securely.

### Why Do You Need It?

You need a private key to:

1. **Encrypt information** that can only be decrypted by someone with the matching public key.
2. **Sign certificates** that prove your server’s identity (when setting up a TLS/SSL certificate).

### Step-by-Step Process

#### 1. Install OpenSSL

OpenSSL is a tool used to create TLS certificates, including the private key. It comes pre-installed on most Unix-based systems (like Linux or macOS), but if you're using Windows, you might need to install it manually.

* On **Linux** or **macOS**, OpenSSL should already be available in the terminal. You can check if it’s installed by typing:

  ```bash
  openssl --version
  ```

  ![](./img/ossl-version.png)

* On **Windows**, you can download OpenSSL from [here](https://slproweb.com/products/Win32OpenSSL.html).

#### 2. Generate the Private Key

Now, we’re ready to generate the private key. This step will create a file that only you (or your server) can use. You can create an RSA private key using the following command:

```bash
openssl genpkey -algorithm RSA -out private.key -aes256
```

Let’s break this down:

* `openssl genpkey` is the command that tells OpenSSL to generate a key.
* `-algorithm RSA` specifies that we’re using the RSA algorithm for the private key. RSA is widely used for TLS encryption.
* `-out private.key` tells OpenSSL to save the private key in a file called `private.key`.
* `-aes256` encrypts the private key using AES (Advanced Encryption Standard) with a 256-bit key.

> Note: You’ll be prompted to set a password for the private key file. If you don’t want to encrypt the private key with a password, you can omit the `-aes256` part

![](./img/ossl-privk.png)

#### 3. Verify the Private Key

Once your private key is generated, you can verify it using the following command:

```bash
openssl pkey -in private.key -text -noout
```

This will display the details of the private key, including the size of the key and other metadata. If you see information displayed, that means the key was successfully created!

#### 4. Security of the Private Key

* **Keep your private key safe!** It should **never** be shared with anyone. If someone gets access to your private key, they can decrypt your messages or impersonate your server.
* Make sure it’s stored in a secure location and that the file permissions are set to restrict access.

## Creating Your Certificate Authority (CA)

### What’s a Certificate Authority (CA)?

A **Certificate Authority (CA)** is a trusted entity that issues digital certificates. These certificates authenticate identities, ensuring secure communication over networks.

In a public context, well-known CAs like **Let's Encrypt**, **DigiCert**, or **Comodo** issue certificates for websites. However, if you’re setting up your own server (e.g., for internal use), you can create your own CA and sign certificates using it.

### Why Would You Want to Create Your Own CA?

1. **Private Networks**: If you have a private network (like internal systems or development environments), you don’t need to rely on public CAs.
2. **Full Control**: You get to decide who you trust and how certificates are issued, including when to revoke them.
3. **No Costs**: If you don’t need to pay for a public certificate authority, this is a good option.

### Step-by-Step Process

#### 1. Create a Self-Signed Root Certificate (CA Certificate)

The root certificate is a public certificate that is used by your CA to sign other certificates. This is the certificate that clients (like browsers or servers) will trust once they know the root certificate.

To create the **root certificate**, you’ll need to generate a **self-signed certificate**. Here’s the command to do that:

```bash
openssl req -key private.key -new -x509 -out ca-cert.pem -days 3650
```

Let’s break it down:

* `openssl req`: Tells OpenSSL to create a new certificate signing request (CSR).
* `-key private.key`: Uses the private key you generated for your CA.
* `-new`: Creates a new CSR.
* `-x509`: Specifies that you want to create a self-signed certificate (this turns it into a root certificate).
* `-out ca-cert.pem`: Specifies the output filename for your root certificate.
* `-days 3650`: This sets the certificate's expiration to 10 years (you can change the duration).

You’ll be prompted to enter some details for the certificate (like your country, organization name, etc.). These can be whatever you like, but the **Common Name (CN)** field should typically be something like "My Custom CA" or the name you want to associate with your CA.

![](./img/ossl-ca.png)

#### 2. Verify Your Root Certificate

Once you’ve created the certificate, you can verify it with:

```bash
openssl x509 -in ca-cert.pem -text -noout
```

This will display the details of the certificate, including the expiration date, public key, and more. If everything looks good, your root certificate is now ready.

## Creating Your Server Certificate

### What’s a Server Certificate?

A **server certificate** is a digital certificate that proves the identity of a server to clients (like web browsers). When clients connect to your server, they can use this certificate to verify that the server is legitimate and that they are communicating with the intended party, not an imposter.

The server certificate contains your server's public key and details about your server’s identity. In a typical TLS/SSL setup, the certificate is signed by a trusted Certificate Authority (CA). However, in this case, we’ll be using your own **Certificate Authority (CA)** to sign the server certificate.

### Why Do You Need a Server Certificate?

You need a server certificate to:

1. **Authenticate your server**: It proves to clients that they are connecting to the correct server.
2. **Encrypt communication**: The certificate enables the server to encrypt and secure data exchanged with clients.
3. **Avoid Man-in-the-Middle Attacks**: Clients can use the server certificate to make sure they’re talking to the right server and not someone impersonating it.

### Step-by-Step Process

#### 1. Create a Certificate Signing Request (CSR) for the Server

To create a server certificate, you first need to generate a **Certificate Signing Request (CSR)**. This is a file that contains information about your server and is signed with your server's private key. The CSR will then be submitted to the CA (in this case, your own self-signed CA) for signing.

Here’s the command to generate the CSR:

```bash
openssl req -new -key private.key -out server.csr
```

Let’s break this down:

* `openssl req`: Tells OpenSSL to generate a certificate request (CSR).
* `-new`: Indicates that a new CSR is being generated.
* `-key private.key`: Specifies the private key that corresponds to the public key in the server certificate.
* `-out server.csr`: Specifies the output filename for the CSR, which is `server.csr` in this case.

When you run this command, you’ll be prompted to enter some details for the CSR. These details include:

* **Country Name (C)**
* **State or Province Name (ST)**
* **Locality Name (L)**
* **Organization Name (O)**
* **Organizational Unit Name (OU)**
* **Common Name (CN)**: Normally, this would be the fully qualified domain name (FQDN) of your server, such as `www.example.com`. **However, if you’re using an IP address** for internal systems or testing purposes, you can use the server’s **IP address** as the CN.
    ![](./img/ip.png)
* **Email Address**: You can leave this blank, or provide a contact email.

> Note: While public CAs require domain names to issue a certificate, if you are generating a certificate for internal or non-public use, you can safely use a private IP address here.

![](./img/ossl-server-ctr.png)

#### 2. Sign the Server Certificate with Your CA

Once the CSR is created, the next step is to use your own **Certificate Authority (CA)** to sign the server certificate. This process generates the actual server certificate that you will install on your server.

Here’s the command to sign the server certificate using your root CA’s private key:

```bash
openssl x509 -req -in server.csr -CA ca-cert.pem -CAkey private.key -CAcreateserial -out server-cert.pem -days 3650
```

Let’s break this down:

* `openssl x509 -req`: Tells OpenSSL to create a certificate from the CSR.
* `-in server.csr`: Specifies the CSR file you created earlier.
* `-CA ca-cert.pem`: Specifies the root CA certificate (the one you created).
* `-CAkey private.key`: Specifies the private key of your root CA.
* `-CAcreateserial`: Creates a serial number file for the certificate (this is required).
* `-out server-cert.pem`: Specifies the output filename for the signed server certificate.
* `-days 3650`: Specifies the validity of the certificate (in this case, 10 year).

Once this command is run, you will have a signed server certificate (`server-cert.pem`) that is trusted by your CA.

![](./img/ossl-server-pem.png)

#### 3. Verify Your Server Certificate

To verify the server certificate, use the following command:

```bash
openssl x509 -in server-cert.pem -text -noout
```

This will display the details of your signed server certificate, including the public key, the issuer (your CA), and the expiration date.

If everything looks good, your server certificate is now ready to be installed on your server!

#### 4. Install the Server Certificate

Once you have the signed server certificate, you can install it on your server.

#### 5. Ensure CA is Trusted

To ensure that your server’s certificate is trusted by clients (such as web browsers), you need to install the **Certificate Authority (CA)** certificate on the client machines. This allows browsers to recognize your self-signed CA as a trusted source.

##### For Google Chrome (Windows/macOS)

1. **Open Chrome** and go to the settings:

   * Click the **three vertical dots** (top-right) and select **Settings**.

2. **Access the Certificate Manager**:

   * Scroll down and click **Advanced**.
   * Under the **Privacy and security** section, click **Security**.
   * Scroll down to **Manage certificates**. This will open the **Certificate Manager**.
   * Navigate under **Custom**, select the **Installed by you** option

3. **Import the CA Certificate**:

   * Click on the **Import** button under the **Trusted Certificates** tab.
   * Browse to your `ca-cert.pem` file and select it.

4. **Restart Chrome** for the changes to take effect.

##### For Mozilla Firefox (Windows/macOS)

1. **Open Firefox** and go to the settings:

   * Click the **three horizontal lines** (top-right) and select **Settings**.

2. **Access the Certificate Manager**:

   * Scroll down and click **Privacy & Security**.
   * Scroll down to the **Certificates** section.
   * Click on **View Certificates**.

3. **Import the CA Certificate**:

   * Go to the **Authorities** tab.
   * Click on **Import**, and browse to your `ca-cert.pem` file.
   * Ensure the box next to **Trust this CA to identify websites** is checked.

4. **Restart Firefox** for the changes to take effect.

By adding your **self-signed CA certificate** to the browser’s list of trusted authorities, any server certificates signed by your CA will now be trusted by that browser.

![](./img/ff-ca.png)

## Creating Your HTTPS Server with Python

Now that you've generated your private key (`private.key`), root certificate (`ca-cert.pem`), and signed server certificate (`server-cert.pem`), it's time to set up a basic HTTPS server using Python. This is a simple yet effective way to serve secure content using **TLS/SSL**.

We'll use Python's built-in `http.server` module and provide the server with both the private key and the server certificate to ensure secure HTTPS communication.

### Step-by-Step Process

#### 1. Install Python (If Not Already Installed)

Most systems come with Python pre-installed. To verify that Python is available, open a terminal and run:

```bash
python3 --version
```

If it's not installed, you can download and install it from the [official Python website](https://www.python.org/downloads/).

#### 3. Write the Python Script to Launch the HTTPS Server

You can use Python’s built-in `http.server` module, which allows you to easily create an HTTPS server. However, we will need to provide it with the server's certificate and private key to enable HTTPS.

Create a Python script, say `https_server.py`, in the same directory as your certificate and key files, and open it in your preferred text editor.

Paste the following code inside `https_server.py`:

```python
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
```

#### 5. Access the HTTPS Server in Your Browser

* Open your browser and navigate to `https://[PRIVATE IP ADDRESS]:4443`

> Note: You might see a **security warning** because your certificate is self-signed with an IP address as a CN. Just ignore it for the sake of this tutorial

#### 6. Verify the Connection is Secure

To verify that the connection is indeed using HTTPS and your certificates are correctly installed:

1. **Check the URL**: Ensure that the URL in the browser’s address bar starts with `https://`.
2. **Inspect the Certificate**:

   * **In Chrome**: Click the padlock icon in the address bar, then click **Certificate** to view the certificate details. It should show your server certificate and that it is issued by your self-signed CA.
   * **In Firefox**: Similarly, click the padlock icon in the address bar, click **More Information**, and then **View Certificate** to see the details.

    ![](./img/ff-https.png)

## Conclusion

You've now successfully created a **secure HTTPS server** using Python with your own self-signed certificates! This server uses **TLS/SSL encryption** to secure the communication, ensuring data is transmitted securely between clients and the server.

This setup is perfect for testing, development, and internal use, but for production environments, you should consider using a trusted third-party Certificate Authority (CA) for your server certificates to avoid browser warnings for users.
