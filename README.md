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
  openssl version
  ```

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
openssl req -new -key server-private.key -out server.csr
```

Let’s break this down:

* `openssl req`: Tells OpenSSL to generate a certificate request (CSR).
* `-new`: Indicates that a new CSR is being generated.
* `-key server-private.key`: Specifies the private key that corresponds to the public key in the server certificate. If you don’t have a server-private.key yet, you can generate it with `openssl genpkey`.
* `-out server.csr`: Specifies the output filename for the CSR, which is `server.csr` in this case.

When you run this command, you’ll be prompted to enter some details for the CSR. These details include:

* **Country Name (C)**
* **State or Province Name (ST)**
* **Locality Name (L)**
* **Organization Name (O)**
* **Organizational Unit Name (OU)**
* **Common Name (CN)**: Normally, this would be the fully qualified domain name (FQDN) of your server, such as `www.example.com`. **However, if you’re using an IP address** for internal systems or testing purposes, you can use the server’s **IP address** as the CN. Keep in mind that **major public CAs** generally require a domain name rather than an IP address, and may not accept an IP for validation.
* **Email Address**: You can leave this blank, or provide a contact email.

> Note: While public CAs require domain names to issue a certificate, if you are generating a certificate for internal or non-public use, you can safely use a private IP address here.

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

#### 3. Verify Your Server Certificate

To verify the server certificate, use the following command:

```bash
openssl x509 -in server-cert.pem -text -noout
```

This will display the details of your signed server certificate, including the public key, the issuer (your CA), and the expiration date.

If everything looks good, your server certificate is now ready to be installed on your server!

### 4. Install the Server Certificate

Once you have the signed server certificate, you can install it on your server.

#### Running Apache Server on Docker

Now that you have your server certificate, let's set up Apache inside a Docker container and enable SSL. Docker is a platform that allows you to create, deploy, and run applications in isolated containers. It's an efficient way to package applications with all their dependencies, ensuring they run consistently across different environments.

If you haven’t installed Docker yet, you can follow the official Docker installation guide for your platform here: [Docker Installation Guide](https://docs.docker.com/get-started/get-docker/)

##### Prepare Your Files

Before running the container, make sure you have the following files available:

* **server-cert.pem**: Your signed server certificate.
* **private.key**: The private key for your server.
* **ca-cert.pem**: The root certificate of your Certificate Authority (CA).
* **my-ssl.conf**: A custom Apache configuration file for enabling SSL. This will set up Apache to listen on port 443 and use the SSL certificates.

Here's an example of what the `my-ssl.conf` file might look like:

```xml
<VirtualHost *:443>
    DocumentRoot /usr/local/apache2/htdocs
    ServerName localhost

    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/server-cert.pem
    SSLCertificateKeyFile /etc/ssl/private/private.key
</VirtualHost>
```

> Note: If using an actual domain name, you could replace the `ServerName` field (e.g.: [example.com]())

#### **2. Run Apache in Docker with SSL**

Now, use the following `docker run` command to start Apache in a container with SSL enabled. We’ll mount the necessary certificate files and configuration file as volumes inside the container.

```bash
docker run -d \
  --name apache-ssl \
  -p 8080:80 -p 8443:443 \
  -v /path/to/your/server-cert.pem:/etc/ssl/certs/server-cert.pem \
  -v /path/to/your/private.key:/etc/ssl/private/private.key \
  -v /path/to/your/ca-cert.pem:/etc/ssl/certs/ca-cert.pem \
  -v /path/to/your/my-ssl.conf:/usr/local/apache2/conf/extra/my-ssl.conf \
  httpd:2.4
```

### Breakdown of the `docker run` Command

* `-d`: Runs the container in detached mode, allowing it to run in the background.
* `--name apache-ssl`: Names the container `apache-ssl` for easy reference.
* `-p 80:80 -p 443:443`: Exposes ports 80 (HTTP) and 443 (HTTPS) to the host machine, allowing external access to your server via these ports.
* `-v /path/to/your/server-cert.pem:/etc/ssl/certs/server-cert.pem`: Mounts your server certificate to the container.
* `-v /path/to/your/private.key:/etc/ssl/private/private.key`: Mounts your private key to the container.
* `-v /path/to/your/ca-cert.pem:/etc/ssl/certs/ca-cert.pem`: Mounts your CA certificate to the container.
* `-v /path/to/your/my-ssl.conf:/usr/local/apache2/conf/extra/my-ssl.conf`: Mounts your Apache SSL configuration file to the container.
* `httpd:2.4`: Specifies the official Apache HTTP Server image version 2.4.

#### **3. Modify Apache Configuration to Enable SSL**

By default, the Apache image might not include SSL configured out of the box. The `my-ssl.conf` file that you mounted above will need to be included in the main Apache configuration.

To make sure that Apache loads your SSL configuration, you'll need to include it in the main Apache config file. Here's how you can ensure that the SSL configuration is loaded:

1. Enter the running container with:

   ```bash
   docker exec -it apache-ssl bash
   ```

2. Once inside the container, edit the `httpd.conf` file to include your custom SSL configuration:

   ```bash
   apt update && apt install nano
   nano /usr/local/apache2/conf/httpd.conf
   ```

   Add the following line to include your SSL configuration:

   ```apache
   Include /usr/local/apache2/conf/extra/my-ssl.conf
   ```

3. Save the changes and exit the container.

#### **4. Restart Apache in the Container**

After updating the Apache configuration, you’ll need to restart Apache for the changes to take effect. Run the following command to restart Apache inside the container:

```bash
docker restart 
```
