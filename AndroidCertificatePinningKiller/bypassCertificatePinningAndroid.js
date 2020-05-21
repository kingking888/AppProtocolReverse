/*
    Bypass certificate pinning script for Android's default library and the OKHttp library. Using this script all certificates will be considered as trusted.

    $ frida -U -l bypassCertificatePinningAndroid.js -f org.package.name --no-pause

    @author Cees Mandjes
*/
Java.perform(function (){
    console.log("");
    console.log("-- Bypass certificate pinning for Android's default libary and OKHttp libary --");

	//Bypass the OKHttp Library
    try {
        console.log("Looking for OKHttp library");
        //Class config
        var CertificatePinnerBuilder = Java.use('okhttp3.CertificatePinner$Builder');

        CertificatePinnerBuilder.add.implementation = function(host, pins) {
            console.log("OKHttp: remove pin for host: " + host);
            var fakeHostName = "x";
            return this.add(fakeHostName, pins);
        }

        console.log("OKHttp library was succesfully hooked");
    } catch (e) {
        console.log("OKHttp library was not found");
    }

    //Bypass the Android's default Library
    try {
        console.log("Looking for Android's default library");
        //Classes config
        var SSLContext = Java.use("javax.net.ssl.SSLContext");
        var KeyStore = Java.use("java.security.KeyStore");            
        var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');


        //Create TrustManager instance by using the default KeyStore instance and the TrustManagerImpl class
        var keyStoreType = KeyStore.getDefaultType();
        var keyStore = KeyStore.getInstance(keyStoreType);
        keyStore.load(null, null);
        var MyTrustManager = [TrustManagerImpl.$new(keyStore)];

        //Makes sure that the TustManagerImpl is used as Trustmanager (default behavior), this class is hooked below
        SSLContext.init.overload('[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom').implementation = function(keyManager, trustManager, secureRandom) {
            console.log("Overriding TrustManager with default instance of TrustManagerImpl");
            this.init(keyManager, MyTrustManager, secureRandom);
        };

        //Skip certificate chain validation by returning the received certificate chain as a trusted chain
        TrustManagerImpl.checkTrustedRecursive.implementation = function(certs, ocspData, tlsSctData, host, clientAuth, untrustedChain, trustAnchorChain, used) {
            var certsList = Java.use('java.util.ArrayList').$new();
            var i;
            for (i = 0; i < certs.length; i++) {               
                certsList.add(certs[i]);
            }
            return certsList;
        }

        console.log("Android's default library was succesfully hooked");
    } catch (e) {
        console.log("Android's default library was not found");
    }

    //Information loging for Android SafetyNet
    try {
        console.log("Looking for Android SafetyNet Attestation library");
        //Classes config
        var SafetyNetClient = Java.use("com.google.android.gms.safetynet.SafetyNetClient");
        var SafetyNetAttestationResponse = Java.use("com.google.android.gms.safetynet.SafetyNetApi$AttestationResponse");
        var Base64 = Java.use("java.util.Base64");
        var String = Java.use("java.lang.String");
    
        //Logs when SafetyNet Attestation evaluation starts and continues its regular behavior
        SafetyNetClient.attest.implementation = function(nonce, apiKey) {
            console.log("SafetyNet Attestation is called");            
            return this.attest(nonce, apiKey);
        }

        //Logs the payload of SafetyNet Attestation evaluation and continues its regular behavior
        SafetyNetAttestationResponse.getJwsResult.implementation = function() {
            var signedAttestation = this.getJwsResult();
            var payloadEncoded = (signedAttestation.split(".")[1]); 
            var payloadDecoded = String.$new(Base64.getDecoder().decode(payloadEncoded));
            console.log("SafetyNet Attestion payload:\n" + payloadDecoded);
            return signedAttestation;
        }

        console.log("Android SafetyNet Attestation library was succesfully hooked");
    } catch (e) {
        console.log("Android SafetyNet Attestation library was not found");
    }

    console.log("-- Hooking complete --");
    console.log("");
});